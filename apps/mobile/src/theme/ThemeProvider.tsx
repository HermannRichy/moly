import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';

import { dark, light, type Palette } from './tokens';

export type ThemeMode = 'clair' | 'sombre' | 'auto';

type ThemeContextValue = {
  t: Palette;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
};

const KEY = 'moly.theme';
const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('auto');

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((value) => {
        if (value === 'clair' || value === 'sombre' || value === 'auto') setModeState(value);
      })
      .catch(() => {});
  }, []);

  const value = useMemo<ThemeContextValue>(() => {
    const isDark = mode === 'sombre' || (mode === 'auto' && system === 'dark');
    return {
      t: isDark ? dark : light,
      mode,
      setMode: (next) => {
        setModeState(next);
        AsyncStorage.setItem(KEY, next).catch(() => {});
      },
    };
  }, [mode, system]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme doit être utilisé dans ThemeProvider');
  return ctx;
}
