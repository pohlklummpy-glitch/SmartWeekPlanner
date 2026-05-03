import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal } from 'react-native';
import { usePlanner } from '../context/PlannerContext';
import { usePremium } from '../context/PremiumContext';
import { useTheme } from '../context/ThemeContext';
import { SIZES, CATEGORIES, DAYS } from '../constants/theme';
import { IconEdit, IconCopy, IconTrash, IconFocus, IconChevron, IconX } from '../constants/icons';
import PremiumModal from './PremiumModal';

export default function TaskCard({ task, onEdit, selectedDay }) {
  const { deleteTask, completeTaskForDate, isTaskCompletedForDate, copyTaskToDay, startFocusMode } = usePlanner();
  const { isPremium } = usePremium();
  const { colors } = useTheme();
  const [showCopy, setShowCopy] = useState(false);
  const [showPremium, setShowPremium] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const cat = CATEGORIES.find((c) => c.id === task.category) || CATEGORIES[5];
  const taskColor = task.color || colors[cat.colorKey] || colors.primary;

  const getDateForDay = (dayIndex) => {
    const now = new Date();
    const currentDay = now.getDay() === 0 ? 6 : now.getDay() - 1;
    const diff = dayIndex - currentDay;
    const d = new Date(now);
    d.setDate(now.getDate() + diff);
    return d.toISOString().split('T')[0];
  };

  const dateStr = getDateForDay(selectedDay);
  const isCompleted = isTaskCompletedForDate(task, dateStr);

  const handleDelete = () => {
    Alert.alert('Delete', `Delete "${task.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteTask(task.id) },
    ]);
  };

  const handleCopy = async (targetDay) => {
    await copyTaskToDay(task.id, targetDay);
    setShowCopy(false);
  };

  const handleFocus = () => {
    if (!isPremium) { setShowPremium(true); return; }
    startFocusMode(task);
    setExpanded(false);
  };

  return (
    <>
      <TouchableOpacity
        style={[s(colors).card, isCompleted && s(colors).cardDone]}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.8}
      >
        <View style={[s(colors).accent, { backgroundColor: taskColor }]} />
        <View style={s(colors).body}>
          {/* Main row */}
          <View style={s(colors).row}>
            <TouchableOpacity
              style={[s(colors).check, isCompleted && { backgroundColor: taskColor, borderColor: taskColor }]}
              onPress={() => completeTaskForDate(task.id, dateStr)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              {isCompleted && (
                <View style={s(colors).checkInner}>
                  <View style={[s(colors).checkLine1, { backgroundColor: '#fff' }]} />
                  <View style={[s(colors).checkLine2, { backgroundColor: '#fff' }]} />
                </View>
              )}
            </TouchableOpacity>

            <View style={s(colors).info}>
              <Text style={[s(colors).title, isCompleted && s(colors).titleDone]} numberOfLines={1}>
                {task.title}
              </Text>
              <View style={s(colors).metaRow}>
                <Text style={s(colors).metaTime}>{task.time}</Text>
                <View style={s(colors).metaDot} />
                <Text style={s(colors).metaCat}>{cat.label}</Text>
                {task.repeat === 'weekly' && (
                  <>
                    <View style={s(colors).metaDot} />
                    <Text style={[s(colors).metaCat, { color: colors.primary }]}>Weekly</Text>
                  </>
                )}
              </View>
            </View>

            <View style={{ transform: [{ rotate: expanded ? '90deg' : '0deg' }] }}>
              <IconChevron color={colors.textMuted} size={16} />
            </View>
          </View>

          {/* Expanded actions */}
          {expanded && (
            <View style={s(colors).actions}>
              <ActionBtn icon={<IconEdit color={colors.textSecondary} size={14} />} label="Edit" onPress={() => { onEdit(); setExpanded(false); }} colors={colors} />
              <ActionBtn icon={<IconCopy color={colors.textSecondary} size={14} />} label="Kopieren" onPress={() => setShowCopy(true)} colors={colors} />
              <ActionBtn icon={<IconFocus color={isPremium ? colors.textSecondary : colors.gold} size={14} />} label={isPremium ? 'Fokus' : 'Fokus ·PRO'} onPress={handleFocus} colors={colors} />
              <ActionBtn icon={<IconTrash color={colors.error} size={14} />} label="Delete" onPress={handleDelete} colors={colors} danger />
            </View>
          )}
        </View>
      </TouchableOpacity>

      {/* Copy Modal */}
      <Modal visible={showCopy} transparent animationType="fade" statusBarTranslucent>
        <TouchableOpacity style={ms(colors).overlay} activeOpacity={1} onPress={() => setShowCopy(false)}>
          <View style={ms(colors).sheet}>
            <View style={ms(colors).sheetHeader}>
              <Text style={ms(colors).sheetTitle}>Auf welchen Tag kopieren?</Text>
              <TouchableOpacity onPress={() => setShowCopy(false)}>
                <IconX color={colors.textSecondary} size={14} />
              </TouchableOpacity>
            </View>
            {DAYS.filter((d) => d.id !== task.day).map((d) => (
              <TouchableOpacity key={d.id} style={ms(colors).sheetItem} onPress={() => handleCopy(d.id)}>
                <Text style={ms(colors).sheetItemText}>{d.full}</Text>
                <IconChevron color={colors.textMuted} size={14} />
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      <PremiumModal visible={showPremium} onClose={() => setShowPremium(false)} />
    </>
  );
}

function ActionBtn({ icon, label, onPress, colors, danger }) {
  return (
    <TouchableOpacity
      style={[
        { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 7, borderRadius: SIZES.radiusSm, backgroundColor: colors.surfaceLight, borderWidth: 1, borderColor: danger ? colors.error + '40' : colors.border },
      ]}
      onPress={onPress}
    >
      {icon}
      <Text style={{ fontSize: SIZES.xs, color: danger ? colors.error : colors.textSecondary, fontWeight: '600' }}>{label}</Text>
    </TouchableOpacity>
  );
}

const s = (c) => StyleSheet.create({
  card: {
    flexDirection: 'row', backgroundColor: c.surface,
    borderRadius: SIZES.radius, marginBottom: 8,
    borderWidth: 1, borderColor: c.border, overflow: 'hidden',
  },
  cardDone: { opacity: 0.5 },
  accent: { width: 3 },
  body: { flex: 1, padding: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  check: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: c.border,
    alignItems: 'center', justifyContent: 'center',
  },
  checkInner: { width: 12, height: 12, alignItems: 'center', justifyContent: 'center' },
  checkLine1: { position: 'absolute', width: 5, height: 1.8, borderRadius: 1, transform: [{ rotate: '45deg' }, { translateX: -2 }, { translateY: 1 }] },
  checkLine2: { position: 'absolute', width: 8, height: 1.8, borderRadius: 1, transform: [{ rotate: '-50deg' }, { translateX: 1 }] },
  info: { flex: 1 },
  title: { fontSize: SIZES.base, fontWeight: '600', color: c.text, marginBottom: 4, textAlign: 'center' },
  titleDone: { textDecorationLine: 'line-through', color: c.textMuted },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  metaTime: { fontSize: SIZES.xs, color: c.textMuted, fontWeight: '600' },
  metaDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: c.textMuted },
  metaCat: { fontSize: SIZES.xs, color: c.textMuted },
  actions: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 6,
    marginTop: 12, paddingTop: 12,
    borderTopWidth: 1, borderTopColor: c.border,
  },
});

const ms = (c) => StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  sheet: { backgroundColor: c.surface, borderRadius: SIZES.radiusLg, padding: 20, width: 300, borderWidth: 1, borderColor: c.border },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sheetTitle: { fontSize: SIZES.base, fontWeight: '700', color: c.text },
  sheetItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: c.border },
  sheetItemText: { fontSize: SIZES.base, color: c.text },
});
