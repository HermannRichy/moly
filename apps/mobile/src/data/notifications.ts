/**
 * Textes des notifications, par état. L'envoi sera branché au lot 3.
 * `{serie}` est remplacé par le nombre de jours de la série en cours.
 */
export type NotificationState = 'rappel' | 'relance' | 'serieEnDanger' | 'seriePerdue' | 'retour';

export const notificationTexts: Record<NotificationState, { title: string; body: string }[]> = {
  rappel: [
    { title: 'Votre leçon du jour vous attend', body: 'Trois minutes suffisent pour une règle de plus.' },
    { title: 'Un instant pour la langue', body: 'Votre leçon est prête, et le coq aussi.' },
    { title: "L'expression du jour est arrivée", body: 'Venez la découvrir et la glisser dans votre prochaine phrase.' },
  ],
  relance: [
    { title: 'Il est encore temps', body: "Votre leçon du jour n'attend que vous." },
    { title: 'Deux minutes avant ce soir ?', body: 'Une règle, quelques questions, et la journée est gagnée.' },
  ],
  serieEnDanger: [
    { title: 'Votre série de {serie} jours est en péril', body: 'Une courte leçon avant minuit suffit à la préserver.' },
    { title: 'Ne laissez pas filer {serie} jours', body: 'Le coq veille, mais il ne peut pas répondre à votre place.' },
  ],
  seriePerdue: [
    { title: 'La série est rompue, pas votre élan', body: 'Reprenez dès aujourd’hui : un jour suffit pour repartir.' },
    { title: 'On recommence ?', body: 'Les plus belles séries naissent d’un nouveau départ.' },
  ],
  retour: [
    { title: 'Vous nous avez manqué', body: 'Une règle vous attend pour renouer en douceur.' },
    { title: 'Quel plaisir de vous revoir', body: 'Reprenons là où vous vous étiez arrêté.' },
  ],
};
