import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { THEMES, buildColors } from '../constants/theme';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [themeId, setThemeId] = useState('dark');
  const [colors, setColors] = useState(buildColors(THEMES.dark));

  useEffect(() => {
    AsyncStorage.getItem('app_theme').then((t) => {
      if (t && THEMES[t]) {
        setThemeId(t);
        setColors(buildColors(THEMES[t]));
      }
    });
  }, []);

  const applyTheme = async (id) => {
    if (!THEMES[id]) return;
    await AsyncStorage.setItem('app_theme', id);
    setThemeId(id);
    setColors(buildColors(THEMES[id]));
  };
  
  const switchToFreeTheme = async () => {
    // Called when premium expires and user has premium theme
    if (themeId && THEMES[themeId] && !THEMES[themeId].free) {
      console.log('Premium expired, switching to white theme');
      await applyTheme('white');
    }
  };

  return (
    <ThemeContext.Provider value={{ themeId, colors, applyTheme, switchToFreeTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
