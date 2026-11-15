import { IconFlameFilled, IconStarFilled } from '@tabler/icons-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Body, Button, Coq, Display, Heading, ProgressBar, Stage, Tile } from '@/components/ui';
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
  const params = useLocalSearchParams<{ correct: string; total: string; xp: string; streak: string; badge: string; lesson: string }>();
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

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <Stage height={stage + insets.top}>
        <View style={{ position: 'absolute', left: 0, right: 0, top: insets.top - 20, bottom: 0, alignItems: 'center' }}>
          <View style={{ width: 390, flex: 1 }}>
            {CONFETTI.map((c, i) => (
              <View key={i} style={{ position: 'absolute', left: c.x, top: c.y, width: c.w, height: c.h, borderRadius: c.w === c.h ? 7 : 4, backgroundColor: c.color, transform: [{ rotate: c.rot }] }} />
            ))}
            <View style={{ position: 'absolute', left: 22, top: 128, transform: [{ rotate: '-10deg' }], paddingHorizontal: 16, paddingTop: 6, paddingBottom: 4, borderRadius: 18, backgroundColor: '#0A0A0A' }}>
              <Display size={34} color="#FFFFFF">
                +{xp} XP
              </Display>
            </View>
            <View style={{ position: 'absolute', right: 24, top: 104, transform: [{ rotate: '9deg' }], paddingHorizontal: 16, paddingTop: 6, paddingBottom: 4, borderRadius: 18, backgroundColor: '#FFFFFF' }}>
              <Display size={34} color="#0A0A0A">
                {correct}/{total}
              </Display>
            </View>
          </View>
        </View>
        <Coq size={Math.min(200, Math.round(stage * 0.66))} mood={perfect ? 'proud' : 'happy'} style={{ position: 'absolute', left: 0, right: 0, bottom: 12, alignItems: 'center' }} />
      </Stage>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 2, paddingBottom: insets.bottom + 12, gap: 12 }}>
        <Heading lead="Leçon" main="terminée !" size={46} center />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Tile big={`${correct}/${total}`} small={correct > 1 ? 'bonnes réponses' : 'bonne réponse'} />
          <Tile big={`+${xp}`} small="XP gagnés" />
          <Tile big={String(streak)} small={streak > 1 ? 'jours de série' : 'jour de série'} icon={<IconFlameFilled size={22} color={t.blueText} />} />
        </View>
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
