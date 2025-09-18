import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RGB, rgbToHex } from '@/utils/color';

interface ColorBlockProps {
  rgb: RGB;
  label?: string;
  size?: 'small' | 'medium' | 'large' | 'extra-large';
  showLabel?: boolean;
  showHex?: boolean;
  borderStyle?: 'solid' | 'dashed' | 'empty';
}

export const ColorBlock: React.FC<ColorBlockProps> = ({
  rgb,
  label,
  size = 'medium',
  showLabel = true,
  showHex = false,
  borderStyle = 'solid',
}) => {
  const hex = rgbToHex(rgb);
  const sizeStyles = getSizeStyles(size);

  return (
    <View style={styles.container}>
      {showLabel && label && (
        <Text style={styles.label}>{label}</Text>
      )}
      <View
        style={[
          styles.colorBlock,
          sizeStyles,
          {
            backgroundColor: hex,
            borderStyle: borderStyle === 'empty' ? 'dashed' : 'solid',
            borderColor: borderStyle === 'empty' ? '#FFFFFF' : 'transparent',
            opacity: borderStyle === 'empty' ? 0.3 : 1,
          },
        ]}
      >
        {borderStyle === 'empty' && (
          <Text style={styles.emptyText}>?</Text>
        )}
      </View>
      {showHex && (
        <Text style={styles.hexText}>{hex.toUpperCase()}</Text>
      )}
    </View>
  );
};

const getSizeStyles = (size: 'small' | 'medium' | 'large' | 'extra-large') => {
  switch (size) {
    case 'small':
      return { width: 60, height: 60 };
    case 'large':
      return { width: 120, height: 120 };
    case 'extra-large':
      return { width: 180, height: 180 };
    default:
      return { width: 80, height: 80 };
  }
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 8,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  colorBlock: {
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  hexText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    opacity: 0.8,
  },
});
