import { Redirect } from 'expo-router';

import { useApp } from '@/store/AppState';

export default function Index() {
  const { data } = useApp();
  if (!data.signedIn) return <Redirect href="/connexion" />;
  if (!data.onboarded) return <Redirect href="/onboarding" />;
  return <Redirect href="/accueil" />;
}
