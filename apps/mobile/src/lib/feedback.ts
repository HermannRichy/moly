import { type AudioPlayer, createAudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';

const SOURCES = {
  bonne: require('@/assets/sounds/bonne.wav'),
  erreur: require('@/assets/sounds/erreur.wav'),
  touche: require('@/assets/sounds/touche.wav'),
  fin: require('@/assets/sounds/fin.wav'),
  niveau: require('@/assets/sounds/niveau.wav'),
};
export type SoundName = keyof typeof SOURCES;

/** Réglages lus par les fonctions ci-dessous ; mis à jour par le fournisseur de préférences. */
export const feedbackPrefs = { sounds: true, haptics: true };

const players: Partial<Record<SoundName, AudioPlayer>> = {};

export function playSound(name: SoundName) {
  if (!feedbackPrefs.sounds) return;
  try {
    const player = (players[name] ??= createAudioPlayer(SOURCES[name]));
    player.seekTo(0).catch(() => {});
    player.play();
  } catch {
    // Le son est un agrément : son absence ne doit jamais bloquer l'app.
  }
}

export function buzz(kind: 'light' | 'success' | 'error' = 'light') {
  if (!feedbackPrefs.haptics) return;
  const run =
    kind === 'light'
      ? Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      : Haptics.notificationAsync(kind === 'success' ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error);
  run.catch(() => {});
}
