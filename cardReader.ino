/*
  Uses https://github.com/miguelbalboa/rfid
*/

#include <SPI.h>
#include <MFRC522.h>
#include <stdio.h>

MFRC522 lecteur(10, 9);

int UID[7];

void setup() {
  Serial.begin(9600);

  while (!Serial);

  for (int i = 0; i < 7; i++) {
    UID[i] = 0xff;
  }

  SPI.begin();
  lecteur.PCD_Init();
}

void loop() {
  if (!lecteur.PICC_IsNewCardPresent() || !lecteur.PICC_ReadCardSerial()) {
    return;
  }

  bool isCardDifferent = false;
  for (int i = 0; i < 7; i++) {
    if (UID[i] != lecteur.uid.uidByte[i]) {
      isCardDifferent = true;
      break;
    }
  }

  if (isCardDifferent) {
    for (int i = 0; i < 7; i++) {
      char buffer[2] = {0};
      UID[i] = lecteur.uid.uidByte[i];
      sprintf(buffer, "%02X", UID[i]);
      Serial.print(buffer);
    }
    Serial.println("");
  }

  delay(1);
}