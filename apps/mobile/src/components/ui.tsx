import type { Icon } from '@tabler/icons-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import {
  Image,
  Pressable,
  type StyleProp,
  StyleSheet,
  Text,
  type TextProps,
  type TextStyle,
  View,
  type ViewStyle,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { useTheme } from '@/theme/ThemeProvider';
import { BLUE, BLUE_DARK, fonts } from '@/theme/tokens';

const GRAIN = require('@/assets/images/grain.png');
const COQ = {
  happy: require('@/assets/images/coq-happy.png'),
  proud: require('@/assets/images/coq-proud.png'),
  kind: require('@/assets/images/coq-kind.png'),
};
export type Mood = keyof typeof COQ;

/** Titre en Robinco. */
export function Display({ size = 40, color, style, ...rest }: TextProps & { size?: number; color?: string }) {
  const { t } = useTheme();
  return (
    <Text
      {...rest}
      style={[
        { fontFamily: fonts.display, fontSize: size, lineHeight: Math.round(size * 1.08), color: color ?? t.ink, letterSpacing: size * 0.01 },
        style,
      ]}
    />
  );
}

/** Titre bicolore : amorce grisée, fin accentuée. */
export function Heading({ lead, main, size = 40, center }: { lead?: string; main: string; size?: number; center?: boolean }) {
  const { t } = useTheme();
  return (
    <Display size={size} accessibilityRole="header" style={center ? { textAlign: 'center' } : undefined}>
      {lead ? <Text style={{ color: t.dim }}>{lead} </Text> : null}
      {main}
    </Display>
  );
}

type Weight = 'regular' | 'medium' | 'semibold' | 'bold';

/** Texte courant en Switzer. */
export function Body({
  size = 16,
  weight = 'regular',
  color,
  style,
  ...rest
}: TextProps & { size?: number; weight?: Weight; color?: string }) {
  const { t } = useTheme();
  return (
    <Text
      {...rest}
      style={[{ fontFamily: fonts[weight], fontSize: size, lineHeight: Math.round(size * 1.42), color: color ?? t.ink }, style]}
    />
  );
}

export function Label({ children, color }: { children: string; color?: string }) {
  const { t } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: BLUE }} />
      <Text style={{ fontFamily: fonts.semibold, fontSize: 13, letterSpacing: 1, textTransform: 'uppercase', color: color ?? t.muted }}>
        {children}
      </Text>
    </View>
  );
}

export function Card({ children, style, radius = 28 }: { children?: ReactNode; style?: StyleProp<ViewStyle>; radius?: number }) {
  const { t } = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: t.card,
          borderRadius: radius,
          shadowColor: '#000',
          shadowOpacity: t.name === 'clair' ? 0.09 : 0.5,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 10 },
          elevation: 4,
        },
        style,
      ]}>
      {children}
    </View>
  );
}

export function Grain({ opacity = 0.5 }: { opacity?: number }) {
  return <Image source={GRAIN} resizeMode="repeat" style={[StyleSheet.absoluteFill, { width: '100%', height: '100%', opacity }]} />;
}

/** Vague de transition, à poser en bas d'une scène ou en haut d'un panneau. */
export function Wave({ color, height = 40, style }: { color: string; height?: number; style?: StyleProp<ViewStyle> }) {
  return (
    <View pointerEvents="none" style={[{ position: 'absolute', left: 0, right: 0, height }, style]}>
      <Svg width="100%" height={height} viewBox="0 0 390 40" preserveAspectRatio="none">
        <Path d="M0 40V20C55 -2 120 2 195 20s140 20 195 -4V40z" fill={color} />
      </Svg>
    </View>
  );
}

/** Scène bleue à grain, terminée par une vague. */
export function Stage({ height, children }: { height: number; children?: ReactNode }) {
  const { t } = useTheme();
  return (
    <View style={{ height, overflow: 'hidden' }}>
      <LinearGradient colors={['#5A73FF', BLUE, '#1630D6']} style={StyleSheet.absoluteFill} />
      <Grain />
      {children}
      <Wave color={t.bg} style={{ bottom: -1 }} />
    </View>
  );
}

export function Coq({ size, mood = 'happy', style }: { size: number; mood?: Mood; style?: StyleProp<ViewStyle> }) {
  return (
    <View pointerEvents="none" style={style}>
      <Image source={COQ[mood]} style={{ width: size, height: Math.round(size * 1.075) }} />
    </View>
  );
}

/** Tête du coq dans un médaillon rond. */
export function Medal({ size, mood = 'happy', bg = BLUE }: { size: number; mood?: Mood; bg?: string }) {
  const w = Math.round(size * 1.5);
  const h = Math.round(w * 1.075);
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, overflow: 'hidden', backgroundColor: bg }}>
      <Image source={COQ[mood]} style={{ position: 'absolute', left: (size - w) / 2, top: Math.round(size / 2 - 0.4 * h), width: w, height: h }} />
    </View>
  );
}

type ButtonKind = 'blue' | 'white' | 'second' | 'ghost';

/** Bouton épais : une tranche sous la face, qui s'enfonce à l'appui. */
export function Button({
  label,
  onPress,
  kind = 'blue',
  icon: IconCmp,
  iconFirst,
  disabled,
}: {
  label: string;
  onPress?: () => void;
  kind?: ButtonKind;
  icon?: Icon;
  iconFirst?: boolean;
  disabled?: boolean;
}) {
  const { t } = useTheme();
  if (kind === 'ghost') {
    return (
      <Pressable accessibilityRole="button" onPress={onPress} style={{ height: 44, alignItems: 'center', justifyContent: 'center' }}>
        <Body size={16} weight="semibold">
          {label}
        </Body>
      </Pressable>
    );
  }
  const face = kind === 'blue' ? BLUE : kind === 'white' ? '#FFFFFF' : t.card;
  const edge = kind === 'blue' ? BLUE_DARK : kind === 'white' ? 'rgba(0,0,0,0.28)' : t.edge;
  const fg = kind === 'blue' ? '#FFFFFF' : kind === 'white' ? '#0A0A0A' : t.ink;
  const icon = IconCmp ? <IconCmp size={20} color={fg} strokeWidth={2} /> : null;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={{ height: 66, opacity: disabled ? 0.45 : 1 }}>
      {({ pressed }) => (
        <View style={{ flex: 1, borderRadius: 20, backgroundColor: edge, paddingBottom: pressed ? 2 : 6, marginTop: pressed ? 4 : 0 }}>
          <View
            style={{
              flex: 1,
              borderRadius: 20,
              backgroundColor: face,
              borderWidth: kind === 'second' ? 1 : 0,
              borderColor: t.line,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
            }}>
            {iconFirst ? icon : null}
            <Text style={{ fontFamily: fonts.semibold, fontSize: 17, color: fg }}>{label}</Text>
            {iconFirst ? null : icon}
          </View>
        </View>
      )}
    </Pressable>
  );
}

export function CircleButton({
  icon: IconCmp,
  label,
  onPress,
  size = 44,
  bg,
  fg,
  style,
}: {
  icon: Icon;
  label: string;
  onPress?: () => void;
  size?: number;
  bg?: string;
  fg?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const { t } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={size < 44 ? (44 - size) / 2 : 0}
      style={({ pressed }) => [
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bg ?? t.invBg,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: pressed ? 0.75 : 1,
        },
        style,
      ]}>
      <IconCmp size={Math.round(size * 0.48)} color={fg ?? t.invFg} strokeWidth={2} />
    </Pressable>
  );
}

export function Pill({ children, bg, fg, style }: { children: string; bg: string; fg: string; style?: StyleProp<TextStyle> }) {
  return (
    <Text
      style={[
        { alignSelf: 'flex-start', overflow: 'hidden', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: bg, color: fg, fontFamily: fonts.semibold, fontSize: 13 },
        style,
      ]}>
      {children}
    </Text>
  );
}

export function Dots({ index }: { index: number }) {
  const { t } = useTheme();
  return (
    <View accessibilityLabel={`Étape ${index + 1} sur 3`} style={{ flexDirection: 'row', gap: 6 }}>
      {[0, 1, 2].map((i) => (
        <View key={i} style={{ width: i === index ? 28 : 8, height: 8, borderRadius: 4, backgroundColor: i === index ? BLUE : t.soft }} />
      ))}
    </View>
  );
}

export function Tile({ big, small, icon }: { big: string; small: string; icon?: ReactNode }) {
  const { t } = useTheme();
  return (
    <Card radius={22} style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 6, alignItems: 'center', gap: 2 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        {icon}
        <Display size={34}>{big}</Display>
      </View>
      <Body size={13} color={t.muted} style={{ textAlign: 'center' }}>
        {small}
      </Body>
    </Card>
  );
}

export function ProgressBar({ value, max }: { value: number; max: number }) {
  const { t } = useTheme();
  const pct = Math.max(0, Math.min(1, max > 0 ? value / max : 0));
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max, now: value }}
      style={{ height: 10, borderRadius: 5, backgroundColor: t.soft, overflow: 'hidden' }}>
      <View style={{ width: `${pct * 100}%`, height: 10, borderRadius: 5, backgroundColor: BLUE }} />
    </View>
  );
}
