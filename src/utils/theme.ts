export interface Theme {
  background: string;
  surface: string;
  surfaceSecondary: string;
  text: string;
  textSecondary: string;
  border: string;
  primary: string;
  success: string;
  warning: string;
  error: string;
}

export const darkTheme: Theme = {
  background: '#121212',
  surface: 'rgba(255, 255, 255, 0.12)',
  surfaceSecondary: 'rgba(255, 255, 255, 0.06)',
  text: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  border: 'rgba(255, 255, 255, 0.12)',
  primary: '#4CAF50',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
};

export const lightTheme: Theme = {
  background: '#F8F9FA',
  surface: 'rgba(0, 0, 0, 0.08)',
  surfaceSecondary: 'rgba(0, 0, 0, 0.04)',
  text: '#1A1A1A',
  textSecondary: 'rgba(26, 26, 26, 0.7)',
  border: 'rgba(0, 0, 0, 0.15)',
  primary: '#4CAF50',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
};

export const getTheme = (isDarkMode: boolean): Theme => {
  return isDarkMode ? darkTheme : lightTheme;
};
