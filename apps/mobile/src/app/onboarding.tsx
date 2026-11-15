import { IconArrowRight, IconCheck, IconMinus, IconPlus } from '@tabler/icons-react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Body, Button, Card, CircleButton, Coq, Display, Dots, Grain, Heading, Medal } from '@/components/ui';
import { formatTime } from '@/lib/dates';
import { type Pace, useApp } from '@/store/AppState';
import { useTheme } from '@/theme/ThemeProvider';
import { BLUE, BLUE_DARK, fonts } from '@/theme/tokens';

const PRESETS = [
  { label: 'Matin', minutes: 7 * 60 + 30 },
  { label: 'Midi', minutes: 12 * 60 + 30 },
  { label: 'Soir', minutes: 20 * 60 },
];

export default function Onboarding() {
  const { t } = useTheme();
  const { data, update } = useApp();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const [minutes, setMinutes] = useState(data.reminderMinutes);
  const [pace, setPace] = useState<Pace>(data.pace);

  const finish = () => {
    update({ onboarded: true, reminderMinutes: minutes, pace });
    router.replace('/accueil');
  };
  const shift = (delta: number) => setMinutes((m) => (m + delta + 1440) % 1440);

  return (
    <View style={{ flex: 1, backgroundColor: t.bg, paddingTop: insets.top + 12, paddingBottom: insets.bottom + 16 }}>
      <View style={{ height: 44, paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Dots index={step} />
        {step === 0 ? (
          <Pressable accessibilityRole="button" onPress={finish} hitSlop={12}>
            <Body size={15} weight="semibold">
              Passer
            </Body>
          </Pressable>
        ) : null}
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingBottom: 16 }} showsVerticalScrollIndicator={false}>
        {step === 0 ? <Promise /> : null}
        {step === 1 ? (
          <View style={{ gap: 16, marginTop: 12 }}>
            <Heading lead="À quelle heure" main="vous rappeler ?" size={42} />
            <View style={{ overflow: 'hidden', paddingHorizontal: 20, paddingTop: 18, paddingBottom: 20, borderRadius: 32, backgroundColor: t.invBg }}>
              <View style={{ position: 'absolute', right: -50, top: -60, width: 180, height: 180, borderRadius: 90, backgroundColor: BLUE, opacity: 0.35 }} />
              <Text style={{ fontFamily: fonts.semibold, fontSize: 13, letterSpacing: 1, textTransform: 'uppercase', color: t.invMuted }}>
                Rappel principal
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                <CircleButton icon={IconMinus} label="Trente minutes plus tôt" size={48} bg={BLUE} fg="#FFFFFF" onPress={() => shift(-30)} />
                <Display size={96} color={t.invFg}>
                  {formatTime(minutes)}
                </Display>
                <CircleButton icon={IconPlus} label="Trente minutes plus tard" size={48} bg={BLUE} fg="#FFFFFF" onPress={() => shift(30)} />
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {PRESETS.map((preset) => {
                const on = preset.minutes === minutes;
                return (
                  <Pressable
                    key={preset.label}
                    accessibilityRole="button"
                    accessibilityState={{ selected: on }}
                    onPress={() => setMinutes(preset.minutes)}
                    style={{ flex: 1, height: 50, borderRadius: 16, backgroundColor: on ? BLUE_DARK : t.edge, paddingBottom: 4 }}>
                    <View
                      style={{
                        flex: 1,
                        borderRadius: 16,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: on ? BLUE : t.card,
                        borderWidth: on ? 0 : 1,
                        borderColor: t.line,
                      }}>
                      <Text style={{ fontFamily: fonts.semibold, fontSize: 15, color: on ? '#FFFFFF' : t.ink }}>{preset.label}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
            <View style={{ marginHorizontal: 6, marginTop: 10 }}>
              <Card radius={24} style={{ position: 'absolute', left: 10, right: 10, top: 10, bottom: -10, opacity: 0.6, transform: [{ rotate: '3deg' }] }} />
              <Card radius={24} style={{ padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, transform: [{ rotate: '-2deg' }] }}>
                <Medal size={48} />
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Body size={13} weight="bold">
                      MOLY
                    </Body>
                    <Body size={13} color={t.muted}>
                      maintenant
                    </Body>
                  </View>
                  <Body size={15}>Votre leçon du jour vous attend. Trois minutes suffisent.</Body>
                </View>
              </Card>
            </View>
          </View>
        ) : null}
        {step === 2 ? (
          <View style={{ gap: 20, marginTop: 12 }}>
            <Heading lead="Choisissez" main="votre rythme quotidien" size={42} />
            <View style={{ flexDirection: 'row', gap: 14, paddingHorizontal: 4, paddingTop: 12, paddingBottom: 8 }}>
              <PaceCard name="Express" minutes="2" selected={pace === 'express'} tilt="-3deg" onPress={() => setPace('express')} />
              <PaceCard name="Complet" minutes="5" selected={pace === 'complet'} tilt="3deg" onPress={() => setPace('complet')} />
            </View>
            <Card radius={24} style={{ paddingVertical: 16, paddingHorizontal: 18, gap: 10 }}>
              {(pace === 'complet'
                ? ['Une règle à réviser', 'Un mini-quiz de quatre exercices', "L'expression du jour"]
                : ['Une règle à réviser', 'Deux exercices éclair']
              ).map((line) => (
                <View key={line} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <IconCheck size={20} color={t.blueText} strokeWidth={3} />
                  <Body size={15} weight="medium">
                    {line}
                  </Body>
                </View>
              ))}
            </Card>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Medal size={44} />
              <Body size={14} color={t.muted} style={{ flex: 1 }}>
                Modifiable à tout moment depuis votre profil.
              </Body>
            </View>
          </View>
        ) : null}
      </ScrollView>

      <View style={{ paddingHorizontal: 24, gap: 4 }}>
        {step === 0 ? <Button label="Continuer" icon={IconArrowRight} onPress={() => setStep(1)} /> : null}
        {step === 1 ? (
          <>
            <Button label="Valider cette heure" onPress={() => setStep(2)} />
            <Button label="Plus tard" kind="ghost" onPress={() => setStep(2)} />
          </>
        ) : null}
        {step === 2 ? <Button label="Commencer" icon={IconArrowRight} onPress={finish} /> : null}
      </View>
    </View>
  );
}

function Promise() {
  const { t } = useTheme();
  const cards = [
    { left: 10, top: 62, rot: '-14deg', bg: t.invBg, fg: t.invFg, glyph: 'ç', label: 'Orthographe', blue: false },
    { left: 166, top: 46, rot: '11deg', bg: t.card, fg: t.ink, glyph: 'ê', label: 'Conjugaison', blue: false },
    { left: 84, top: 84, rot: '-3deg', bg: BLUE, fg: '#FFFFFF', glyph: 'é', label: 'Grammaire', blue: true },
  ];
  return (
    <View>
      <View style={{ height: 330, alignSelf: 'center', width: 342 }}>
        {cards.map((card) => (
          <View
            key={card.label}
            style={{
              position: 'absolute',
              left: card.left,
              top: card.top,
              width: 168,
              height: 216,
              borderRadius: 30,
              overflow: 'hidden',
              backgroundColor: card.bg,
              paddingHorizontal: 18,
              paddingVertical: 16,
              justifyContent: 'space-between',
              transform: [{ rotate: card.rot }],
              elevation: card.blue ? 8 : 4,
            }}>
            {card.blue ? <Grain opacity={0.45} /> : null}
            <Text style={{ fontFamily: fonts.semibold, fontSize: 13, letterSpacing: 1, textTransform: 'uppercase', color: card.fg }}>
              {card.label}
            </Text>
            <Display size={120} color={card.fg}>
              {card.glyph}
            </Display>
          </View>
        ))}
        <Coq size={118} style={{ position: 'absolute', right: 0, bottom: -8 }} />
      </View>
      <View style={{ gap: 12, marginTop: 18 }}>
        <Heading lead="Cinq minutes par jour pour un français" main="irréprochable" />
        <Body color={t.muted}>Chaque jour : une règle à réviser, un mini-quiz et une expression à adopter.</Body>
      </View>
    </View>
  );
}

function PaceCard({ name, minutes, selected, tilt, onPress }: { name: string; minutes: string; selected: boolean; tilt: string; onPress: () => void }) {
  const { t } = useTheme();
  const fg = selected ? '#FFFFFF' : t.ink;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${name}, ${minutes} minutes`}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={{ flex: 1, height: 240, borderRadius: 32, backgroundColor: selected ? BLUE_DARK : t.edge, paddingBottom: 8, transform: [{ rotate: tilt }, { translateY: selected ? -8 : 0 }] }}>
      <View style={{ flex: 1, borderRadius: 32, overflow: 'hidden', backgroundColor: selected ? BLUE : t.card, padding: 18, justifyContent: 'space-between' }}>
        {selected ? <Grain opacity={0.45} /> : null}
        <Text style={{ fontFamily: fonts.semibold, fontSize: 15, color: fg }}>{name}</Text>
        <View>
          <Display size={124} color={fg}>
            {minutes}
          </Display>
          <Text style={{ fontFamily: fonts.medium, fontSize: 15, color: selected ? '#FFFFFF' : t.muted }}>minutes</Text>
        </View>
        {selected ? (
          <View style={{ position: 'absolute', right: 14, top: 14, width: 30, height: 30, borderRadius: 15, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' }}>
            <IconCheck size={20} color={BLUE} strokeWidth={3} />
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}
