# EAS Build - iOS IPA erstellen (EINFACH!)

## Was ist EAS Build?
- Expo's eigener Build-Service
- Baut deine App in der Cloud
- **KOSTENLOS** für Open Source Projekte
- Funktioniert **OHNE** Apple Developer Account (99€)
- Erstellt IPA für AltStore

## Schritt 1: Expo Account erstellen

1. Gehe zu: https://expo.dev/signup
2. Registriere dich (kostenlos)
3. Bestätige deine Email

## Schritt 2: EAS CLI installieren

Öffne PowerShell und führe aus:

```powershell
npm install -g eas-cli
```

## Schritt 3: Bei EAS anmelden

```powershell
cd C:\Users\pohlk\Desktop\fick\SmartWeekPlanner
eas login
```

Gib deine Expo Account Daten ein.

## Schritt 4: iOS Build starten

```powershell
eas build --platform ios --profile preview
```

**Das war's!** EAS macht jetzt:
- ✅ Installiert alle Dependencies
- ✅ Erstellt das iOS Projekt
- ✅ Baut die IPA
- ✅ Hostet die IPA zum Download

## Schritt 5: IPA herunterladen

1. Der Build dauert **10-15 Minuten**
2. Du bekommst einen Link in der Konsole
3. Oder gehe zu: https://expo.dev/accounts/[dein-username]/projects/smart-week-planner/builds
4. Klicke auf den fertigen Build
5. Klicke **"Download"**
6. Du bekommst eine `.ipa` Datei

## Schritt 6: Mit AltStore installieren

1. Öffne AltStore auf deinem iPhone
2. Tippe auf **"+"**
3. Wähle die heruntergeladene `.ipa` Datei
4. Fertig! 🎉

## Wichtig zu wissen

### Kosten
- **KOSTENLOS** für Open Source (dein Projekt ist public auf GitHub)
- Unbegrenzte Builds
- Keine Apple Developer Account nötig

### Apple ID
- Du brauchst nur deine normale Apple ID: `pohldonato123@gmail.com`
- Kein Entwickler-Account nötig
- Keine 99€ Gebühr

### Neu signieren
- Die App läuft 7 Tage
- Dann in AltStore neu signieren (dauert 10 Sekunden)
- Oder neuen Build machen

## Probleme?

### "Not logged in"
```powershell
eas login
```

### "Project not configured"
```powershell
eas build:configure
```

### Build schlägt fehl
- Schau in die Build-Logs auf expo.dev
- Oder frag mich (Kiro) 😊

## Vorteile gegenüber GitHub Actions

✅ **Einfacher** - Ein Befehl statt komplexe Workflows
✅ **Zuverlässiger** - Expo kennt sich mit Expo aus
✅ **Schneller** - Optimierte Build-Umgebung
✅ **Kostenlos** - Für Open Source Projekte
✅ **Support** - Expo Community hilft bei Problemen

## Nächste Schritte

1. Führe `eas build --platform ios --profile preview` aus
2. Warte 10-15 Minuten
3. Lade die IPA herunter
4. Installiere mit AltStore
5. Fertig! 🚀
