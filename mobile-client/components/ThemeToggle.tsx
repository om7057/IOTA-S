import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export const ThemeToggle = () => {
  const { theme, setTheme, colors } = useTheme();

  const cycleTheme = () => {
    const themes: ('light' | 'dark' | 'system')[] = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return 'sunny';
      case 'dark':
        return 'moon';
      case 'system':
        return 'settings';
      default:
        return 'sunny';
    }
  };

  return (
    <TouchableOpacity
      onPress={cycleTheme}
      style={[styles.container, { backgroundColor: colors.card }]}
    >
      <Ionicons name={getThemeIcon()} size={24} color={colors.text} />
      <Text style={[styles.text, { color: colors.text }]}>
        {theme.charAt(0).toUpperCase() + theme.slice(1)}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  text: {
    marginLeft: 8,
    fontSize: 16,
  },
}); 