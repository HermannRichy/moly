import { IconArrowDown, IconBulb, IconCheck, IconX } from '@tabler/icons-react-native';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Body, Button, Card, CircleButton, Display, Grain, Heading, Label, Medal, Pill, Wave } from '@/components/ui';
import { type Exercise, getLesson, type Lesson } from '@/data/lessons';
import { isCorrect } from '@/lib/grading';
import { useApp } from '@/store/AppState';
import { useTheme } from '@/theme/ThemeProvider';
import { BLUE, BLUE_DARK, fonts } from '@/theme/tokens';

const KIND: Record<Exercise['type'], { label: string; lead: string; main: string }> = {
  qcm: { label: 'QCM', lead: 'Choisissez', main: 'la bonne forme' },
  trous: { label: 'Texte à trous', lead: 'Complétez', main: 'la phrase' },
  correction: { label: 'Correction', lead: 'Corrigez', main: 'la phrase' },
  reformulation: { label: 'Reformulation', lead: 'Passez au', main: 'registre soutenu' },
};

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTheme();
  const { data, completeLesson } = useApp();
  const insets = useSafeAreaInsets();
  const lesson = getLesson(id);

  const [step, setStep] = useState(0);
  const [answer, setAnswer] = useState('');
  const [verdict, setVerdict] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);

  if (!lesson) {
    return (
      <View style={{ flex: 1, backgroundColor: t.bg, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 }}>
        <Body>Cette leçon est introuvable.</Body>
        <Button label="Retour à l'accueil" onPress={() => router.replace('/accueil')} />
      </View>
    );
  }

  const exercises: Exercise[] = data.pace === 'express' ? lesson.exercises.slice(0, 2) : lesson.exercises;
  const total = exercises.length + 1;
  const exercise = step > 0 ? exercises[step - 1] : null;

  const validate = (value: string) => {
    if (!exercise || verdict !== null) return;
    Keyboard.dismiss();
    const ok = isCorrect(exercise, value);
    setAnswer(value);
    setVerdict(ok);
    if (ok) setScore((s) => s + 1);
    Haptics.notificationAsync(ok ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error).catch(() => {});
  };

  const next = () => {
    if (step < exercises.length) {
      setStep(step + 1);
      setAnswer('');
      setVerdict(null);
      return;
    }
    const outcome = completeLesson(lesson.id, score, exercises.length);
    router.replace({
      pathname: '/resultat',
      params: {
        correct: String(outcome.correct),
        total: String(outcome.total),
        xp: String(outcome.xpGained),
        streak: String(outcome.streak),
        badge: outcome.newBadges[0] ?? '',
        lesson: lesson.id,
      },
    });
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: t.bg }}>
      <View style={{ paddingTop: insets.top + 12, paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <CircleButton icon={IconX} label="Quitter la leçon" onPress={() => (router.canGoBack() ? router.back() : router.replace('/accueil'))} />
        <View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: total, now: step + 1 }} style={{ flex: 1, flexDirection: 'row', gap: 5 }}>
          {Array.from({ length: total }, (_, i) => (
            <View key={i} style={{ flex: 1, height: 8, borderRadius: 4, backgroundColor: i <= step ? BLUE : t.soft }} />
          ))}
        </View>
        <Body size={14} weight="semibold" color={t.muted}>
          {step + 1}/{total}
        </Body>
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 22, paddingBottom: verdict === null ? 16 : 300 }}>
        {exercise ? (
          <ExerciseView key={step} exercise={exercise} answer={answer} setAnswer={setAnswer} verdict={verdict} onPick={validate} />
        ) : (
          <Rule lesson={lesson} />
        )}
      </ScrollView>

      {verdict === null ? (
        <View style={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 16 }}>
          {exercise ? (
            exercise.type === 'qcm' ? null : (
              <Button label="Valider" disabled={answer.trim().length === 0} onPress={() => validate(answer)} />
            )
          ) : (
            <Button label="J'ai compris" onPress={next} />
          )}
        </View>
      ) : (
        <Feedback exercise={exercise!} good={verdict} onNext={next} last={step === exercises.length} />
      )}
    </KeyboardAvoidingView>
  );
}

function Rule({ lesson }: { lesson: Lesson }) {
  const { t } = useTheme();
  const parts = lesson.rule.split(lesson.highlight);
  return (
    <View style={{ gap: 14 }}>
      <Label>{lesson.category}</Label>
      <Heading lead={lesson.titleLead} main={lesson.titleMain} size={38} />
      <Card style={{ paddingHorizontal: 20, paddingVertical: 18 }}>
        <Body size={17} style={{ lineHeight: 27 }}>
          {parts[0]}
          {parts.length > 1 ? <Text style={{ fontFamily: fonts.semibold, color: '#FFFFFF', backgroundColor: BLUE }}> {lesson.highlight} </Text> : null}
          {parts.slice(1).join(lesson.highlight)}
        </Body>
      </Card>
      <View style={{ flexDirection: 'row', gap: 12, marginVertical: 4 }}>
        {lesson.examples.map((example, index) => (
          <Card
            key={example.tag}
            radius={24}
            style={{ flex: 1, padding: 14, gap: 8, borderWidth: 2, borderColor: example.positive ? BLUE : t.card, transform: [{ rotate: index === 0 ? '-2deg' : '2deg' }] }}>
            <Pill bg={example.positive ? BLUE : t.invBg} fg={example.positive ? '#FFFFFF' : t.invFg}>
              {example.tag}
            </Pill>
            <Body size={17} weight="medium" style={{ lineHeight: 23 }}>
              {example.sentence}
            </Body>
            <Body size={13} color={t.muted} style={{ lineHeight: 18 }}>
              {example.note}
            </Body>
          </Card>
        ))}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Medal size={56} />
        <Card radius={18} style={{ flex: 1, paddingHorizontal: 14, paddingVertical: 10 }}>
          <Body size={14}>
            <Text style={{ fontFamily: fonts.bold }}>Astuce : </Text>
            {lesson.tip}
          </Body>
        </Card>
      </View>
    </View>
  );
}

function Stack3D({ children, tilt = '-2deg' }: { children: React.ReactNode; tilt?: string }) {
  return (
    <View style={{ marginHorizontal: 4, marginTop: 28, marginBottom: 30 }}>
      <Card style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, opacity: 0.55, transform: [{ rotate: tilt.startsWith('-') ? '4deg' : '-4deg' }] }} />
      <Card style={{ padding: 22, transform: [{ rotate: tilt }] }}>{children}</Card>
    </View>
  );
}

function ExerciseView({
  exercise,
  answer,
  setAnswer,
  verdict,
  onPick,
}: {
  exercise: Exercise;
  answer: string;
  setAnswer: (value: string) => void;
  verdict: boolean | null;
  onPick: (value: string) => void;
}) {
  const { t } = useTheme();
  const kind = KIND[exercise.type];
  const locked = verdict !== null;
  const [before, after] = exercise.sentence.split('___');
  const sentenceStyle = { fontFamily: fonts.medium, fontSize: 21, lineHeight: 33, color: t.ink } as const;
  const fieldStyle = {
    borderRadius: 18,
    borderWidth: 2,
    borderColor: t.ink,
    backgroundColor: t.card,
    color: t.ink,
    fontFamily: fonts.medium,
    fontSize: 18,
    paddingHorizontal: 18,
  } as const;

  return (
    <View>
      <View style={{ gap: 10 }}>
        <Label>{kind.label}</Label>
        <Heading lead={kind.lead} main={kind.main} size={36} />
      </View>

      {exercise.type === 'qcm' ? (
        <>
          <Stack3D>
            <Text style={sentenceStyle}>
              {before}
              {locked ? (
                <Text style={{ color: '#FFFFFF', backgroundColor: BLUE }}> {exercise.answer} </Text>
              ) : (
                <Text style={{ color: BLUE }}>______</Text>
              )}
              {after}
            </Text>
          </Stack3D>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {exercise.options.map((option) => {
              const isAnswer = option === exercise.answer;
              const picked = locked && option === answer;
              const blue = locked && isAnswer;
              const wrong = picked && !isAnswer;
              return (
                <Pressable
                  key={option}
                  accessibilityRole="button"
                  accessibilityState={{ selected: picked, disabled: locked }}
                  disabled={locked}
                  onPress={() => onPick(option)}
                  style={{ width: '47.5%', height: 64, borderRadius: 18, backgroundColor: blue ? BLUE_DARK : wrong ? t.invBg : t.edge, paddingBottom: 5 }}>
                  <View
                    style={{
                      flex: 1,
                      borderRadius: 18,
                      paddingHorizontal: 18,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: blue ? BLUE : wrong ? t.invBg : t.card,
                      borderWidth: blue || wrong ? 0 : 1,
                      borderColor: t.line,
                    }}>
                    <Text style={{ fontFamily: fonts.semibold, fontSize: 17, color: blue ? '#FFFFFF' : wrong ? t.invFg : t.ink }}>{option}</Text>
                    {blue ? <IconCheck size={22} color="#FFFFFF" strokeWidth={3} /> : null}
                    {wrong ? <IconX size={22} color={t.invFg} strokeWidth={3} /> : null}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </>
      ) : null}

      {exercise.type === 'trous' ? (
        <>
          <Stack3D tilt="2deg">
            <Text style={sentenceStyle}>
              {before}
              <Text style={{ color: BLUE }}>______</Text>
              {after}
            </Text>
          </Stack3D>
          <View style={{ gap: 8 }}>
            <Body size={14} weight="semibold" color={t.muted}>
              Votre réponse
            </Body>
            <TextInput
              accessibilityLabel="Votre réponse"
              value={answer}
              onChangeText={setAnswer}
              editable={!locked}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={() => answer.trim() && onPick(answer)}
              placeholder="Écrivez le mot manquant"
              placeholderTextColor={t.dim}
              style={[fieldStyle, { height: 60 }]}
            />
            <View style={{ alignSelf: 'flex-start', marginTop: 6, flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, paddingLeft: 10, paddingRight: 14, borderRadius: 18, backgroundColor: t.soft }}>
              <IconBulb size={20} color={t.ink} />
              <Body size={14}>
                Indice : <Text style={{ fontFamily: fonts.bold }}>{exercise.hint}</Text>
              </Body>
            </View>
          </View>
        </>
      ) : null}

      {exercise.type === 'correction' ? (
        <>
          <Stack3D>
            <Text style={sentenceStyle}>{exercise.sentence}</Text>
          </Stack3D>
          <View style={{ gap: 8 }}>
            <Body size={14} weight="semibold" color={t.muted}>
              Votre correction
            </Body>
            <TextInput
              accessibilityLabel="Votre correction"
              value={answer}
              onChangeText={setAnswer}
              editable={!locked}
              multiline
              autoCorrect={false}
              placeholder="Réécrivez la phrase sans faute"
              placeholderTextColor={t.dim}
              style={[fieldStyle, { minHeight: 92, paddingVertical: 14, textAlignVertical: 'top' }]}
            />
          </View>
        </>
      ) : null}

      {exercise.type === 'reformulation' ? (
        <>
          <View style={{ marginHorizontal: 4, marginTop: 26 }}>
            <Card style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, opacity: 0.55, transform: [{ rotate: '4deg' }] }} />
            <Card style={{ padding: 22, gap: 8, transform: [{ rotate: '-2deg' }] }}>
              <Pill bg={t.invBg} fg={t.invFg}>
                Registre courant
              </Pill>
              <Text style={[sentenceStyle, { fontSize: 18, lineHeight: 27 }]}>{exercise.sentence}</Text>
            </Card>
          </View>
          <View style={{ alignSelf: 'center', marginTop: -8, marginBottom: 6, width: 40, height: 44, borderRadius: 20, backgroundColor: BLUE_DARK, paddingBottom: 4 }}>
            <View style={{ flex: 1, borderRadius: 20, backgroundColor: BLUE, alignItems: 'center', justifyContent: 'center' }}>
              <IconArrowDown size={20} color="#FFFFFF" />
            </View>
          </View>
          <View style={{ gap: 8 }}>
            <Body size={14} weight="semibold" color={t.muted}>
              Registre soutenu
            </Body>
            <TextInput
              accessibilityLabel="Votre reformulation en registre soutenu"
              value={answer}
              onChangeText={setAnswer}
              editable={!locked}
              multiline
              placeholder="Reformulez la phrase"
              placeholderTextColor={t.dim}
              style={[fieldStyle, { minHeight: 110, paddingVertical: 14, textAlignVertical: 'top' }]}
            />
          </View>
          <View style={{ gap: 8, marginTop: 14 }}>
            <Body size={14} weight="semibold" color={t.muted}>
              Tournures utiles
            </Body>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {exercise.keywords.map((keyword) => (
                <Pill key={keyword} bg={t.soft} fg={t.ink} style={{ paddingVertical: 8, paddingHorizontal: 14, borderRadius: 16, fontFamily: fonts.medium, fontSize: 14 }}>
                  {keyword}
                </Pill>
              ))}
            </View>
          </View>
        </>
      ) : null}
    </View>
  );
}

function Feedback({ exercise, good, onNext, last }: { exercise: Exercise; good: boolean; onNext: () => void; last: boolean }) {
  const { t } = useTheme();
  const insets = useSafeAreaInsets();
  const bg = good ? BLUE : t.invBg;
  const fg = good ? '#FFFFFF' : t.invFg;
  const Mark = good ? IconCheck : IconX;

  let body: string;
  if (exercise.type === 'reformulation') {
    body = good
      ? `Belle tournure. Notre proposition : « ${exercise.model} »`
      : `Employez au moins deux des tournures proposées. Par exemple : « ${exercise.model} »`;
  } else if (exercise.type === 'qcm' || good) {
    body = exercise.explanation;
  } else {
    body = `On attendait : « ${exercise.answers[0]} » ${exercise.explanation}`;
  }

  return (
    <View accessibilityLiveRegion="polite" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: bg, paddingHorizontal: 24, paddingTop: 6, paddingBottom: insets.bottom + 18, gap: 16 }}>
      <Wave color={bg} height={30} style={{ top: -29 }} />
      {good ? <Grain opacity={0.4} /> : null}
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 14 }}>
        <Medal size={64} mood={good ? 'proud' : 'kind'} bg={good ? '#FFFFFF' : BLUE} />
        <View style={{ flex: 1, gap: 6 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Display size={36} color={fg} accessibilityRole="header">
              {good ? 'Exact !' : 'Presque !'}
            </Display>
            <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: fg, alignItems: 'center', justifyContent: 'center' }}>
              <Mark size={20} color={bg} strokeWidth={3} />
            </View>
          </View>
          <Body size={15} color={fg}>
            {body}
          </Body>
        </View>
      </View>
      <Button label={last ? 'Voir le résultat' : 'Continuer'} kind={good ? 'white' : 'blue'} onPress={onNext} />
    </View>
  );
}
