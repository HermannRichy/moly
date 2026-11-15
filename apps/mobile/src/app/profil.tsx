import { useUser } from '@clerk/expo';
import { IconCheck, IconCrown, IconFlameFilled, IconLock, IconSettings, IconStarFilled, type Icon } from '@tabler/icons-react-native';
import { router } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TabBar } from '@/components/TabBar';
import { Avatar, Body, Card, CircleButton, Display, ProgressBar, Stage, Tile } from '@/components/ui';
import { levelOf } from '@/lib/levels';
import { BADGES, type BadgeId, currentStreak, earnedBadges, useApp } from '@/store/AppState';
import { useTheme } from '@/theme/ThemeProvider';
import { BLUE } from '@/theme/tokens';

const BADGE_ICONS: Record<BadgeId, Icon> = {
  'premiere-lecon': IconStarFilled,
  'sans-faute': IconCheck,
  'sept-jours': IconFlameFilled,
  'trente-jours': IconFlameFilled,
};

export default function Profil() {
  const { t } = useTheme();
  const { data } = useApp();
  const { user } = useUser();
  const insets = useSafeAreaInsets();
  const level = levelOf(data.xp);
  const streak = currentStreak(data);
  const earned = earnedBadges(data);

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}>
        <Stage height={110 + insets.top}>
          <Display size={110} color="#FFFFFF" style={{ position: 'absolute', right: 18, top: insets.top, opacity: 0.22, letterSpacing: 5 }}>
            MOLY
          </Display>
          <CircleButton
            icon={IconSettings}
            label="Réglages"
            onPress={() => router.push('/reglages')}
            bg="#FFFFFF"
            fg="#0A0A0A"
            style={{ position: 'absolute', right: 24, top: insets.top + 12 }}
          />
        </Stage>
        <View style={{ position: 'absolute', left: 24, top: 52 + insets.top, borderRadius: 50, borderWidth: 5, borderColor: t.bg }}>
          <Avatar size={86} uri={user?.imageUrl} bg={t.invBg} />
        </View>
        <View style={{ marginLeft: 134, marginRight: 24, marginTop: 6, minHeight: 56 }}>
          <Display size={32} accessibilityRole="header" numberOfLines={1} adjustsFontSizeToFit>
            {data.userName || 'Votre profil'}
          </Display>
          <Body size={14} color={t.muted}>
            Niveau {level.level} · {level.name}
          </Body>
        </View>

        <View style={{ paddingHorizontal: 24, paddingTop: 14, gap: 12 }}>
          <View style={{ gap: 6 }}>
            <ProgressBar value={level.current} max={level.needed} />
            <Body size={13} color={t.muted}>
              {level.current} / {level.needed} XP avant le niveau {level.level + 1}
            </Body>
          </View>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Tile big={String(streak)} small={streak > 1 ? 'jours de série' : 'jour de série'} icon={<IconFlameFilled size={22} color={t.blueText} />} />
            <Tile big={String(data.completed.length)} small={data.completed.length > 1 ? 'leçons' : 'leçon'} />
            <Tile big={String(data.savedExpressions.length)} small={data.savedExpressions.length > 1 ? 'expressions' : 'expression'} />
          </View>

          <Card radius={24} style={{ padding: 14, paddingBottom: 16, gap: 12 }}>
            <Body size={16} weight="bold" accessibilityRole="header">
              Badges
            </Body>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {BADGES.map((badge, index) => {
                const has = earned.includes(badge.id);
                const IconCmp = has ? BADGE_ICONS[badge.id] : IconLock;
                const blue = index % 2 === 0;
                return (
                  <View key={badge.id} style={{ flex: 1, alignItems: 'center', gap: 8 }}>
                    <View
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: 18,
                        alignItems: 'center',
                        justifyContent: 'center',
                        transform: [{ rotate: has ? (blue ? '-8deg' : '6deg') : '0deg' }],
                        backgroundColor: has ? (blue ? BLUE : t.invBg) : 'transparent',
                        borderWidth: has ? 0 : 2,
                        borderStyle: 'dashed',
                        borderColor: t.dim,
                      }}>
                      <IconCmp size={26} color={has ? (blue ? '#FFFFFF' : t.invFg) : t.muted} />
                    </View>
                    <Body size={13} weight="medium" color={has ? t.ink : t.muted} style={{ textAlign: 'center', lineHeight: 16 }}>
                      {badge.name}
                    </Body>
                  </View>
                );
              })}
            </View>
          </Card>

          <View style={{ overflow: 'hidden', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 24, backgroundColor: t.invBg, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ position: 'absolute', right: -40, top: -50, width: 150, height: 150, borderRadius: 75, backgroundColor: BLUE, opacity: 0.35 }} />
            <View style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: BLUE, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-8deg' }] }}>
              <IconCrown size={22} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Display size={24} color={t.invFg}>
                MOLY Premium
              </Display>
              <Body size={13} color={t.invFg}>
                Leçons illimitées, bientôt disponible
              </Body>
            </View>
          </View>
        </View>
      </ScrollView>
      <TabBar active="profil" />
    </View>
  );
}
