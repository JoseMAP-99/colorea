import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface PrecisionBarProps {
  precision: number;
  showLabel?: boolean;
  height?: number;
}

export const PrecisionBar: React.FC<PrecisionBarProps> = ({
  precision,
  showLabel = true,
  height = 8,
}) => {
  // Manejar valores NaN o inválidos
  const safePrecision = isNaN(precision) || !isFinite(precision) ? 0 : precision;
  const clampedPrecision = Math.max(0, Math.min(100, safePrecision));
  const fillWidth = `${clampedPrecision}%`;

  return (
    <View style={styles.container}>
      {showLabel && (
        <Text style={styles.label}>
          Precisión: {Math.round(clampedPrecision)}%
        </Text>
      )}
      <View style={[styles.bar, { height }]}>
        <View
          style={[
            styles.fill,
            { width: fillWidth },
            {
              backgroundColor: getPrecisionColor(clampedPrecision),
            },
          ]}
        />
      </View>
    </View>
  );
};

const getPrecisionColor = (precision: number): string => {
  if (precision >= 90) return '#4CAF50'; // Verde
  if (precision >= 70) return '#FFC107'; // Amarillo
  if (precision >= 50) return '#FF9800'; // Naranja
  return '#F44336'; // Rojo
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  bar: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
    transition: 'width 0.3s ease',
  },
});
