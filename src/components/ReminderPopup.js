import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity, Animated, Dimensions,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { usePremium } from '../context/PremiumContext';
import { SIZES } from '../constants/theme';
import { IconX } from '../constants/icons';

const { width: SCREEN_W } = Dimensions.get('window');

export default function ReminderPopup({ task, onClose }) {
  const { colors } = useTheme();
  const { isPremium } = usePremium();
  const [slideAnim] = useState(new Animated.Value(-100));

  useEffect(() => {
    // Slide in animation
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();

    // Auto-close after 10 seconds
    const timer = setTimeout(() => {
      handleClose();
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: -100,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  if (!isPremium || !task) return null;

  return (
    <Modal visible transparent animationType="none" statusBarTranslucent>
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.popup,
            {
              backgroundColor: colors.surface,
              borderColor: task.color || colors.primary,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Color bar */}
          <View style={[styles.colorBar, { backgroundColor: task.color || colors.primary }]} />

          {/* Content */}
          <View style={styles.content}>
            <View style={styles.header}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { color: colors.textMuted }]}>ERINNERUNG IN 15 MIN</Text>
                <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
                  {task.title}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.closeBtn, { backgroundColor: colors.surfaceLight }]}
                onPress={handleClose}
              >
                <IconX color={colors.textSecondary} size={14} />
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <View style={[styles.timeBox, { backgroundColor: colors.surfaceLight }]}>
                <Text style={[styles.timeIcon, { color: task.color || colors.primary }]}>🕐</Text>
                <Text style={[styles.timeText, { color: colors.text }]}>{task.time}</Text>
              </View>
              <View style={[styles.categoryBox, { backgroundColor: task.color + '20' }]}>
                <Text style={[styles.categoryText, { color: task.color || colors.primary }]}>
                  {task.category}
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: SIZES.padding,
  },
  popup: {
    borderRadius: SIZES.radiusLg,
    borderWidth: 2,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  colorBar: {
    height: 6,
    width: '100%',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
  },
  title: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    lineHeight: 22,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
  },
  timeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  timeIcon: {
    fontSize: 16,
  },
  timeText: {
    fontSize: SIZES.sm,
    fontWeight: '700',
  },
  categoryBox: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    justifyContent: 'center',
  },
  categoryText: {
    fontSize: SIZES.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
