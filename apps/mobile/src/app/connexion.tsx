import { useSSO } from '@clerk/expo';
import { IconBrandAppleFilled, IconBrandGoogleFilled } from '@tabler/icons-react-native';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Body, Button, Coq, Display, Stage } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts } from '@/theme/tokens';

WebBrowser.maybeCompleteAuthSession();

export default function Connexion() {
  const { t } = useTheme();
  const { startSSOFlow } = useSSO();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const stage = Math.min(470, Math.round(height * 0.54));
  const coq = Math.min(250, Math.round(stage * 0.53));

  // Dans Expo Go, la connexion passe par une feuille navigateur ouverte par Clerk.
  const signIn = async (strategy: 'oauth_google' | 'oauth_apple') => {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const { createdSessionId, setActive } = await startSSOFlow({ strategy });
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        router.replace('/');
      }
    } catch {
      setError('La connexion a échoué. Vérifiez votre réseau, puis réessayez.');
    } finally {
      setBusy(false);
    }
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
        <Button label="Continuer avec Google" icon={IconBrandGoogleFilled} iconFirst disabled={busy} onPress={() => signIn('oauth_google')} />
        <Button label="Continuer avec Apple" kind="second" icon={IconBrandAppleFilled} iconFirst disabled={busy} onPress={() => signIn('oauth_apple')} />
        {error ? (
          <Body size={14} weight="medium" accessibilityLiveRegion="polite" style={{ textAlign: 'center' }}>
            {error}
          </Body>
        ) : null}
        <Body size={13} color={t.muted} style={{ textAlign: 'center', marginTop: 2 }}>
          En continuant, vous acceptez les Conditions d'utilisation et la Politique de confidentialité.
        </Body>
      </View>
    </View>
  );
}
