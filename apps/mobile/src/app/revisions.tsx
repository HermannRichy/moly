import { IconChevronRight } from '@tabler/icons-react-native';
import { router } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TabBar } from '@/components/TabBar';
import { Body, Card, Heading, Label, Medal, Pill } from '@/components/ui';
import { type Lesson, lessons } from '@/data/lessons';
import { useApp } from '@/store/AppState';
import { useTheme } from '@/theme/ThemeProvider';
import { BLUE } from '@/theme/tokens';

export default function Revisions() {
  const { t } = useTheme();
  const { data } = useApp();
  const insets = useSafeAreaInsets();

  const toReview = lessons.filter((lesson) => data.toReview.includes(lesson.id));
  const mastered = lessons.filter((lesson) => data.completed.includes(lesson.id) && !data.toReview.includes(lesson.id));

  const row = (lesson: Lesson, due: boolean) => (
    <Pressable key={lesson.id} accessibilityRole="button" onPress={() => router.push({ pathname: '/lecon/[id]', params: { id: lesson.id } })}>
      <Card radius={24} style={{ padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{ flex: 1, gap: 6 }}>
          <Pill bg={due ? BLUE : t.soft} fg={due ? '#FFFFFF' : t.ink}>
            {lesson.category}
          </Pill>
          <Body size={17} weight="semibold">
            {lesson.titleLead} {lesson.titleMain}
          </Body>
        </View>
        <IconChevronRight size={20} color={t.muted} />
      </Card>
    </Pressable>
  );

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + 16, paddingHorizontal: 24, paddingBottom: insets.bottom + 120, gap: 14 }}>
        <Heading lead="Vos" main="révisions" size={44} />
        {toReview.length === 0 && mastered.length === 0 ? (
          <Card style={{ padding: 20, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <Medal size={56} />
            <Body size={15} color={t.muted} style={{ flex: 1 }}>
              Rien à revoir pour l'instant. Terminez une première leçon : les règles manquées reviendront ici.
            </Body>
          </Card>
        ) : null}
        {toReview.length > 0 ? (
          <>
            <Label>À revoir</Label>
            {toReview.map((lesson) => row(lesson, true))}
          </>
        ) : null}
        {mastered.length > 0 ? (
          <>
            <View style={{ marginTop: 6 }}>
              <Label>Acquises</Label>
            </View>
            {mastered.map((lesson) => row(lesson, false))}
          </>
        ) : null}
      </ScrollView>
      <TabBar active="revisions" />
    </View>
  );
}
