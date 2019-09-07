# TVPI Installationsanleitung

## Hardware

* Raspberry Pi mit SD Karte
* Monitor
* Externe Festplatte

## Installation

1. Installiere die neueste Version von [Raspbian Lite](https://www.raspberrypi.org/downloads/raspbian/) auf deine SD Karte. Dazu kannst du zum Beispiel [Rufus](https://rufus.ie/) verwenden. 
2. Starte das Raspberry Pi mit dem neuen System auf und nimm die erforderlichen Einstellungen mit `sudo raspi-config` vor. Du solltest die automatische Anmeldung aktivieren.
3. Mounte die Externe Festplatte, indem du [dieser Anleitung](https://www.raspberrypi.org/documentation/configuration/external-storage.md) folgst.
4. Folge weiter [dieser Anleitung](https://die-antwort.eu/techblog/2017-12-setup-raspberry-pi-for-kiosk-mode/). Setze die URL für Chromium auf `http://127.0.0.1:8001`.
5. Erstelle anschliessend ein `systemd` Service File, indem du [dieser Anleitung](https://nodesource.com/blog/running-your-node-js-app-with-systemd-part-1/) folgst. Lasse beim Inhalt des Services die Variablen `Documentation` und `Environment` aus, und ändere die Variablen `Description`, `User` und `ExecStart` entsprechend. `ExecStart` sollte dabei auf die Datei `/mnt/external-drive/tvpi/index.js` verweisen.