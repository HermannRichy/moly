export const BLUE = '#1F3DFF';
export const BLUE_DARK = '#1329B0';

export const fonts = {
  display: 'Robinco',
  regular: 'Switzer-Regular',
  medium: 'Switzer-Medium',
  semibold: 'Switzer-Semibold',
  bold: 'Switzer-Bold',
} as const;

export type Palette = {
  name: 'clair' | 'sombre';
  bg: string;
  card: string;
  ink: string;
  muted: string;
  dim: string;
  soft: string;
  line: string;
  invBg: string;
  invFg: string;
  invMuted: string;
  invBlue: string;
  blueText: string;
  edge: string;
};

export const light: Palette = {
  name: 'clair',
  bg: '#EEEEEB',
  card: '#FFFFFF',
  ink: '#0A0A0A',
  muted: '#5A5A5A',
  dim: '#7C7C78',
  soft: '#E0E0DB',
  line: 'rgba(0,0,0,0.08)',
  invBg: '#0A0A0A',
  invFg: '#FFFFFF',
  invMuted: '#B8B8B8',
  invBlue: '#7D92FF',
  blueText: '#1F3DFF',
  edge: '#C6C6C0',
};

export const dark: Palette = {
  name: 'sombre',
  bg: '#0A0A0B',
  card: '#1B1B1F',
  ink: '#F5F5F5',
  muted: '#A6A6A6',
  dim: '#7E7E84',
  soft: '#2A2A2F',
  line: 'rgba(255,255,255,0.10)',
  invBg: '#F5F5F5',
  invFg: '#0A0A0A',
  invMuted: '#5A5A5A',
  invBlue: '#1F3DFF',
  blueText: '#8C9DFF',
  edge: '#000000',
};
