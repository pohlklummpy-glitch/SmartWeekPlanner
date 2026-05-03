import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, Modal, ActivityIndicator,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { collection, getDocs, doc, updateDoc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { SIZES } from '../constants/theme';
import { IconX, IconCrown, IconTrash, IconUser, IconBan } from '../constants/icons';

const ADMIN_EMAIL = 'pohlklummpy@gmail.com';

// Role colors
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

export default function AdminScreen({ navigation }) {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(null); // 'ban' | 'premium' | 'details'
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    if (user?.email !== ADMIN_EMAIL) {
      Alert.alert('Zugriff verweigert', 'Du hast keine Admin-Rechte.');
      navigation.goBack();
      return;
    }
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'users'));
      const userList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(userList);
    } catch (e) {
      Alert.alert('Error', 'Konnte User nicht laden.');
    } finally {
      setLoading(false);
    }
  };

  const handleBan = (u) => {
    setSelectedUser(u);
    setShowModal('ban');
  };

  const handlePremium = (u) => {
    setSelectedUser(u);
    setShowModal('premium');
  };

  const handleDetails = (u) => {
    setSelectedUser(u);
    setShowModal('details');
  };

  const handleRole = (u) => {
    setSelectedUser(u);
    setShowModal('role');
  };

  const handleDelete = (u) => {
    Alert.alert(
      'Account löschen',
      `Möchtest du ${u.email} wirklich löschen?\n\nDies löscht:\n✓ Firestore Daten\n✓ Firebase Auth Account\n\nDies kann nicht rückgängig gemacht werden!`,
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: async () => {
            try {
              // Delete Firestore data
              await deleteDoc(doc(db, 'users', u.id));
              
              Alert.alert(
                'Teilweise gelöscht',
                `Firestore-Daten wurden gelöscht.\n\nDer Firebase Auth Account muss manuell in der Firebase Console gelöscht werden:\n\nhttps://console.firebase.google.com/project/smartweekplanner-77584/authentication/users`
              );
              
              loadUsers();
            } catch (e) {
              Alert.alert('Error', e.message);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <View style={[styles.backChevron, { borderColor: colors.primary }]} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Admin Panel</Text>
        <TouchableOpacity onPress={loadUsers}>
          <Text style={[styles.refreshText, { color: colors.primary }]}>↻</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
              {users.length} BENUTZER
            </Text>
            {users.map((u) => (
              <View
                key={u.id}
                style={[styles.userCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <View style={styles.userInfo}>
                  <View style={styles.userRow}>
                    <Text style={[styles.userName, { color: colors.text }]}>{u.name}</Text>
                    {u.role && (
                      <View style={[styles.roleBadge, { backgroundColor: getRoleColor(u.role) + '20', borderColor: getRoleColor(u.role) + '50' }]}>
                        <Text style={[styles.roleText, { color: getRoleColor(u.role) }]}>{u.role}</Text>
                      </View>
                    )}
                    {u.isPremium && <IconCrown color={colors.gold} size={14} />}
                    {u.banned && <IconBan color={colors.error} size={14} />}
                  </View>
                  <Text style={[styles.userEmail, { color: colors.textMuted }]}>{u.email}</Text>
                  {u.banned && (
                    <Text style={[styles.bannedText, { color: colors.error }]}>
                      🚫 Gebannt: {u.banReason || 'Kein Grund'}
                    </Text>
                  )}
                </View>

                <View style={styles.userActions}>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: colors.surfaceLight }]}
                    onPress={() => handleDetails(u)}
                  >
                    <IconUser color={colors.textSecondary} size={16} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: colors.primary + '20' }]}
                    onPress={() => handleRole(u)}
                  >
                    <Text style={{ fontSize: 16 }}>👤</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: colors.gold + '20' }]}
                    onPress={() => handlePremium(u)}
                  >
                    <IconCrown color={colors.gold} size={16} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: u.banned ? colors.success + '20' : colors.error + '20' }]}
                    onPress={() => handleBan(u)}
                  >
                    <IconBan color={u.banned ? colors.success : colors.error} size={16} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: colors.error + '30' }]}
                    onPress={() => handleDelete(u)}
                  >
                    <IconTrash color={colors.error} size={16} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
          <View style={{ height: 120 }} />
        </ScrollView>
      )}

      {/* Modals */}
      {showModal === 'ban' && selectedUser && (
        <BanModal
          visible
          user={selectedUser}
          onClose={() => { setShowModal(null); setSelectedUser(null); }}
          onSuccess={loadUsers}
        />
      )}
      {showModal === 'role' && selectedUser && (
        <RoleModal
          visible
          user={selectedUser}
          onClose={() => { setShowModal(null); setSelectedUser(null); }}
          onSuccess={loadUsers}
        />
      )}
      {showModal === 'premium' && selectedUser && (
        <PremiumModal
          visible
          user={selectedUser}
          onClose={() => { setShowModal(null); setSelectedUser(null); }}
          onSuccess={loadUsers}
        />
      )}
      {showModal === 'details' && selectedUser && (
        <DetailsModal
          visible
          user={selectedUser}
          onClose={() => { setShowModal(null); setSelectedUser(null); }}
        />
      )}
    </View>
  );
}

// ─── Ban Modal ───────────────────────────────────────────────────────────────
function BanModal({ visible, user, onClose, onSuccess }) {
  const { colors } = useTheme();
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBan = async () => {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.id), {
        banned: true,
        banReason: reason.trim() || 'Verstoß gegen Terms of Service',
      });
      Alert.alert('Gebannt', `${user.email} wurde gebannt.`);
      onSuccess();
      onClose();
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUnban = async () => {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.id), {
        banned: false,
        banReason: null,
      });
      Alert.alert('Entbannt', `${user.email} wurde entbannt.`);
      onSuccess();
      onClose();
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={[styles.modalSheet, { backgroundColor: colors.surface }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: user.banned ? colors.success : colors.error }]}>
              {user.banned ? 'Entbannen' : 'Bannen'}
            </Text>
            <TouchableOpacity
              style={[styles.closeBtn, { backgroundColor: colors.surfaceLight, borderColor: colors.border }]}
              onPress={onClose}
            >
              <IconX color={colors.textSecondary} size={13} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.modalSub, { color: colors.textMuted }]}>
            User: {user.email}
          </Text>

          {!user.banned && (
            <>
              <Text style={[styles.inputLabel, { color: colors.textMuted }]}>GRUND</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surfaceLight, borderColor: colors.border, color: colors.text }]}
                placeholder="Verstoß gegen Terms of Service"
                placeholderTextColor={colors.textMuted}
                value={reason}
                onChangeText={setReason}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </>
          )}

          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: user.banned ? colors.success : colors.error, opacity: loading ? 0.7 : 1 }]}
            onPress={user.banned ? handleUnban : handleBan}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : (
              <Text style={styles.saveBtnText}>{user.banned ? 'Entbannen' : 'Bannen'}</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Role Modal ──────────────────────────────────────────────────────────────
function RoleModal({ visible, user, onClose, onSuccess }) {
  const { colors } = useTheme();
  const [selectedRole, setSelectedRole] = useState(user.role || null);
  const [loading, setLoading] = useState(false);

  const roles = ['Owner', 'Admin', 'Moderator', 'Supporter', 'VIP', 'Beta'];

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.id), {
        role: selectedRole,
      });
      Alert.alert('Rolle gesetzt', `${user.email} ist jetzt ${selectedRole || 'ohne Rolle'}.`);
      onSuccess();
      onClose();
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.id), {
        role: null,
      });
      Alert.alert('Rolle entfernt', `${user.email} hat keine Rolle mehr.`);
      onSuccess();
      onClose();
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={[styles.modalSheet, { backgroundColor: colors.surface }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.primary }]}>Rolle zuweisen</Text>
            <TouchableOpacity
              style={[styles.closeBtn, { backgroundColor: colors.surfaceLight, borderColor: colors.border }]}
              onPress={onClose}
            >
              <IconX color={colors.textSecondary} size={13} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.modalSub, { color: colors.textMuted }]}>
            User: {user.email}
          </Text>

          <View style={styles.roleGrid}>
            {roles.map((role) => (
              <TouchableOpacity
                key={role}
                style={[
                  styles.roleOption,
                  {
                    backgroundColor: selectedRole === role ? getRoleColor(role) + '20' : colors.surfaceLight,
                    borderColor: selectedRole === role ? getRoleColor(role) : colors.border,
                  }
                ]}
                onPress={() => setSelectedRole(role)}
              >
                <Text style={[styles.roleOptionText, { color: selectedRole === role ? getRoleColor(role) : colors.text }]}>
                  {role}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1, marginBottom: 10 }]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : (
              <Text style={styles.saveBtnText}>Rolle setzen</Text>
            )}
          </TouchableOpacity>

          {user.role && (
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: colors.error, opacity: loading ? 0.7 : 1 }]}
              onPress={handleRemove}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : (
                <Text style={styles.saveBtnText}>Rolle entfernen</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Premium Modal ───────────────────────────────────────────────────────────
function PremiumModal({ visible, user, onClose, onSuccess }) {
  const { colors } = useTheme();
  const [minutes, setMinutes] = useState('5');
  const [loading, setLoading] = useState(false);

  const handleGivePremium = async () => {
    const mins = parseInt(minutes) || 5;
    setLoading(true);
    try {
      const expiresAt = new Date(Date.now() + mins * 60 * 1000);
      await updateDoc(doc(db, 'users', user.id), {
        isPremium: true,
        premiumExpiresAt: expiresAt.toISOString(),
      });
      Alert.alert('Premium Activeiert', `${user.email} hat Premium für ${mins} Minuten.`);
      onSuccess();
      onClose();
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePremium = async () => {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.id), {
        isPremium: false,
        premiumExpiresAt: null,
      });
      Alert.alert('Premium entfernt', `${user.email} hat kein Premium mehr.`);
      onSuccess();
      onClose();
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={[styles.modalSheet, { backgroundColor: colors.surface }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.gold }]}>Premium Test</Text>
            <TouchableOpacity
              style={[styles.closeBtn, { backgroundColor: colors.surfaceLight, borderColor: colors.border }]}
              onPress={onClose}
            >
              <IconX color={colors.textSecondary} size={13} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.modalSub, { color: colors.textMuted }]}>
            User: {user.email}
          </Text>

          <Text style={[styles.inputLabel, { color: colors.textMuted }]}>DAUER (MINUTEN)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surfaceLight, borderColor: colors.border, color: colors.text }]}
            placeholder="5"
            placeholderTextColor={colors.textMuted}
            value={minutes}
            onChangeText={setMinutes}
            keyboardType="number-pad"
          />

          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: colors.gold, opacity: loading ? 0.7 : 1, marginBottom: 10 }]}
            onPress={handleGivePremium}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : (
              <Text style={styles.saveBtnText}>Premium geben</Text>
            )}
          </TouchableOpacity>

          {user.isPremium && (
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: colors.error, opacity: loading ? 0.7 : 1 }]}
              onPress={handleRemovePremium}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : (
                <Text style={styles.saveBtnText}>Premium entfernen</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Details Modal ───────────────────────────────────────────────────────────
function DetailsModal({ visible, user, onClose }) {
  const { colors } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalSheet, { backgroundColor: colors.surface }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>User Details</Text>
            <TouchableOpacity
              style={[styles.closeBtn, { backgroundColor: colors.surfaceLight, borderColor: colors.border }]}
              onPress={onClose}
            >
              <IconX color={colors.textSecondary} size={13} />
            </TouchableOpacity>
          </View>

          <ScrollView>
            <DetailRow label="Name" value={user.name} colors={colors} />
            <DetailRow label="Email" value={user.email} colors={colors} />
            <DetailRow label="User ID" value={user.id} colors={colors} />
            <DetailRow label="Premium" value={user.isPremium ? 'Ja' : 'Nein'} colors={colors} />
            {user.isPremium && user.premiumExpiresAt && (
              <DetailRow label="Premium bis" value={new Date(user.premiumExpiresAt).toLocaleString('de-DE')} colors={colors} />
            )}
            <DetailRow label="Gebannt" value={user.banned ? 'Ja' : 'Nein'} colors={colors} />
            {user.banned && user.banReason && (
              <DetailRow label="Ban-Grund" value={user.banReason} colors={colors} />
            )}
            <DetailRow label="Erstellt am" value={user.createdAt ? new Date(user.createdAt.seconds * 1000).toLocaleDateString('de-DE') : 'Unbekannt'} colors={colors} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function DetailRow({ label, value, colors }) {
  return (
    <View style={styles.detailRow}>
      <Text style={[styles.detailLabel, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[styles.detailValue, { color: colors.text }]}>{value}</Text>
    </View>
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
  refreshText: { fontSize: 28, fontWeight: '300' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  section: { paddingHorizontal: SIZES.padding, marginTop: 12 },
  sectionLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12, marginLeft: 2 },
  userCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderRadius: SIZES.radiusLg, padding: 14, borderWidth: 1, marginBottom: 10,
  },
  userInfo: { flex: 1 },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  userName: { fontSize: SIZES.base, fontWeight: '700' },
  userEmail: { fontSize: SIZES.sm },
  bannedText: { fontSize: SIZES.xs, marginTop: 4, fontWeight: '600' },
  userActions: { flexDirection: 'row', gap: 8 },
  actionBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  modalSheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: SIZES.paddingLg, paddingBottom: 48, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: SIZES.xl, fontWeight: '800' },
  modalSub: { fontSize: SIZES.sm, marginBottom: 16 },
  closeBtn: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  inputLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, marginBottom: 8, marginTop: 4 },
  input: {
    borderRadius: SIZES.radius, padding: 14, fontSize: SIZES.base,
    borderWidth: 1.5, marginBottom: 16,
  },
  saveBtn: { borderRadius: SIZES.radius, padding: 15, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: SIZES.base },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#ffffff10' },
  detailLabel: { fontSize: SIZES.sm, fontWeight: '600' },
  detailValue: { fontSize: SIZES.sm, flex: 1, textAlign: 'right', marginLeft: 16 },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  roleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  roleOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 2,
    minWidth: '30%',
    alignItems: 'center',
  },
  roleOptionText: {
    fontSize: SIZES.sm,
    fontWeight: '700',
  },
});
