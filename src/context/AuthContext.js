import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  updatePassword,
  updateEmail,
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { Platform } from 'react-native';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen to Firebase auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Load extra profile data from Firestore
        try {
          const snap = await getDoc(doc(db, 'users', firebaseUser.uid));
          const profile = snap.exists() ? snap.data() : {};
          
          // Check if user is banned
          if (profile.banned) {
            await signOut(auth);
            setUser(null);
            setLoading(false);
            // Show ban message (will be handled in login screen)
            return;
          }
          
          setUser({
            id:    firebaseUser.uid,
            email: firebaseUser.email,
            name:  profile.name || firebaseUser.displayName || firebaseUser.email,
            ...profile,
          });
        } catch {
          setUser({
            id:    firebaseUser.uid,
            email: firebaseUser.email,
            name:  firebaseUser.displayName || firebaseUser.email,
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  // ── Login ───────────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      
      // Check if user is banned
      const snap = await getDoc(doc(db, 'users', cred.user.uid));
      if (snap.exists()) {
        const profile = snap.data();
        if (profile.banned) {
          await signOut(auth);
          throw new Error(`Your account has been banned.\nReason: ${profile.banReason || 'Violation of Terms of Service'}`);
        }
      }
      
      return cred.user;
    } catch (e) {
      // Check if it's a ban error
      if (e.message.includes('gesperrt')) {
        throw e;
      }
      
      switch (e.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          throw new Error('Email oder Password falsch.');
        case 'auth/user-disabled':
          throw new Error('Dieses Account wurde deaktiviert.');
        default:
          throw new Error('Anmeldung fehlgeschlagen. Bitte erneut versuchen.');
      }
    }
  };

  // ── Register (called after email verification) ──────────────────────────────
  const register = async (name, email, password, language = 'de') => {
    if (!name.trim() || !email.trim() || !password)
      throw new Error('Please fill all fields.');
    if (password.length < 6)
      throw new Error('Password muss mindestens 6 Zeichen haben.');

    let createdUser = null;
    
    try {
      // Step 1: Create Firebase Auth account
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      createdUser = cred.user;

      // Step 2: Set display name in Firebase Auth
      await updateProfile(cred.user, { displayName: name.trim() });

      // Step 3: Save profile in Firestore
      await setDoc(doc(db, 'users', cred.user.uid), {
        name:      name.trim(),
        email:     email.trim().toLowerCase(),
        language,
        createdAt: serverTimestamp(),
        isPremium: false,
      });

      return cred.user;
    } catch (e) {
      // If anything fails after account creation, delete the Firebase Auth account
      if (createdUser) {
        try {
          await deleteUser(createdUser);
          console.log('Cleaned up incomplete account:', createdUser.email);
        } catch (cleanupError) {
          console.error('Failed to cleanup account:', cleanupError);
        }
      }
      
      // Handle specific errors
      switch (e.code) {
        case 'auth/email-already-in-use':
          throw new Error('This email is already registered.');
        case 'auth/invalid-email':
          throw new Error('Invalid email address.');
        case 'auth/weak-password':
          throw new Error('Password is too weak.');
        default:
          throw new Error('Registrierung fehlgeschlagen. Bitte erneut versuchen.');
      }
    }
  };

  // ── Google Sign-In (Login only - existing users) ───────────────────────────
  const loginWithGoogle = async () => {
    // Check if running on web
    if (Platform.OS !== 'web') {
      throw new Error('Google Sign-In ist nur im Web verfügbar.\n\nFür Android/iOS brauchst du einen Development Build:\neas build --profile development');
    }

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Check if user exists in Firestore
      const snap = await getDoc(doc(db, 'users', result.user.uid));
      
      if (!snap.exists()) {
        // User doesn't exist - sign them out and show error
        await signOut(auth);
        throw new Error('Dieser Account ist nicht registriert.\n\nBitte registriere dich zuerst.');
      }
      
      // Check if user is banned
      const profile = snap.data();
      if (profile.banned) {
        await signOut(auth);
        throw new Error(`Your account has been banned.\nReason: ${profile.banReason || 'Violation of Terms of Service'}`);
      }
      
      return result.user;
    } catch (e) {
      console.error('Google Sign-In error:', e);
      
      if (e.code === 'auth/popup-closed-by-user') {
        throw new Error('Google Sign-In wurde abgebrochen.');
      } else if (e.message?.includes('nicht registriert') || e.message?.includes('banned')) {
        throw e;
      } else {
        throw new Error('Google Sign-In fehlgeschlagen. Bitte erneut versuchen.');
      }
    }
  };

  // ── Google Sign-In (Register - create new users) ───────────────────────────
  const registerWithGoogle = async () => {
    // Check if running on web
    if (Platform.OS !== 'web') {
      throw new Error('Google Sign-In ist nur im Web verfügbar.\n\nFür Android/iOS brauchst du einen Development Build:\neas build --profile development');
    }

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Check if user already exists
      const snap = await getDoc(doc(db, 'users', result.user.uid));
      
      if (snap.exists()) {
        // User already exists - just log them in
        const profile = snap.data();
        if (profile.banned) {
          await signOut(auth);
          throw new Error(`Your account has been banned.\nReason: ${profile.banReason || 'Violation of Terms of Service'}`);
        }
        return result.user;
      }
      
      // New user - create profile in Firestore
      await setDoc(doc(db, 'users', result.user.uid), {
        name:      result.user.displayName || 'Google User',
        email:     result.user.email.toLowerCase(),
        language:  'en',
        createdAt: serverTimestamp(),
        isPremium: false,
        provider:  'google',
      });
      
      return result.user;
    } catch (e) {
      console.error('Google Register error:', e);
      
      if (e.code === 'auth/popup-closed-by-user') {
        throw new Error('Google Sign-In wurde abgebrochen.');
      } else if (e.message?.includes('banned')) {
        throw e;
      } else {
        throw new Error('Google Registrierung fehlgeschlagen. Bitte erneut versuchen.');
      }
    }
  };

  // ── Logout ──────────────────────────────────────────────────────────────────
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error('logout:', e);
    }
  };

  // ── Update user profile ─────────────────────────────────────────────────────
  const updateUser = async (updates) => {
    if (!user?.id) return;
    try {
      // Update Firestore first
      await updateDoc(doc(db, 'users', user.id), updates);
      
      // Update Firebase Auth if name changed (email is handled separately with verification)
      if (updates.name && auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: updates.name });
      }
      
      setUser((prev) => ({ ...prev, ...updates }));
    } catch (e) {
      console.error('updateUser:', e);
      throw new Error('Aktualisierung fehlgeschlagen.');
    }
  };

  // ── Update email with verification ──────────────────────────────────────────
  const updateUserEmail = async (newEmail, currentPassword) => {
    if (!auth.currentUser || !user?.email || !user?.id) throw new Error('Nicht angemeldet.');
    
    try {
      // Re-authenticate first
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      
      // Update email in Firebase Auth
      await updateEmail(auth.currentUser, newEmail);
      
      // Update email in Firestore
      await updateDoc(doc(db, 'users', user.id), { email: newEmail.toLowerCase() });
      
      setUser((prev) => ({ ...prev, email: newEmail.toLowerCase() }));
    } catch (e) {
      console.error('updateUserEmail error:', e.code, e.message);
      switch (e.code) {
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          throw new Error('Password ist falsch.');
        case 'auth/email-already-in-use':
          throw new Error('This email is already in use.');
        case 'auth/invalid-email':
          throw new Error('Invalid email address.');
        case 'auth/requires-recent-login':
          throw new Error('Please sign in again and try again.');
        case 'auth/too-many-requests':
          throw new Error('Zu viele Versuche. Bitte warte einige Minuten und versuche es erneut.');
        default:
          throw new Error('Email konnte nicht geändert werden: ' + (e.message || 'Unbekannter Error'));
      }
    }
  };

  // ── Update password ─────────────────────────────────────────────────────────
  const updateUserPassword = async (currentPassword, newPassword) => {
    if (!auth.currentUser || !user?.email) throw new Error('Nicht angemeldet.');
    
    try {
      // Re-authenticate first
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      
      // Update password
      await updatePassword(auth.currentUser, newPassword);
    } catch (e) {
      console.error('updateUserPassword error:', e.code, e.message);
      switch (e.code) {
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          throw new Error('Aktuelles Password ist falsch.');
        case 'auth/weak-password':
          throw new Error('Neues Password ist zu schwach.');
        case 'auth/requires-recent-login':
          throw new Error('Bitte melde dich erneut an und versuche es nochmal.');
        case 'auth/too-many-requests':
          throw new Error('Zu viele Versuche. Bitte warte einige Minuten und versuche es erneut.');
        default:
          throw new Error('Password konnte nicht geändert werden: ' + (e.message || 'Unbekannter Error'));
      }
    }
  };

  // ── Delete account ──────────────────────────────────────────────────────────
  const deleteAccount = async (password) => {
    if (!auth.currentUser || !user?.id) throw new Error('Nicht angemeldet.');
    
    try {
      // Check if user signed in with Google (no password needed)
      const isGoogleUser = user?.provider === 'google';
      
      if (!isGoogleUser) {
        // Email/Password user - need to re-authenticate
        if (!user?.email) throw new Error('Email nicht gefunden.');
        if (!password) throw new Error('Password erforderlich.');
        
        const credential = EmailAuthProvider.credential(user.email, password);
        await reauthenticateWithCredential(auth.currentUser, credential);
      }
      // Google users don't need re-authentication for account deletion
      
      // Delete Firestore data
      await deleteDoc(doc(db, 'users', user.id));
      
      // Delete Firebase Auth user
      await deleteUser(auth.currentUser);
    } catch (e) {
      console.error('deleteAccount error:', e.code, e.message);
      switch (e.code) {
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          throw new Error('Password ist falsch.');
        case 'auth/requires-recent-login':
          throw new Error('Bitte melde dich erneut an und versuche es nochmal.');
        case 'auth/too-many-requests':
          throw new Error('Zu viele Versuche. Bitte warte einige Minuten und versuche es erneut.');
        default:
          throw new Error('Account konnte nicht gelöscht werden: ' + (e.message || 'Unbekannter Error'));
      }
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login,
      loginWithGoogle,
      registerWithGoogle,
      register, 
      logout, 
      updateUser,
      updateUserEmail, 
      updateUserPassword, 
      deleteAccount 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() { return useContext(AuthContext); }
