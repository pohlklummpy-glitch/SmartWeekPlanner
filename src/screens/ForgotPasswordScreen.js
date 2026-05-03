import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../components/Toast';
import { SIZES } from '../constants/theme';
import { sendVerificationEmail, generateVerificationCode } from '../services/EmailService';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

// Email validation functions from RegisterScreen
function isValidEmailFormat(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

const BLOCKED_DOMAINS = [
  'mailinator.com','guerrillamail.com','tempmail.com','throwaway.email',
  'yopmail.com','sharklasers.com','guerrillamailblock.com','grr.la',
  'guerrillamail.info','spam4.me','trashmail.com','dispostable.com',
  'maildrop.cc','fakeinbox.com','temp-mail.org','getnada.com',
  'discard.email','spamgourmet.com','mailnull.com','spamspot.com',
];

function isDisposableEmail(email) {
  const domain = email.trim().toLowerCase().split('@')[1] || '';
  return BLOCKED_DOMAINS.includes(domain);
}

async function checkEmailDomainExists(email) {
  try {
    const domain = email.trim().toLowerCase().split('@')[1];
    if (!domain) return false;
    const res = await fetch(
      `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=MX`,
      { headers: { Accept: 'application/json' } }
    );
    const data = await res.json();
    return data.Status === 0 && Array.isArray(data.Answer) && data.Answer.length > 0;
  } catch {
    return true;
  }
}

export default function ForgotPasswordScreen({ navigation }) {
  const { colors } = useTheme();
  const { showToast } = useToast();
  const [step, setStep] = useState('email'); // 'email' | 'code' | 'password'
  const [email, setEmail] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [expectedCode, setExpectedCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const inputs = useRef([]);
  const auth = getAuth();
  const db = getFirestore();

  const handleSendCode = async () => {
    const trimmedEmail = email.trim();
    
    // Validate email format
    if (!trimmedEmail || !isValidEmailFormat(trimmedEmail)) {
      showToast('Bitte eine gültige Email eingeben.', 'error');
      return;
    }
    
    // Check for disposable email
    if (isDisposableEmail(trimmedEmail)) {
      showToast('Disposable emails sind nicht erlaubt.', 'error');
      return;
    }
    
    setLoading(true);
    setCheckingEmail(true);
    
    try {
      // Check if email domain exists
      const domainExists = await checkEmailDomainExists(trimmedEmail);
      if (!domainExists) {
        showToast('Diese Email-Domain existiert nicht.', 'error');
        setLoading(false);
        setCheckingEmail(false);
        return;
      }
      
      // Check if user exists in Firebase
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', trimmedEmail.toLowerCase()));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        showToast('Diese Email ist nicht registriert.', 'error');
        setLoading(false);
        setCheckingEmail(false);
        return;
      }
      
      // Send verification code via email
      const newCode = generateVerificationCode();
      await sendVerificationEmail(trimmedEmail, 'User', newCode);
      setExpectedCode(newCode);
      setStep('code');
      showToast('Code wurde gesendet!', 'success');
    } catch (e) {
      console.error('Send code error:', e);
      showToast(e.message || 'Fehler beim Senden des Codes.', 'error');
    } finally {
      setLoading(false);
      setCheckingEmail(false);
    }
  };

  const handleVerifyCode = () => {
    const entered = code.join('');
    if (entered.length < 6) {
      showToast('Bitte alle 6 Ziffern eingeben.', 'error');
      return;
    }
    if (entered !== expectedCode) {
      showToast('Der eingegebene Code ist falsch.', 'error');
      setCode(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
      return;
    }
    setStep('password');
    showToast('Code bestätigt!', 'success');
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      showToast('Bitte beide Felder ausfüllen.', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('Password muss mindestens 6 Zeichen haben.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Passwords stimmen nicht überein.', 'error');
      return;
    }

    setLoading(true);
    try {
      // Send Firebase password reset email
      await sendPasswordResetEmail(auth, email.trim().toLowerCase());
      
      showToast('Password-Reset-Link wurde an deine Email gesendet!', 'success');
      
      // Navigate back to login after 2 seconds
      setTimeout(() => {
        navigation.navigate('Login');
      }, 2000);
    } catch (e) {
      console.error('Reset password error:', e);
      
      switch (e.code) {
        case 'auth/user-not-found':
          showToast('Diese Email ist nicht registriert.', 'error');
          break;
        case 'auth/invalid-email':
          showToast('Ungültige Email-Adresse.', 'error');
          break;
        case 'auth/too-many-requests':
          showToast('Zu viele Versuche. Bitte warte einige Minuten.', 'error');
          break;
        default:
          showToast('Fehler beim Zurücksetzen des Passwords.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDigit = (val, idx) => {
    if (val.length === 6 && /^\d{6}$/.test(val)) {
      setCode(val.split(''));
      inputs.current[5]?.focus();
      return;
    }
    const digit = val.replace(/\D/g, '').slice(-1);
    const next = [...code];
    next[idx] = digit;
    setCode(next);
    if (digit && idx < 5) inputs.current[idx + 1]?.focus();
  };

  const handleKeyPress = (e, idx) => {
    if (e.nativeEvent.key === 'Backspace' && !code[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
        <View style={[styles.backChevron, { borderColor: colors.primary }]} />
        <Text style={[styles.backText, { color: colors.primary }]}>Back</Text>
      </TouchableOpacity>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Icon */}
          <View style={styles.iconArea}>
            <View style={[styles.iconBox, { backgroundColor: colors.primary + '18', borderColor: colors.primary + '40' }]}>
              <Text style={styles.iconEmoji}>🔑</Text>
            </View>
            <Text style={[styles.title, { color: colors.text }]}>Password vergessen?</Text>
            <Text style={[styles.sub, { color: colors.textMuted }]}>
              {step === 'email' && 'Gib deine Email ein, um einen Code zu erhalten.'}
              {step === 'code' && 'Gib den 6-stelligen Code ein.'}
              {step === 'password' && 'Wähle ein neues Password.'}
            </Text>
          </View>

          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {/* Step 1: Email */}
            {step === 'email' && (
              <>
                <Text style={[styles.label, { color: colors.textMuted }]}>E-MAIL</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surfaceLight, borderColor: colors.border, color: colors.text }]}
                  placeholder="name@beispiel.de"
                  placeholderTextColor={colors.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoFocus
                />
                <TouchableOpacity
                  style={[styles.btn, { backgroundColor: colors.primary, shadowColor: colors.primary, opacity: loading || checkingEmail ? 0.7 : 1 }]}
                  onPress={handleSendCode}
                  disabled={loading || checkingEmail}
                >
                  {loading || checkingEmail ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Send Code</Text>}
                </TouchableOpacity>
              </>
            )}

            {/* Step 2: Code */}
            {step === 'code' && (
              <>
                <View style={styles.codeRow}>
                  {code.map((digit, idx) => (
                    <TextInput
                      key={idx}
                      ref={(r) => { inputs.current[idx] = r; }}
                      style={[
                        styles.codeInput,
                        {
                          backgroundColor: colors.surfaceLight,
                          borderColor: digit ? colors.primary : colors.border,
                          color: colors.text,
                        },
                      ]}
                      value={digit}
                      onChangeText={(v) => handleDigit(v, idx)}
                      onKeyPress={(e) => handleKeyPress(e, idx)}
                      keyboardType="number-pad"
                      maxLength={6}
                      textAlign="center"
                      selectTextOnFocus
                    />
                  ))}
                </View>
                <TouchableOpacity
                  style={[styles.btn, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
                  onPress={handleVerifyCode}
                >
                  <Text style={styles.btnText}>Confirm</Text>
                </TouchableOpacity>
              </>
            )}

            {/* Step 3: New Password */}
            {step === 'password' && (
              <>
                <Text style={[styles.label, { color: colors.textMuted }]}>NEW PASSWORD</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surfaceLight, borderColor: colors.border, color: colors.text }]}
                  placeholder="At least 6 characters"
                  placeholderTextColor={colors.textMuted}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                  autoFocus
                />

                <Text style={[styles.label, { color: colors.textMuted }]}>PASSWORT CONFIRM</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surfaceLight, borderColor: colors.border, color: colors.text }]}
                  placeholder="Password wiederholen"
                  placeholderTextColor={colors.textMuted}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />

                <TouchableOpacity
                  style={[styles.btn, { backgroundColor: colors.primary, shadowColor: colors.primary, opacity: loading ? 0.7 : 1 }]}
                  onPress={handleResetPassword}
                  disabled={loading}
                >
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Password zurücksetzen</Text>}
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: SIZES.paddingLg, paddingTop: 20, paddingBottom: 48 },
  back: { position: 'absolute', top: 56, left: SIZES.paddingLg, flexDirection: 'row', alignItems: 'center', gap: 8, zIndex: 10 },
  backChevron: { width: 8, height: 8, borderLeftWidth: 2, borderBottomWidth: 2, transform: [{ rotate: '45deg' }] },
  backText: { fontSize: SIZES.base, fontWeight: '600' },
  iconArea: { alignItems: 'center', marginBottom: 32 },
  iconBox: {
    width: 72, height: 72, borderRadius: 20, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  iconEmoji: { fontSize: 32 },
  title: { fontSize: SIZES.xl, fontWeight: '800', letterSpacing: -0.5, marginBottom: 10 },
  sub: { fontSize: SIZES.sm, textAlign: 'center', lineHeight: 22, paddingHorizontal: 24 },
  card: { borderRadius: SIZES.radiusLg, padding: SIZES.paddingLg, borderWidth: 1, marginBottom: 24 },
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 8, marginTop: 4 },
  input: {
    borderRadius: SIZES.radius, paddingHorizontal: 14, paddingVertical: 14,
    fontSize: SIZES.base, borderWidth: 1.5, marginBottom: 16,
  },
  codeRow: { flexDirection: 'row', gap: 8, justifyContent: 'center', marginBottom: 24 },
  codeInput: {
    width: 44, height: 54, borderRadius: SIZES.radius,
    fontSize: SIZES.xl, fontWeight: '800', borderWidth: 2,
  },
  btn: {
    borderRadius: SIZES.radius, paddingVertical: 15, alignItems: 'center',
    shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8,
  },
  btnText: { color: '#fff', fontSize: SIZES.base, fontWeight: '700' },
});
