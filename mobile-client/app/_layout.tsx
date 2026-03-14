import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Slot, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { UserProvider, useUserProfile } from '../contexts/UserContext';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { session, loading } = useAuth();
  const { hasAge, loading: userLoading } = useUserProfile();
  const segments = useSegments();
  const router = useRouter();
  const [fontsLoaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    if (loading || userLoading || !fontsLoaded) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';
    const inAgeSelection = segments[0] === 'age-selection';

    if (session && !inTabsGroup && !inAgeSelection) {
      // If user is signed in, check if they have age set
      if (hasAge) {
        // If they have age, go to tabs
        router.replace('/(tabs)');
      } else {
        // If they don't have age, go to age selection
        router.replace('/age-selection');
      }
    } else if (!session && !inAuthGroup) {
      // If user is not signed in and not in auth group, redirect to sign in
      router.replace('/(auth)/sign-in');
    }
  }, [session, loading, userLoading, segments, fontsLoaded, hasAge]);

  if (!fontsLoaded || loading || userLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <Slot />
        <StatusBar style="dark" />
      </View>
    </ThemeProvider>
  );
}

function RootLayoutWrapper() {
  return (
    <AuthProvider>
      <UserProvider>
        <RootLayoutNav />
      </UserProvider>
    </AuthProvider>
  );
}

export default RootLayoutWrapper;