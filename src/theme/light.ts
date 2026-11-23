export interface ThemeColors {
  background: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  border: string;
  accent: string;
  accentLight: string;
  danger: string;
  dangerLight: string;
  icon: string;
  iconMuted: string;
  overlay: string;
  tabBar: string;
  tabBarBorder: string;
  statusBar: 'dark' | 'light';
}

export const lightColors: ThemeColors = {
  background: '#F8F9FA',
  surface: '#FFFFFF',
  surfaceAlt: '#F1F3F5',
  text: '#111827',
  textSecondary: '#4B5563',
  textTertiary: '#9CA3AF',
  border: 'rgba(0, 0, 0, 0.08)',
  accent: '#2563EB',
  accentLight: '#EFF6FF',
  danger: '#DC2626',
  dangerLight: '#FEE2E2',
  icon: '#374151',
  iconMuted: '#9CA3AF',
  overlay: 'rgba(0, 0, 0, 0.5)',
  tabBar: '#FFFFFF',
  tabBarBorder: 'rgba(0, 0, 0, 0.08)',
  statusBar: 'dark',
};
