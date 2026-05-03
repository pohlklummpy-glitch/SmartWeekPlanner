import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../components/Toast';
import { SIZES } from '../constants/theme';
import { IconEye } from '../constants/icons';
import GoogleIcon from '../components/GoogleIcon';

export default function LoginScreen({ navigation }) {
  const { login, loginWithGoogle } = useAuth();
  const { colors } = useTheme();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [focused, setFocused] = useState(null);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      showToast('Please enter email and password.', 'error');
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Logo */}
          <View style={styles.logoArea}>
            <View style={[styles.logoBox, { backgroundColor: colors.primary, shadowColor: colors.primary }]}>
              <View style={styles.logoInner}>
                <View style={[styles.logoLine, { backgroundColor: '#fff' }]} />
                <View style={[styles.logoLine, { backgroundColor: '#fff', width: 16 }]} />
                <View style={[styles.logoLine, { backgroundColor: '#fff', width: 20 }]} />
              </View>
            </View>
            <Text style={[styles.appName, { color: colors.text }]}>Week Planner</Text>
            <Text style={[styles.appSub, { color: colors.textMuted }]}>Your week. Your pace.</Text>
          </View>

          {/* Form */}
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Sign In</Text>

            <Text style={[styles.label, { color: colors.textMuted }]}>EMAIL</Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.surfaceLight, borderColor: focused === 'email' ? colors.primary : colors.border, color: colors.text }
              ]}
              placeholder="name@beispiel.de"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              onFocus={() => setFocused('email')}
              onBlur={() => setFocused(null)}
            />

            <Text style={[styles.label, { color: colors.textMuted }]}>PASSWORD</Text>
            <View style={styles.pwRow}>
              <TextInput
                style={[
                  styles.input,
                  { flex: 1, backgroundColor: colors.surfaceLight, borderColor: focused === 'pw' ? colors.primary : colors.border, color: colors.text }
                ]}
                placeholder="At least 6 characters"
                placeholderTextColor={colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPw}
                onFocus={() => setFocused('pw')}
                onBlur={() => setFocused(null)}
              />
              <TouchableOpacity
                style={[styles.eyeBtn, { backgroundColor: colors.surfaceLight, borderColor: colors.border }]}
                onPress={() => setShowPw(!showPw)}
              >
                <IconEye color={colors.textSecondary} size={18} closed={!showPw} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.forgotBtn}
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text style={[styles.forgotText, { color: colors.primary }]}>Forgot password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, { backgroundColor: colors.primary, shadowColor: colors.primary, opacity: loading ? 0.7 : 1 }]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={styles.btnText}>Sign In</Text>
              }
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              <Text style={[styles.dividerText, { color: colors.textMuted }]}>OR</Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            </View>

            {/* Google Sign-In Button */}
            <TouchableOpacity
              style={[styles.googleBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={handleGoogleLogin}
              disabled={googleLoading || loading}
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
            <Text style={[styles.footerText, { color: colors.textMuted }]}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={[styles.footerLink, { color: colors.primary }]}>Register</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: SIZES.paddingLg,
    paddingVertical: 30,
  },
  logoArea: { alignItems: 'center', marginBottom: 32 },
  logoBox: {
    width: 60, height: 60, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 14,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 8,
  },
  logoInner: { gap: 5, alignItems: 'flex-start' },
  logoLine: { height: 2.5, width: 24, borderRadius: 2 },
  appName: { fontSize: SIZES.xxl, fontWeight: '800', letterSpacing: -0.5 },
  appSub: { fontSize: SIZES.sm, marginTop: 4 },
  card: {
    borderRadius: SIZES.radiusLg, padding: SIZES.paddingLg,
    borderWidth: 1, marginBottom: 20,
  },
  cardTitle: { fontSize: SIZES.xl, fontWeight: '700', marginBottom: 20 },
  label: {
    fontSize: 11, fontWeight: '700', letterSpacing: 1,
    marginBottom: 8, marginTop: 4,
  },
  input: {
    borderRadius: SIZES.radius, paddingHorizontal: 14, paddingVertical: 14,
    fontSize: SIZES.base, borderWidth: 1.5, marginBottom: 14,
  },
  pwRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  eyeBtn: {
    height: 48, paddingHorizontal: 14, borderRadius: SIZES.radius,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5,
  },
  forgotBtn: { alignSelf: 'flex-start', marginBottom: 14 },
  forgotText: { fontSize: SIZES.sm, fontWeight: '600' },
  btn: {
    borderRadius: SIZES.radius, paddingVertical: 15,
    alignItems: 'center', marginTop: 4,
    shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8,
  },
  btnText: { color: '#fff', fontSize: SIZES.base, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'center' },
  footerText: { fontSize: SIZES.sm },
  footerLink: { fontSize: SIZES.sm, fontWeight: '700' },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
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
