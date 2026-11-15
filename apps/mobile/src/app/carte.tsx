import { IconCheck, IconLockFilled, IconRoute, IconStarFilled } from '@tabler/icons-react-native';
import { router } from 'expo-router';
import { type ComponentRef, useEffect, useMemo, useRef } from 'react';
import { Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { TabBar } from '@/components/TabBar';
import { Body, Coq, Display, Heading } from '@/components/ui';
import { actTitle, SCENES_PER_ACT } from '@/data/actes';
import type { Lesson } from '@/data/lessons';
import { buzz } from '@/lib/feedback';
import { useApp } from '@/store/AppState';
import { useTheme } from '@/theme/ThemeProvider';
import { BLUE, BLUE_DARK, fonts } from '@/theme/tokens';

const ACT_HEIGHT = 72;
const FIRST_OFFSET = 86;
const SPACING = 112;
const ACT_BOTTOM = 96;
const X_PATTERN = [0.64, 0.36, 0.62, 0.34, 0.62, 0.36];

type SceneState = 'done' | 'perfect' | 'current' | 'locked';
type Scene = { lesson: Lesson; index: number; cx: number; cy: number; state: SceneState };
type Act = { index: number; top: number; scenes: Scene[]; done: number; locked: boolean };

function curve(x1: number, y1: number, x2: number, y2: number): string {
  const my = (y1 + y2) / 2;
  return `M${x1} ${y1} C${x1} ${my} ${x2} ${my} ${x2} ${y2}`;
}

export default function Carte() {
  const { t } = useTheme();
  const { data, lessons } = useApp();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);

  const { acts, height, currentY, doneCount } = useMemo(() => {
    const firstOpen = lessons.findIndex((lesson) => !data.completed.includes(lesson.id));
    const currentIndex = firstOpen === -1 ? lessons.length : firstOpen;
    const out: Act[] = [];
    let y = 0;
    let focus = 0;
    for (let start = 0; start < lessons.length; start += SCENES_PER_ACT) {
      const group = lessons.slice(start, start + SCENES_PER_ACT);
      const top = y;
      const scenes = group.map((lesson, i): Scene => {
        const index = start + i;
        const completed = data.completed.includes(lesson.id);
        const state: SceneState = completed
          ? data.perfect.includes(lesson.id)
            ? 'perfect'
            : 'done'
          : index === currentIndex
            ? 'current'
            : 'locked';
        const cy = top + ACT_HEIGHT + FIRST_OFFSET + i * SPACING;
        if (state === 'current') focus = cy;
        return { lesson, index, cx: Math.round(X_PATTERN[i % X_PATTERN.length] * width), cy, state };
      });
      out.push({
        index: start / SCENES_PER_ACT,
        top,
        scenes,
        done: scenes.filter((scene) => scene.state === 'done' || scene.state === 'perfect').length,
        locked: start > currentIndex,
      });
      y = top + ACT_HEIGHT + FIRST_OFFSET + (group.length - 1) * SPACING + ACT_BOTTOM;
    }
    return { acts: out, height: y, currentY: focus, doneCount: lessons.filter((lesson) => data.completed.includes(lesson.id)).length };
  }, [lessons, data.completed, data.perfect, width]);

  // Au premier affichage, on amène la scène à jouer au milieu de l'écran.
  useEffect(() => {
    const timer = setTimeout(() => scroll.current?.scrollTo({ y: Math.max(0, currentY - 220), animated: true }), 250);
    return () => clearTimeout(timer);
  }, [currentY]);

  const open = (scene: Scene) => {
    if (scene.state === 'locked') {
      buzz('error');
      return;
    }
    buzz('light');
    router.push({ pathname: '/lecon/[id]', params: { id: scene.lesson.id } });
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <ScrollView ref={scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + 130 }}>
        <View style={{ paddingHorizontal: 24, marginBottom: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Heading lead="Votre" main="parcours" size={38} />
          <View
            accessibilityLabel={`${doneCount} scènes terminées sur ${lessons.length}`}
            style={{ height: 44, paddingLeft: 12, paddingRight: 16, borderRadius: 22, backgroundColor: t.invBg, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <IconRoute size={22} color={t.invBlue} />
            <Display size={24} color={t.invFg}>
              {doneCount} / {lessons.length}
            </Display>
          </View>
        </View>

        <View style={{ height }}>
          <Svg width={width} height={height} style={{ position: 'absolute', left: 0, top: 0 }}>
            {acts.flatMap((act) =>
              act.scenes.map((scene, i) => {
                const prev = act.scenes[i - 1];
                const reached = scene.state !== 'locked';
                const d = prev ? curve(prev.cx, prev.cy, scene.cx, scene.cy) : curve(scene.cx, act.top + ACT_HEIGHT, scene.cx, scene.cy);
                return (
                  <Path
                    key={scene.lesson.id}
                    d={d}
                    fill="none"
                    stroke={reached ? BLUE : t.dim}
                    strokeOpacity={reached ? 1 : 0.55}
                    strokeWidth={6}
                    strokeLinecap="round"
                    strokeDasharray="2 14"
                  />
                );
              }),
            )}
          </Svg>

          {acts.map((act) => {
            const title = actTitle(act.index);
            return (
              <View key={`acte-${act.index}`}>
                <View
                  accessibilityRole="header"
                  accessibilityLabel={`Acte ${title.numeral}, ${title.name}${act.locked ? ', verrouillé' : `, ${act.done} scènes sur ${act.scenes.length}`}`}
                  style={{
                    position: 'absolute',
                    left: 24,
                    right: 24,
                    top: act.top,
                    height: ACT_HEIGHT,
                    overflow: 'hidden',
                    paddingHorizontal: 20,
                    borderRadius: 24,
                    backgroundColor: t.invBg,
                    opacity: act.locked ? 0.55 : 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                  <Display size={100} color={t.invFg} style={{ position: 'absolute', right: 96, top: -16, opacity: 0.1 }}>
                    {title.numeral}
                  </Display>
                  <View style={{ flexShrink: 1 }}>
                    <Text style={{ fontFamily: fonts.semibold, fontSize: 13, letterSpacing: 1, textTransform: 'uppercase', color: t.invMuted }}>Acte {title.numeral}</Text>
                    <Display size={26} color={t.invFg} numberOfLines={1} adjustsFontSizeToFit>
                      {title.name}
                    </Display>
                  </View>
                  {act.locked ? (
                    <IconLockFilled size={24} color={t.invMuted} />
                  ) : (
                    <View style={{ alignItems: 'flex-end', gap: 6 }}>
                      <Text style={{ fontFamily: fonts.semibold, fontSize: 14, color: t.invFg }}>
                        {act.done} sur {act.scenes.length}
                      </Text>
                      <View style={{ width: 84, height: 8, borderRadius: 4, backgroundColor: 'rgba(128,128,128,0.35)', overflow: 'hidden' }}>
                        <View style={{ width: `${(act.done / act.scenes.length) * 100}%`, height: 8, borderRadius: 4, backgroundColor: t.invBlue }} />
                      </View>
                    </View>
                  )}
                </View>
                {act.scenes.map((scene) => (
                  <SceneNode key={scene.lesson.id} scene={scene} width={width} onPress={() => open(scene)} />
                ))}
              </View>
            );
          })}
        </View>
      </ScrollView>
      <TabBar active="carte" />
    </View>
  );
}

function SceneNode({ scene, width, onPress }: { scene: Scene; width: number; onPress: () => void }) {
  const { t } = useTheme();
  const { lesson, index, cx, cy, state } = scene;
  const current = state === 'current';
  const locked = state === 'locked';
  const size = current ? 96 : 72;
  const finished = state === 'done' || state === 'perfect';
  const face = finished ? BLUE : current ? t.card : t.soft;
  const edge = locked ? t.edge : BLUE_DARK;
  const title = `${lesson.titleLead} ${lesson.titleMain}`;
  const onRight = cx < width / 2;
  const labelWidth = Math.min(160, (onRight ? width - cx : cx) - size / 2 - 30);

  const pulse = useSharedValue(1);
  const hop = useSharedValue(0);
  useEffect(() => {
    if (!current) return;
    pulse.value = withRepeat(withTiming(1.18, { duration: 1100, easing: Easing.inOut(Easing.quad) }), -1, true);
    hop.value = withRepeat(
      withSequence(withTiming(-8, { duration: 380, easing: Easing.out(Easing.quad) }), withTiming(0, { duration: 380, easing: Easing.in(Easing.quad) }), withTiming(0, { duration: 1400 })),
      -1,
    );
  }, [current, pulse, hop]);
  const haloStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));
  const coqStyle = useAnimatedStyle(() => ({ transform: [{ translateY: hop.value }] }));

  return (
    <>
      {current ? (
        <Animated.View
          pointerEvents="none"
          style={[{ position: 'absolute', left: cx - 66, top: cy - 66, width: 132, height: 132, borderRadius: 66, backgroundColor: BLUE, opacity: 0.2 }, haloStyle]}
        />
      ) : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Scène ${index + 1}, ${title}, ${locked ? 'verrouillée' : current ? 'à jouer' : state === 'perfect' ? 'terminée sans faute' : 'terminée'}`}
        accessibilityState={{ disabled: locked }}
        onPress={onPress}
        style={{ position: 'absolute', left: cx - size / 2, top: cy - size / 2, width: size, height: size + 7 }}>
        {({ pressed }) => (
          <View style={{ flex: 1, borderRadius: size / 2, backgroundColor: edge, paddingBottom: pressed && !locked ? 2 : 7, marginTop: pressed && !locked ? 5 : 0 }}>
            <View
              style={{
                flex: 1,
                borderRadius: size / 2,
                backgroundColor: face,
                borderWidth: current ? 5 : 0,
                borderColor: BLUE,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              {state === 'perfect' ? <IconStarFilled size={32} color="#FFFFFF" /> : null}
              {state === 'done' ? <IconCheck size={32} color="#FFFFFF" strokeWidth={3} /> : null}
              {current ? (
                <Display size={38} color={t.blueText}>
                  {String(index + 1)}
                </Display>
              ) : null}
              {locked ? <IconLockFilled size={26} color={t.muted} /> : null}
            </View>
          </View>
        )}
      </Pressable>
      {current ? (
        <Animated.View pointerEvents="none" style={[{ position: 'absolute', left: cx - 44, top: cy - size / 2 - 72 }, coqStyle]}>
          <Coq size={88} />
        </Animated.View>
      ) : null}
      <View
        pointerEvents="none"
        style={[
          { position: 'absolute', top: cy - (current ? 34 : 22), width: labelWidth },
          onRight ? { left: cx + size / 2 + 14 } : { left: cx - size / 2 - 14 - labelWidth },
          current
            ? { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 18, backgroundColor: t.invBg }
            : { alignItems: onRight ? 'flex-start' : 'flex-end' },
        ]}>
        <Body size={13} weight="semibold" color={current ? t.invMuted : t.muted}>
          Scène {index + 1}
          {current ? ` · ${lesson.minutes} min` : ''}
        </Body>
        <Body
          size={15}
          weight="semibold"
          color={current ? t.invFg : locked ? t.muted : t.ink}
          numberOfLines={3}
          style={{ lineHeight: 19, textAlign: current || onRight ? 'left' : 'right' }}>
          {title}
        </Body>
      </View>
    </>
  );
}
