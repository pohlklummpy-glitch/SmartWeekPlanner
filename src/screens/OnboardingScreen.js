import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { SIZES } from '../constants/theme';

const { width } = Dimensions.get('window');

const SLIDES = [
  { id: '1', emoji: '📅', title: 'Deine Week im Blick', desc: 'Plan quickly and easily – without complicated calendars.' },
  { id: '2', emoji: '🔔', title: 'Smart Reminders', desc: 'Notifications at the right time. With snooze function.' },
  { id: '3', emoji: '🎯', title: 'Goale erreichen', desc: 'Setze Weeknziele und verfolge deinen Fortschritt.' },
  { id: '4', emoji: '⭐', title: 'Unlock Premium', desc: 'Themes, Focus Mode, unbegrenzte Goale und mehr.' },
];

export default function OnboardingScreen({ onDone }) {
  const { colors } = useTheme();
  const [index, setIndex] = useState(0);
  const ref = useRef(null);
  const s = makeStyles(colors);

  const next = () => {
    if (index < SLIDES.length - 1) {
      ref.current?.scrollToIndex({ index: index + 1 });
      setIndex(index + 1);
    } else {
      finish();
    }
  };

  const finish = async () => {
    await AsyncStorage.setItem('onboarding_seen', 'true');
    onDone?.();
  };

  return (
    <View style={s.root}>
      <TouchableOpacity style={s.skip} onPress={finish}>
        <Text style={s.skipText}>Überspringen</Text>
      </TouchableOpacity>

      <FlatList
        ref={ref}
        data={SLIDES}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={s.slide}>
            <Text style={s.emoji}>{item.emoji}</Text>
            <Text style={s.slideTitle}>{item.title}</Text>
            <Text style={s.slideDesc}>{item.desc}</Text>
          </View>
        )}
      />

      <View style={s.dots}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[s.dot, i === index && s.dotActive]} />
        ))}
      </View>

      <TouchableOpacity style={s.btn} onPress={next}>
        <Text style={s.btnText}>{index === SLIDES.length - 1 ? 'Loslegen' : 'Weiter'}</Text>
      </TouchableOpacity>
    </View>
  );
}

function makeStyles(c) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: c.background, alignItems: 'center', justifyContent: 'center' },
    skip: { position: 'absolute', top: 56, right: 24 },
    skipText: { color: c.textMuted, fontSize: SIZES.sm },
    slide: { width, alignItems: 'center', paddingHorizontal: 48, paddingTop: 60 },
    emoji: { fontSize: 80, marginBottom: 32 },
    slideTitle: { fontSize: SIZES.xxxl, fontWeight: '800', color: c.text, textAlign: 'center', marginBottom: 14, letterSpacing: -0.5 },
    slideDesc: { fontSize: SIZES.base, color: c.textSecondary, textAlign: 'center', lineHeight: 24 },
    dots: { flexDirection: 'row', gap: 6, marginBottom: 40 },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: c.border },
    dotActive: { width: 20, backgroundColor: c.primary },
    btn: {
      backgroundColor: c.primary, paddingHorizontal: 48, paddingVertical: 16,
      borderRadius: SIZES.radiusLg, marginBottom: 56,
      shadowColor: c.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 8,
    },
    btnText: { color: '#fff', fontSize: SIZES.lg, fontWeight: '700' },
  });
}
