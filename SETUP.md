# Setup-Anleitung

## 1. Firebase-Projekt anlegen

1. Gehe zu [console.firebase.google.com](https://console.firebase.google.com)
2. Neues Projekt erstellen (z.B. "wer-wird-millionaer")
3. **Firestore Database** aktivieren → "Start in test mode" (30 Tage offen, danach `firestore.rules` deployen)
4. **Web-App** registrieren → Firebase-Config-Werte kopieren

## 2. Firebase-Config eintragen

Entweder direkt lokal (nicht committen!) oder als GitLab CI/CD-Variablen:

```
FIREBASE_API_KEY=...
FIREBASE_AUTH_DOMAIN=...projekt.firebaseapp.com
FIREBASE_PROJECT_ID=...
FIREBASE_STORAGE_BUCKET=...projekt.appspot.com
FIREBASE_MESSAGING_SENDER_ID=...
FIREBASE_APP_ID=...
```

Für lokale Entwicklung: `.env`-Datei anlegen (wird von `.gitignore` ausgeschlossen):
```
FIREBASE_API_KEY=dein-api-key
...
```

## 3. Initial-Konfiguration in Firestore

Im Firebase Console → Firestore → Dokument anlegen:

**Collection:** `config`  
**Dokument-ID:** `appConfig`  
**Felder:**
```
playerPasswordHash: "ee50a1aaf85ad9a4f21ff8ff5ad8a13843aa9bb3f8c9adc16e8bf2e4cbf07a90"  # SHA-256 von "WWM"
adminPasswordHash:  "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918"  # SHA-256 von "admin"
appTitle:           "Wer kennt ihn am besten?"
```

SHA-256-Hashes für eigene Passwörter berechnen: https://emn178.github.io/online-tools/sha256.html

## 4. Firestore Security Rules deployen

Nach Ablauf der Test-Mode-Periode:

```bash
npm install -g firebase-tools
firebase login
firebase init firestore
firebase deploy --only firestore:rules
```

## 5. Lokale Entwicklung

```bash
npm install
npm run dev
```
→ App läuft auf http://localhost:3000

## 6. Production Build

```bash
npm run build
```
→ Output in `/dist/` — direkt auf GitLab Pages deployen

## 7. GitLab Pages Deployment

CI/CD-Variablen in GitLab setzen (Settings → CI/CD → Variables):
- `FIREBASE_API_KEY`
- `FIREBASE_AUTH_DOMAIN`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_STORAGE_BUCKET`
- `FIREBASE_MESSAGING_SENDER_ID`
- `FIREBASE_APP_ID`

Dann push auf `main` → Pipeline baut und deployed automatisch.

## 8. Avatare hinzufügen

Avatar-Bilder (PNG, ca. 200×200px, quadratisch) in `/public/assets/avatars/` ablegen:
- `beyonce.png`, `ladygaga.png`, `madonna.png`, `britney.png`
- `cher.png`, `tovelo.png`, `rihanna.png`, `kylie.png`
- `mariah.png`, `whitney.png`, `ariana.png`, `taylor.png`

Tipp: Lizenzfreie Illustrations-Icons von flaticon.com oder ähnlichen Quellen verwenden.

## 9. Spiel konfigurieren

1. `admin.html` aufrufen, Passwort: `admin`
2. Unter "Spiele" → Neues Spiel erstellen
3. Fragen hinzufügen (bis zu 15)
4. Spiel aktivieren
5. Unter "Spielsteuerung" → Session starten → QR-Code an Gäste zeigen
