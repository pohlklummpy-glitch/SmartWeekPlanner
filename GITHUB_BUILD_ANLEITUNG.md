# 🚀 GitHub Actions Build - Komplette Anleitung

## Schritt 1: GitHub Repo erstellen

### 1.1 Auf GitHub.com:
1. Gehe zu https://github.com/new
2. Repository Name: `SmartWeekPlanner`
3. Private oder Public (egal)
4. **NICHT** "Initialize with README" anklicken
5. Create Repository

### 1.2 Im Terminal:
```bash
cd SmartWeekPlanner

# Git initialisieren
git init

# Alle Dateien hinzufügen
git add .

# Commit erstellen
git commit -m "Initial commit"

# Branch umbenennen
git branch -M main

# Remote hinzufügen (ERSETZE DEINNAME!)
git remote add origin https://github.com/DEINNAME/SmartWeekPlanner.git

# Pushen
git push -u origin main
```

---

## Schritt 2: Build starten

### 2.1 Auf GitHub:
1. Gehe zu deinem Repo
2. Klicke auf **"Actions"** Tab
3. Klicke auf **"Build iOS App"**
4. Klicke auf **"Run workflow"**
5. Klicke auf grünen **"Run workflow"** Button

### 2.2 Warten:
- Build dauert **10-15 Minuten**
- Du siehst den Fortschritt live

---

## Schritt 3: .ipa downloaden

### 3.1 Wenn Build fertig:
1. Klicke auf den Build (grüner Haken ✅)
2. Scrolle runter zu **"Artifacts"**
3. Klicke auf **"SmartWeekPlanner.ipa"**
4. Download startet automatisch

---

## Schritt 4: Mit AltStore installieren

### 4.1 AltStore installieren:
1. PC: https://altstore.io → Download AltServer
2. iPhone: AltStore App über PC installieren

### 4.2 .ipa installieren:
1. AltStore auf iPhone öffnen
2. Klicke auf **"+"** (oben links)
3. Wähle die heruntergeladene `.ipa` Datei
4. Warten...
5. **Fertig!** App ist installiert! 🎉

### 4.3 Wichtig:
- **Alle 7 Tage** neu signieren (AltStore macht das automatisch)
- iPhone & PC müssen im **gleichen WLAN** sein
- **AltServer** muss auf PC laufen

---

## ⚠️ Troubleshooting

### Problem: "Build failed"
**Lösung**: Checke die Logs in GitHub Actions

### Problem: "No code signing identity found"
**Lösung**: Das ist OK! AltStore signiert die App später

### Problem: "Can't install .ipa"
**Lösung**: 
1. Stelle sicher dass AltServer auf PC läuft
2. iPhone & PC im gleichen WLAN
3. Vertraue dem Entwickler: Einstellungen → Allgemein → VPN & Geräteverwaltung

---

## 🎉 Fertig!

Jetzt hast du:
- ✅ Kostenlose Cloud-Builds
- ✅ .ipa Download
- ✅ Installation mit AltStore
- ✅ Alle Features (inkl. Widgets!)
- ✅ 0€ Kosten

**Alle 7 Tage**: AltStore öffnen → App wird automatisch neu signiert

---

## 📝 Für Updates:

```bash
# Code ändern
git add .
git commit -m "Update"
git push

# Dann auf GitHub: Actions → Run workflow
# Neue .ipa downloaden
# Mit AltStore installieren
```

**Viel Erfolg!** 🚀
