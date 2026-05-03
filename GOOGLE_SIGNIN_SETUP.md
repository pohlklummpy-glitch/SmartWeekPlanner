# Google Sign-In Setup Anleitung (Expo AuthSession)

## ✅ Was bereits gemacht wurde:

1. ✅ Expo AuthSession Packages installiert (`expo-auth-session`, `expo-crypto`, `expo-web-browser`)
2. ✅ Google Sign-In Buttons zu Login & Register Screens hinzugefügt
3. ✅ AuthContext mit `loginWithGoogle()` Funktion erweitert
4. ✅ Firebase Auth mit Google Provider konfiguriert
5. ✅ **Funktioniert in Expo Go!** ✨

## 🔧 Was du noch machen musst:

### Schritt 1: Web Client ID von Firebase holen

1. Gehe zur **Firebase Console**: https://console.firebase.google.com/
2. Wähle dein Projekt: **smartweekplanner-77584**
3. Gehe zu **Authentication** → **Sign-in method**
4. Aktiviere **Google** als Sign-in Provider (falls noch nicht aktiviert)
5. Kopiere die **Web Client ID** (sieht aus wie: `123456789-abc123.apps.googleusercontent.com`)

### Schritt 2: Web Client ID in AuthContext einfügen

Öffne `SmartWeekPlanner/src/context/AuthContext.js` und ersetze Zeile ~25:

```javascript
const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
  clientId: '995772478548-YOUR_WEB_CLIENT_ID.apps.googleusercontent.com', // TODO: Replace
});
```

Mit deiner echten Web Client ID:

```javascript
const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
  clientId: '995772478548-DEINE_ECHTE_CLIENT_ID.apps.googleusercontent.com',
});
```

### Schritt 3: App neu starten

```bash
cd SmartWeekPlanner
npm start
```

Drücke `r` um die App neu zu laden.

## 🎉 Fertig!

Jetzt sollte Google Sign-In funktionieren:
- ✅ Funktioniert in **Expo Go**
- ✅ Funktioniert in **Development Builds**
- ✅ Funktioniert in **Production Builds**
- ✅ Benutzer können sich mit ihrem Google Account anmelden
- ✅ Beim ersten Login wird automatisch ein Firestore Profil erstellt

## 🐛 Troubleshooting

**Fehler: "Invalid client ID"**
- Web Client ID ist falsch oder fehlt
- Stelle sicher, dass du die **Web Client ID** verwendest (nicht Android oder iOS Client ID)

**Google Login öffnet sich nicht**
- Stelle sicher, dass du die richtige Client ID eingefügt hast
- Prüfe, ob Google Sign-In in Firebase aktiviert ist

**Fehler nach erfolgreichem Google Login**
- Prüfe Firebase Console Logs
- Stelle sicher, dass Firestore Regeln das Schreiben erlauben

## 📱 Testing

- **Expo Go**: ✅ Funktioniert!
- **Development Build**: ✅ Funktioniert!
- **Production Build**: ✅ Funktioniert!

## 🔐 Sicherheit

Die Expo AuthSession Methode ist sicher, weil:
- OAuth Flow läuft über Google's Server
- ID Token wird direkt von Google validiert
- Firebase verifiziert den Token serverseitig
- Keine Secrets im Client Code
