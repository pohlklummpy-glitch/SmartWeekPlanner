export const PALETTE = {
  purple:  '#6E5CF6',
  pink:    '#F0547C',
  teal:    '#0ABFA3',
  orange:  '#F97316',
  yellow:  '#FBBF24',
  blue:    '#3B82F6',
  green:   '#22C55E',
  red:     '#EF4444',
  gold:    '#F59E0B',
  violet:  '#8B5CF6',
  rose:    '#FB7185',
  sky:     '#38BDF8',
  lime:    '#84CC16',
  amber:   '#F59E0B',
};

export const THEMES = {
  dark: {
    id: 'dark', label: 'Dunkel', free: true,
    background: '#0C0C14', surface: '#13131E', surfaceLight: '#1A1A2A',
    card: '#161624', border: '#22223A', borderLight: '#2A2A45',
    text: '#EEEEFF', textSecondary: '#8080A8', textMuted: '#404060',
    primary: PALETTE.purple,
  },
  light: {
    id: 'light', label: 'Hell', free: true,
    background: '#F2F2F8', surface: '#FFFFFF', surfaceLight: '#EBEBF5',
    card: '#FFFFFF', border: '#DCDCEC', borderLight: '#E8E8F4',
    text: '#0E0E1C', textSecondary: '#50507A', textMuted: '#A0A0C0',
    primary: PALETTE.purple,
  },
  midnight: {
    id: 'midnight', label: 'Midnight', free: false,
    background: '#04040E', surface: '#0A0A1A', surfaceLight: '#101028',
    card: '#0C0C20', border: '#181838', borderLight: '#202048',
    text: '#C8C8FF', textSecondary: '#6060A0', textMuted: '#282850',
    primary: '#7B68EE',
  },
  forest: {
    id: 'forest', label: 'Forest', free: false,
    background: '#080F08', surface: '#0F180F', surfaceLight: '#162016',
    card: '#121A12', border: '#1C2C1C', borderLight: '#243424',
    text: '#C8EEC8', textSecondary: '#60A060', textMuted: '#284028',
    primary: '#22C55E',
  },
  ocean: {
    id: 'ocean', label: 'Ocean', free: false,
    background: '#040C18', surface: '#081420', surfaceLight: '#0C1E2E',
    card: '#0A1828', border: '#142438', borderLight: '#1C3048',
    text: '#C0E0FF', textSecondary: '#5080A8', textMuted: '#203040',
    primary: '#38BDF8',
  },
  rose: {
    id: 'rose', label: 'Rose', free: false,
    background: '#120810', surface: '#1C0E18', surfaceLight: '#261420',
    card: '#200C1A', border: '#341828', borderLight: '#402030',
    text: '#FFD0E0', textSecondary: '#A06080', textMuted: '#482030',
    primary: '#FB7185',
  },
  carbon: {
    id: 'carbon', label: 'Carbon', free: false,
    background: '#080808', surface: '#111111', surfaceLight: '#1A1A1A',
    card: '#141414', border: '#242424', borderLight: '#2E2E2E',
    text: '#E8E8E8', textSecondary: '#707070', textMuted: '#383838',
    primary: '#F59E0B',
  },
  aurora: {
    id: 'aurora', label: 'Aurora', free: false,
    background: '#060810', surface: '#0C1020', surfaceLight: '#121830',
    card: '#0E1428', border: '#1A2040', borderLight: '#222850',
    text: '#E0F0FF', textSecondary: '#6080B0', textMuted: '#202840',
    primary: '#8B5CF6',
  },
};

export function buildColors(theme) {
  return {
    ...theme,
    secondary:  PALETTE.pink,
    accent:     PALETTE.teal,
    success:    PALETTE.green,
    warning:    PALETTE.yellow,
    error:      PALETTE.red,
    gold:       PALETTE.gold,
    taskColors: [
      PALETTE.purple, PALETTE.pink,   PALETTE.teal,
      PALETTE.orange, PALETTE.yellow, PALETTE.blue,
      PALETTE.green,  PALETTE.red,    PALETTE.violet,
      PALETTE.rose,   PALETTE.sky,    PALETTE.lime,
    ],
    sport:   PALETTE.pink,
    work:    PALETTE.purple,
    leisure: PALETTE.teal,
    health:  PALETTE.green,
    social:  PALETTE.orange,
    other:   '#6060A0',
  };
}

export const SIZES = {
  xs: 10, sm: 12, md: 14, base: 16, lg: 18, xl: 20, xxl: 24, xxxl: 30,
  radius: 12, radiusLg: 20, radiusSm: 8,
  padding: 16, paddingLg: 24,
};

export const CATEGORIES = [
  { id: 'sport',   label: 'Sport',      colorKey: 'sport'   },
  { id: 'work',    label: 'Arbeit',     colorKey: 'work'    },
  { id: 'leisure', label: 'Freizeit',   colorKey: 'leisure' },
  { id: 'health',  label: 'Gesundheit', colorKey: 'health'  },
  { id: 'social',  label: 'Soziales',   colorKey: 'social'  },
  { id: 'other',   label: 'Sonstiges',  colorKey: 'other'   },
];

export const CATEGORY_ICONS = {
  sport:   '🏃',
  work:    '💼',
  leisure: '🎮',
  health:  '💚',
  social:  '👥',
  other:   '📌',
};

export const DAYS = [
  { id: 0, short: 'Mo', full: 'Montag'     },
  { id: 1, short: 'Di', full: 'Dienstag'   },
  { id: 2, short: 'Mi', full: 'Mittwoch'   },
  { id: 3, short: 'Do', full: 'Donnerstag' },
  { id: 4, short: 'Fr', full: 'Freitag'    },
  { id: 5, short: 'Sa', full: 'Samstag'    },
  { id: 6, short: 'So', full: 'Sonntag'    },
];

export const PREMIUM_FEATURES = [
  { title: 'Alle Themes',       desc: '8 exklusive Designs' },
  { title: 'Focus Mode',       desc: 'Work distraction-free' },
  { title: 'Pre-Reminder',    desc: 'Up to 60 min before' },
  { title: 'Unbegrenzte Goale', desc: 'Mehr als 3 Goale' },
  { title: 'Custom Colors',     desc: 'Eigene Farbe pro Task' },
  { title: 'Advanced Stats',  desc: 'Detailed analysis' },
  { title: 'Data Export',      desc: 'Export as CSV' },
  { title: 'Priority Support',desc: 'Fast Support' },
];

// Discord webhook for support
export const DISCORD_WEBHOOK = 'https://discord.com/api/webhooks/1500170691847393373/XZkt3BbKJes_llYk1XSENqqbUSM-Fqt4H3M3w5oyWDm0PdZII3K2qLqBZlvKwWsLcCcx';
