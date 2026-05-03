import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { SIZES, DAYS } from '../constants/theme';

export default function SuggestionCard({ suggestion, onAccept }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.primary + '12', borderColor: colors.primary + '30' }]}>
      <Text style={styles.icon}>🧠</Text>
      <Text style={[styles.text, { color: colors.textSecondary }]}>
        Du machst oft{' '}
        <Text style={[styles.bold, { color: colors.text }]}>
          {DAYS[suggestion.day]?.full} – {suggestion.title}
        </Text>
        {' '}→ wieder einplanen?
      </Text>
      <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={onAccept}>
        <Text style={styles.btnText}>+ Ja</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 12, padding: 12, marginBottom: 8,
    borderWidth: 1, gap: 8,
  },
  icon: { fontSize: 18 },
  text: { flex: 1, fontSize: SIZES.sm, lineHeight: 18 },
  bold: { fontWeight: '700' },
  btn: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: SIZES.sm },
});
