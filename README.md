# 📅 Smart Week Planner

Eine smarte Wochenplanungs-App mit Login-System und Premium-Werbung.

## 🚀 Setup

### Voraussetzungen
- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- Expo Go App auf deinem Handy (iOS/Android)

### Installation

```bash
cd SmartWeekPlanner
npm install
npx expo start
```

Dann QR-Code mit der Expo Go App scannen.

---

## 📱 Features

### Kostenlos
- ✅ Login & Registrierung (lokal gespeichert)
- ✅ Wochenübersicht mit Tagesauswahl
- ✅ Aufgaben erstellen (einmalig oder wöchentlich)
- ✅ Push-Benachrichtigungen
- ✅ Snooze-Funktion (5/10/30 Min)
- ✅ Aufgaben kopieren auf andere Tage
- ✅ Kategorien (Sport, Arbeit, Freizeit, etc.)
- ✅ Wochenziele setzen
- ✅ Statistiken
- ✅ Smarte Vorschläge (Gewohnheiten)
- 📢 Werbebanner (alle 5 Aktionen Interstitial)

### Premium (⭐)
- ✅ Keine Werbung
- ✅ Fokus-Modus
- ✅ Vor-Erinnerungen (5/10/15/30 Min)
- ✅ Cloud-Sync (Platzhalter – Firebase ready)
- ✅ Unbegrenzte Ziele

---

## 🏗️ Architektur

```
SmartWeekPlanner/
├── App.js                    # Root mit Navigation
├── src/
│   ├── constants/
│   │   └── theme.js          # Farben, Fonts, Kategorien
│   ├── context/
│   │   ├── AuthContext.js    # Login/Register (AsyncStorage)
│   │   ├── PlannerContext.js # Aufgaben, Ziele, Gewohnheiten
│   │   └── PremiumContext.js # Premium-Status, Werbezähler
│   ├── navigation/
│   │   └── MainTabNavigator.js
│   ├── screens/
│   │   ├── OnboardingScreen.js
│   │   ├── LoginScreen.js
│   │   ├── RegisterScreen.js
│   │   ├── WeekScreen.js     # Hauptansicht
│   │   ├── GoalsScreen.js    # Ziele
│   │   ├── StatsScreen.js    # Statistiken
│   │   └── ProfileScreen.js  # Profil + Premium
│   ├── components/
│   │   ├── TaskCard.js       # Aufgabenkarte
│   │   ├── AddTaskModal.js   # Aufgabe hinzufügen/bearbeiten
│   │   ├── AdBanner.js       # Werbebanner + Interstitial
│   │   ├── SuggestionCard.js # Smarte Vorschläge
│   │   └── FocusModeOverlay.js
│   └── services/
│       └── NotificationService.js
```

---

## 💰 Monetarisierung

### Werbung (Free-Tier)
- **Banner-Werbung**: Oben auf jeder Hauptseite
- **Interstitial**: Alle 5 Nutzeraktionen (Aufgabe erstellen/abschließen)
- In Produktion: Google AdMob via `react-native-google-mobile-ads`

### Premium (In-App-Kauf)
- Monatlich: €2,99
- Jährlich: €19,99 (€1,67/Monat)
- In Produktion: RevenueCat oder `expo-in-app-purchases`

---

## 🔧 Produktion-Setup

### AdMob einrichten
1. Google AdMob Konto erstellen
2. App-ID in `app.json` eintragen
3. `react-native-google-mobile-ads` konfigurieren

### Firebase Auth (optional)
1. Firebase Projekt erstellen
2. `google-services.json` (Android) / `GoogleService-Info.plist` (iOS) hinzufügen
3. `AuthContext.js` auf Firebase Auth umstellen

### In-App-Käufe
1. RevenueCat Konto erstellen
2. `react-native-purchases` installieren
3. `PremiumContext.js` auf RevenueCat umstellen
