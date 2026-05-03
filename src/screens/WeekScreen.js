import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { usePlanner } from '../context/PlannerContext';
import { useTheme } from '../context/ThemeContext';
import { SIZES, DAYS } from '../constants/theme';
import AddTaskModal from '../components/AddTaskModal';
import TaskCard from '../components/TaskCard';
import SuggestionCard from '../components/SuggestionCard';
import FocusModeOverlay from '../components/FocusModeOverlay';

function getCurrentDayIndex() {
  const d = new Date().getDay();
  return d === 0 ? 6 : d - 1;
}

export default function WeekScreen() {
  const { getTasksForDay, getSuggestions, focusMode, activeTask } = usePlanner();
  const { colors } = useTheme();
  const [selectedDay, setSelectedDay] = useState(getCurrentDayIndex());
  const [showAdd, setShowAdd] = useState(false);
  const [editTask, setEditTask] = useState(null);

  const today = getCurrentDayIndex();
  const dayTasks = getTasksForDay(selectedDay);
  const suggestions = getSuggestions();
  const s = makeStyles(colors);

  return (
    <View style={s.root}>
      <View style={s.header}>
        <View>
          <Text style={s.dateText}>
            {new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })}
          </Text>
          <Text style={s.title}>Meine Week</Text>
        </View>
        <TouchableOpacity style={s.addBtn} onPress={() => { setEditTask(null); setShowAdd(true); }}>
          <Text style={s.addBtnText}>＋</Text>
        </TouchableOpacity>
      </View>

      {/* Day Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.dayScroll} contentContainerStyle={s.dayScrollContent}>
        {DAYS.map((day) => {
          const count = getTasksForDay(day.id).length;
          const isToday = day.id === today;
          const isSel = day.id === selectedDay;
          return (
            <TouchableOpacity
              key={day.id}
              style={[s.dayTab, isSel && s.dayTabSel, isToday && !isSel && s.dayTabToday]}
              onPress={() => setSelectedDay(day.id)}
            >
              <Text style={[s.dayTabText, isSel && s.dayTabTextSel, isToday && !isSel && { color: colors.primary }]}>
                {day.short}
              </Text>
              {count > 0 && (
                <View style={[s.badge, isSel && s.badgeSel]}>
                  <Text style={s.badgeText}>{count}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView style={s.content} showsVerticalScrollIndicator={false}>
        {suggestions.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionLabel}>Vorschläge</Text>
            {suggestions.map((s2, i) => (
              <SuggestionCard key={i} suggestion={s2} onAccept={() => { setEditTask(null); setShowAdd(true); }} />
            ))}
          </View>
        )}

        <View style={s.section}>
          <View style={s.sectionRow}>
            <Text style={s.sectionLabel}>{DAYS[selectedDay].full}</Text>
            <Text style={s.sectionCount}>{dayTasks.length} Taskn</Text>
          </View>

          {dayTasks.length === 0 ? (
            <View style={s.empty}>
              <Text style={s.emptyEmoji}>✨</Text>
              <Text style={s.emptyTitle}>Free Day</Text>
              <Text style={s.emptyDesc}>Keine Taskn geplant</Text>
              <TouchableOpacity style={s.emptyBtn} onPress={() => { setEditTask(null); setShowAdd(true); }}>
                <Text style={s.emptyBtnText}>+ Task hinzufügen</Text>
              </TouchableOpacity>
            </View>
          ) : (
            dayTasks.map((task) => (
              <TaskCard
                key={task.id + '_' + selectedDay}
                task={task}
                onEdit={() => { setEditTask(task); setShowAdd(true); }}
                selectedDay={selectedDay}
              />
            ))
          )}
        </View>
        <View style={{ height: 120 }} />
      </ScrollView>

      <AddTaskModal visible={showAdd} onClose={() => setShowAdd(false)} editTask={editTask} defaultDay={selectedDay} />
      {focusMode && activeTask && <FocusModeOverlay task={activeTask} />}
    </View>
  );
}

function makeStyles(c) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: c.background },
    header: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      paddingHorizontal: SIZES.padding, paddingTop: 60, paddingBottom: 12,
    },
    dateText: { fontSize: SIZES.xs, color: c.textMuted, marginBottom: 2 },
    title: { fontSize: SIZES.xxl + 2, fontWeight: '800', color: c.text, letterSpacing: -0.5 },
    addBtn: {
      width: 44, height: 44, borderRadius: 22,
      backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center',
      shadowColor: c.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 8,
    },
    addBtnText: { color: '#fff', fontSize: 24, fontWeight: '300', marginTop: -2 },
    dayScroll: { maxHeight: 68 },
    dayScrollContent: { paddingHorizontal: SIZES.padding, paddingVertical: 6, gap: 8 },
    dayTab: {
      width: 46, height: 54, borderRadius: SIZES.radius,
      backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center',
      borderWidth: 1, borderColor: c.border, gap: 3,
    },
    dayTabSel: {
      backgroundColor: c.primary, borderColor: c.primary,
      shadowColor: c.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 6,
    },
    dayTabToday: { borderColor: c.primary },
    dayTabText: { fontSize: SIZES.sm, fontWeight: '700', color: c.textMuted },
    dayTabTextSel: { color: '#fff' },
    badge: {
      backgroundColor: c.secondary, borderRadius: 7,
      minWidth: 14, height: 14, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3,
    },
    badgeSel: { backgroundColor: 'rgba(255,255,255,0.3)' },
    badgeText: { fontSize: 9, color: '#fff', fontWeight: '800' },
    content: { flex: 1 },
    section: { paddingHorizontal: SIZES.padding, marginTop: 20 },
    sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    sectionLabel: { fontSize: SIZES.base, fontWeight: '700', color: c.text },
    sectionCount: { fontSize: SIZES.xs, color: c.textMuted },
    empty: {
      alignItems: 'center', paddingVertical: 48,
      backgroundColor: c.surface, borderRadius: SIZES.radiusLg,
      borderWidth: 1, borderColor: c.border,
    },
    emptyEmoji: { fontSize: 40, marginBottom: 12 },
    emptyTitle: { fontSize: SIZES.lg, fontWeight: '700', color: c.text, marginBottom: 6 },
    emptyDesc: { fontSize: SIZES.sm, color: c.textMuted },
    emptyBtn: {
      marginTop: 18, backgroundColor: c.primary,
      paddingHorizontal: 22, paddingVertical: 11, borderRadius: SIZES.radius,
    },
    emptyBtnText: { color: '#fff', fontWeight: '700', fontSize: SIZES.sm },
  });
}
