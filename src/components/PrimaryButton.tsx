import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useGameStore } from '@/store/game';
import { getTheme } from '@/utils/theme';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  disabled = false,
  style,
  textStyle,
}) => {
  const { isDarkMode } = useGameStore();
  const theme = getTheme(isDarkMode);
  
  return (
    <TouchableOpacity
      style={[
        styles.button,
        { 
          backgroundColor: theme.surface,
          borderColor: theme.border,
          borderWidth: 1,
        },
        disabled && { 
          backgroundColor: theme.surfaceSecondary,
          opacity: 0.6 
        },
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={[
        styles.text, 
        { color: theme.text },
        disabled && { color: theme.textSecondary },
        textStyle
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
