import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Vibration } from 'react-native';
import { usePlanner } from '../context/PlannerContext';
import { useTheme } from '../context/ThemeContext';
import { SIZES } from '../constants/theme';

export default function FocusModeOverlay({ task }) {
  const { stopFocusMode, completeTaskForDate } = usePlanner();
  const { colors } = useTheme();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const handleDone = async () => {
    Vibration.vibrate(200);
    const today = new Date().toISOString().split('T')[0];
    await completeTaskForDate(task.id, today);
    stopFocusMode();
  };

  return (
    <View style={[styles.overlay, { backgroundColor: colors.background }]}>
      <Text style={[styles.label, { color: colors.primary }]}>FOKUS-MODUS</Text>
      <Text style={[styles.taskTitle, { color: colors.text }]}>{task.title}</Text>
      <Text style={[styles.timer, { color: colors.primary }]}>{fmt(elapsed)}</Text>
      <Text style={[styles.hint, { color: colors.textMuted }]}>All notifications muted</Text>
      <TouchableOpacity style={[styles.doneBtn, { backgroundColor: colors.success }]} onPress={handleDone}>
        <Text style={styles.doneBtnText}>✅ Complete Task</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.exitBtn} onPress={stopFocusMode}>
        <Text style={[styles.exitBtnText, { color: colors.textMuted }]}>Fokus beenden</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center', alignItems: 'center', zIndex: 100, padding: 32,
  },
  label: { fontSize: SIZES.xs, fontWeight: '800', letterSpacing: 3, marginBottom: 24 },
  taskTitle: { fontSize: SIZES.xxxl, fontWeight: '800', textAlign: 'center', marginBottom: 32, letterSpacing: -0.5 },
  timer: { fontSize: 72, fontWeight: '200', marginBottom: 16 },
  hint: { fontSize: SIZES.sm, marginBottom: 48 },
  doneBtn: {
    borderRadius: SIZES.radiusLg, paddingHorizontal: 40, paddingVertical: 16,
    marginBottom: 16, width: '100%', alignItems: 'center',
  },
  doneBtnText: { color: '#fff', fontWeight: '700', fontSize: SIZES.lg },
  exitBtn: { padding: 12 },
  exitBtnText: { fontSize: SIZES.sm },
});
