import { IconHome, IconPlus, IconRepeat, IconUser } from '@tabler/icons-react-native';
import { BlurView } from 'expo-blur';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { nextLesson, useApp } from '@/store/AppState';
import { useTheme } from '@/theme/ThemeProvider';
import { BLUE } from '@/theme/tokens';

import { Card } from './ui';

export type TabName = 'accueil' | 'revisions' | 'profil';

const TABS = [
  { name: 'accueil', label: 'Accueil', icon: IconHome },
  { name: 'revisions', label: 'Révisions', icon: IconRepeat },
  { name: 'profil', label: 'Profil', icon: IconUser },
] as const;

/** Barre flottante : trois onglets, et le « + » en verre accolé à droite. */
export function TabBar({ active }: { active: TabName }) {
  const { t } = useTheme();
  const { data, lessons } = useApp();
  const insets = useSafeAreaInsets();
  const startLesson = () => router.push({ pathname: '/lecon/[id]', params: { id: nextLesson(data, lessons).id } });

  return (
    <View
      pointerEvents="box-none"
      style={{ position: 'absolute', left: 0, right: 0, bottom: Math.max(insets.bottom, 16) + 8, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
      <Card radius={32} style={{ width: 200, height: 64, padding: 8, flexDirection: 'row', justifyContent: 'space-between' }}>
        {TABS.map(({ name, label, icon: IconCmp }) => {
          const on = name === active;
          return (
            <Pressable
              key={name}
              accessibilityRole="tab"
              accessibilityLabel={label}
              accessibilityState={{ selected: on }}
              onPress={() => {
                if (!on) router.replace(`/${name}`);
              }}
              style={{ width: 56, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? t.invBg : 'transparent' }}>
              <IconCmp size={24} color={on ? t.invFg : t.muted} strokeWidth={2} />
            </Pressable>
          );
        })}
      </Card>
      <Pressable accessibilityRole="button" accessibilityLabel="Nouvelle leçon" onPress={startLesson} style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}>
        {isLiquidGlassAvailable() ? (
          <GlassView glassEffectStyle="regular" tintColor={BLUE} isInteractive style={{ width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' }}>
            <IconPlus size={28} color="#FFFFFF" strokeWidth={2.5} />
          </GlassView>
        ) : (
          <View style={{ width: 64, height: 64, borderRadius: 32, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)' }}>
            <BlurView intensity={30} tint="default" style={{ flex: 1 }}>
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(31,61,255,0.80)' }}>
                <IconPlus size={28} color="#FFFFFF" strokeWidth={2.5} />
              </View>
            </BlurView>
          </View>
        )}
      </Pressable>
    </View>
  );
}
