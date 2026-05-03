import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, TextInput, ActivityIndicator,
  KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Platform,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { usePremium } from '../context/PremiumContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../components/Toast';
import { SIZES, THEMES, DISCORD_WEBHOOK } from '../constants/theme';
import { IconCrown, IconLogout, IconMessage, IconX, IconChevron, IconSettings } from '../constants/icons';
import PremiumModal from '../components/PremiumModal';

// Role colors (same as AdminScreen)
const ROLE_COLORS = {
  Owner: '#FF6B6B',
  Admin: '#FF8C42',
  Moderator: '#4ECDC4',
  Supporter: '#95E1D3',
  VIP: '#FFD93D',
  Beta: '#A8E6CF',
};

function getRoleColor(role) {
  return ROLE_COLORS[role] || '#6E5CF6';
}

export default function ProfileeScreen({ navigation }) {
  const { user, logout } = useAuth();
  const { isPremium, deactivatePremium } = usePremium();
  const { colors, themeId, applyTheme } = useTheme();
  const { showToast, showConfirm } = useToast();
  const [showPremium, setShowPremium] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [supportMsg, setSupportMsg] = useState('');
  const [sending, setSending] = useState(false);

  const isAdmin = user?.email === 'pohlklummpy@gmail.com';

  // ── Logout ──────────────────────────────────────────────────────────────────
  const handleLogout = () => {
    showConfirm('Sign Out', 'Really sign out?', logout);
  };

  // ── Cancel Premium ───────────────────────────────────────────────────────────
  const handleCancelPremium = () => {
    showConfirm('Cancel Premium', 'Your premium will be deactivated immediately.', deactivatePremium);
  };

  // ── Support ──────────────────────────────────────────────────────────────────
  const handleSendSupport = async () => {
    if (!supportMsg.trim()) {
      showToast('Please enter a message.', 'error');
      return;
    }
    setSending(true);
    try {
      const res = await fetch(DISCORD_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embeds: [{
            title: 'Support-Nachricht',
            description: supportMsg.trim(),
            color: 0x6E5CF6,
            fields: [
              { name: 'Nutzer', value: user?.email || 'Unbekannt', inline: true },
              { name: 'Premium', value: isPremium ? 'Ja' : 'Nein', inline: true },
            ],
            timestamp: new Date().toISOString(),
          }],
        }),
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      setSupportMsg('');
      setShowSupport(false);
      showToast('Your message has been sent.', 'success');
    } catch {
      showToast('Message could not be sent.', 'error');
    } finally {
      setSending(false);
    }
  };

  const freeThemes = Object.values(THEMES).filter((t) => t.free);
  const proThemes  = Object.values(THEMES).filter((t) => !t.free);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
        <TouchableOpacity
          style={[styles.settingsBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => navigation.navigate('Settings')}
        >
          <IconSettings color={colors.textSecondary} size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* User card */}
        <View style={[styles.userCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.avatar, { backgroundColor: isPremium ? colors.gold : colors.primary }]}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0)?.toUpperCase() || '?'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.nameRow}>
              <Text style={[styles.userName, { color: colors.text }]}>{user?.name}</Text>
              {user?.role && (
                <View style={[styles.roleBadge, { backgroundColor: getRoleColor(user.role) + '20', borderColor: getRoleColor(user.role) + '50' }]}>
                  <Text style={[styles.roleText, { color: getRoleColor(user.role) }]}>{user.role}</Text>
                </View>
              )}
              {isPremium && (
                <View style={[styles.proBadge, { backgroundColor: colors.gold + '18', borderColor: colors.gold + '50' }]}>
                  <IconCrown color={colors.gold} size={11} />
                  <Text style={[styles.proBadgeText, { color: colors.gold }]}>PRO</Text>
                </View>
              )}
            </View>
            <Text style={[styles.userEmail, { color: colors.textMuted }]}>{user?.email}</Text>
          </View>
        </View>

        {/* Premium banner / manage */}
        {!isPremium ? (
          <TouchableOpacity
            style={[styles.premiumBanner, { backgroundColor: colors.primary + '14', borderColor: colors.primary + '30' }]}
            onPress={() => setShowPremium(true)}
          >
            <IconCrown color={colors.primary} size={20} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.bannerTitle, { color: colors.text }]}>Unlock Premium</Text>
              <Text style={[styles.bannerSub, { color: colors.textMuted }]}>Themes · Focus · Unlimited Goals</Text>
            </View>
            <IconChevron color={colors.primary} size={14} />
          </TouchableOpacity>
        ) : (
          <View style={[styles.premiumBanner, { backgroundColor: colors.gold + '10', borderColor: colors.gold + '30' }]}>
            <IconCrown color={colors.gold} size={20} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.bannerTitle, { color: colors.text }]}>Premium Active</Text>
              <Text style={[styles.bannerSub, { color: colors.textMuted }]}>All features unlocked</Text>
            </View>
            <TouchableOpacity onPress={handleCancelPremium}>
              <Text style={[styles.cancelLink, { color: colors.error }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Themes */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Design</Text>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.cardSub, { color: colors.textMuted }]}>Free</Text>
            <View style={styles.themeRow}>
              {freeThemes.map((t) => (
                <ThemeBtn key={t.id} theme={t} active={themeId === t.id} locked={false} colors={colors} onPress={() => applyTheme(t.id)} />
              ))}
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.cardSubRow}>
              <Text style={[styles.cardSubInline, { color: colors.textMuted }]}>Premium</Text>
              {!isPremium && <IconCrown color={colors.gold} size={13} />}
            </View>
            <View style={styles.themeRow}>
              {proThemes.map((t) => (
                <ThemeBtn
                  key={t.id} theme={t} active={themeId === t.id}
                  locked={!isPremium} colors={colors}
                  onPress={() => { if (!isPremium) { setShowPremium(true); return; } applyTheme(t.id); }}
                />
              ))}
            </View>
          </View>
        </View>

        {/* Admin Panel (nur für Admin) */}
        {isAdmin && (
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>ADMIN</Text>
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Admin')}>
                <IconSettings color={colors.gold} size={18} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.menuLabel, { color: colors.text }]}>Admin Panel</Text>
                  <Text style={[styles.menuSub, { color: colors.textMuted }]}>User verwalten & testen</Text>
                </View>
                <IconChevron color={colors.textMuted} size={14} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Support */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Support</Text>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <TouchableOpacity style={styles.menuItem} onPress={() => setShowSupport(true)}>
              <IconMessage color={colors.textSecondary} size={18} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.menuLabel, { color: colors.text }]}>Send Message</Text>
                <Text style={[styles.menuSub, { color: colors.textMuted }]}>Feedback & Error melden</Text>
              </View>
              <IconChevron color={colors.textMuted} size={14} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.logoutBtn, { backgroundColor: colors.surface, borderColor: colors.error + '40' }]}
            onPress={handleLogout}
          >
            <IconLogout color={colors.error} size={18} />
            <Text style={[styles.logoutText, { color: colors.error }]}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.version, { color: colors.textMuted }]}>Smart Week Planner v1.0.0</Text>
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Support Modal */}
      <Modal visible={showSupport} transparent animationType="slide" statusBarTranslucent onRequestClose={() => setShowSupport(false)}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.modalKAV}
            >
              <TouchableWithoutFeedback>
                <View style={[styles.modalSheet, { backgroundColor: colors.surface }]}>
                  <View style={styles.modalHeader}>
                    <Text style={[styles.modalTitle, { color: colors.text }]}>Support</Text>
                    <TouchableOpacity
                      style={[styles.closeBtn, { backgroundColor: colors.surfaceLight, borderColor: colors.border }]}
                      onPress={() => setShowSupport(false)}
                    >
                      <IconX color={colors.textSecondary} size={13} />
                    </TouchableOpacity>
                  </View>
                  <Text style={[styles.modalSub, { color: colors.textMuted }]}>
                    Describe your problem or feedback. We will get back to you as soon as possible.
                  </Text>
                  <TextInput
                    style={[styles.supportInput, { backgroundColor: colors.surfaceLight, borderColor: colors.border, color: colors.text }]}
                    placeholder="Your message..."
                    placeholderTextColor={colors.textMuted}
                    value={supportMsg}
                    onChangeText={setSupportMsg}
                    multiline
                    numberOfLines={5}
                    textAlignVertical="top"
                    returnKeyType="default"
                  />
                  <TouchableOpacity
                    style={[styles.sendBtn, { backgroundColor: colors.primary, opacity: sending ? 0.7 : 1 }]}
                    onPress={handleSendSupport}
                    disabled={sending}
                  >
                    {sending
                      ? <ActivityIndicator color="#fff" size="small" />
                      : <Text style={styles.sendBtnText}>Send</Text>
                    }
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <PremiumModal visible={showPremium} onClose={() => setShowPremium(false)} />
    </View>
  );
}

// ─── ThemeBtn ─────────────────────────────────────────────────────────────────
function ThemeBtn({ theme, active, locked, colors, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.themeBtn, { borderColor: active ? colors.primary : 'transparent' }]}
      onPress={onPress}
    >
      <View style={[styles.themePreview, { backgroundColor: theme.background, borderColor: theme.border }]}>
        <View style={[styles.themeBar, { backgroundColor: theme.primary }]} />
        <View style={[styles.themeCardEl, { backgroundColor: theme.surface }]} />
        {locked && (
          <View style={styles.themeLockOverlay}>
            <IconCrown color={colors.gold} size={18} />
          </View>
        )}
      </View>
      <Text style={[styles.themeLabel, { color: active ? colors.primary : colors.textMuted }]}>{theme.label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: SIZES.padding, paddingTop: 60, paddingBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: SIZES.xxl + 2, fontWeight: '800', letterSpacing: -0.5 },
  settingsBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  userCard: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: SIZES.padding, marginBottom: 12,
    borderRadius: SIZES.radiusLg, padding: 16, borderWidth: 1, gap: 14,
  },
  avatar: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: SIZES.xl, fontWeight: '800', color: '#fff' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  userName: { fontSize: SIZES.lg, fontWeight: '700' },
  userEmail: { fontSize: SIZES.sm, marginTop: 2 },
  proBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3, borderWidth: 1 },
  proBadgeText: { fontSize: 10, fontWeight: '800' },
  roleBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  premiumBanner: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: SIZES.padding, marginBottom: 12,
    borderRadius: SIZES.radiusLg, padding: 14, borderWidth: 1, gap: 12,
  },
  bannerTitle: { fontSize: SIZES.base, fontWeight: '700' },
  bannerSub: { fontSize: SIZES.xs, marginTop: 2 },
  cancelLink: { fontSize: SIZES.sm, fontWeight: '700' },
  section: { paddingHorizontal: SIZES.padding, marginBottom: 12 },
  sectionLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8, marginLeft: 2 },
  card: { borderRadius: SIZES.radiusLg, borderWidth: 1, padding: 16 },
  cardSub: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5, marginBottom: 10 },
  cardSubInline: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  cardSubRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  divider: { height: 1, marginVertical: 14 },
  themeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  themeBtn: { alignItems: 'center', gap: 5, borderRadius: SIZES.radius, borderWidth: 2, padding: 2 },
  themePreview: { width: 58, height: 42, borderRadius: 8, borderWidth: 1, overflow: 'hidden', justifyContent: 'flex-end' },
  themeBar: { height: 4, width: '100%' },
  themeCardEl: { height: 18, width: '75%', borderTopRightRadius: 4, marginBottom: 3, marginLeft: 4 },
  themeLockOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.35)', borderRadius: 8 },
  themeLabel: { fontSize: SIZES.xs, fontWeight: '600' },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 4 },
  menuLabel: { fontSize: SIZES.base },
  menuSub: { fontSize: SIZES.xs, marginTop: 2 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: SIZES.radiusLg, padding: 15, borderWidth: 1 },
  logoutText: { fontWeight: '600', fontSize: SIZES.base },
  version: { textAlign: 'center', fontSize: SIZES.xs, marginBottom: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  modalKAV: { justifyContent: 'flex-end' },
  modalSheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: SIZES.paddingLg, paddingBottom: 48 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  modalTitle: { fontSize: SIZES.xl, fontWeight: '800' },
  closeBtn: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  modalSub: { fontSize: SIZES.sm, lineHeight: 20, marginBottom: 16 },
  supportInput: { borderRadius: SIZES.radius, padding: 14, fontSize: SIZES.base, borderWidth: 1.5, minHeight: 120, marginBottom: 16 },
  sendBtn: { borderRadius: SIZES.radius, padding: 15, alignItems: 'center' },
  sendBtnText: { color: '#fff', fontWeight: '700', fontSize: SIZES.base },
});
