import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { SIZES } from '../constants/theme';
import { IconCalendar, IconTarget, IconChart, IconUser } from '../constants/icons';

import WeekScreen from '../screens/WeekScreen';
import GoalsScreen from '../screens/GoalsScreen';
import StatsScreen from '../screens/StatsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const TABS = [
  { name: 'Week',    component: WeekScreen,    Icon: IconCalendar, label: 'Week'  },
  { name: 'Goals',   component: GoalsScreen,   Icon: IconTarget,   label: 'Goale'  },
  { name: 'Stats',   component: StatsScreen,   Icon: IconChart,    label: 'Stats'  },
  { name: 'Profile', component: ProfileScreen, Icon: IconUser,     label: 'Profile' },
];

export default function MainTabNavigator() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 72,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarShowLabel: false,
      }}
    >
      {TABS.map(({ name, component, Icon, label }) => (
        <Tab.Screen
          key={name}
          name={name}
          component={component}
          options={{
            tabBarIcon: ({ focused }) => (
              <View style={styles.tabItem}>
                <Icon color={focused ? colors.primary : colors.textMuted} size={22} />
                <Text style={[styles.label, { color: focused ? colors.primary : colors.textMuted }]}>
                  {label}
                </Text>
              </View>
            ),
          }}
        />
      ))}
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabItem: { alignItems: 'center', justifyContent: 'center', gap: 3 },
  label: { fontSize: SIZES.xs, fontWeight: '600' },
});
