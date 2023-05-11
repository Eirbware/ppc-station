use tokio_serial::{SerialPortBuilderExt};
use serde::{Deserialize, Serialize};
use tokio_serial;
use tokio::io::{BufReader, AsyncBufReadExt};
use std::fmt::{Debug};
use std::process::Command;

use ldap3::{Scope, SearchEntry, LdapConnAsync};

#[derive(Serialize, Deserialize, Debug)]
struct SerialData {
    data: String,
}

#[derive(Serialize, Deserialize, Debug)]
struct LdapData {
    given_name: String,
    sn: String,
    mail: String,
    uid: String,
}
    
async fn read_from_serial(port: &str) -> Result<SerialData, String> {
    let port = tokio_serial::new(port, 9600).open_native_async().unwrap();
    let mut reader = BufReader::new(port);
    let mut buffer = String::new();
    if let Err(e) = reader.read_line(&mut buffer).await {
        return Err(format!("Failed to read from serial port: {}", e));
    }

    Ok(SerialData { data: buffer})
}

#[tauri::command]
async fn fetch_from_ldap(mifare: &str) -> Result<LdapData, String> {
    let (conn, mut ldap) = LdapConnAsync::new("ldap://ldap.ipb.fr:389").await.unwrap();

    ldap3::drive!(conn);

    let query = format!("(ipbPupi={{MIFARE}}{})", mifare);

    let (result, _) = ldap.search(
        "dc=ipb,dc=fr",
        Scope::Subtree,
        &query,
        vec![
            "sn",
            "givenName",
            "ipbMailMainAccount",
            "uid"
        ],
    ).await.unwrap().success().unwrap();

    // Handle the case where the search returns no results
    if result.is_empty() {
        return Err(format!("No results found for {}", mifare));
    }

    // Get first result
    let entry = result.get(0).unwrap();

    let entry = SearchEntry::construct(entry.clone());

    ldap.unbind().await.unwrap();

    let given_name = entry.attrs.get("givenName").unwrap().get(0).unwrap();
    let sn = entry.attrs.get("sn").unwrap().get(0).unwrap();

    Ok(LdapData {
        given_name: String::from(given_name),
        sn: String::from(sn),
        mail: String::from(entry.attrs.get("ipbMailMainAccount").unwrap().get(0).unwrap()),
        uid: String::from(entry.attrs.get("uid").unwrap().get(0).unwrap()),
    })
}

#[tauri::command]
async fn read_mifare(port: &str) -> Result<SerialData, String> {
    let data = read_from_serial(port).await?;
    Ok(data)
}

#[tauri::command]
fn console_log(message: &str) {
    println!("{}", message);
}

#[tauri::command]
fn play_audio(path: &str) -> Result<i32, String> {
    // Println pwd
    let child = match Command::new("cvlc").arg("--play-and-exit").arg(path).spawn() {
        Ok(child) => child,
        Err(e) => return Err(format!("Failed to play audio: {}", e)),
    };

    Ok(child.id() as i32)
}

#[tauri::command]
fn kill_audio(pid: i32) -> Result<(), String> {
    match Command::new("kill").arg("-9").arg(format!("{}", pid)).spawn() {
        Ok(child) => child,
        Err(e) => return Err(format!("Failed to kill audio: {}", e)),
    };

    Ok(())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![read_mifare, fetch_from_ldap, console_log, play_audio, kill_audio])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
