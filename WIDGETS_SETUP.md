# 📱 Widgets & Custom Sounds Setup

## ⚠️ Wichtig: Nur mit Development Build!

Widgets und Custom Sounds funktionieren **NICHT** in Expo Go!

Du brauchst:
- ✅ Apple Developer Account (99€/Jahr) ODER
- ✅ AltStore (kostenlos, alle 7 Tage neu signieren)

---

## 🔔 Klingelton-Auswahl

### Aktueller Status:
✅ UI ist fertig (Settings → Notification Sound)
✅ 3 Sounds zur Auswahl: Default, Bell, Chime
✅ Wird in Firebase gespeichert
⏳ Custom Sounds funktionieren erst mit Development Build

### In Expo Go:
- Klingelton-Auswahl wird angezeigt
- Auswahl wird gespeichert
- Aber: System-Standard-Sound wird verwendet

### Mit Development Build:
- Alle 3 Sounds funktionieren
- Custom Sound wird abgespielt

---

## 📊 Widget Setup (für später)

### Schritt 1: Dependencies installieren
```bash
npm install react-native-widget-extension
```

### Schritt 2: Widget erstellen
```javascript
// widgets/TaskWidget.js
import { WidgetPreview } from 'react-native-widget-extension';

export default function TaskWidget({ task }) {
  return (
    <WidgetPreview>
      <View style={{ backgroundColor: task.color }}>
        <Text>Erinnerung in 15 Min</Text>
        <Text>{task.title}</Text>
        <Text>{task.time}</Text>
      </View>
    </WidgetPreview>
  );
}
```

### Schritt 3: Widget registrieren
```javascript
// app.json
{
  "expo": {
    "plugins": [
      [
        "react-native-widget-extension",
        {
          "widgets": [
            {
              "name": "TaskReminder",
              "displayName": "Task Reminder"
            }
          ]
        }
      ]
    ]
  }
}
```

---

## 🚀 Development Build erstellen

### Option 1: EAS Build (mit 99€)
```bash
# iOS
eas build --profile development --platform ios

# Android
eas build --profile development --platform android
```

### Option 2: AltStore (kostenlos)
```bash
# Build erstellen
eas build --profile preview --platform ios

# Mit AltStore installieren
# Alle 7 Tage neu signieren
```

---

## ✅ Checklist

### Jetzt (Expo Go):
- [x] Klingelton-Auswahl UI
- [x] Einstellungen speichern
- [x] In-App Reminder Popup
- [x] Standard Notifications

### Mit Development Build:
- [ ] Custom Sounds
- [ ] Widgets
- [ ] Push Notifications im Standby
- [ ] Alle nativen Features

---

## 📝 Notizen

- Klingelton-Auswahl ist bereits implementiert
- Code ist bereit für Development Build
- Widgets müssen noch implementiert werden
- Alles funktioniert sobald Development Build erstellt ist

---

## 🔗 Links

- EAS Build: https://docs.expo.dev/build/introduction/
- AltStore: https://altstore.io
- Widgets: https://docs.expo.dev/guides/widgets/
