import {drive_v3, google} from 'googleapis';
import { config } from 'dotenv';

config();

// Replace the values below with your own
const SERVICE_ACCOUNT_FILE = process.env.SERVICE_ACCOUNT_FILE || '';
const FOLDER_ID = process.env.FOLDER_ID || '';

// Create a new JWT client using the service account credentials
const auth = new google.auth.GoogleAuth({
  keyFile: SERVICE_ACCOUNT_FILE,
  scopes: ['https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/spreadsheets'],
});
const drive = google.drive({ version: 'v3', auth });

// List the files in the specified folder
async function listFiles() {
  const query = `'${FOLDER_ID}' in parents`;
  const res = await drive.files.list({ q: query });

  return res.data.files;
}

// Create a new Google Sheets file in the specified folder
async function createSheet() {
  const resource: drive_v3.Schema$File = {
    name: 'Réservations actuelles',
    parents: [FOLDER_ID],
    mimeType: 'application/vnd.google-apps.spreadsheet',
  };

  const res = await drive.files.create({ requestBody: resource });
  const fileId = res.data.id;

  return fileId;
}

// Write data to a Google Sheets file
async function writeData(fileId: string, data: Array<string>) {
  const sheets = google.sheets({ version: 'v4', auth });
  const resource = {
    values: [data]
  };
  const range = 'Sheet1';
  const params = {
    spreadsheetId: fileId,
    range,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    resource,
  };
  const res = await sheets.spreadsheets.values.append(params);
  console.log(`Updated sheet with ${res.data.updates?.updatedCells} cells.`);
}


export {
  listFiles,
  createSheet,
  writeData,
};
