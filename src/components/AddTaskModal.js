import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Modal, TextInput, TouchableOpacity,
  ScrollView, Alert, KeyboardAvoidingView, Platform, Dimensions,
  PanResponder, Animated,
} from 'react-native';
import { usePlanner } from '../context/PlannerContext';
import { usePremium } from '../context/PremiumContext';
import { useTheme } from '../context/ThemeContext';
import { SIZES, DAYS, CATEGORIES } from '../constants/theme';
import { IconX, IconCrown } from '../constants/icons';
import PremiumModal from './PremiumModal';

const { height: SCREEN_H } = Dimensions.get('window');
const TIME_PRESETS = ['06:00','07:00','08:00','09:00','10:00','12:00','14:00','16:00','18:00','20:00','22:00'];

export default function AddTaskModal({ visible, onClose, editTask, defaultDay }) {
  const { addTask, updateTask } = usePlanner();
  const { isPremium } = usePremium();
  const { colors } = useTheme();

  const [title, setTitle] = useState('');
  const [day, setDay] = useState(defaultDay || 0);
  const [time, setTime] = useState('08:00');
  const [category, setCategory] = useState('other');
  const [color, setColor] = useState(colors.primary);
  const [repeat, setRepeat] = useState('once');
  const [preReminder, setPreReminder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPremium, setShowPremium] = useState(false);

  // Swipe-to-close
  const translateY = useRef(new Animated.Value(0)).current;
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (_, g) => g.dy > 0,
      onMoveShouldSetPanResponder:  (_, g) => g.dy > 5,
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) translateY.setValue(g.dy);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 80 || g.vy > 0.5) {
          Animated.timing(translateY, { toValue: 800, duration: 200, useNativeDriver: true }).start(() => {
            onClose();
            translateY.setValue(0);
          });
        } else {
          Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (!visible) return;
    if (editTask) {
      setTitle(editTask.title);
      setDay(editTask.day);
      setTime(editTask.time);
      setCategory(editTask.category);
      setColor(editTask.color || colors.primary);
      setRepeat(editTask.repeat);
      setPreReminder(editTask.preReminder);
    } else {
      setTitle('');
      setDay(defaultDay ?? 0);
      setTime('08:00');
      setCategory('other');
      setColor(colors.primary);
      setRepeat('once');
      setPreReminder(null);
    }
  }, [visible, editTask, defaultDay]);

  const handleSave = async () => {
    if (!title.trim()) { Alert.alert('Error', 'Bitte einen Titel eingeben.'); return; }
    setLoading(true);
    try {
      if (editTask) {
        await updateTask(editTask.id, { title: title.trim(), day, time, category, color, repeat, preReminder });
      } else {
        await addTask({ title: title.trim(), day, time, category, color, repeat, preReminder });
      }
      onClose();
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
        <View style={styles.overlay}>
          <KeyboardAvoidingView
            style={styles.kavWrapper}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={0}
          >
          <Animated.View style={[styles.sheet, { backgroundColor: colors.surface, maxHeight: SCREEN_H * 0.88, transform: [{ translateY }] }]}>
            {/* Header */}
            <View style={styles.sheetHeader}>
              <Text style={[styles.sheetTitle, { color: colors.text }]}>
                {editTask ? 'Edit' : 'Neue Task'}
              </Text>
              <TouchableOpacity
                style={[styles.closeBtn, { backgroundColor: colors.surfaceLight, borderColor: colors.border }]}
                onPress={onClose}
              >
                <IconX color={colors.textSecondary} size={13} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.scrollContent}
            >
              {/* Title input */}
              <TextInput
                style={[styles.titleInput, { backgroundColor: colors.surfaceLight, borderColor: colors.border, color: colors.text }]}
                placeholder="Was planst du?"
                placeholderTextColor={colors.textMuted}
                value={title}
                onChangeText={setTitle}
                returnKeyType="done"
              />

              {/* ── Day ── */}
              <Text style={[styles.label, { color: colors.textMuted }]}>TAG</Text>
              <View style={styles.chipRow}>
                {DAYS.map((d) => (
                  <TouchableOpacity
                    key={d.id}
                    style={[styles.chip, { backgroundColor: colors.surfaceLight, borderColor: colors.border }, day === d.id && { backgroundColor: colors.primary, borderColor: colors.primary }]}
                    onPress={() => setDay(d.id)}
                  >
                    <Text style={[styles.chipText, { color: colors.textSecondary }, day === d.id && { color: '#fff' }]}>
                      {d.short}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* ── Time ── */}
              <Text style={[styles.label, { color: colors.textMuted }]}>UHRZEIT</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hScroll}>
                <View style={styles.chipRow}>
                  {TIME_PRESETS.map((t) => (
                    <TouchableOpacity
                      key={t}
                      style={[styles.chip, { backgroundColor: colors.surfaceLight, borderColor: colors.border }, time === t && { backgroundColor: colors.primary, borderColor: colors.primary }]}
                      onPress={() => setTime(t)}
                    >
                      <Text style={[styles.chipText, { color: colors.textSecondary }, time === t && { color: '#fff' }]}>
                        {t}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
              <TextInput
                style={[styles.smallInput, { backgroundColor: colors.surfaceLight, borderColor: colors.border, color: colors.text }]}
                placeholder="Eigene Zeit (HH:MM)"
                placeholderTextColor={colors.textMuted}
                value={time}
                onChangeText={setTime}
                keyboardType="numbers-and-punctuation"
              />

              {/* ── Category ── */}
              <Text style={[styles.label, { color: colors.textMuted }]}>KATEGORIE</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hScroll}>
                <View style={styles.chipRow}>
                  {CATEGORIES.map((cat) => {
                    const catColor = colors[cat.colorKey] || colors.primary;
                    const sel = category === cat.id;
                    return (
                      <TouchableOpacity
                        key={cat.id}
                        style={[
                          styles.chip,
                          { backgroundColor: colors.surfaceLight, borderColor: colors.border },
                          sel && { backgroundColor: catColor + '22', borderColor: catColor },
                        ]}
                        onPress={() => { setCategory(cat.id); setColor(catColor); }}
                      >
                        <Text style={[styles.chipText, { color: sel ? catColor : colors.textSecondary }]}>
                          {cat.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>

              {/* ── Custom Color (Pro) ── */}
              <View style={styles.labelRow}>
                <Text style={[styles.label, { color: colors.textMuted }]}>FARBE</Text>
                {!isPremium && (
                  <TouchableOpacity style={styles.proTag} onPress={() => setShowPremium(true)}>
                    <IconCrown color={colors.gold} size={11} />
                    <Text style={[styles.proTagText, { color: colors.gold }]}>PRO</Text>
                  </TouchableOpacity>
                )}
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hScroll}>
                <View style={styles.colorRow}>
                  {colors.taskColors.map((c2) => (
                    <TouchableOpacity
                      key={c2}
                      style={[
                        styles.colorDot,
                        { backgroundColor: c2 },
                        color === c2 && styles.colorDotSel,
                        !isPremium && styles.colorDotLocked,
                      ]}
                      onPress={() => {
                        if (!isPremium) { setShowPremium(true); return; }
                        setColor(c2);
                      }}
                    />
                  ))}
                </View>
              </ScrollView>

              {/* ── Repeat ── */}
              <Text style={[styles.label, { color: colors.textMuted }]}>WIEDERHOLUNG</Text>
              <View style={styles.repeatRow}>
                {[
                  { val: 'once', label: 'Once' },
                  { val: 'weekly', label: 'Weekly' },
                ].map((r) => (
                  <TouchableOpacity
                    key={r.val}
                    style={[
                      styles.repeatBtn,
                      { backgroundColor: colors.surfaceLight, borderColor: colors.border },
                      repeat === r.val && { borderColor: colors.primary, backgroundColor: colors.primary + '18' },
                    ]}
                    onPress={() => setRepeat(r.val)}
                  >
                    <Text style={[styles.repeatLabel, { color: repeat === r.val ? colors.primary : colors.textSecondary }]}>
                      {r.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* ── Pre-Reminder (Pro) ── */}
              <View style={styles.labelRow}>
                <Text style={[styles.label, { color: colors.textMuted }]}>VOR-ERINNERUNG</Text>
                {!isPremium && (
                  <TouchableOpacity style={styles.proTag} onPress={() => setShowPremium(true)}>
                    <IconCrown color={colors.gold} size={11} />
                    <Text style={[styles.proTagText, { color: colors.gold }]}>PRO</Text>
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.chipRow}>
                {[null, 5, 10, 15, 30].map((m) => (
                  <TouchableOpacity
                    key={String(m)}
                    style={[
                      styles.chip,
                      { backgroundColor: colors.surfaceLight, borderColor: colors.border },
                      preReminder === m && { backgroundColor: colors.primary, borderColor: colors.primary },
                      !isPremium && m !== null && { opacity: 0.4 },
                    ]}
                    onPress={() => {
                      if (!isPremium && m !== null) { setShowPremium(true); return; }
                      setPreReminder(m);
                    }}
                  >
                    <Text style={[styles.chipText, { color: preReminder === m ? '#fff' : colors.textSecondary }]}>
                      {m === null ? 'Aus' : `${m} Min`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* ── Buttons ── */}
              <View style={styles.btnRow}>
                <TouchableOpacity
                  style={[styles.cancelBtn, { backgroundColor: colors.surfaceLight, borderColor: colors.border }]}
                  onPress={onClose}
                >
                  <Text style={[styles.cancelBtnText, { color: colors.textSecondary }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveBtn, { backgroundColor: colors.primary, shadowColor: colors.primary, opacity: loading ? 0.7 : 1 }]}
                  onPress={handleSave}
                  disabled={loading}
                >
                  <Text style={styles.saveBtnText}>{editTask ? 'Save' : 'Add'}</Text>
                </TouchableOpacity>
              </View>
              <View style={{ height: 8 }} />
            </ScrollView>
          </Animated.View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <PremiumModal visible={showPremium} onClose={() => setShowPremium(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  kavWrapper: { width: '100%' },
  sheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: SIZES.paddingLg, paddingTop: 0, paddingBottom: 24 },
  handle: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center' },
  handleArea: { paddingTop: 12, paddingBottom: 4, alignItems: 'center', marginHorizontal: -SIZES.paddingLg },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, paddingTop: 18 },
  sheetTitle: { fontSize: SIZES.xl, fontWeight: '800', paddingTop: 2 },
  closeBtn: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', borderWidth: 1, marginTop: 4 },
  scrollContent: { paddingBottom: 8 },
  titleInput: {
    borderRadius: SIZES.radius, paddingHorizontal: 14, paddingVertical: 13,
    fontSize: SIZES.lg, fontWeight: '600', borderWidth: 1.5, marginBottom: 18,
  },
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, marginBottom: 8 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8, marginTop: 2 },
  proTag: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  proTagText: { fontSize: 11, fontWeight: '700' },
  hScroll: { marginBottom: 14 },
  chipRow: { flexDirection: 'row', gap: 5, flexWrap: 'nowrap', marginBottom: 14 },
  chip: { flex: 1, paddingHorizontal: 8, paddingVertical: 8, borderRadius: SIZES.radiusLg, borderWidth: 1.5, alignItems: 'center' },
  chipText: { fontSize: SIZES.xs, fontWeight: '700' },
  smallInput: {
    borderRadius: SIZES.radius, paddingHorizontal: 14, paddingVertical: 11,
    fontSize: SIZES.sm, borderWidth: 1.5, marginBottom: 16,
  },
  colorRow: { flexDirection: 'row', gap: 9, paddingVertical: 4, marginBottom: 14 },
  colorDot: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: 'transparent' },
  colorDotSel: { borderColor: '#fff', transform: [{ scale: 1.15 }] },
  colorDotLocked: { opacity: 0.3 },
  repeatRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  repeatBtn: { flex: 1, padding: 12, borderRadius: SIZES.radius, alignItems: 'center', borderWidth: 1.5 },
  repeatLabel: { fontSize: SIZES.sm, fontWeight: '600' },
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 20 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: SIZES.radius, alignItems: 'center', borderWidth: 1 },
  cancelBtnText: { fontWeight: '600' },
  saveBtn: {
    flex: 2, padding: 14, borderRadius: SIZES.radius, alignItems: 'center',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: SIZES.base },
});
