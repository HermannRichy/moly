import { useAuth } from '@clerk/expo';
import { Redirect } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

import { Coq, Display, Grain } from '@/components/ui';
import { useApp } from '@/store/AppState';
import { BLUE } from '@/theme/tokens';

export default function Index() {
  const { isLoaded, isSignedIn } = useAuth();
  const { data, synced } = useApp();

  if (!isLoaded || (isSignedIn && !synced)) return <Loading />;
  if (!isSignedIn) return <Redirect href="/connexion" />;
  if (!data.onboarded) return <Redirect href="/onboarding" />;
  return <Redirect href="/accueil" />;
}

/** Écran d'attente : le coq sautille pendant que le compte se charge. */
function Loading() {
  const hop = useSharedValue(0);
  const dots = useSharedValue(0.3);
  useEffect(() => {
    hop.value = withRepeat(
      withSequence(withTiming(-22, { duration: 320, easing: Easing.out(Easing.quad) }), withTiming(0, { duration: 320, easing: Easing.in(Easing.quad) }), withTiming(0, { duration: 260 })),
      -1,
    );
    dots.value = withRepeat(withTiming(1, { duration: 700 }), -1, true);
  }, [hop, dots]);
  const coqStyle = useAnimatedStyle(() => ({ transform: [{ translateY: hop.value }] }));
  const textStyle = useAnimatedStyle(() => ({ opacity: dots.value }));

  return (
    <View accessibilityLabel="Chargement de MOLY" style={{ flex: 1, backgroundColor: BLUE, alignItems: 'center', justifyContent: 'center', gap: 18 }}>
      <Grain />
      <Animated.View style={coqStyle}>
        <Coq size={170} />
      </Animated.View>
      <Animated.View style={textStyle}>
        <Display size={64} color="#FFFFFF" style={{ letterSpacing: 4 }}>
          MOLY
        </Display>
      </Animated.View>
    </View>
  );
}
