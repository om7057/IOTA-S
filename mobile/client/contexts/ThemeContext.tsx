// In contexts/ThemeContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeType = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: ThemeType;
  isDark: boolean;
  setTheme: (theme: ThemeType) => void;
  colors: typeof lightColors | typeof darkColors;
}

const lightColors = {
  primary: '#2196F3',
  background: '#FFFFFF',
  card: '#F5F5F5',
  text: '#000000',
  border: '#E0E0E0',
  notification: '#FF3B30',
  error: '#FF3B30',
  success: '#34C759',
  warning: '#FF9500',
  info: '#5856D6',
  placeholder: '#8E8E93',
  disabled: '#C7C7CC',
  verified: '#2196F3',
  nonVerified: '#757575',
};

const darkColors = {
  primary: '#0A84FF',
  background: '#000000',
  card: '#1C1C1E',
  text: '#FFFFFF',
  border: '#38383A',
  notification: '#FF453A',
  error: '#FF453A',
  success: '#32D74B',
  warning: '#FF9F0A',
  info: '#5E5CE6',
  placeholder: '#8E8E93',
  disabled: '#3A3A3C',
  verified: '#0A84FF',
  nonVerified: '#8E8E93',
};

const ThemeContext = createContext<ThemeContextType>({
  theme: 'system',
  isDark: false,
  setTheme: () => {},
  colors: lightColors,
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState<ThemeType>('system');

  useEffect(() => {
    // Load saved theme preference
    AsyncStorage.getItem('theme').then((savedTheme) => {
      if (savedTheme) {
        setThemeState(savedTheme as ThemeType);
      }
    });
  }, []);

  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
    AsyncStorage.setItem('theme', newTheme);
  };

  const isDark = theme === 'system' 
    ? systemColorScheme === 'dark'
    : theme === 'dark';

  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ theme, isDark, setTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};