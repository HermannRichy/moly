import { IconFlameFilled, IconStarFilled } from '@tabler/icons-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, Text, useWindowDimensions, View } from 'react-native';
import Animated, { BounceIn, Easing, FadeInDown, useAnimatedStyle, useSharedValue, withDelay, withTiming, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Body, Button, Coq, Display, Heading, ProgressBar, Stage, Tile } from '@/components/ui';
import { playSound } from '@/lib/feedback';
import { levelOf } from '@/lib/levels';
import { useApp } from '@/store/AppState';
import { useTheme } from '@/theme/ThemeProvider';
import { BLUE, fonts } from '@/theme/tokens';

const CONFETTI = [
  { x: 36, y: 70, w: 12, h: 22, color: '#FFFFFF', rot: '20deg' },
  { x: 320, y: 64, w: 12, h: 22, color: '#0A0A0A', rot: '-25deg' },
  { x: 96, y: 44, w: 14, h: 14, color: '#0A0A0A', rot: '0deg' },
  { x: 268, y: 150, w: 14, h: 14, color: '#FFFFFF', rot: '0deg' },
  { x: 22, y: 190, w: 12, h: 22, color: '#9DB0FF', rot: '50deg' },
  { x: 346, y: 200, w: 12, h: 22, color: '#FFFFFF', rot: '-40deg' },
  { x: 170, y: 40, w: 12, h: 12, color: '#9DB0FF', rot: '0deg' },
  { x: 232, y: 58, w: 12, h: 22, color: '#FFFFFF', rot: '60deg' },
];

export default function Resultat() {
  const params = useLocalSearchParams<{ correct: string; total: string; xp: string; streak: string; badge: string; level: string; lesson: string }>();
  const { t } = useTheme();
  const { data } = useApp();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const stage = Math.min(300, Math.round(height * 0.36));

  const correct = Number(params.correct ?? 0);
  const total = Number(params.total ?? 0);
  const xp = Number(params.xp ?? 0);
  const streak = Number(params.streak ?? 0);
  const level = levelOf(data.xp);
  const perfect = correct === total;
  const percent = total > 0 ? Math.round((correct / total) * 100) : 0;
  const leveledUp = Boolean(params.level);

  // Les XP gagnés se comptent à l'écran, puis le son du niveau suit celui de fin de leçon.
  const [shownXp, setShownXp] = useState(0);
  useEffect(() => {
    playSound('fin');
    const levelTimer = leveledUp ? setTimeout(() => playSound('niveau'), 1100) : undefined;
    const steps = 20;
    let i = 0;
    const counter = setInterval(() => {
      i += 1;
      setShownXp(Math.round((xp * i) / steps));
      if (i >= steps) clearInterval(counter);
    }, 35);
    return () => {
      clearInterval(counter);
      if (levelTimer) clearTimeout(levelTimer);
    };
  }, [xp, leveledUp]);

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <Stage height={stage + insets.top}>
        <View style={{ position: 'absolute', left: 0, right: 0, top: insets.top - 20, bottom: 0, alignItems: 'center' }}>
          <View style={{ width: 390, flex: 1 }}>
            {CONFETTI.map((c, i) => (
              <Confetto key={i} index={i} {...c} />
            ))}
            <View style={{ position: 'absolute', left: 22, top: 128, transform: [{ rotate: '-10deg' }], paddingHorizontal: 16, paddingTop: 6, paddingBottom: 4, borderRadius: 18, backgroundColor: '#0A0A0A' }}>
              <Display size={34} color="#FFFFFF">
                +{shownXp} XP
              </Display>
            </View>
            <View style={{ position: 'absolute', right: 24, top: 104, transform: [{ rotate: '9deg' }], paddingHorizontal: 16, paddingTop: 6, paddingBottom: 4, borderRadius: 18, backgroundColor: '#FFFFFF' }}>
              <Display size={34} color="#0A0A0A">
                {percent} %
              </Display>
            </View>
          </View>
        </View>
        <Animated.View entering={BounceIn.delay(120).duration(700)} style={{ position: 'absolute', left: 0, right: 0, bottom: 12, alignItems: 'center' }}>
          <Coq size={Math.min(200, Math.round(stage * 0.66))} mood={perfect ? 'proud' : 'happy'} />
        </Animated.View>
      </Stage>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 2, paddingBottom: insets.bottom + 12, gap: 12 }}>
        <Heading lead="Leçon" main="terminée !" size={46} center />
        {leveledUp ? (
          <Animated.View
            entering={ZoomIn.delay(900).springify()}
            accessibilityLiveRegion="polite"
            style={{ paddingVertical: 12, paddingHorizontal: 16, borderRadius: 24, backgroundColor: BLUE, alignItems: 'center' }}>
            <Text style={{ fontFamily: fonts.semibold, fontSize: 13, letterSpacing: 1, textTransform: 'uppercase', color: '#FFFFFF' }}>Niveau supérieur</Text>
            <Display size={30} color="#FFFFFF">
              {params.level}
            </Display>
          </Animated.View>
        ) : null}
        <Animated.View entering={FadeInDown.delay(250).duration(380)} style={{ flexDirection: 'row', gap: 10 }}>
          <Tile big={`${percent} %`} small="bonnes réponses" />
          <Tile big={`+${xp}`} small="XP gagnés" />
          <Tile big={String(streak)} small={streak > 1 ? 'jours de série' : 'jour de série'} icon={<IconFlameFilled size={22} color={t.blueText} />} />
        </Animated.View>
        {params.badge ? (
          <View style={{ paddingHorizontal: 16, paddingVertical: 14, borderRadius: 24, backgroundColor: t.invBg, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: BLUE, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-8deg' }] }}>
              <IconStarFilled size={24} color="#FFFFFF" />
            </View>
            <View>
              <Text style={{ fontFamily: fonts.semibold, fontSize: 13, letterSpacing: 1, textTransform: 'uppercase', color: t.invMuted }}>Nouveau badge</Text>
              <Body size={17} weight="semibold" color={t.invFg}>
                {params.badge}
              </Body>
            </View>
          </View>
        ) : null}
        <View style={{ gap: 6 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Body size={14} weight="semibold">
              Niveau {level.level} · {level.name}
            </Body>
            <Body size={14} color={t.muted}>
              {level.current} / {level.needed} XP
            </Body>
          </View>
          <ProgressBar value={level.current} max={level.needed} />
        </View>
        <View style={{ flex: 1 }} />
        <Button label="Continuer" onPress={() => router.replace('/accueil')} />
        {!perfect && params.lesson ? (
          <Button label="Refaire la leçon" kind="ghost" onPress={() => router.replace({ pathname: '/lecon/[id]', params: { id: params.lesson } })} />
        ) : null}
      </ScrollView>
    </View>
  );
}

/** Confetti qui tombe du haut de la scène jusqu'à sa place, en tournant. */
function Confetto({ index, x, y, w, h, color, rot }: { index: number; x: number; y: number; w: number; h: number; color: string; rot: string }) {
  const fall = useSharedValue(-y - 60);
  const spin = useSharedValue(-180);
  useEffect(() => {
    const delay = 80 + index * 70;
    fall.value = withDelay(delay, withTiming(0, { duration: 900, easing: Easing.out(Easing.cubic) }));
    spin.value = withDelay(delay, withTiming(0, { duration: 900, easing: Easing.out(Easing.cubic) }));
  }, [index, fall, spin]);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: fall.value }, { rotate: `${spin.value}deg` }] }));
  return (
    <Animated.View style={[{ position: 'absolute', left: x, top: y }, style]}>
      <View style={{ width: w, height: h, borderRadius: w === h ? 7 : 4, backgroundColor: color, transform: [{ rotate: rot }] }} />
    </Animated.View>
  );
}
