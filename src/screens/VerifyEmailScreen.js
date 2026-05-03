import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { SIZES } from '../constants/theme';
import { sendVerificationEmail, generateVerificationCode } from '../services/EmailService';

export default function VerifyEmailScreen({ route, navigation }) {
  const { pendingUser } = route.params; // { name, email, password }
  const { register } = useAuth();
  const { colors } = useTheme();

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [expectedCode, setExpectedCode] = useState(route.params.code);

  const inputs = useRef([]);

  // Countdown for resend button
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  // Handle single digit input
  const handleDigit = (val, idx) => {
    // Allow paste of full 6-digit code
    if (val.length === 6 && /^\d{6}$/.test(val)) {
      const digits = val.split('');
      setCode(digits);
      inputs.current[5]?.focus();
      return;
    }
    const digit = val.replace(/\D/g, '').slice(-1);
    const next = [...code];
    next[idx] = digit;
    setCode(next);
    if (digit && idx < 5) {
      inputs.current[idx + 1]?.focus();
    }
  };

  const handleKeyPress = (e, idx) => {
    if (e.nativeEvent.key === 'Backspace' && !code[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const entered = code.join('');
    if (entered.length < 6) {
      Alert.alert('Error', 'Bitte alle 6 Ziffern eingeben.');
      return;
    }
    if (entered !== expectedCode) {
      Alert.alert('Falscher Code', 'Der eingegebene Code ist falsch. Bitte erneut versuchen.');
      setCode(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
      return;
    }
    setLoading(true);
    try {
      await register(pendingUser.name, pendingUser.email, pendingUser.password, pendingUser.language || 'de');
      // Navigation happens automatically via AuthContext user state change
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      const newCode = generateVerificationCode();
      await sendVerificationEmail(pendingUser.email, pendingUser.name, newCode);
      setExpectedCode(newCode);
      setCountdown(60);
      setCode(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
      Alert.alert('Sent', 'Ein neuer Code wurde an deine Email gesendet.');
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setResending(false);
    }
  };

  const maskedEmail = pendingUser.email.replace(
    /^(.{2})(.*)(@.*)$/,
    (_, a, b, c) => a + '*'.repeat(Math.max(1, b.length)) + c
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Back button – always top left */}
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
              <Text style={styles.iconEmoji}>✉️</Text>
            </View>
            <Text style={[styles.title, { color: colors.text }]}>Email bestätigen</Text>
            <Text style={[styles.sub, { color: colors.textMuted }]}>
              Wir haben einen 6-stelligen Code an{'\n'}
              <Text style={{ color: colors.text, fontWeight: '700' }}>{maskedEmail}</Text>
              {'\n'}gesendet.
            </Text>
          </View>

          {/* Code input */}
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
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
              style={[styles.btn, { backgroundColor: colors.primary, shadowColor: colors.primary, opacity: loading ? 0.7 : 1 }]}
              onPress={handleVerify}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={styles.btnText}>Confirm</Text>
              }
            </TouchableOpacity>
          </View>

          {/* Resend */}
          <View style={styles.resendRow}>
            <Text style={[styles.resendText, { color: colors.textMuted }]}>Keinen Code erhalten? </Text>
            {countdown > 0 ? (
              <Text style={[styles.resendLink, { color: colors.textMuted }]}>
                Erneut senden ({countdown}s)
              </Text>
            ) : (
              <TouchableOpacity onPress={handleResend} disabled={resending}>
                {resending
                  ? <ActivityIndicator size="small" color={colors.primary} />
                  : <Text style={[styles.resendLink, { color: colors.primary }]}>Erneut senden</Text>
                }
              </TouchableOpacity>
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
  sub: { fontSize: SIZES.sm, textAlign: 'center', lineHeight: 22 },
  card: { borderRadius: SIZES.radiusLg, padding: SIZES.paddingLg, borderWidth: 1, marginBottom: 20 },
  codeRow: { flexDirection: 'row', gap: 10, justifyContent: 'center', marginBottom: 24 },
  codeInput: {
    width: 44, height: 54, borderRadius: SIZES.radius,
    fontSize: SIZES.xl, fontWeight: '800', borderWidth: 2,
  },
  btn: {
    borderRadius: SIZES.radius, paddingVertical: 15, alignItems: 'center',
    shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8,
  },
  btnText: { color: '#fff', fontSize: SIZES.base, fontWeight: '700' },
  resendRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  resendText: { fontSize: SIZES.sm },
  resendLink: { fontSize: SIZES.sm, fontWeight: '700' },
});
