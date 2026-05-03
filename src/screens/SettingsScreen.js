import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Modal, ActivityIndicator,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../components/Toast';
import { SIZES } from '../constants/theme';
import { IconChevron, IconX, IconMail, IconUser, IconLock, IconTrash } from '../constants/icons';

export default function SettingsScreen({ navigation }) {
  const { user, updateUser, logout } = useAuth();
  const { colors } = useTheme();

  const [showModal, setShowModal] = useState(null); // 'name' | 'email' | 'password' | 'delete' | 'ringtone'

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <View style={[styles.backChevron, { borderColor: colors.primary }]} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Account Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>ACCOUNT</Text>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            
            {/* Name */}
            <TouchableOpacity style={styles.item} onPress={() => setShowModal('name')}>
              <IconUser color={colors.textSecondary} size={20} />
              <View style={styles.itemContent}>
                <Text style={[styles.itemLabel, { color: colors.text }]}>Name</Text>
                <Text style={[styles.itemValue, { color: colors.textMuted }]}>{user?.name}</Text>
              </View>
              <IconChevron color={colors.textMuted} size={14} />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            {/* Email */}
            <TouchableOpacity style={styles.item} onPress={() => setShowModal('email')}>
              <IconMail color={colors.textSecondary} size={20} />
              <View style={styles.itemContent}>
                <Text style={[styles.itemLabel, { color: colors.text }]}>Email</Text>
                <Text style={[styles.itemValue, { color: colors.textMuted }]}>{user?.email}</Text>
              </View>
              <IconChevron color={colors.textMuted} size={14} />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            {/* Ringtone */}
            <TouchableOpacity style={styles.item} onPress={() => setShowModal('ringtone')}>
              <Text style={{ fontSize: 20 }}>🔔</Text>
              <View style={styles.itemContent}>
                <Text style={[styles.itemLabel, { color: colors.text }]}>Notification Sound</Text>
                <Text style={[styles.itemValue, { color: colors.textMuted }]}>
                  {user?.ringtone === 'bell' ? 'Bell' : user?.ringtone === 'chime' ? 'Chime' : 'Default'}
                </Text>
              </View>
              <IconChevron color={colors.textMuted} size={14} />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            {/* Terms */}
            <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('Terms')}>
              <Text style={{ fontSize: 20 }}>📄</Text>
              <View style={styles.itemContent}>
                <Text style={[styles.itemLabel, { color: colors.text }]}>Terms of Service</Text>
                <Text style={[styles.itemValue, { color: colors.textMuted }]}>Nutzungsbedingungen</Text>
              </View>
              <IconChevron color={colors.textMuted} size={14} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>DANGER ZONE</Text>
          <TouchableOpacity
            style={[styles.dangerBtn, { backgroundColor: colors.surface, borderColor: colors.error + '40' }]}
            onPress={() => setShowModal('delete')}
          >
            <IconTrash color={colors.error} size={20} />
            <Text style={[styles.dangerText, { color: colors.error }]}>Account löschen</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Modals */}
      {showModal === 'name' && <NameModal visible onClose={() => setShowModal(null)} />}
      {showModal === 'email' && <EmailModal visible onClose={() => setShowModal(null)} />}
      {showModal === 'password' && <PasswordModal visible onClose={() => setShowModal(null)} />}
      {showModal === 'delete' && <DeleteModal visible onClose={() => setShowModal(null)} />}
      {showModal === 'ringtone' && <RingtoneModal visible onClose={() => setShowModal(null)} />}
    </View>
  );
}

// ─── Name Modal ──────────────────────────────────────────────────────────────
function NameModal({ visible, onClose }) {
  const { user, updateUser } = useAuth();
  const { colors } = useTheme();
  const { showToast } = useToast();
  const [name, setName] = useState(user?.name || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      showToast('Please enter a name.', 'error');
      return;
    }
    setLoading(true);
    try {
      await updateUser({ name: name.trim() });
      showToast('Your name has been updated.', 'success');
      onClose();
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={[styles.modalSheet, { backgroundColor: colors.surface }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Change Name</Text>
            <TouchableOpacity
              style={[styles.closeBtn, { backgroundColor: colors.surfaceLight, borderColor: colors.border }]}
              onPress={onClose}
            >
              <IconX color={colors.textSecondary} size={13} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.inputLabel, { color: colors.textMuted }]}>NEW NAME</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surfaceLight, borderColor: colors.border, color: colors.text }]}
            placeholder="Your name"
            placeholderTextColor={colors.textMuted}
            value={name}
            onChangeText={setName}
            autoFocus
          />

          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save</Text>}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Email Modal ─────────────────────────────────────────────────────────────
function EmailModal({ visible, onClose }) {
  const { updateUserEmail } = useAuth();
  const { colors } = useTheme();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      showToast('Bitte eine gültige Email eingeben.', 'error');
      return;
    }
    if (!password) {
      showToast('Bitte dein aktuelles Password eingeben.', 'error');
      return;
    }
    setLoading(true);
    try {
      await updateUserEmail(email.trim().toLowerCase(), password);
      showToast('Deine Email wurde aktualisiert.', 'success');
      onClose();
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={[styles.modalSheet, { backgroundColor: colors.surface }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Email ändern</Text>
            <TouchableOpacity
              style={[styles.closeBtn, { backgroundColor: colors.surfaceLight, borderColor: colors.border }]}
              onPress={onClose}
            >
              <IconX color={colors.textSecondary} size={13} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.inputLabel, { color: colors.textMuted }]}>NEW EMAIL</Text>
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

          <Text style={[styles.inputLabel, { color: colors.textMuted }]}>CURRENT PASSWORD</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surfaceLight, borderColor: colors.border, color: colors.text }]}
            placeholder="For confirmation"
            placeholderTextColor={colors.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save</Text>}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Password Modal ──────────────────────────────────────────────────────────
function PasswordModal({ visible, onClose }) {
  const { updateUserPassword } = useAuth();
  const { colors } = useTheme();
  const { showToast } = useToast();
  const [current, setCurrent] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!current || !newPw || !confirm) {
      showToast('Please fill all fields.', 'error');
      return;
    }
    if (newPw.length < 6) {
      showToast('Neues Password muss mindestens 6 Zeichen haben.', 'error');
      return;
    }
    if (newPw !== confirm) {
      showToast('Passwords do not match.', 'error');
      return;
    }
    setLoading(true);
    try {
      await updateUserPassword(current, newPw);
      showToast('Dein Password wurde aktualisiert.', 'success');
      onClose();
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={[styles.modalSheet, { backgroundColor: colors.surface }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Password ändern</Text>
            <TouchableOpacity
              style={[styles.closeBtn, { backgroundColor: colors.surfaceLight, borderColor: colors.border }]}
              onPress={onClose}
            >
              <IconX color={colors.textSecondary} size={13} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.inputLabel, { color: colors.textMuted }]}>CURRENT PASSWORD</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surfaceLight, borderColor: colors.border, color: colors.text }]}
            placeholder="Aktuelles Password"
            placeholderTextColor={colors.textMuted}
            value={current}
            onChangeText={setCurrent}
            secureTextEntry
            autoFocus
          />

          <Text style={[styles.inputLabel, { color: colors.textMuted }]}>NEW PASSWORD</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surfaceLight, borderColor: colors.border, color: colors.text }]}
            placeholder="At least 6 characters"
            placeholderTextColor={colors.textMuted}
            value={newPw}
            onChangeText={setNewPw}
            secureTextEntry
          />

          <Text style={[styles.inputLabel, { color: colors.textMuted }]}>CONFIRM</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surfaceLight, borderColor: colors.border, color: colors.text }]}
            placeholder="Neues Password wiederholen"
            placeholderTextColor={colors.textMuted}
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save</Text>}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Delete Modal ────────────────────────────────────────────────────────────
function DeleteModal({ visible, onClose }) {
  const { deleteAccount, user } = useAuth();
  const { colors } = useTheme();
  const { showToast } = useToast();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Check if user signed in with Google
  const isGoogleUser = user?.provider === 'google';

  const handleDelete = async () => {
    if (!isGoogleUser && !password) {
      showToast('Bitte Password eingeben.', 'error');
      return;
    }
    
    setLoading(true);
    try {
      await deleteAccount(isGoogleUser ? null : password);
      showToast('Dein Account wurde gelöscht.', 'success');
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={[styles.modalSheet, { backgroundColor: colors.surface }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.error }]}>Account löschen</Text>
            <TouchableOpacity
              style={[styles.closeBtn, { backgroundColor: colors.surfaceLight, borderColor: colors.border }]}
              onPress={onClose}
            >
              <IconX color={colors.textSecondary} size={13} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.modalSub, { color: colors.textMuted }]}>
            This action cannot be undone. All your data will be permanently deleted.
          </Text>

          {!isGoogleUser && (
            <>
              <Text style={[styles.inputLabel, { color: colors.textMuted }]}>PASSWORT CONFIRM</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surfaceLight, borderColor: colors.border, color: colors.text }]}
                placeholder="Dein Password"
                placeholderTextColor={colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoFocus
              />
            </>
          )}

          {isGoogleUser && (
            <View style={[styles.googleWarning, { backgroundColor: colors.primary + '10', borderColor: colors.primary + '30' }]}>
              <Text style={[styles.googleWarningText, { color: colors.text }]}>
                Du bist mit Google angemeldet. Kein Password erforderlich.
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: colors.error, opacity: loading ? 0.7 : 1 }]}
            onPress={handleDelete}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Account löschen</Text>}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Ringtone Modal ──────────────────────────────────────────────────────────
function RingtoneModal({ visible, onClose }) {
  const { user, updateUser } = useAuth();
  const { colors } = useTheme();
  const { showToast } = useToast();
  const [selected, setSelected] = useState(user?.ringtone || 'default');
  const [loading, setLoading] = useState(false);

  const ringtones = [
    { id: 'default', name: 'Default', icon: '🔔', description: 'System standard sound' },
    { id: 'bell', name: 'Bell', icon: '🛎️', description: 'Classic bell sound' },
    { id: 'chime', name: 'Chime', icon: '🎵', description: 'Soft chime sound' },
  ];

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateUser({ ringtone: selected });
      showToast('Notification sound updated.', 'success');
      onClose();
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={[styles.modalSheet, { backgroundColor: colors.surface }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Notification Sound</Text>
            <TouchableOpacity
              style={[styles.closeBtn, { backgroundColor: colors.surfaceLight, borderColor: colors.border }]}
              onPress={onClose}
            >
              <IconX color={colors.textSecondary} size={13} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.modalSub, { color: colors.textMuted }]}>
            Choose a sound for task reminders. Custom sounds work with Development Build.
          </Text>

          <View style={styles.ringtoneList}>
            {ringtones.map((tone) => (
              <TouchableOpacity
                key={tone.id}
                style={[
                  styles.ringtoneOption,
                  {
                    backgroundColor: selected === tone.id ? colors.primary + '14' : colors.surfaceLight,
                    borderColor: selected === tone.id ? colors.primary : colors.border,
                  }
                ]}
                onPress={() => setSelected(tone.id)}
              >
                <Text style={styles.ringtoneIcon}>{tone.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.ringtoneName, { color: colors.text }]}>{tone.name}</Text>
                  <Text style={[styles.ringtoneDesc, { color: colors.textMuted }]}>{tone.description}</Text>
                </View>
                {selected === tone.id && (
                  <View style={[styles.ringtoneCheck, { backgroundColor: colors.primary }]}>
                    <Text style={styles.ringtoneCheckText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          <View style={[styles.ringtoneNote, { backgroundColor: colors.primary + '10', borderColor: colors.primary + '30' }]}>
            <Text style={[styles.ringtoneNoteText, { color: colors.textMuted }]}>
              💡 Custom sounds require a Development Build or App Store version. In Expo Go, the system default sound is used.
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save</Text>}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Language Modal ──────────────────────────────────────────────────────────
function LanguageModal({ visible, onClose }) {
  const { colors } = useTheme();
  const { language, changeLanguage } = useLanguage();
  const { showToast } = useToast();
  const [selected, setSelected] = useState(language);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await changeLanguage(selected);
      showToast('Language wurde aktualisiert.', 'success');
      onClose();
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={[styles.modalSheet, { backgroundColor: colors.surface }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Language ändern</Text>
            <TouchableOpacity
              style={[styles.closeBtn, { backgroundColor: colors.surfaceLight, borderColor: colors.border }]}
              onPress={onClose}
            >
              <IconX color={colors.textSecondary} size={13} />
            </TouchableOpacity>
          </View>

          <View style={styles.languageList}>
            {Object.values(LANGUAGES).map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.languageOption,
                  {
                    backgroundColor: selected === lang.code ? colors.primary + '14' : colors.surfaceLight,
                    borderColor: selected === lang.code ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setSelected(lang.code)}
              >
                <Text style={styles.languageFlag}>{lang.flag}</Text>
                <Text style={[styles.languageName, { color: colors.text }]}>{lang.name}</Text>
                {selected === lang.code && (
                  <View style={[styles.languageCheck, { backgroundColor: colors.primary }]}>
                    <Text style={styles.languageCheckText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save</Text>}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding, paddingTop: 60, paddingBottom: 12,
  },
  backBtn: { width: 32, height: 32, justifyContent: 'center' },
  backChevron: { width: 10, height: 10, borderLeftWidth: 2, borderBottomWidth: 2, transform: [{ rotate: '45deg' }] },
  headerTitle: { fontSize: SIZES.xl, fontWeight: '800', letterSpacing: -0.5 },
  section: { paddingHorizontal: SIZES.padding, marginBottom: 16 },
  sectionLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8, marginLeft: 2 },
  card: { borderRadius: SIZES.radiusLg, borderWidth: 1, padding: 4 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  itemContent: { flex: 1 },
  itemLabel: { fontSize: SIZES.base, fontWeight: '600' },
  itemValue: { fontSize: SIZES.sm, marginTop: 2 },
  divider: { height: 1, marginHorizontal: 12 },
  dangerBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, borderRadius: SIZES.radiusLg, padding: 15, borderWidth: 1,
  },
  dangerText: { fontWeight: '600', fontSize: SIZES.base },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  modalSheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: SIZES.paddingLg, paddingBottom: 48 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: SIZES.xl, fontWeight: '800' },
  modalSub: { fontSize: SIZES.sm, lineHeight: 20, marginBottom: 16 },
  closeBtn: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  inputLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, marginBottom: 8, marginTop: 4 },
  input: {
    borderRadius: SIZES.radius, padding: 14, fontSize: SIZES.base,
    borderWidth: 1.5, marginBottom: 16,
  },
  codeRow: { flexDirection: 'row', gap: 8, justifyContent: 'center', marginBottom: 20 },
  codeInput: {
    width: 44, height: 54, borderRadius: SIZES.radius,
    fontSize: SIZES.xl, fontWeight: '800', borderWidth: 2,
  },
  saveBtn: { borderRadius: SIZES.radius, padding: 15, alignItems: 'center', marginTop: 8 },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: SIZES.base },
  googleWarning: {
    padding: 14,
    borderRadius: SIZES.radius,
    borderWidth: 1.5,
    marginBottom: 16,
  },
  googleWarningText: {
    fontSize: SIZES.sm,
    lineHeight: 20,
    textAlign: 'center',
  },
  languageList: { gap: 10, marginBottom: 20 },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: SIZES.radius,
    borderWidth: 2,
  },
  languageFlag: { fontSize: 24 },
  languageName: { flex: 1, fontSize: SIZES.base, fontWeight: '600' },
  languageCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  languageCheckText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  ringtoneList: { gap: 12, marginBottom: 16 },
  ringtoneOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: SIZES.radius,
    borderWidth: 2,
  },
  ringtoneIcon: { fontSize: 28 },
  ringtoneName: { fontSize: SIZES.base, fontWeight: '700' },
  ringtoneDesc: { fontSize: SIZES.xs, marginTop: 2 },
  ringtoneCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringtoneCheckText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  ringtoneNote: {
    padding: 12,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    marginBottom: 16,
  },
  ringtoneNoteText: {
    fontSize: SIZES.xs,
    lineHeight: 18,
    textAlign: 'center',
  },
});
