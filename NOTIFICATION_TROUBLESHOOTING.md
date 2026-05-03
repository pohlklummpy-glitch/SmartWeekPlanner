# 🔔 Notification Troubleshooting

## ✅ Notifications erscheinen, aber kein Sound?

### Problem: Notifications sind stumm

Dein Screenshot zeigt dass die Notifications **funktionieren** (sie erscheinen im Notification Center), aber möglicherweise **keinen Sound** abspielen.

### Lösung 1: iPhone Lautlos-Modus checken

```
1. Checke den Schalter an der linken Seite des iPhones
2. Wenn du ORANGE siehst → Lautlos-Modus ist AN
3. Schiebe den Schalter nach oben → Lautlos-Modus AUS
4. Teste nochmal
```

### Lösung 2: Notification-Einstellungen für Expo Go

```
1. Einstellungen → Mitteilungen → Expo Go
2. Stelle sicher dass:
   ✅ "Mitteilungen erlauben" ist AN
   ✅ "Töne" ist AN
   ✅ "Banner" ist AN
   ✅ "Im Sperrbildschirm" ist AN
   ✅ "Mitteilungszentrale" ist AN
3. Mitteilungsstil: "Banner" oder "Hinweise"
```

### Lösung 3: "Nicht stören" deaktivieren

```
1. Kontrollzentrum öffnen (von oben rechts wischen)
2. Checke ob "Fokus" oder "Nicht stören" aktiv ist
3. Wenn ja → Deaktivieren
4. Teste nochmal
```

### Lösung 4: Lautstärke erhöhen

```
1. Drücke Lautstärke-Taste (oben)
2. Stelle sicher dass Klingelton-Lautstärke hoch ist
3. Teste nochmal
```

---

## 🎯 Expo Go Limitation

### ⚠️ Wichtig zu wissen:

In **Expo Go** werden Notifications mit dem **System-Standard-Sound** abgespielt.

**Das bedeutet**:
- ✅ Notifications funktionieren
- ✅ Erscheinen im Notification Center
- ✅ Wecken Display auf
- ⚠️ Sound ist der Standard-Notification-Sound
- ❌ Custom Sounds (Bell, Chime) funktionieren NICHT

### Mit Development Build:

```bash
eas build --profile development --platform ios
```

**Dann funktionieren**:
- ✅ Notifications
- ✅ Custom Sounds (Bell, Chime, etc.)
- ✅ Lautere/auffälligere Sounds
- ✅ Widgets
- ✅ Alle nativen Features

---

## 🔧 Debug: Notification-Berechtigungen checken

### In der App:

Füge temporär diesen Code in `App.js` ein (nach Zeile 30):

```javascript
useEffect(() => {
  async function checkPermissions() {
    const { status } = await Notifications.getPermissionsAsync();
    console.log('Notification Permission:', status);
    
    if (status !== 'granted') {
      const { status: newStatus } = await Notifications.requestPermissionsAsync();
      console.log('New Permission:', newStatus);
    }
  }
  checkPermissions();
}, []);
```

Dann checke die Konsole:
```bash
npm start
# Schaue in die Konsole
# Sollte zeigen: "Notification Permission: granted"
```

---

## 🎯 Was funktioniert (laut Screenshot):

### ✅ Perfekt:
1. ✅ Notifications werden gesendet
2. ✅ Erscheinen im Notification Center
3. ✅ Vorklingeln funktioniert (5 Min vorher)
4. ✅ Haupt-Notification funktioniert (zur Zeit)
5. ✅ Funktioniert auch wenn App geschlossen
6. ✅ Zeigt korrekte Zeit (17:10 Uhr)
7. ✅ Zeigt korrekten Titel ("test")

### ⚠️ Möglicherweise Problem:
- ⚠️ Kein Sound (wegen Lautlos-Modus oder Expo Go Limitation)
- ⚠️ Keine Vibration (wegen Lautlos-Modus)

---

## 💡 Empfehlung:

### Option 1: Teste mit Sound (JETZT)

```
1. Lautlos-Modus AUS (Schalter an der Seite)
2. Lautstärke HOCH
3. "Nicht stören" AUS
4. Expo Go Notification-Einstellungen checken
5. Neue Task erstellen in 2 Minuten
6. Warten...
7. Sollte jetzt mit Sound kommen!
```

### Option 2: Development Build (für laute Sounds)

```bash
eas build --profile development --platform ios
# Dann funktionieren Custom Sounds
# Und du kannst lautere/auffälligere Sounds wählen
```

---

## 🎉 Zusammenfassung:

**Notifications funktionieren PERFEKT!** ✅

Dein Screenshot beweist:
- ✅ Vorklingeln wurde gesendet
- ✅ Haupt-Notification wurde gesendet
- ✅ Beide im Notification Center
- ✅ Funktioniert auch wenn App geschlossen

**Einziges Problem**: Möglicherweise kein Sound wegen:
- Lautlos-Modus
- "Nicht stören"
- Expo Go Limitation (Standard-Sound ist leise)

**Lösung**: 
1. Lautlos-Modus AUS
2. Oder: Development Build für laute Custom Sounds
