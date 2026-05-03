import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { SIZES } from '../constants/theme';
import { sendVerificationEmail, generateVerificationCode } from '../services/EmailService';
import GoogleIcon from '../components/GoogleIcon';

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

export default function RegisterScreen({ navigation }) {
  const { colors } = useTheme();
  const { registerWithGoogle } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [focused, setFocused] = useState(null);
  const [errors, setErrors] = useState({ name:'', email:'', password:'', confirm:'' });
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const setError = (f, m) => setErrors(p => ({ ...p, [f]: m }));
  const clearError = (f) => setErrors(p => ({ ...p, [f]: '' }));

  const validate = () => {
    let valid = true;
    const e = { name:'', email:'', password:'', confirm:'' };
    if (!name.trim()) { e.name = 'Name is required'; valid = false; }
    if (!email.trim()) { e.email = 'Email is required'; valid = false; }
    else if (!isValidEmailFormat(email)) { e.email = 'Invalid email format'; valid = false; }
    if (!password) { e.password = 'Password is required'; valid = false; }
    else if (password.length < 6) { e.password = 'At least 6 characters'; valid = false; }
    if (!confirm) { e.confirm = 'Confirm password required'; valid = false; }
    else if (password !== confirm) { e.confirm = 'Passwords do not match'; valid = false; }
    setErrors(e);
    return valid;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    if (!acceptedTerms) {
      setError('confirm', 'Please accept the terms of service');
      return;
    }
    
    setLoading(true);
    try {
      // Check disposable email
      if (isDisposableEmail(email)) {
        setError('email', 'Disposable email addresses are not allowed');
        setLoading(false);
        return;
      }

      // Check DNS MX records
      const domainExists = await checkEmailDomainExists(email);
      if (!domainExists) {
        setError('email', 'Email domain does not exist or has no mail server');
        setLoading(false);
        return;
      }

      // Generate code and send email
      const code = generateVerificationCode();
      console.log('Sending verification email to:', email.trim());
      
      await sendVerificationEmail(email.trim(), name.trim(), code);
      
      console.log('Email sent successfully, navigating to VerifyEmail');
      navigation.navigate('VerifyEmail', {
        pendingUser: { name: name.trim(), email: email.trim().toLowerCase(), password, language: 'en' },
        code,
      });
    } catch (e) {
      console.error('Registration error:', e);
      setError('email', e.message || 'Failed to send verification email');
      showToast(e.message || 'Failed to send verification email', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    if (!acceptedTerms) {
      showToast('Please accept the terms of service', 'error');
      return;
    }
    setGoogleLoading(true);
    try {
      await registerWithGoogle();
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setGoogleLoading(false);
    }
  };

  const borderColor = (field) => {
    if (errors[field]) return colors.error;
    if (focused === field) return colors.primary;
    return colors.border;
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
        <View style={[styles.backChevron, { borderColor: colors.primary }]} />
        <Text style={[styles.backText, { color: colors.primary }]}>Back</Text>
      </TouchableOpacity>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.logoArea}>
            <View style={[styles.logoBox, { backgroundColor: colors.primary, shadowColor: colors.primary }]}>
              <View style={styles.logoInner}>
                <View style={[styles.logoLine, { backgroundColor: '#fff' }]} />
                <View style={[styles.logoLine, { backgroundColor: '#fff', width: 16 }]} />
                <View style={[styles.logoLine, { backgroundColor: '#fff', width: 20 }]} />
              </View>
            </View>
            <Text style={[styles.appName, { color: colors.text }]}>Register</Text>
          </View>

          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.label, { color: colors.textMuted }]}>NAME</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surfaceLight, borderColor: borderColor('name'), color: colors.text }]}
              placeholder="Your name"
              placeholderTextColor={colors.textMuted}
              value={name}
              onChangeText={(v) => { setName(v); if (v.trim()) clearError('name'); }}
              autoCapitalize="words"
              autoCorrect={false}
              onFocus={() => setFocused('name')}
              onBlur={() => { setFocused(null); if (!name.trim()) setError('name', 'Name is required'); }}
            />
            {errors.name ? <Text style={[styles.errorText, { color: colors.error }]}>⚠ {errors.name}</Text> : null}

            <Text style={[styles.label, { color: colors.textMuted }]}>EMAIL</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surfaceLight, borderColor: borderColor('email'), color: colors.text }]}
              placeholder="name@example.com"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={(v) => { setEmail(v); clearError('email'); }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              onFocus={() => setFocused('email')}
              onBlur={() => setFocused(null)}
            />
            {errors.email ? <Text style={[styles.errorText, { color: colors.error }]}>⚠ {errors.email}</Text> : null}

            <Text style={[styles.label, { color: colors.textMuted }]}>PASSWORD</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surfaceLight, borderColor: borderColor('password'), color: colors.text }]}
              placeholder="At least 6 characters"
              placeholderTextColor={colors.textMuted}
              value={password}
              onChangeText={(v) => {
                setPassword(v);
                if (v.length >= 6) clearError('password');
                if (confirm && v !== confirm) setError('confirm', 'Passwords do not match');
                else if (confirm && v === confirm) clearError('confirm');
              }}
              secureTextEntry
              autoCapitalize="none"
              onFocus={() => setFocused('password')}
              onBlur={() => setFocused(null)}
            />
            {errors.password ? <Text style={[styles.errorText, { color: colors.error }]}>⚠ {errors.password}</Text> : null}

            <Text style={[styles.label, { color: colors.textMuted }]}>CONFIRM PASSWORD</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surfaceLight, borderColor: borderColor('confirm'), color: colors.text, marginBottom: 4 }]}
              placeholder="Repeat password"
              placeholderTextColor={colors.textMuted}
              value={confirm}
              onChangeText={(v) => {
                setConfirm(v);
                if (v === password) clearError('confirm');
                else if (v) setError('confirm', 'Passwords do not match');
              }}
              secureTextEntry
              autoCapitalize="none"
              onFocus={() => setFocused('confirm')}
              onBlur={() => setFocused(null)}
            />
            {errors.confirm ? <Text style={[styles.errorText, { color: colors.error }]}>⚠ {errors.confirm}</Text> : null}

            <TouchableOpacity
              style={styles.termsRow}
              onPress={() => setAcceptedTerms(!acceptedTerms)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, { borderColor: acceptedTerms ? colors.primary : colors.border, backgroundColor: acceptedTerms ? colors.primary : 'transparent' }]}>
                {acceptedTerms && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={[styles.termsText, { color: colors.textMuted }]}>
                I accept the{' '}
                <Text
                  style={[styles.termsLink, { color: colors.primary }]}
                  onPress={(e) => {
                    e.stopPropagation();
                    navigation.navigate('Terms');
                  }}
                >
                  Terms of Service
                </Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, { backgroundColor: colors.primary, shadowColor: colors.primary, opacity: loading || !acceptedTerms ? 0.7 : 1, marginTop: 12 }]}
              onPress={handleRegister}
              disabled={loading || !acceptedTerms}
            >
              {loading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.btnText}>Send Code</Text>}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              <Text style={[styles.dividerText, { color: colors.textMuted }]}>OR</Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            </View>

            {/* Google Sign-In Button */}
            <TouchableOpacity
              style={[styles.googleBtn, { backgroundColor: colors.surface, borderColor: colors.border, opacity: !acceptedTerms ? 0.7 : 1 }]}
              onPress={handleGoogleRegister}
              disabled={googleLoading || loading || !acceptedTerms}
            >
              {googleLoading ? (
                <ActivityIndicator color={colors.primary} size="small" />
              ) : (
                <>
                  <GoogleIcon size={20} />
                  <Text style={[styles.googleBtnText, { color: colors.text }]}>Continue with Google</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.textMuted }]}>Already registered? </Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={[styles.footerLink, { color: colors.primary }]}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: SIZES.paddingLg, paddingTop: 20, paddingBottom: 30 },
  back: { position: 'absolute', top: 56, left: SIZES.paddingLg, flexDirection: 'row', alignItems: 'center', gap: 8, zIndex: 10 },
  backChevron: { width: 8, height: 8, borderLeftWidth: 2, borderBottomWidth: 2, transform: [{ rotate: '45deg' }] },
  backText: { fontSize: SIZES.base, fontWeight: '600' },
  logoArea: { alignItems: 'center', marginBottom: 24 },
  logoBox: {
    width: 60, height: 60, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
    shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8,
  },
  logoInner: { gap: 5, alignItems: 'flex-start' },
  logoLine: { height: 2.5, width: 24, borderRadius: 2 },
  appName: { fontSize: SIZES.xl, fontWeight: '800', letterSpacing: -0.5 },
  card: { borderRadius: SIZES.radiusLg, padding: SIZES.paddingLg, borderWidth: 1, marginBottom: 16 },
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 8, marginTop: 4 },
  input: {
    borderRadius: SIZES.radius, paddingHorizontal: 14, paddingVertical: 14,
    fontSize: SIZES.base, borderWidth: 1.5, marginBottom: 2,
  },
  errorText: { fontSize: 10, fontWeight: '600', marginTop: 3, marginBottom: 8, marginLeft: 2 },
  btn: {
    borderRadius: SIZES.radius, paddingVertical: 15, alignItems: 'center',
    shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8,
  },
  btnText: { color: '#fff', fontSize: SIZES.base, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 8 },
  footerText: { fontSize: SIZES.sm },
  footerLink: { fontSize: SIZES.sm, fontWeight: '700' },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    marginBottom: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  termsText: {
    flex: 1,
    fontSize: SIZES.xs,
    lineHeight: 18,
  },
  termsLink: {
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
  },
  googleBtn: {
    borderRadius: SIZES.radius,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    gap: 10,
  },
  googleBtnText: {
    fontSize: SIZES.sm,
    fontWeight: '600',
  },
});
