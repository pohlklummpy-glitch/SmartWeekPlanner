import React, { createContext, useContext, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { SIZES } from '../constants/theme';
import { IconX, IconCheck } from '../constants/icons';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const hideToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showConfirm = useCallback((title, message, onConfirm, onCancel) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { 
      id, 
      title,
      message, 
      type: 'confirm', 
      duration: 0,
      onConfirm: () => {
        hideToast(id);
        onConfirm?.();
      },
      onCancel: () => {
        hideToast(id);
        onCancel?.();
      }
    }]);
  }, [hideToast]);

  return (
    <ToastContext.Provider value={{ showToast, hideToast, showConfirm }}>
      {children}
      <ToastContainer toasts={toasts} onHide={hideToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

function ToastContainer({ toasts, onHide }) {
  const { colors } = useTheme();

  return (
    <View style={styles.container} pointerEvents="box-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onHide={onHide} colors={colors} />
      ))}
    </View>
  );
}

function ToastItem({ toast, onHide, colors }) {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(-20));

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleHide = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -20,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => onHide(toast.id));
  };

  if (toast.type === 'confirm') {
    return (
      <Animated.View
        style={[
          styles.confirmBox,
          { 
            backgroundColor: colors.surface,
            borderColor: colors.border,
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.confirmHeader}>
          <Text style={[styles.confirmTitle, { color: colors.text }]}>{toast.title}</Text>
        </View>
        <Text style={[styles.confirmMessage, { color: colors.textMuted }]}>{toast.message}</Text>
        <View style={styles.confirmButtons}>
          <TouchableOpacity
            style={[styles.confirmBtn, { backgroundColor: colors.surfaceLight, borderColor: colors.border }]}
            onPress={toast.onCancel}
          >
            <Text style={[styles.confirmBtnText, { color: colors.textSecondary }]}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.confirmBtn, styles.confirmBtnPrimary, { backgroundColor: colors.primary }]}
            onPress={toast.onConfirm}
          >
            <Text style={[styles.confirmBtnText, { color: '#fff' }]}>Confirm</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  }

  const bgColor = 
    toast.type === 'error' ? colors.error :
    toast.type === 'success' ? colors.success :
    colors.surface;

  return (
    <Animated.View
      style={[
        styles.toast,
        { 
          backgroundColor: bgColor,
          borderColor: toast.type === 'info' ? colors.border : bgColor,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      {toast.type === 'success' && (
        <View style={[styles.iconBox, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
          <IconCheck color="#fff" size={14} />
        </View>
      )}
      <Text style={[styles.toastText, { color: toast.type === 'info' ? colors.text : '#fff', flex: 1 }]}>
        {toast.message}
      </Text>
      <TouchableOpacity onPress={handleHide} style={styles.closeBtn}>
        <IconX color={toast.type === 'info' ? colors.textMuted : '#fff'} size={14} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
    paddingHorizontal: SIZES.padding,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: SIZES.radiusLg,
    marginBottom: 10,
    width: '100%',
    maxWidth: 500,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  iconBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toastText: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    lineHeight: 20,
  },
  closeBtn: {
    padding: 4,
  },
  confirmBox: {
    borderRadius: SIZES.radiusLg,
    padding: SIZES.paddingLg,
    marginBottom: 10,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  confirmHeader: {
    marginBottom: 8,
  },
  confirmTitle: {
    fontSize: SIZES.lg,
    fontWeight: '700',
  },
  confirmMessage: {
    fontSize: SIZES.sm,
    lineHeight: 20,
    marginBottom: 20,
  },
  confirmButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    borderWidth: 1,
  },
  confirmBtnPrimary: {
    borderWidth: 0,
  },
  confirmBtnText: {
    fontSize: SIZES.sm,
    fontWeight: '700',
  },
});
