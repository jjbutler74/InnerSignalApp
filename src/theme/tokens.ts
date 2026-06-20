export const lightTokens = {
  // Surfaces
  bg:        '#EDEBE6',
  surface:   '#F5F3EF',
  surface2:  '#EFEDE8',
  card:      '#F5F3EF',
  divider:   '#DDDAD3',
  hairline:  'rgba(30, 30, 30, 0.09)',

  // Ink
  ink:       '#1E1E1E',
  ink2:      '#3A3A3A',
  muted:     '#7A7872',
  soft:      '#ABA9A3',

  // Accents — Iron / Ember / Stone-gold / Charcoal
  sage:      '#7A876B',  // Iron-olive
  sageSoft:  '#D6DDD0',
  terra:     '#CC6B49',  // Ember
  terraSoft: '#EED6C6',
  amber:     '#A8956B',  // Stone-gold
  amberSoft: '#E2D9C4',
  night:     '#252528',  // Charcoal

  // Light-card-on-dark-screen text (Lock/EveningNotif mini app-card header)
  cardLabel: '#4A3F36',
  cardSub:   '#8A7B6E',

  // Border radii
  rXs: 6,
  rSm: 10,
  rMd: 16,
  rLg: 22,
  rXl: 28,
} as const;

export const darkTokens = {
  ...lightTokens,
  bg:       '#141414',
  surface:  '#1A1A1A',
  surface2: '#1E1E1E',
  card:     '#242424',
  divider:  '#303030',
  hairline: 'rgba(255,255,255,0.07)',
  ink:      '#ECEAE5',
  ink2:     '#C8C6C0',
  muted:    '#8A8880',
  soft:     '#5A5854',
} as const;

export type Tokens = {
  [K in keyof typeof lightTokens]: typeof lightTokens[K] extends number ? number : string;
};

// Applies an alpha channel to a token hex color, e.g. withAlpha(darkTokens.ink, 0.5)
export function withAlpha(hex: string, alpha: number): string {
  const v = hex.replace('#', '');
  const r = parseInt(v.substring(0, 2), 16);
  const g = parseInt(v.substring(2, 4), 16);
  const b = parseInt(v.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export const fonts = {
  display: 'InstrumentSerif_400Regular',
  displayItalic: 'InstrumentSerif_400Regular_Italic',
  sans: 'Geist_400Regular',
  sansMedium: 'Geist_500Medium',
  sansSemiBold: 'Geist_600SemiBold',
  mono: 'GeistMono_400Regular',
  monoMedium: 'GeistMono_500Medium',
} as const;
