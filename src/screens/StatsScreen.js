import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { usePlanner } from '../context/PlannerContext';
import { usePremium } from '../context/PremiumContext';
import { useTheme } from '../context/ThemeContext';
import { SIZES, DAYS, CATEGORIES } from '../constants/theme';
import { IconCrown, IconChevron } from '../constants/icons';
import PremiumModal from '../components/PremiumModal';

export default function StatsScreen() {
  const { getFullStats, getTasksForDay } = usePlanner();
  const { isPremium } = usePremium();
  const { colors } = useTheme();
  const [showPremium, setShowPremium] = useState(false);

  const stats = getFullStats();
  const today = (() => { const d = new Date().getDay(); return d === 0 ? 6 : d - 1; })();
  const maxCount = Math.max(...DAYS.map((d) => getTasksForDay(d.id).length), 1);
  const DAYS_DE = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Statistiken</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── FREE SECTION ─────────────────────────────────────── */}

        {/* Overview cards */}
        <View style={styles.row3}>
          <StatCard label="Taskn" value={stats.total} color={colors.primary} colors={colors} />
          <StatCard label="Today" value={stats.completedToday} color={colors.success} colors={colors} />
          <StatCard label="Diese Week" value={stats.completedThisWeek} color={colors.warning} colors={colors} />
        </View>

        {/* Bar chart – tasks per day */}
        <SectionCard title="Taskn pro Tag" colors={colors}>
          <View style={styles.barChart}>
            {DAYS.map((day) => {
              const count = getTasksForDay(day.id).length;
              const h = maxCount > 0 ? (count / maxCount) * 80 : 0;
              const isToday = day.id === today;
              return (
                <View key={day.id} style={styles.barItem}>
                  <Text style={[styles.barCount, { color: colors.textMuted }]}>{count > 0 ? count : ''}</Text>
                  <View style={[styles.barTrack, { backgroundColor: colors.surfaceLight }]}>
                    <View style={[
                      styles.barFill,
                      { height: Math.max(h, count > 0 ? 6 : 0), backgroundColor: isToday ? colors.secondary : colors.primary + '90' },
                    ]} />
                  </View>
                  <Text style={[styles.barLabel, { color: isToday ? colors.secondary : colors.textMuted }]}>{day.short}</Text>
                </View>
              );
            })}
          </View>
        </SectionCard>

        {/* Category breakdown */}
        <SectionCard title="Kategorien" colors={colors}>
          {CATEGORIES.map((cat) => {
            const count = stats.byCategory[cat.id] || 0;
            if (count === 0) return null;
            const catColor = colors[cat.colorKey] || colors.primary;
            const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
            return (
              <View key={cat.id} style={styles.catRow}>
                <View style={[styles.catDot, { backgroundColor: catColor }]} />
                <Text style={[styles.catName, { color: colors.text }]}>{cat.label}</Text>
                <View style={[styles.catTrack, { backgroundColor: colors.surfaceLight }]}>
                  <View style={[styles.catFill, { width: `${pct}%`, backgroundColor: catColor }]} />
                </View>
                <Text style={[styles.catCount, { color: colors.textMuted }]}>{count}</Text>
              </View>
            );
          })}
          {stats.total === 0 && <Text style={[styles.noData, { color: colors.textMuted }]}>Noch keine Taskn</Text>}
        </SectionCard>

        {/* ── PRO SECTION ──────────────────────────────────────── */}

        <ProSectionHeader colors={colors} isPremium={isPremium} onPress={() => setShowPremium(true)} />

        {/* Streak */}
        <ProCard isPremium={isPremium} onPress={() => setShowPremium(true)} colors={colors}>
          <SectionCard title="Streak" colors={colors} noPad>
            <View style={styles.streakRow}>
              <View style={[styles.streakCircle, { borderColor: stats.streak > 0 ? colors.warning : colors.border }]}>
                <Text style={[styles.streakNum, { color: stats.streak > 0 ? colors.warning : colors.textMuted }]}>{stats.streak}</Text>
                <Text style={[styles.streakLabel, { color: colors.textMuted }]}>Tage</Text>
              </View>
              <View style={styles.streakInfo}>
                <Text style={[styles.streakTitle, { color: colors.text }]}>
                  {stats.streak === 0 ? 'Noch kein Streak' : stats.streak === 1 ? '1 Tag in Folge' : `${stats.streak} Tage in Folge`}
                </Text>
                <Text style={[styles.streakSub, { color: colors.textMuted }]}>
                  {stats.streak >= 7 ? 'Fantastic! Keep it up.' : 'Erledige täglich Taskn um deinen Streak zu halten.'}
                </Text>
              </View>
            </View>
          </SectionCard>
        </ProCard>

        {/* Weekly completion heatmap */}
        <ProCard isPremium={isPremium} onPress={() => setShowPremium(true)} colors={colors}>
          <SectionCard title="Week im Detail" colors={colors} noPad>
            <View style={styles.heatRow}>
              {stats.dailyCompletion.map((d, i) => {
                const intensity = d.done > 0 ? Math.min(d.done / 3, 1) : 0;
                const bg = intensity > 0
                  ? colors.primary + Math.round(intensity * 255).toString(16).padStart(2, '0')
                  : colors.surfaceLight;
                return (
                  <View key={i} style={styles.heatItem}>
                    <View style={[styles.heatCell, { backgroundColor: bg, borderColor: colors.border }]}>
                      {d.done > 0 && <Text style={[styles.heatNum, { color: '#fff' }]}>{d.done}</Text>}
                    </View>
                    <Text style={[styles.heatLabel, { color: i === today ? colors.primary : colors.textMuted }]}>{DAYS_DE[i]}</Text>
                  </View>
                );
              })}
            </View>
          </SectionCard>
        </ProCard>

        {/* Task type split */}
        <ProCard isPremium={isPremium} onPress={() => setShowPremium(true)} colors={colors}>
          <SectionCard title="Taskntypen" colors={colors} noPad>
            <View style={styles.splitRow}>
              <SplitItem label="Once" value={stats.onceCount} total={stats.total} color={colors.secondary} colors={colors} />
              <View style={[styles.splitDivider, { backgroundColor: colors.border }]} />
              <SplitItem label="Weekly" value={stats.weeklyCount} total={stats.total} color={colors.primary} colors={colors} />
            </View>
          </SectionCard>
        </ProCard>

        {/* Best day + avg */}
        <ProCard isPremium={isPremium} onPress={() => setShowPremium(true)} colors={colors}>
          <SectionCard title="Insights" colors={colors} noPad>
            <View style={styles.insightRow}>
              <InsightItem
                label="Bester Tag"
                value={DAYS[stats.bestDayIdx]?.full || '–'}
                colors={colors}
              />
              <View style={[styles.splitDivider, { backgroundColor: colors.border }]} />
              <InsightItem
                label="Ø pro Tag"
                value={`${stats.avgPerDay}`}
                colors={colors}
              />
              <View style={[styles.splitDivider, { backgroundColor: colors.border }]} />
              <InsightItem
                label="Abschlussrate"
                value={`${stats.completionRate}%`}
                colors={colors}
              />
            </View>
          </SectionCard>
        </ProCard>

        <View style={{ height: 120 }} />
      </ScrollView>

      <PremiumModal visible={showPremium} onClose={() => setShowPremium(false)} />
    </View>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatCard({ label, value, color, colors }) {
  return (
    <View style={[sc(colors).card, { borderTopColor: color }]}>
      <Text style={[sc(colors).value, { color }]}>{value}</Text>
      <Text style={sc(colors).label}>{label}</Text>
    </View>
  );
}

function SectionCard({ title, children, colors, noPad }) {
  return (
    <View style={[sec(colors).card, noPad && { paddingHorizontal: 0, paddingBottom: 0 }]}>
      {title && <Text style={[sec(colors).title, noPad && { paddingHorizontal: 16 }]}>{title}</Text>}
      {children}
    </View>
  );
}

function ProSectionHeader({ colors, isPremium, onPress }) {
  if (isPremium) return null;
  return (
    <TouchableOpacity style={[psh(colors).banner]} onPress={onPress}>
      <IconCrown color={colors.gold} size={16} />
      <Text style={[psh(colors).text, { color: colors.gold }]}>Premium Stats – Jetzt freischalten</Text>
      <IconChevron color={colors.gold} size={14} />
    </TouchableOpacity>
  );
}

function ProCard({ isPremium, onPress, children, colors }) {
  if (isPremium) {
    return <View>{children}</View>;
  }
  // Not premium: show blurred/locked card with overlay
  return (
    <View style={{ position: 'relative', marginHorizontal: SIZES.padding, marginBottom: 10 }}>
      {/* Blurred content placeholder */}
      <View style={[pro(colors).lockedCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={pro(colors).lockedInner}>
          <View style={[pro(colors).badge, { backgroundColor: colors.gold + '20', borderColor: colors.gold + '40' }]}>
            <IconCrown color={colors.gold} size={16} />
            <Text style={[pro(colors).badgeText, { color: colors.gold }]}>Unlock Premium</Text>
          </View>
          <Text style={[pro(colors).lockedHint, { color: colors.textMuted }]}>
            Diese Statistik ist nur für Premium-Nutzer verfügbar.
          </Text>
          <TouchableOpacity
            style={[pro(colors).unlockBtn, { backgroundColor: colors.gold }]}
            onPress={onPress}
          >
            <Text style={pro(colors).unlockBtnText}>Jetzt freischalten</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function SplitItem({ label, value, total, color, colors }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <View style={{ flex: 1, alignItems: 'center', padding: 14 }}>
      <Text style={{ fontSize: SIZES.xxl, fontWeight: '800', color }}>{value}</Text>
      <Text style={{ fontSize: SIZES.xs, color: colors.textMuted, marginTop: 2 }}>{label}</Text>
      <Text style={{ fontSize: SIZES.xs, color: colors.textMuted }}>{pct}%</Text>
    </View>
  );
}

function InsightItem({ label, value, colors }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', padding: 14 }}>
      <Text style={{ fontSize: SIZES.lg, fontWeight: '800', color: colors.text }}>{value}</Text>
      <Text style={{ fontSize: SIZES.xs, color: colors.textMuted, marginTop: 2, textAlign: 'center' }}>{label}</Text>
    </View>
  );
}

// ─── StyleSheet factories ─────────────────────────────────────────────────────

const sc = (c) => StyleSheet.create({
  card: { flex: 1, backgroundColor: c.surface, borderRadius: SIZES.radius, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: c.border, borderTopWidth: 3 },
  value: { fontSize: SIZES.xxl, fontWeight: '800' },
  label: { fontSize: SIZES.xs, color: c.textMuted, marginTop: 4, textAlign: 'center' },
});

const sec = (c) => StyleSheet.create({
  card: { backgroundColor: c.surface, borderRadius: SIZES.radiusLg, padding: 16, borderWidth: 1, borderColor: c.border, marginHorizontal: SIZES.padding, marginBottom: 10 },
  title: { fontSize: SIZES.base, fontWeight: '700', color: c.text, marginBottom: 14 },
});

const psh = (c) => StyleSheet.create({
  banner: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: SIZES.padding, marginBottom: 8, backgroundColor: c.gold + '10', borderRadius: SIZES.radius, padding: 12, borderWidth: 1, borderColor: c.gold + '30' },
  text: { flex: 1, fontSize: SIZES.sm, fontWeight: '700' },
});

const pro = (c) => StyleSheet.create({
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10, borderRadius: SIZES.radiusLg, alignItems: 'center', justifyContent: 'center' },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: SIZES.radiusLg, borderWidth: 1 },
  badgeText: { fontSize: SIZES.sm, fontWeight: '700' },
  lockedCard: { borderRadius: SIZES.radiusLg, borderWidth: 1, overflow: 'hidden' },
  lockedInner: { padding: 20, alignItems: 'center', gap: 10 },
  lockedHint: { fontSize: SIZES.xs, textAlign: 'center', lineHeight: 16 },
  unlockBtn: { borderRadius: SIZES.radius, paddingHorizontal: 20, paddingVertical: 10, marginTop: 4 },
  unlockBtnText: { color: '#fff', fontWeight: '700', fontSize: SIZES.sm },
});

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: SIZES.padding, paddingTop: 60, paddingBottom: 12 },
  title: { fontSize: SIZES.xxl + 2, fontWeight: '800', letterSpacing: -0.5 },
  row3: { flexDirection: 'row', gap: 8, paddingHorizontal: SIZES.padding, marginBottom: 10 },
  barChart: { flexDirection: 'row', alignItems: 'flex-end', height: 90, gap: 6 },
  barItem: { flex: 1, alignItems: 'center', height: '100%', justifyContent: 'flex-end' },
  barCount: { fontSize: SIZES.xs, marginBottom: 3 },
  barTrack: { width: '100%', flex: 1, borderRadius: 4, justifyContent: 'flex-end', overflow: 'hidden' },
  barFill: { width: '100%', borderRadius: 4 },
  barLabel: { fontSize: SIZES.xs, marginTop: 5, fontWeight: '600' },
  catRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  catDot: { width: 8, height: 8, borderRadius: 4 },
  catName: { fontSize: SIZES.sm, fontWeight: '600', width: 80 },
  catTrack: { flex: 1, height: 5, borderRadius: 3, overflow: 'hidden' },
  catFill: { height: '100%', borderRadius: 3 },
  catCount: { fontSize: SIZES.xs, width: 20, textAlign: 'right' },
  noData: { textAlign: 'center', paddingVertical: 12 },
  streakRow: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 16 },
  streakCircle: { width: 72, height: 72, borderRadius: 36, borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
  streakNum: { fontSize: SIZES.xxl, fontWeight: '800' },
  streakLabel: { fontSize: SIZES.xs },
  streakInfo: { flex: 1 },
  streakTitle: { fontSize: SIZES.base, fontWeight: '700' },
  streakSub: { fontSize: SIZES.xs, marginTop: 4, lineHeight: 16 },
  heatRow: { flexDirection: 'row', gap: 6, padding: 16 },
  heatItem: { flex: 1, alignItems: 'center', gap: 5 },
  heatCell: { width: '100%', aspectRatio: 1, borderRadius: 6, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  heatNum: { fontSize: SIZES.xs, fontWeight: '800' },
  heatLabel: { fontSize: SIZES.xs, fontWeight: '600' },
  splitRow: { flexDirection: 'row', alignItems: 'center' },
  splitDivider: { width: 1, height: 40 },
  insightRow: { flexDirection: 'row', alignItems: 'center' },
});
