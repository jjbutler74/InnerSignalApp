export const lightTokens = {
  // Surfaces
  bg:        '#F2EDE2',
  surface:   '#FAF6EE',
  surface2:  '#F6F0E2',
  card:      '#FFFFFF',
  divider:   '#E6DCC9',
  hairline:  'rgba(42, 33, 27, 0.08)',

  // Ink
  ink:       '#2A211B',
  ink2:      '#4A3F36',
  muted:     '#8A7B6E',
  soft:      '#B6A99A',

  // Accents
  sage:      '#6F8169',
  sageSoft:  '#DDE3D2',
  terra:     '#C97B5B',
  terraSoft: '#F2D9CC',
  amber:     '#D4A24C',
  amberSoft: '#F0DFB9',
  night:     '#2D3B3F',

  // Border radii
  rXs: 6,
  rSm: 10,
  rMd: 16,
  rLg: 22,
  rXl: 28,
} as const;

export const darkTokens = {
  ...lightTokens,
  bg:       '#1A1612',
  surface:  '#211C17',
  surface2: '#251F1A',
  card:     '#2A231D',
  divider:  '#3A3128',
  hairline: 'rgba(255,255,255,0.08)',
  ink:      '#F2EDE2',
  ink2:     '#D9D0BD',
  muted:    '#9C8E80',
  soft:     '#6B5F53',
} as const;

export type Tokens = {
  [K in keyof typeof lightTokens]: typeof lightTokens[K] extends number ? number : string;
};

export const fonts = {
  display: 'InstrumentSerif_400Regular',
  displayItalic: 'InstrumentSerif_400Regular_Italic',
  sans: 'Geist_400Regular',
  sansMedium: 'Geist_500Medium',
  sansSemiBold: 'Geist_600SemiBold',
  mono: 'GeistMono_400Regular',
  monoMedium: 'GeistMono_500Medium',
} as const;
