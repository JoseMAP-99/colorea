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
  background: '#0b0b0b',
  surface: 'rgba(255, 255, 255, 0.1)',
  surfaceSecondary: 'rgba(255, 255, 255, 0.05)',
  text: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  border: 'rgba(255, 255, 255, 0.1)',
  primary: '#4CAF50',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
};

export const lightTheme: Theme = {
  background: '#FFFFFF',
  surface: 'rgba(0, 0, 0, 0.05)',
  surfaceSecondary: 'rgba(0, 0, 0, 0.02)',
  text: '#000000',
  textSecondary: 'rgba(0, 0, 0, 0.7)',
  border: 'rgba(0, 0, 0, 0.1)',
  primary: '#4CAF50',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
};

export const getTheme = (isDarkMode: boolean): Theme => {
  return isDarkMode ? darkTheme : lightTheme;
};
