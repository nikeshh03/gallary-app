export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const fontSizes = {
  caption: 12,
  body: 14,
  subtitle: 16,
  title: 20,
  heading: 28,
} as const;

export const radii = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 9999,
} as const;

export const durations = {
  fast: 150,
  normal: 250,
  slow: 400,
} as const;

export type Spacing = typeof spacing;
export type FontSizes = typeof fontSizes;
export type Radii = typeof radii;
export type Durations = typeof durations;
