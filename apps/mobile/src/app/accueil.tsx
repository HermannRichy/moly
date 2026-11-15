import { IconArrowRight, IconBookmark, IconBookmarkFilled, IconChevronRight, IconFlameFilled, IconRepeat } from '@tabler/icons-react-native';
import { useUser } from '@clerk/expo';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TabBar } from '@/components/TabBar';
import { Avatar, Body, Card, CircleButton, Coq, Display, Grain, Label } from '@/components/ui';
import { dayKey, dayOfYear } from '@/lib/dates';
import { currentStreak, nextLesson, useApp } from '@/store/AppState';
import { useTheme } from '@/theme/ThemeProvider';
import { BLUE, fonts } from '@/theme/tokens';

export default function Accueil() {
  const { t } = useTheme();
  const { data, lessons, expressions, toggleExpression } = useApp();
  const insets = useSafeAreaInsets();
  const { user } = useUser();

  const streak = currentStreak(data);
  const lesson = nextLesson(data, lessons);
  const doneToday = data.lastLessonDay === dayKey();
  const expression = expressions[dayOfYear() % expressions.length];
  const saved = data.savedExpressions.includes(expression.id);
  const openLesson = () => router.push({ pathname: '/lecon/[id]', params: { id: lesson.id } });

  const days: number[] = [];
  for (let n = Math.max(1, streak - 3); n <= streak + 3; n++) days.push(n);
  if (streak === 0) days.unshift(0);

  const glyphs = lesson.category === 'Grammaire' ? ['é', 'ées'] : lesson.category === 'Conjugaison' ? ['ai', 'ais'] : ['ç', 'œ'];

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 24, paddingBottom: insets.bottom + 120, gap: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Avatar size={48} uri={user?.imageUrl} />
          <View style={{ flex: 1 }}>
            <Body size={14} color={t.muted}>
              Bonjour{data.userName ? ',' : ''}
            </Body>
            <Display size={30} accessibilityRole="header" numberOfLines={1} adjustsFontSizeToFit>
              {data.userName || 'Bienvenue'}
            </Display>
          </View>
          <View
            accessibilityLabel={`Série de ${streak} jours`}
            style={{ height: 48, paddingLeft: 12, paddingRight: 16, borderRadius: 24, backgroundColor: t.invBg, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <IconFlameFilled size={24} color={t.invBlue} />
            <Display size={28} color={t.invFg}>
              {String(streak)}
            </Display>
          </View>
        </View>

        <Animated.View entering={FadeInDown.duration(380)}>
        <Card style={{ height: 108, paddingHorizontal: 20, paddingBottom: 12, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          {days.map((n) => {
            if (n === streak) {
              return (
                <View key={n} style={{ alignItems: 'center' }}>
                  <Display size={64} color={t.blueText}>
                    {String(n)}
                  </Display>
                  <Text style={{ fontFamily: fonts.semibold, fontSize: 13, color: t.blueText }}>{n > 1 ? 'jours' : 'jour'}</Text>
                </View>
              );
            }
            const past = n < streak;
            return (
              <View key={n} style={{ alignItems: 'center', gap: 6, paddingBottom: 8 }}>
                <Display size={26} color={past ? t.ink : t.dim}>
                  {String(n)}
                </Display>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: past ? BLUE : t.soft }} />
              </View>
            );
          })}
        </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(90).duration(380)} style={{ height: 244 }}>
          <View style={{ position: 'absolute', left: 16, top: 8, width: 104, height: 132, borderRadius: 24, backgroundColor: t.invBg, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-10deg' }] }}>
            <Display size={70} color={t.invFg}>
              {glyphs[0]}
            </Display>
          </View>
          <Card radius={24} style={{ position: 'absolute', left: 124, top: 0, width: 104, height: 132, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '5deg' }] }}>
            <Display size={70}>{glyphs[1]}</Display>
          </Card>
          <Coq size={112} style={{ position: 'absolute', right: 14, top: 0 }} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Commencer la leçon : ${lesson.titleLead} ${lesson.titleMain}`}
            onPress={openLesson}
            style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 150, borderRadius: 30, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.30)' }}>
            <BlurView intensity={24} tint="default" style={{ flex: 1 }}>
              <View style={{ flex: 1, backgroundColor: 'rgba(31,61,255,0.84)', paddingHorizontal: 20, paddingVertical: 18 }}>
                <Grain opacity={0.4} />
                <Text style={{ fontFamily: fonts.semibold, fontSize: 13, letterSpacing: 1, textTransform: 'uppercase', color: '#FFFFFF' }}>
                  {doneToday ? 'Leçon suivante' : 'Leçon du jour'} · {lesson.minutes} min
                </Text>
                <Display size={31} color="#FFFFFF" style={{ maxWidth: 235, marginTop: 8 }}>
                  {lesson.titleLead} {lesson.titleMain}
                </Display>
                <View style={{ position: 'absolute', right: 16, bottom: 16, width: 54, height: 54, borderRadius: 27, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' }}>
                  <IconArrowRight size={24} color="#0A0A0A" strokeWidth={2} />
                </View>
              </View>
            </BlurView>
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(180).duration(380)} style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 18, borderRadius: 28, backgroundColor: t.invBg, gap: 4 }}>
          <Label color={t.invMuted}>Expression du jour</Label>
          <Display size={40} color={t.invFg} style={{ marginTop: 2, marginRight: 44 }}>
            {expression.term}
          </Display>
          <Body size={15} color={t.invFg}>
            <Text style={{ fontStyle: 'italic', color: t.invMuted }}>{expression.nature}</Text> · {expression.definition}
          </Body>
          <Body size={14} color={t.invMuted} style={{ fontStyle: 'italic' }}>
            « {expression.example} »
          </Body>
          <CircleButton
            icon={saved ? IconBookmarkFilled : IconBookmark}
            label={saved ? "Retirer l'expression des favoris" : "Enregistrer l'expression"}
            onPress={() => toggleExpression(expression.id)}
            bg="rgba(128,128,128,0.28)"
            fg={t.invFg}
            style={{ position: 'absolute', right: 12, top: 12 }}
          />
        </Animated.View>

        <Pressable accessibilityRole="button" onPress={() => router.replace('/revisions')}>
          <Card radius={22} style={{ height: 58, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: t.soft, alignItems: 'center', justifyContent: 'center' }}>
              <IconRepeat size={20} color={t.ink} />
            </View>
            <Body size={15} weight="semibold" style={{ flex: 1 }}>
              {data.toReview.length === 0
                ? 'Aucune règle à revoir'
                : data.toReview.length === 1
                  ? '1 règle à revoir'
                  : `${data.toReview.length} règles à revoir`}
            </Body>
            <IconChevronRight size={20} color={t.muted} />
          </Card>
        </Pressable>
      </ScrollView>
      <TabBar active="accueil" />
    </View>
  );
}
