import { useAuth } from '@clerk/expo';
import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { Coq } from '@/components/ui';
import { useApp } from '@/store/AppState';
import { BLUE } from '@/theme/tokens';

export default function Index() {
  const { isLoaded, isSignedIn } = useAuth();
  const { data, synced } = useApp();

  if (!isLoaded || (isSignedIn && !synced)) {
    return (
      <View style={{ flex: 1, backgroundColor: BLUE, alignItems: 'center', justifyContent: 'center', gap: 24 }}>
        <Coq size={160} />
        <ActivityIndicator color="#FFFFFF" accessibilityLabel="Chargement" />
      </View>
    );
  }
  if (!isSignedIn) return <Redirect href="/connexion" />;
  if (!data.onboarded) return <Redirect href="/onboarding" />;
  return <Redirect href="/accueil" />;
}
