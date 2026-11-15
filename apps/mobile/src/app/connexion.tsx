import { IconBrandAppleFilled, IconBrandGoogleFilled } from '@tabler/icons-react-native';
import { router } from 'expo-router';
import { Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Body, Button, Coq, Display, Stage } from '@/components/ui';
import { useApp } from '@/store/AppState';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts } from '@/theme/tokens';

export default function Connexion() {
  const { t } = useTheme();
  const { data, update } = useApp();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const stage = Math.min(470, Math.round(height * 0.54));
  const coq = Math.min(250, Math.round(stage * 0.53));

  // Lot 1 : connexion simulée. Clerk (Google et Apple) sera branché au lot 2.
  const signIn = () => {
    update({ signedIn: true });
    router.replace(data.onboarded ? '/accueil' : '/onboarding');
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <Stage height={stage + insets.top}>
        <Display
          size={Math.min(150, Math.round(stage * 0.32))}
          color="#FFFFFF"
          accessibilityRole="header"
          style={{ position: 'absolute', left: 0, right: 0, top: insets.top + 36, textAlign: 'center', letterSpacing: 7 }}>
          MOLY
        </Display>
        <Coq size={coq} style={{ position: 'absolute', left: 0, right: 0, bottom: 16, alignItems: 'center' }} />
        <View
          style={{
            position: 'absolute',
            right: 18,
            top: insets.top + Math.round(stage * 0.45),
            transform: [{ rotate: '8deg' }],
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: 16,
            borderBottomLeftRadius: 4,
            backgroundColor: '#FFFFFF',
          }}>
          <Text style={{ fontFamily: fonts.semibold, fontSize: 14, color: '#0A0A0A' }}>Bien le bonjour !</Text>
        </View>
      </Stage>
      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 6, paddingBottom: insets.bottom + 16, gap: 10 }}>
        <Display size={34}>
          <Text style={{ color: t.dim }}>Retrouvez un français </Text>impeccable.
        </Display>
        <Body color={t.muted} style={{ marginBottom: 6 }}>
          Quelques minutes par jour suffisent.
        </Body>
        <Button label="Continuer avec Google" icon={IconBrandGoogleFilled} iconFirst onPress={signIn} />
        <Button label="Continuer avec Apple" kind="second" icon={IconBrandAppleFilled} iconFirst onPress={signIn} />
        <Body size={13} color={t.muted} style={{ textAlign: 'center', marginTop: 2 }}>
          En continuant, vous acceptez les Conditions d'utilisation et la Politique de confidentialité.
        </Body>
      </View>
    </View>
  );
}
