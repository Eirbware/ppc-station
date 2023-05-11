import express from 'express';
import { createSheet, listFiles, writeData } from './google';
import { config } from 'dotenv';
import tunnel from 'tunnel-ssh';
import ldap from 'ldapjs';
import fs from 'fs';

config();

// ======== SSH Tunnel ========

const sshConfig = {
    username: process.env.CAS_USERNAME || "",
    password: process.env.CAS_PASSWORD || "",
    host: process.env.SSH_HOST || "",
    port: 22,
    dstHost: process.env.DST_HOST || "",
    dstPort: (process.env.DST_PORT) ? parseInt(process.env.DST_PORT) : 389,
    localPort: 8664,
    keepAlive: true,
};

const tnl = tunnel(sshConfig);
tnl.on('error', (error) => {
    console.error(`Error occurred in SSH tunnel: ${error}`);
});

// ======== LDAP Client ========

const ldapClient = ldap.createClient({ url: 'ldap://localhost:8664' });

process.on('SIGINT', () => {
    process.exit();
});

process.on('exit', () => {
    ldapClient.destroy();
    tnl.close();
});


function loadStudentData(mifareUID: string) {
    return new Promise((resolve, reject) => {
        ldapClient.search('dc=ipb,dc=fr', {
            filter: `(ipbPupi={MIFARE}${mifareUID})`,
            scope: 'sub',
            attributes: [
                'sn',
                'givenName',
                'ipbMailMainAccount',
                'uid'
            ]
        },
            (err, search) => {
                if (err) {
                    reject(err);
                    return;
                }

                search.on('searchEntry', (entry) => {
                    resolve(entry.object);
                });

                search.on('error', (err) => {
                    reject(err);
                });

                search.on('end', (result) => {
                    if (result?.status === 0) {
                        reject(new Error(`LDAP search failed`));
                    }
                });
            });
    });
}

const app = express();
let currentSheetId = '';

function getSheetId() {
    const createSheetAndWriteHeaders = () => {
        console.log('No current sheet found, creating one...');
        createSheet().then((sheetId) => {
            currentSheetId = sheetId!;
            console.log(`Current sheet ID: ${currentSheetId}`);

            // Write sheet ID to file
            fs.writeFileSync('.sheet-id', currentSheetId);

            // Write headers
            writeData(currentSheetId, ['Nom', 'Prénom', 'Email', 'UID']).then(() => {
                console.log('Headers written to sheet');
            }).catch((err) => {
                console.error(`Error occurred while writing headers to sheet: ${err}`);
            });
        }).catch((err) => {
            console.error(`Error occurred while creating sheet: ${err}`);
        });
    };

    listFiles().then((files) => {
        if (files && files.length > 0) {
            // Get first file with name 'Réservations actuelles'
            const currentSheet = files.find((file) => file.name === 'Réservations actuelles' && file.mimeType === 'application/vnd.google-apps.spreadsheet');

            if (currentSheet) {
                currentSheetId = currentSheet.id!;
                console.log(`Current sheet ID: ${currentSheetId}`);

                // Write sheet ID to file
                fs.writeFileSync('.sheet-id', currentSheetId);
            } else {
                createSheetAndWriteHeaders();
            }
        } else {
            createSheetAndWriteHeaders();
        }
    }).catch((err) => {
        console.error(`Error occurred while getting sheet ID: ${err}`);
    });
}

// Execute getSheetId() every hour
setInterval(getSheetId, 3600000);

// Check if file '.sheet-id' exists
if (fs.existsSync('.sheet-id')) {
    // Read file
    const data = fs.readFileSync('.sheet-id', 'utf8');
    currentSheetId = data;
    console.log(`Current sheet ID: ${currentSheetId}`);
} else {
    getSheetId();
}

// Parse JSON bodies (as sent by API clients)
app.use(express.json());

// POST /add-reservation
app.post('/add-reservation', (req, res) => {
    // Parse the request body
    const { mifareUID } = req.body;

    // Load student data from LDAP
    loadStudentData(mifareUID).then((student: any) => {
        writeData(currentSheetId, [
            student.sn as string,
            student.givenName as string,
            student.ipbMailMainAccount as string,
            student.uid as string
        ]).then(() => {
            res.status(200).send();
        }).catch((err) => {
            console.error(`Error occurred while writing data to GSheet: ${err}`);
            res.status(500).send();
        });
    }).catch((err) => {
        console.error(`Error occurred while loading strudent data: ${err}`);
        res.status(500).send();
    });
});

app.listen(3000, () => {
    console.log('Server started on port 3000');
});