// Custom SVG-style icon components using React Native primitives
// All icons adapt to the current theme color

import React from 'react';
import { View, StyleSheet } from 'react-native';

// ─── Icon primitives ─────────────────────────────────────────────────────────

const Line = ({ color, style }) => <View style={[{ backgroundColor: color }, style]} />;

export function IconCalendar({ color, size = 22 }) {
  const s = size;
  return (
    <View style={{ width: s, height: s, justifyContent: 'center', alignItems: 'center' }}>
      {/* Outer frame */}
      <View style={{
        width: s * 0.88, height: s * 0.82,
        borderWidth: 1.8, borderColor: color, borderRadius: 4,
        overflow: 'hidden',
      }}>
        {/* Header bar */}
        <View style={{ width: '100%', height: s * 0.28, backgroundColor: color, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ flexDirection: 'row', gap: s * 0.08 }}>
            {[0,1,2,3,4,5,6].map(i => (
              <View key={i} style={{ width: s * 0.06, height: s * 0.06, borderRadius: 1, backgroundColor: 'rgba(255,255,255,0.7)' }} />
            ))}
          </View>
        </View>
        {/* Grid rows */}
        <View style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap', padding: s * 0.04, gap: s * 0.04 }}>
          {[0,1,2,3,4,5,6,7,8].map(i => (
            <View key={i} style={{ width: s * 0.18, height: s * 0.14, borderRadius: 1, backgroundColor: color + (i === 2 ? 'FF' : '30') }} />
          ))}
        </View>
      </View>
      {/* Ring pins */}
      <View style={{ position: 'absolute', top: 0, left: s * 0.22, width: 2, height: s * 0.22, backgroundColor: color, borderRadius: 1 }} />
      <View style={{ position: 'absolute', top: 0, right: s * 0.22, width: 2, height: s * 0.22, backgroundColor: color, borderRadius: 1 }} />
    </View>
  );
}

export function IconTarget({ color, size = 22 }) {
  const s = size;
  return (
    <View style={{ width: s, height: s, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ width: s, height: s, borderRadius: s / 2, borderWidth: 1.8, borderColor: color }} />
      <View style={{ position: 'absolute', width: s * 0.6, height: s * 0.6, borderRadius: s * 0.3, borderWidth: 1.8, borderColor: color }} />
      <View style={{ position: 'absolute', width: s * 0.2, height: s * 0.2, borderRadius: s * 0.1, backgroundColor: color }} />
    </View>
  );
}

export function IconChart({ color, size = 22 }) {
  const s = size;
  const bars = [0.4, 0.7, 0.55, 1.0, 0.65];
  return (
    <View style={{ width: s, height: s, justifyContent: 'flex-end', alignItems: 'center', flexDirection: 'row', gap: 2, paddingBottom: 1 }}>
      {bars.map((h, i) => (
        <View key={i} style={{ width: s * 0.12, height: s * 0.7 * h, backgroundColor: color, borderRadius: 2 }} />
      ))}
    </View>
  );
}

export function IconUser({ color, size = 22 }) {
  const s = size;
  return (
    <View style={{ width: s, height: s, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ width: s * 0.42, height: s * 0.42, borderRadius: s * 0.21, borderWidth: 1.8, borderColor: color, marginBottom: 2 }} />
      <View style={{ width: s * 0.75, height: s * 0.35, borderTopLeftRadius: s * 0.4, borderTopRightRadius: s * 0.4, borderWidth: 1.8, borderColor: color, borderBottomWidth: 0 }} />
    </View>
  );
}

export function IconPlus({ color, size = 20 }) {
  const s = size;
  return (
    <View style={{ width: s, height: s, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ width: s * 0.7, height: 2, backgroundColor: color, borderRadius: 1 }} />
      <View style={{ width: 2, height: s * 0.7, backgroundColor: color, borderRadius: 1, position: 'absolute' }} />
    </View>
  );
}

export function IconCheck({ color, size = 14 }) {
  const s = size;
  return (
    <View style={{ width: s, height: s, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ width: s * 0.35, height: 2, backgroundColor: color, borderRadius: 1, transform: [{ rotate: '45deg' }, { translateX: -s * 0.08 }, { translateY: s * 0.08 }] }} />
      <View style={{ width: s * 0.6, height: 2, backgroundColor: color, borderRadius: 1, transform: [{ rotate: '-50deg' }, { translateX: s * 0.1 }], position: 'absolute' }} />
    </View>
  );
}

export function IconChevron({ color, size = 18, direction = 'right' }) {
  const rotate = { right: '0deg', down: '90deg', left: '180deg', up: '-90deg' }[direction];
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center', transform: [{ rotate }] }}>
      <View style={{ width: size * 0.35, height: 1.8, backgroundColor: color, borderRadius: 1, transform: [{ rotate: '45deg' }, { translateY: size * 0.09 }] }} />
      <View style={{ width: size * 0.35, height: 1.8, backgroundColor: color, borderRadius: 1, transform: [{ rotate: '-45deg' }, { translateY: -size * 0.09 }] }} />
    </View>
  );
}

export function IconTrash({ color, size = 16 }) {
  const s = size;
  return (
    <View style={{ width: s, height: s, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ width: s * 0.65, height: s * 0.6, borderWidth: 1.5, borderColor: color, borderRadius: 2, marginTop: s * 0.15 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 3 }}>
          {[0,1,2].map(i => <View key={i} style={{ width: 1.2, height: s * 0.3, backgroundColor: color, borderRadius: 1 }} />)}
        </View>
      </View>
      <View style={{ position: 'absolute', top: 0, width: s * 0.5, height: 1.5, backgroundColor: color, borderRadius: 1 }} />
      <View style={{ position: 'absolute', top: -s * 0.1, width: s * 0.3, height: s * 0.15, borderWidth: 1.5, borderColor: color, borderRadius: 2 }} />
    </View>
  );
}

export function IconEdit({ color, size = 16 }) {
  const s = size;
  return (
    <View style={{ width: s, height: s, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ width: s * 0.6, height: s * 0.6, borderWidth: 1.5, borderColor: color, borderRadius: 2, transform: [{ rotate: '45deg' }] }} />
      <View style={{ position: 'absolute', bottom: 0, left: 0, width: s * 0.25, height: s * 0.25, borderLeftWidth: 1.5, borderBottomWidth: 1.5, borderColor: color }} />
    </View>
  );
}

export function IconCopy({ color, size = 16 }) {
  const s = size;
  return (
    <View style={{ width: s, height: s }}>
      <View style={{ position: 'absolute', right: 0, top: 0, width: s * 0.7, height: s * 0.7, borderWidth: 1.5, borderColor: color, borderRadius: 2 }} />
      <View style={{ position: 'absolute', left: 0, bottom: 0, width: s * 0.7, height: s * 0.7, borderWidth: 1.5, borderColor: color, borderRadius: 2, backgroundColor: 'transparent' }} />
    </View>
  );
}

export function IconBell({ color, size = 16 }) {
  const s = size;
  return (
    <View style={{ width: s, height: s, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ width: s * 0.65, height: s * 0.55, borderTopLeftRadius: s * 0.35, borderTopRightRadius: s * 0.35, borderWidth: 1.5, borderColor: color, borderBottomWidth: 0, marginTop: s * 0.1 }} />
      <View style={{ width: s * 0.65, height: s * 0.15, borderWidth: 1.5, borderColor: color, borderTopWidth: 0 }} />
      <View style={{ width: s * 0.25, height: s * 0.15, borderBottomLeftRadius: s * 0.15, borderBottomRightRadius: s * 0.15, borderWidth: 1.5, borderColor: color, borderTopWidth: 0, marginTop: -1 }} />
      <View style={{ position: 'absolute', top: 0, width: 1.5, height: s * 0.15, backgroundColor: color, borderRadius: 1 }} />
    </View>
  );
}

export function IconStar({ color, size = 16, filled = false }) {
  // Simple diamond star
  const s = size;
  return (
    <View style={{ width: s, height: s, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ width: s * 0.55, height: s * 0.55, backgroundColor: filled ? color : 'transparent', borderWidth: 1.5, borderColor: color, transform: [{ rotate: '45deg' }], borderRadius: 2 }} />
    </View>
  );
}

export function IconRepeat({ color, size = 16 }) {
  const s = size;
  return (
    <View style={{ width: s, height: s, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ width: s * 0.75, height: s * 0.55, borderWidth: 1.5, borderColor: color, borderRadius: s * 0.3, borderBottomWidth: 0 }} />
      <View style={{ position: 'absolute', top: s * 0.02, right: s * 0.05, width: 0, height: 0, borderLeftWidth: s * 0.15, borderRightWidth: s * 0.15, borderBottomWidth: s * 0.22, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: color }} />
      <View style={{ position: 'absolute', bottom: s * 0.1, width: s * 0.75, height: s * 0.55, borderWidth: 1.5, borderColor: color, borderRadius: s * 0.3, borderTopWidth: 0 }} />
    </View>
  );
}

export function IconFocus({ color, size = 16 }) {
  const s = size;
  return (
    <View style={{ width: s, height: s, justifyContent: 'center', alignItems: 'center' }}>
      {/* Corner brackets */}
      <View style={{ position: 'absolute', top: 0, left: 0, width: s * 0.3, height: s * 0.3, borderTopWidth: 2, borderLeftWidth: 2, borderColor: color }} />
      <View style={{ position: 'absolute', top: 0, right: 0, width: s * 0.3, height: s * 0.3, borderTopWidth: 2, borderRightWidth: 2, borderColor: color }} />
      <View style={{ position: 'absolute', bottom: 0, left: 0, width: s * 0.3, height: s * 0.3, borderBottomWidth: 2, borderLeftWidth: 2, borderColor: color }} />
      <View style={{ position: 'absolute', bottom: 0, right: 0, width: s * 0.3, height: s * 0.3, borderBottomWidth: 2, borderRightWidth: 2, borderColor: color }} />
      <View style={{ width: s * 0.2, height: s * 0.2, borderRadius: s * 0.1, backgroundColor: color }} />
    </View>
  );
}

export function IconX({ color, size = 14 }) {
  const s = size;
  return (
    <View style={{ width: s, height: s, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ width: s * 0.75, height: 1.8, backgroundColor: color, borderRadius: 1, position: 'absolute', transform: [{ rotate: '45deg' }] }} />
      <View style={{ width: s * 0.75, height: 1.8, backgroundColor: color, borderRadius: 1, position: 'absolute', transform: [{ rotate: '-45deg' }] }} />
    </View>
  );
}

export function IconLogout({ color, size = 18 }) {
  const s = size;
  return (
    <View style={{ width: s, height: s, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ width: s * 0.55, height: s * 0.75, borderWidth: 1.5, borderColor: color, borderRadius: 2, borderRightWidth: 0 }} />
      <View style={{ position: 'absolute', right: 0, width: s * 0.5, height: 1.8, backgroundColor: color, borderRadius: 1 }} />
      <View style={{ position: 'absolute', right: s * 0.05, width: 0, height: 0, borderTopWidth: s * 0.15, borderBottomWidth: s * 0.15, borderLeftWidth: s * 0.2, borderTopColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: color }} />
    </View>
  );
}

export function IconCloud({ color, size = 18 }) {
  const s = size;
  return (
    <View style={{ width: s, height: s, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ width: s * 0.8, height: s * 0.45, borderWidth: 1.5, borderColor: color, borderRadius: s * 0.25, marginTop: s * 0.1 }} />
      <View style={{ position: 'absolute', top: s * 0.05, left: s * 0.15, width: s * 0.35, height: s * 0.35, borderWidth: 1.5, borderColor: color, borderRadius: s * 0.2 }} />
    </View>
  );
}

export function IconExport({ color, size = 18 }) {
  const s = size;
  return (
    <View style={{ width: s, height: s, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ width: s * 0.65, height: s * 0.5, borderWidth: 1.5, borderColor: color, borderRadius: 2, borderTopWidth: 0, marginTop: s * 0.2 }} />
      <View style={{ position: 'absolute', top: 0, width: 1.8, height: s * 0.55, backgroundColor: color, borderRadius: 1 }} />
      <View style={{ position: 'absolute', top: s * 0.02, width: 0, height: 0, borderLeftWidth: s * 0.15, borderRightWidth: s * 0.15, borderBottomWidth: s * 0.2, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: color, transform: [{ rotate: '180deg' }] }} />
    </View>
  );
}

export function IconMoon({ color, size = 18 }) {
  const s = size;
  return (
    <View style={{ width: s, height: s, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ width: s * 0.7, height: s * 0.7, borderRadius: s * 0.35, borderWidth: 1.8, borderColor: color, borderRightColor: 'transparent', transform: [{ rotate: '30deg' }] }} />
    </View>
  );
}

export function IconSun({ color, size = 18 }) {
  const s = size;
  return (
    <View style={{ width: s, height: s, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ width: s * 0.4, height: s * 0.4, borderRadius: s * 0.2, borderWidth: 1.8, borderColor: color }} />
      {[0,45,90,135].map(deg => (
        <View key={deg} style={{ position: 'absolute', width: 1.8, height: s * 0.2, backgroundColor: color, borderRadius: 1, transform: [{ rotate: `${deg}deg` }, { translateY: -s * 0.38 }] }} />
      ))}
    </View>
  );
}

export function IconMessage({ color, size = 18 }) {
  const s = size;
  return (
    <View style={{ width: s, height: s, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ width: s * 0.85, height: s * 0.65, borderWidth: 1.5, borderColor: color, borderRadius: 4 }}>
        {[0,1,2].map(i => (
          <View key={i} style={{ width: s * (0.5 - i * 0.1), height: 1.2, backgroundColor: color, borderRadius: 1, marginTop: i === 0 ? 5 : 3, marginLeft: 5 }} />
        ))}
      </View>
      <View style={{ position: 'absolute', bottom: s * 0.05, left: s * 0.15, width: 0, height: 0, borderRightWidth: s * 0.15, borderTopWidth: s * 0.15, borderRightColor: 'transparent', borderTopColor: color }} />
    </View>
  );
}

export function IconCrown({ color, size = 18 }) {
  const s = size;
  return (
    <View style={{ width: s, height: s, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ width: s * 0.8, height: s * 0.15, backgroundColor: color, borderRadius: 1, marginTop: s * 0.2 }} />
      <View style={{ position: 'absolute', top: s * 0.1, left: s * 0.1, width: 0, height: 0, borderLeftWidth: s * 0.15, borderRightWidth: s * 0.15, borderBottomWidth: s * 0.35, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: color }} />
      <View style={{ position: 'absolute', top: s * 0.05, left: s * 0.35, width: 0, height: 0, borderLeftWidth: s * 0.15, borderRightWidth: s * 0.15, borderBottomWidth: s * 0.4, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: color }} />
      <View style={{ position: 'absolute', top: s * 0.1, right: s * 0.1, width: 0, height: 0, borderLeftWidth: s * 0.15, borderRightWidth: s * 0.15, borderBottomWidth: s * 0.35, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: color }} />
    </View>
  );
}

export function IconSettings({ color, size = 20 }) {
  const s = size;
  return (
    <View style={{ width: s, height: s, justifyContent: 'center', alignItems: 'center' }}>
      {/* Center circle */}
      <View style={{ width: s * 0.35, height: s * 0.35, borderRadius: s * 0.175, borderWidth: 1.8, borderColor: color }} />
      {/* Gear teeth */}
      {[0, 60, 120, 180, 240, 300].map(deg => (
        <View key={deg} style={{ position: 'absolute', width: s * 0.15, height: s * 0.25, backgroundColor: color, borderRadius: 2, transform: [{ rotate: `${deg}deg` }, { translateY: -s * 0.35 }] }} />
      ))}
    </View>
  );
}

export function IconLock({ color, size = 18 }) {
  const s = size;
  return (
    <View style={{ width: s, height: s, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ width: s * 0.65, height: s * 0.45, borderWidth: 1.5, borderColor: color, borderRadius: 3, marginTop: s * 0.15 }}>
        <View style={{ width: s * 0.15, height: s * 0.15, borderRadius: s * 0.075, backgroundColor: color, alignSelf: 'center', marginTop: s * 0.08 }} />
      </View>
      <View style={{ position: 'absolute', top: s * 0.05, width: s * 0.45, height: s * 0.35, borderWidth: 1.5, borderColor: color, borderRadius: s * 0.25, borderBottomWidth: 0 }} />
    </View>
  );
}

export function IconMail({ color, size = 18 }) {
  const s = size;
  return (
    <View style={{ width: s, height: s, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ width: s * 0.85, height: s * 0.6, borderWidth: 1.5, borderColor: color, borderRadius: 3 }} />
      <View style={{ position: 'absolute', width: 0, height: 0, borderLeftWidth: s * 0.3, borderRightWidth: s * 0.3, borderTopWidth: s * 0.25, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: color }} />
    </View>
  );
}

export function IconEye({ color, size = 18, closed = false }) {
  const s = size;
  return (
    <View style={{ width: s, height: s, justifyContent: 'center', alignItems: 'center' }}>
      {/* Eye shape */}
      <View style={{ width: s * 0.8, height: s * 0.5, borderWidth: 1.5, borderColor: color, borderRadius: s * 0.4 }} />
      {/* Pupil */}
      {!closed && (
        <View style={{ position: 'absolute', width: s * 0.25, height: s * 0.25, borderRadius: s * 0.125, backgroundColor: color }} />
      )}
      {/* Slash when closed */}
      {closed && (
        <View style={{ position: 'absolute', width: s * 0.9, height: 1.8, backgroundColor: color, borderRadius: 1, transform: [{ rotate: '-45deg' }] }} />
      )}
    </View>
  );
}

export function IconBan({ color, size = 16 }) {
  const s = size;
  return (
    <View style={{ width: s, height: s, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ width: s * 0.8, height: s * 0.8, borderRadius: s * 0.4, borderWidth: 2, borderColor: color }} />
      <View style={{ position: 'absolute', width: s * 0.9, height: 2, backgroundColor: color, borderRadius: 1, transform: [{ rotate: '-45deg' }] }} />
    </View>
  );
}



export function IconGlobe({ color, size = 18 }) {
  const s = size;
  return (
    <View style={{ width: s, height: s, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ width: s * 0.85, height: s * 0.85, borderRadius: s * 0.425, borderWidth: 2, borderColor: color }} />
      <View style={{ position: 'absolute', width: s * 0.5, height: s * 0.85, borderRadius: s * 0.425, borderWidth: 2, borderColor: color }} />
      <View style={{ position: 'absolute', width: s * 0.85, height: 2, backgroundColor: color }} />
    </View>
  );
}
