import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';

import { feedbackPrefs } from '@/lib/feedback';

import { dark, light, type Palette } from './tokens';

export type ThemeMode = 'clair' | 'sombre' | 'auto';

type Prefs = { mode: ThemeMode; sounds: boolean; haptics: boolean };

type ThemeContextValue = Prefs & {
  t: Palette;
  setMode: (mode: ThemeMode) => void;
  setSounds: (on: boolean) => void;
  setHaptics: (on: boolean) => void;
};

const KEY = 'moly.prefs.v1';
const DEFAULTS: Prefs = { mode: 'auto', sounds: true, haptics: true };
const ThemeContext = createContext<ThemeContextValue | null>(null);

/** Préférences propres à l'appareil : apparence, sons et vibrations. */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (raw) setPrefs({ ...DEFAULTS, ...(JSON.parse(raw) as Partial<Prefs>) });
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    feedbackPrefs.sounds = prefs.sounds;
    feedbackPrefs.haptics = prefs.haptics;
  }, [prefs.sounds, prefs.haptics]);

  const value = useMemo<ThemeContextValue>(() => {
    const isDark = prefs.mode === 'sombre' || (prefs.mode === 'auto' && system === 'dark');
    const change = (patch: Partial<Prefs>) => {
      const next = { ...prefs, ...patch };
      setPrefs(next);
      AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
    };
    return {
      ...prefs,
      t: isDark ? dark : light,
      setMode: (mode) => change({ mode }),
      setSounds: (sounds) => change({ sounds }),
      setHaptics: (haptics) => change({ haptics }),
    };
  }, [prefs, system]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme doit être utilisé dans ThemeProvider');
  return ctx;
}
