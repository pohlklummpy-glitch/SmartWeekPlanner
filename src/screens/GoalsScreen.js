import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Modal, Alert, KeyboardAvoidingView, Platform,
  PanResponder, Animated,
} from 'react-native';
import { usePlanner } from '../context/PlannerContext';
import { usePremium } from '../context/PremiumContext';
import { useTheme } from '../context/ThemeContext';
import { SIZES, CATEGORIES, DAYS } from '../constants/theme';
import { IconTarget, IconX, IconChevron, IconCrown, IconTrash } from '../constants/icons';
import PremiumModal from '../components/PremiumModal';

const FREE_GOAL_LIMIT = 3;

export default function GoalsScreen() {
  const { goals, addGoal, deleteGoal, getGoalProgress, getTasksForDay } = usePlanner();
  const { isPremium } = usePremium();
  const { colors } = useTheme();

  const [selectedDay, setSelectedDay] = useState(getCurrentDayIndex());
  const [showAdd, setShowAdd] = useState(false);
  const [showPremium, setShowPremium] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('sport');
  const [target, setTarget] = useState('3');

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
          // Close
          Animated.timing(translateY, { toValue: 600, duration: 200, useNativeDriver: true }).start(() => {
            setShowAdd(false);
            translateY.setValue(0);
          });
        } else {
          // Snap back
          Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start();
        }
      },
    })
  ).current;

  function getCurrentDayIndex() {
    const d = new Date().getDay();
    return d === 0 ? 6 : d - 1;
  }

  const today = getCurrentDayIndex();

  const handleAddPress = () => {
    if (!isPremium && goals.length >= FREE_GOAL_LIMIT) {
      setShowPremium(true);
      return;
    }
    setShowAdd(true);
  };

  const handleSave = async () => {
    if (!title.trim()) { Alert.alert('Error', 'Bitte einen Titel eingeben.'); return; }
    await addGoal({ title: title.trim(), category, targetPerWeek: parseInt(target) || 3 });
    setTitle(''); setCategory('sport'); setTarget('3');
    setShowAdd(false);
  };

  const handleDelete = (goal) => {
    Alert.alert('Goal löschen', `"${goal.title}" löschen?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteGoal(goal.id) },
    ]);
  };

  // Tasks for selected day (for context)
  const dayTasks = getTasksForDay(selectedDay);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.dateText, { color: colors.textMuted }]}>
            {new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })}
          </Text>
          <Text style={[styles.title, { color: colors.text }]}>Goale</Text>
        </View>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
          onPress={handleAddPress}
        >
          <View style={styles.plusIcon}>
            <View style={[styles.plusH, { backgroundColor: '#fff' }]} />
            <View style={[styles.plusV, { backgroundColor: '#fff' }]} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Day selector – same as WeekScreen */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.dayScroll}
        contentContainerStyle={styles.dayScrollContent}
      >
        {DAYS.map((day) => {
          const count = getTasksForDay(day.id).length;
          const isToday = day.id === today;
          const isSel = day.id === selectedDay;
          return (
            <TouchableOpacity
              key={day.id}
              style={[
                styles.dayTab,
                { backgroundColor: colors.surface, borderColor: colors.border },
                isSel && { backgroundColor: colors.primary, borderColor: colors.primary, shadowColor: colors.primary },
                isToday && !isSel && { borderColor: colors.primary },
              ]}
              onPress={() => setSelectedDay(day.id)}
            >
              <Text style={[
                styles.dayTabText,
                { color: colors.textMuted },
                isSel && { color: '#fff' },
                isToday && !isSel && { color: colors.primary },
              ]}>
                {day.short}
              </Text>
              {count > 0 && (
                <View style={[styles.badge, { backgroundColor: isSel ? 'rgba(255,255,255,0.3)' : colors.secondary }]}>
                  <Text style={styles.badgeText}>{count}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Goal limit bar */}
      {!isPremium && (
        <View style={styles.limitRow}>
          <Text style={[styles.limitText, { color: colors.textMuted }]}>{goals.length}/{FREE_GOAL_LIMIT}</Text>
          <View style={[styles.limitTrack, { backgroundColor: colors.border }]}>
            <View style={[styles.limitFill, { width: `${(goals.length / FREE_GOAL_LIMIT) * 100}%`, backgroundColor: colors.primary }]} />
          </View>
          {goals.length >= FREE_GOAL_LIMIT && (
            <TouchableOpacity onPress={() => setShowPremium(true)} style={styles.upgradeBtn}>
              <IconCrown color={colors.gold} size={12} />
              <Text style={[styles.upgradeText, { color: colors.gold }]}>Mehr</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Day tasks summary */}
        {dayTasks.length > 0 && (
          <View style={[styles.daySummary, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.daySummaryTitle, { color: colors.text }]}>
              {DAYS[selectedDay].full} · {dayTasks.length} Task{dayTasks.length !== 1 ? 'n' : ''}
            </Text>
            <View style={styles.daySummaryTasks}>
              {dayTasks.slice(0, 3).map((t) => (
                <View key={t.id} style={[styles.daySummaryTask, { backgroundColor: colors.surfaceLight }]}>
                  <View style={[styles.daySummaryDot, { backgroundColor: t.color || colors.primary }]} />
                  <Text style={[styles.daySummaryTaskText, { color: colors.textSecondary }]} numberOfLines={1}>
                    {t.time} {t.title}
                  </Text>
                </View>
              ))}
              {dayTasks.length > 3 && (
                <Text style={[styles.daySummaryMore, { color: colors.textMuted }]}>+{dayTasks.length - 3} weitere</Text>
              )}
            </View>
          </View>
        )}

        {/* Goals */}
        {goals.length === 0 ? (
          <View style={[styles.empty, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.emptyIconBox, { backgroundColor: colors.primary + '18' }]}>
              <IconTarget color={colors.primary} size={32} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Noch keine Goale</Text>
            <Text style={[styles.emptyDesc, { color: colors.textMuted }]}>
              Setze dir Weeknziele und verfolge deinen Fortschritt
            </Text>
            <TouchableOpacity
              style={[styles.emptyBtn, { backgroundColor: colors.primary }]}
              onPress={handleAddPress}
            >
              <Text style={styles.emptyBtnText}>Erstes Goal setzen</Text>
            </TouchableOpacity>
          </View>
        ) : (
          goals.map((goal) => {
            const cat = CATEGORIES.find((c) => c.id === goal.category);
            const catColor = colors[cat?.colorKey] || colors.primary;
            const progress = getGoalProgress(goal);
            const pct = Math.min((progress / goal.targetPerWeek) * 100, 100);
            const done = progress >= goal.targetPerWeek;
            return (
              <View
                key={goal.id}
                style={[
                  styles.goalCard,
                  { backgroundColor: colors.surface, borderColor: done ? colors.success + '50' : colors.border },
                ]}
              >
                {/* Color accent */}
                <View style={[styles.goalAccent, { backgroundColor: catColor }]} />
                <View style={styles.goalBody}>
                  <View style={styles.goalTop}>
                    <View style={[styles.goalIconBox, { backgroundColor: catColor + '18' }]}>
                      <IconTarget color={catColor} size={18} />
                    </View>
                    <View style={styles.goalInfo}>
                      <Text style={[styles.goalTitle, { color: colors.text }]}>{goal.title}</Text>
                      <Text style={[styles.goalSub, { color: colors.textMuted }]}>
                        {cat?.label} · {goal.targetPerWeek}× pro Week
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => handleDelete(goal)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <IconX color={colors.textMuted} size={14} />
                    </TouchableOpacity>
                  </View>

                  {/* Progress */}
                  <View style={styles.progressRow}>
                    <View style={[styles.progressTrack, { backgroundColor: colors.surfaceLight }]}>
                      <View style={[
                        styles.progressFill,
                        { width: `${pct}%`, backgroundColor: done ? colors.success : catColor },
                      ]} />
                    </View>
                    <Text style={[styles.progressLabel, { color: done ? colors.success : colors.textMuted }]}>
                      {progress}/{goal.targetPerWeek}
                    </Text>
                  </View>

                  {done && (
                    <View style={[styles.doneBadge, { backgroundColor: colors.success + '15' }]}>
                      <Text style={[styles.doneBadgeText, { color: colors.success }]}>
                        Goal diese Week erreicht
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })
        )}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Add Goal Modal */}
      <Modal visible={showAdd} transparent animationType="slide" statusBarTranslucent onRequestClose={() => setShowAdd(false)}>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <Animated.View style={[styles.modalSheet, { backgroundColor: colors.surface, transform: [{ translateY }] }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Neues Goal</Text>
              <TouchableOpacity
                style={[styles.modalClose, { backgroundColor: colors.surfaceLight, borderColor: colors.border }]}
                onPress={() => setShowAdd(false)}
              >
                <IconX color={colors.textSecondary} size={13} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {/* Title */}
              <Text style={[styles.inputLabel, { color: colors.textMuted }]}>TITEL</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surfaceLight, borderColor: colors.border, color: colors.text }]}
                placeholder="z.B. 3× Sport pro Week"
                placeholderTextColor={colors.textMuted}
                value={title}
                onChangeText={setTitle}
                autoFocus
                returnKeyType="done"
              />

              {/* Category – single row */}
              <Text style={[styles.inputLabel, { color: colors.textMuted }]}>KATEGORIE</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {CATEGORIES.map((cat) => {
                    const catColor = colors[cat.colorKey] || colors.primary;
                    const sel = category === cat.id;
                    return (
                      <TouchableOpacity
                        key={cat.id}
                        style={[
                          styles.catChip,
                          { backgroundColor: colors.surfaceLight, borderColor: colors.border },
                          sel && { backgroundColor: catColor + '22', borderColor: catColor },
                        ]}
                        onPress={() => setCategory(cat.id)}
                      >
                        <Text style={[styles.catChipText, { color: sel ? catColor : colors.textSecondary }]}>
                          {cat.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>

              {/* Target */}
              <Text style={[styles.inputLabel, { color: colors.textMuted }]}>TARGET PER WEEK</Text>
              <View style={styles.numRow}>
                {['1', '2', '3', '4', '5', '7'].map((n) => (
                  <TouchableOpacity
                    key={n}
                    style={[
                      styles.numBtn,
                      { backgroundColor: colors.surfaceLight, borderColor: colors.border },
                      target === n && { backgroundColor: colors.primary, borderColor: colors.primary },
                    ]}
                    onPress={() => setTarget(n)}
                  >
                    <Text style={[styles.numBtnText, { color: target === n ? '#fff' : colors.textSecondary }]}>
                      {n}×
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Actions */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.cancelBtn, { backgroundColor: colors.surfaceLight, borderColor: colors.border }]}
                  onPress={() => setShowAdd(false)}
                >
                  <Text style={[styles.cancelBtnText, { color: colors.textSecondary }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveBtn, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
                  onPress={handleSave}
                >
                  <Text style={styles.saveBtnText}>Save</Text>
                </TouchableOpacity>
              </View>
              <View style={{ height: 16 }} />
            </ScrollView>
          </Animated.View>
        </KeyboardAvoidingView>
      </Modal>

      <PremiumModal visible={showPremium} onClose={() => setShowPremium(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SIZES.padding, paddingTop: 60, paddingBottom: 12,
  },
  dateText: { fontSize: SIZES.xs, marginBottom: 2 },
  title: { fontSize: SIZES.xxl + 2, fontWeight: '800', letterSpacing: -0.5 },
  addBtn: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 8,
  },
  plusIcon: { width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },
  plusH: { width: 14, height: 2, borderRadius: 1, position: 'absolute' },
  plusV: { width: 2, height: 14, borderRadius: 1, position: 'absolute' },
  dayScroll: { maxHeight: 68 },
  dayScrollContent: { paddingHorizontal: SIZES.padding, paddingVertical: 6, gap: 8 },
  dayTab: {
    width: 46, height: 54, borderRadius: SIZES.radius,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, gap: 3,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0, shadowRadius: 8, elevation: 0,
  },
  dayTabText: { fontSize: SIZES.sm, fontWeight: '700' },
  badge: { borderRadius: 7, minWidth: 14, height: 14, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  badgeText: { fontSize: 9, color: '#fff', fontWeight: '800' },
  limitRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: SIZES.padding, marginBottom: 8,
  },
  limitText: { fontSize: SIZES.xs, fontWeight: '700', minWidth: 32 },
  limitTrack: { flex: 1, height: 4, borderRadius: 2, overflow: 'hidden' },
  limitFill: { height: '100%', borderRadius: 2 },
  upgradeBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  upgradeText: { fontSize: SIZES.xs, fontWeight: '700' },
  content: { flex: 1, paddingHorizontal: SIZES.padding },
  daySummary: {
    borderRadius: SIZES.radiusLg, padding: 14,
    borderWidth: 1, marginTop: 12, marginBottom: 4,
  },
  daySummaryTitle: { fontSize: SIZES.sm, fontWeight: '700', marginBottom: 8 },
  daySummaryTasks: { gap: 4 },
  daySummaryTask: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: SIZES.radiusSm, paddingHorizontal: 10, paddingVertical: 6 },
  daySummaryDot: { width: 6, height: 6, borderRadius: 3 },
  daySummaryTaskText: { fontSize: SIZES.xs, flex: 1 },
  daySummaryMore: { fontSize: SIZES.xs, marginTop: 2 },
  empty: {
    alignItems: 'center', paddingVertical: 48, marginTop: 16,
    borderRadius: SIZES.radiusLg, borderWidth: 1,
  },
  emptyIconBox: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: SIZES.xl, fontWeight: '700', marginBottom: 8 },
  emptyDesc: { fontSize: SIZES.sm, textAlign: 'center', paddingHorizontal: 32, lineHeight: 20 },
  emptyBtn: { marginTop: 20, paddingHorizontal: 24, paddingVertical: 12, borderRadius: SIZES.radius },
  emptyBtnText: { color: '#fff', fontWeight: '700' },
  goalCard: {
    flexDirection: 'row', borderRadius: SIZES.radiusLg,
    marginBottom: 10, marginTop: 4, borderWidth: 1, overflow: 'hidden',
  },
  goalAccent: { width: 3 },
  goalBody: { flex: 1, padding: 14 },
  goalTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  goalIconBox: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  goalInfo: { flex: 1 },
  goalTitle: { fontSize: SIZES.base, fontWeight: '700' },
  goalSub: { fontSize: SIZES.xs, marginTop: 2 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  progressTrack: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  progressLabel: { fontSize: SIZES.xs, fontWeight: '700', minWidth: 28, textAlign: 'right' },
  doneBadge: { marginTop: 10, borderRadius: SIZES.radiusSm, padding: 7, alignItems: 'center' },
  doneBadgeText: { fontSize: SIZES.xs, fontWeight: '700' },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  modalSheet: {
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: SIZES.paddingLg, paddingTop: 0, paddingBottom: 32,
    maxHeight: '80%',
  },
  handle: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', backgroundColor: '#ccc' },
  handleArea: { paddingTop: 12, paddingBottom: 4, alignItems: 'center', marginHorizontal: -SIZES.paddingLg },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, marginTop: 8 },
  modalTitle: { fontSize: SIZES.xl, fontWeight: '800' },
  modalClose: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  inputLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, marginBottom: 8 },
  input: {
    borderRadius: SIZES.radius, padding: 14, fontSize: SIZES.base,
    borderWidth: 1.5, marginBottom: 16,
  },
  catChip: {
    paddingHorizontal: 14, paddingVertical: 9,
    borderRadius: SIZES.radiusLg, borderWidth: 1.5,
  },
  catChipText: { fontSize: SIZES.sm, fontWeight: '600' },
  numRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  numBtn: { flex: 1, paddingVertical: 11, borderRadius: SIZES.radius, alignItems: 'center', borderWidth: 1.5 },
  numBtnText: { fontWeight: '700', fontSize: SIZES.sm },
  modalActions: { flexDirection: 'row', gap: 10 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: SIZES.radius, alignItems: 'center', borderWidth: 1 },
  cancelBtnText: { fontWeight: '600' },
  saveBtn: {
    flex: 1, padding: 14, borderRadius: SIZES.radius, alignItems: 'center',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  saveBtnText: { color: '#fff', fontWeight: '700' },
});
