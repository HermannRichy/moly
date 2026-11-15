import { ClerkProvider } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { CLERK_PUBLISHABLE_KEY } from '@/config';
import { AppStateProvider, useApp } from '@/store/AppState';
import { ThemeProvider, useTheme } from '@/theme/ThemeProvider';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Robinco: require('@/assets/fonts/Robinco.otf'),
    'Switzer-Regular': require('@/assets/fonts/Switzer-Regular.otf'),
    'Switzer-Medium': require('@/assets/fonts/Switzer-Medium.otf'),
    'Switzer-Semibold': require('@/assets/fonts/Switzer-Semibold.otf'),
    'Switzer-Bold': require('@/assets/fonts/Switzer-Bold.otf'),
  });

  if (!loaded && !error) return null;

  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} tokenCache={tokenCache}>
      <ThemeProvider>
        <AppStateProvider>
          <Shell />
        </AppStateProvider>
      </ThemeProvider>
    </ClerkProvider>
  );
}

function Shell() {
  const { ready } = useApp();
  const { t } = useTheme();

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <>
      <StatusBar style={t.name === 'sombre' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: t.bg } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="connexion" options={{ animation: 'fade' }} />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="accueil" options={{ animation: 'none' }} />
        <Stack.Screen name="carte" options={{ animation: 'none' }} />
        <Stack.Screen name="revisions" options={{ animation: 'none' }} />
        <Stack.Screen name="profil" options={{ animation: 'none' }} />
        <Stack.Screen name="reglages" />
        <Stack.Screen name="lecon/[id]" options={{ animation: 'slide_from_bottom', gestureEnabled: false }} />
        <Stack.Screen name="resultat" options={{ animation: 'fade', gestureEnabled: false }} />
      </Stack>
    </>
  );
}
