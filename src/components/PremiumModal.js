import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { usePremium } from '../context/PremiumContext';
import { useTheme } from '../context/ThemeContext';
import { SIZES, PREMIUM_FEATURES } from '../constants/theme';
import {
  IconCrown, IconX, IconFocus, IconBell, IconTarget,
  IconRepeat, IconChart, IconExport, IconStar, IconMessage,
} from '../constants/icons';

const FEATURE_ICONS = [IconStar, IconFocus, IconBell, IconRepeat, IconStar, IconChart, IconExport, IconMessage];

export default function PremiumModal({ visible, onClose }) {
  const { activatePremium } = usePremium();
  const { colors } = useTheme();
  const [plan, setPlan] = useState('yearly');

  const s = makeStyles(colors);

  const handleActivate = async () => {
    await activatePremium();
    onClose();
    Alert.alert('Premium Active', 'Alle Features sind jetzt freigeschaltet.');
  };

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <View style={s.overlay}>
        <View style={s.sheet}>
          <TouchableOpacity style={s.closeBtn} onPress={onClose}>
            <IconX color={colors.textSecondary} size={14} />
          </TouchableOpacity>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={s.headerArea}>
              <View style={[s.crownBox, { backgroundColor: colors.gold + '20', borderColor: colors.gold + '40' }]}>
                <IconCrown color={colors.gold} size={32} />
              </View>
              <Text style={s.title}>Smart Week Premium</Text>
              <Text style={s.sub}>Everything without restrictions</Text>
            </View>

            {/* Features */}
            <View style={s.featuresGrid}>
              {PREMIUM_FEATURES.map((f, i) => {
                const FeatureIcon = FEATURE_ICONS[i] || IconStar;
                return (
                  <View key={i} style={s.featureCard}>
                    <View style={[s.featureIconBox, { backgroundColor: colors.primary + '18' }]}>
                      <FeatureIcon color={colors.primary} size={18} />
                    </View>
                    <Text style={s.featureTitle}>{f.title}</Text>
                    <Text style={s.featureDesc}>{f.desc}</Text>
                  </View>
                );
              })}
            </View>

            {/* Plans */}
            <View style={s.plansRow}>
              <TouchableOpacity
                style={[s.planCard, plan === 'monthly' && s.planSelected]}
                onPress={() => setPlan('monthly')}
              >
                <Text style={s.planPeriod}>Monatlich</Text>
                <Text style={s.planPrice}>€2,99</Text>
                <Text style={s.planNote}>/Monat</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[s.planCard, s.planBest, plan === 'yearly' && s.planSelected]}
                onPress={() => setPlan('yearly')}
              >
                <View style={[s.bestTag, { backgroundColor: colors.gold }]}>
                  <Text style={s.bestTagText}>BELIEBT</Text>
                </View>
                <Text style={s.planPeriod}>Yearly</Text>
                <Text style={s.planPrice}>€19,99</Text>
                <Text style={s.planNote}>€1,67/Monat</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={s.buyBtn} onPress={handleActivate}>
              <Text style={s.buyBtnText}>
                {plan === 'yearly' ? '€19,99/Jahr' : '€2,99/Monat'} · Freischalten
              </Text>
            </TouchableOpacity>

            <Text style={s.legal}>Cancel anytime · No hidden costs</Text>
            <View style={{ height: 24 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function makeStyles(c) {
  return StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
    sheet: {
      backgroundColor: c.surface, borderTopLeftRadius: 32, borderTopRightRadius: 32,
      padding: SIZES.paddingLg, paddingTop: 20, maxHeight: '92%',
    },
    closeBtn: {
      alignSelf: 'flex-end', width: 30, height: 30, borderRadius: 15,
      backgroundColor: c.surfaceLight, alignItems: 'center', justifyContent: 'center',
      borderWidth: 1, borderColor: c.border, marginBottom: 8,
    },
    headerArea: { alignItems: 'center', marginBottom: 24 },
    crownBox: {
      width: 64, height: 64, borderRadius: 20,
      alignItems: 'center', justifyContent: 'center',
      borderWidth: 1, marginBottom: 14,
    },
    title: { fontSize: SIZES.xxl, fontWeight: '800', color: c.text, letterSpacing: -0.5 },
    sub: { fontSize: SIZES.sm, color: c.textMuted, marginTop: 4 },
    featuresGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
    featureCard: {
      width: '47.5%', backgroundColor: c.surfaceLight,
      borderRadius: SIZES.radius, padding: 12,
      borderWidth: 1, borderColor: c.border,
    },
    featureIconBox: {
      width: 32, height: 32, borderRadius: 8,
      alignItems: 'center', justifyContent: 'center', marginBottom: 8,
    },
    featureTitle: { fontSize: SIZES.sm, fontWeight: '700', color: c.text, marginBottom: 2 },
    featureDesc: { fontSize: SIZES.xs, color: c.textMuted },
    plansRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
    planCard: {
      flex: 1, backgroundColor: c.surfaceLight, borderRadius: SIZES.radiusLg,
      padding: 16, alignItems: 'center', borderWidth: 2, borderColor: c.border,
    },
    planBest: { borderColor: c.gold + '50' },
    planSelected: { borderColor: c.primary },
    bestTag: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, marginBottom: 8 },
    bestTagText: { color: '#000', fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
    planPeriod: { fontSize: SIZES.xs, color: c.textMuted, marginBottom: 4 },
    planPrice: { fontSize: SIZES.xxl, fontWeight: '800', color: c.text },
    planNote: { fontSize: SIZES.xs, color: c.textMuted, marginTop: 2 },
    buyBtn: {
      backgroundColor: c.primary, borderRadius: SIZES.radiusLg,
      padding: 16, alignItems: 'center', marginBottom: 10,
      shadowColor: c.primary, shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.3, shadowRadius: 12, elevation: 8,
    },
    buyBtnText: { color: '#fff', fontWeight: '700', fontSize: SIZES.base },
    legal: { fontSize: SIZES.xs, color: c.textMuted, textAlign: 'center' },
  });
}
