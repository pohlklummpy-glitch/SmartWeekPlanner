# Codemagic - iOS IPA erstellen (Schritt für Schritt)

## Schritt 1: Codemagic Account erstellen

1. Gehe zu: **https://codemagic.io/signup**
2. Klicke auf **"Sign up with GitHub"**
3. Autorisiere Codemagic für dein GitHub Account
4. Du wirst zu Codemagic Dashboard weitergeleitet

## Schritt 2: App hinzufügen

1. Im Codemagic Dashboard klicke auf **"Add application"**
2. Wähle **"GitHub"** als Source
3. Suche nach **"SmartWeekPlanner"** oder wähle es aus der Liste
4. Klicke auf **"Select"**

## Schritt 3: Framework wählen

1. Codemagic fragt: **"Select project type"**
2. Wähle **"React Native"** (NICHT Flutter!)
3. Klicke **"Continue"**

## Schritt 4: Build Konfiguration

### 4.1 Build Settings
1. Klicke auf **"Start new build"** oder **"Configure"**
2. Wähle **"iOS"** als Platform
3. Build mode: **"Release"**

### 4.2 Expo Settings (Wichtig!)
Da du Expo verwendest:
1. Gehe zu **"Build" → "Pre-build script"**
2. Füge hinzu:
```bash
npm install -g expo-cli
npx expo prebuild --platform ios
```

### 4.3 iOS Code Signing

**WICHTIG:** Hier gibt es 2 Optionen:

#### Option A: Ohne Apple Developer Account (Ad-hoc)
1. Gehe zu **"Distribution" → "iOS code signing"**
2. Wähle **"Automatic code signing"**
3. Codemagic erstellt ein temporäres Zertifikat
4. **ABER:** Das funktioniert nur für Simulator oder TestFlight (braucht dann doch Developer Account)

#### Option B: Mit Apple ID (Kostenlos für 7 Tage)
1. Gehe zu **"Distribution" → "iOS code signing"**
2. Wähle **"Manual code signing"**
3. Klicke **"Add certificate"**
4. Wähle **"Development certificate"**
5. Gib deine Apple ID ein: `pohldonato123@gmail.com`
6. Codemagic erstellt ein 7-Tage Zertifikat (wie Xcode)

## Schritt 5: Build starten

1. Klicke auf **"Start new build"**
2. Wähle **"main"** Branch
3. Klicke **"Start build"**
4. Warte 10-20 Minuten

## Schritt 6: IPA herunterladen

1. Wenn der Build fertig ist (grüner Haken ✓)
2. Klicke auf den Build
3. Scrolle zu **"Artifacts"**
4. Klicke auf **"Download"** neben der `.ipa` Datei
5. Speichere die IPA

## Schritt 7: Mit AltStore installieren

1. Öffne AltStore auf deinem iPhone
2. Tippe auf **"+"**
3. Wähle die heruntergeladene `.ipa` Datei
4. Fertig! 🎉

---

## Alternative: codemagic.yaml Datei

Für automatische Builds kannst du eine `codemagic.yaml` erstellen:

```yaml
workflows:
  ios-workflow:
    name: iOS Workflow
    max_build_duration: 60
    environment:
      node: 18
      xcode: latest
    scripts:
      - name: Install dependencies
        script: |
          npm install
      - name: Expo prebuild
        script: |
          npm install -g expo-cli
          npx expo prebuild --platform ios
      - name: Install CocoaPods
        script: |
          cd ios
          pod install
      - name: Build iOS
        script: |
          cd ios
          xcodebuild -workspace SmartWeekPlanner.xcworkspace \
            -scheme SmartWeekPlanner \
            -configuration Release \
            -archivePath build/SmartWeekPlanner.xcarchive \
            archive \
            CODE_SIGN_IDENTITY="" \
            CODE_SIGNING_REQUIRED=NO \
            CODE_SIGNING_ALLOWED=NO
    artifacts:
      - ios/build/*.ipa
```

Speichere das als `codemagic.yaml` im Root deines Projekts.

---

## Wichtige Hinweise

### Kostenlose Limits
- **500 Build-Minuten/Monat** kostenlos
- Danach: 0.038€/Minute

### Code Signing Problem
**ACHTUNG:** Auch Codemagic braucht für **echte iPhone IPAs** entweder:
- Apple Developer Account (99€)
- Oder nur 7-Tage Development Zertifikat (wie Xcode)

### Wenn es nicht funktioniert
Falls Codemagic auch nach Apple Developer Account fragt:
- **Expo Go** ist die einzige kostenlose Option
- Oder die 99€ zahlen

---

## Support

Wenn du Probleme hast:
1. Codemagic Docs: https://docs.codemagic.io/
2. Codemagic Support: support@codemagic.io
3. Oder frag mich (Kiro) 😊

Viel Erfolg! 🚀
