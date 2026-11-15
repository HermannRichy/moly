import { useAuth } from '@clerk/expo';
import { IconArrowLeft, IconMinus, IconPlus } from '@tabler/icons-react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Body, Card, CircleButton, Display, Heading, Label } from '@/components/ui';
import { formatTime } from '@/lib/dates';
import { buzz, playSound } from '@/lib/feedback';
import { type Pace, useApp } from '@/store/AppState';
import { type ThemeMode, useTheme } from '@/theme/ThemeProvider';
import { BLUE, fonts } from '@/theme/tokens';

const MODES: { value: ThemeMode; label: string }[] = [
  { value: 'clair', label: 'Clair' },
  { value: 'sombre', label: 'Sombre' },
  { value: 'auto', label: 'Auto' },
];
const PACES: { value: Pace; label: string }[] = [
  { value: 'express', label: 'Express · 2 min' },
  { value: 'complet', label: 'Complet · 5 min' },
];

function Segmented<T extends string>({ options, value, onChange, label }: { options: { value: T; label: string }[]; value: T; onChange: (value: T) => void; label: string }) {
  const { t } = useTheme();
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel={label} style={{ flexDirection: 'row', borderRadius: 22, backgroundColor: t.soft }}>
      {options.map((option) => {
        const on = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityState={{ selected: on }}
            onPress={() => {
              buzz('light');
              onChange(option.value);
            }}
            style={{ flex: 1, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? t.invBg : 'transparent' }}>
            <Text style={{ fontFamily: fonts.semibold, fontSize: 14, color: on ? t.invFg : t.ink }}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function Reglages() {
  const { t, mode, setMode, sounds, setSounds, haptics, setHaptics } = useTheme();
  const { data, update, deleteAccount } = useApp();
  const { signOut } = useAuth();
  const insets = useSafeAreaInsets();
  const [busy, setBusy] = useState(false);

  const shift = (delta: number) => update({ reminderMinutes: (data.reminderMinutes + delta + 1440) % 1440 });

  const leave = () =>
    signOut()
      .catch(() => {})
      .finally(() => router.replace('/connexion'));

  const confirmSignOut = () =>
    Alert.alert('Se déconnecter ?', 'Votre progression reste enregistrée sur votre compte.', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Se déconnecter', style: 'destructive', onPress: leave },
    ]);

  const confirmDelete = () =>
    Alert.alert('Supprimer votre compte ?', 'Votre compte et toute votre progression seront effacés définitivement. Cette action est irréversible.', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          setBusy(true);
          const done = await deleteAccount();
          setBusy(false);
          if (done) leave();
          else Alert.alert('Suppression impossible', 'Vérifiez votre connexion, puis réessayez.');
        },
      },
    ]);

  const row = { minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: 12 } as const;
  const line = <View style={{ height: 1, backgroundColor: t.line }} />;

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 24, paddingBottom: insets.bottom + 32, gap: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <CircleButton icon={IconArrowLeft} label="Retour" onPress={() => (router.canGoBack() ? router.back() : router.replace('/profil'))} />
          <Heading main="Réglages" size={38} />
        </View>

        <Label>Apprentissage</Label>
        <Card radius={24} style={{ padding: 14, gap: 14 }}>
          <View style={{ gap: 10 }}>
            <Body size={16} weight="medium">
              Rythme quotidien
            </Body>
            <Segmented label="Rythme quotidien" options={PACES} value={data.pace} onChange={(pace) => update({ pace })} />
          </View>
          {line}
          <View style={row}>
            <Body size={16} weight="medium" style={{ flex: 1 }}>
              Heure du rappel
            </Body>
            <CircleButton icon={IconMinus} label="Trente minutes plus tôt" size={40} bg={BLUE} fg="#FFFFFF" onPress={() => shift(-30)} />
            <Display size={30} style={{ minWidth: 76, textAlign: 'center' }}>
              {formatTime(data.reminderMinutes)}
            </Display>
            <CircleButton icon={IconPlus} label="Trente minutes plus tard" size={40} bg={BLUE} fg="#FFFFFF" onPress={() => shift(30)} />
          </View>
        </Card>

        <Label>Affichage et retours</Label>
        <Card radius={24} style={{ padding: 14, gap: 4 }}>
          <View style={{ gap: 10, paddingBottom: 10 }}>
            <Body size={16} weight="medium">
              Apparence
            </Body>
            <Segmented label="Apparence" options={MODES} value={mode} onChange={setMode} />
          </View>
          {line}
          <View style={row}>
            <Body size={16} weight="medium" style={{ flex: 1 }}>
              Sons
            </Body>
            <Switch
              accessibilityLabel="Sons"
              value={sounds}
              onValueChange={(on) => {
                setSounds(on);
                if (on) setTimeout(() => playSound('bonne'), 60);
              }}
              trackColor={{ true: BLUE, false: t.soft }}
            />
          </View>
          {line}
          <View style={row}>
            <Body size={16} weight="medium" style={{ flex: 1 }}>
              Vibrations
            </Body>
            <Switch accessibilityLabel="Vibrations" value={haptics} onValueChange={setHaptics} trackColor={{ true: BLUE, false: t.soft }} />
          </View>
        </Card>

        <Label>Compte</Label>
        <Card radius={24} style={{ paddingHorizontal: 14, paddingVertical: 2 }}>
          <Pressable accessibilityRole="button" onPress={confirmSignOut} style={row}>
            <Body size={16} weight="medium">
              Se déconnecter
            </Body>
          </Pressable>
          {line}
          <Pressable accessibilityRole="button" disabled={busy} onPress={confirmDelete} style={[row, { opacity: busy ? 0.5 : 1 }]}>
            <Body size={16} weight="semibold">
              {busy ? 'Suppression en cours…' : 'Supprimer mon compte'}
            </Body>
          </Pressable>
        </Card>
      </ScrollView>
    </View>
  );
}
