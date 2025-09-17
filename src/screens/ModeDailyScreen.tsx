import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { PrimaryButton } from '@/components';
import { dailySeed, createSeededRNG } from '@/utils/color';

type RootStackParamList = {
  Home: undefined;
  ModeDaily: undefined;
  ColorChain: { isDaily?: boolean };
  GradientGap: { isDaily?: boolean };
  MemoryMix: { isDaily?: boolean };
};

type ModeDailyScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ModeDaily'>;

const GAME_MODES = ['Color Chain', 'Gradient Gap', 'Memory Mix'] as const;

export const ModeDailyScreen: React.FC = () => {
  const navigation = useNavigation<ModeDailyScreenNavigationProp>();
  
  // Generar el modo del día basado en la semilla diaria
  const today = new Date();
  const seed = dailySeed(today);
  const rng = createSeededRNG(seed);
  const modeIndex = Math.floor(rng() * GAME_MODES.length);
  const todaysMode = GAME_MODES[modeIndex];

  const handlePlay = () => {
    switch (todaysMode) {
      case 'Color Chain':
        navigation.navigate('ColorChain', { isDaily: true });
        break;
      case 'Gradient Gap':
        navigation.navigate('GradientGap', { isDaily: true });
        break;
      case 'Memory Mix':
        navigation.navigate('MemoryMix', { isDaily: true });
        break;
    }
  };

  const getModeDescription = (mode: string) => {
    switch (mode) {
      case 'Color Chain':
        return 'Conecta colores paso a paso hasta llegar al objetivo';
      case 'Gradient Gap':
        return 'Completa el degradado recreando el color faltante';
      case 'Memory Mix':
        return 'Memoriza el color y recréalo de memoria';
      default:
        return '';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Reto Diario</Text>
        <Text style={styles.date}>
          {today.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Text>
      </View>

      <View style={styles.modeContainer}>
        <Text style={styles.modeTitle}>Modo de hoy:</Text>
        <Text style={styles.modeName}>{todaysMode}</Text>
        <Text style={styles.modeDescription}>
          {getModeDescription(todaysMode)}
        </Text>
      </View>

      <View style={styles.buttonsContainer}>
        <PrimaryButton
          title="Jugar"
          onPress={handlePlay}
          style={styles.playButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0b0b',
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  date: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textTransform: 'capitalize',
  },
  modeContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 40,
  },
  modeTitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 8,
  },
  modeName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  modeDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 20,
  },
  buttonsContainer: {
    gap: 16,
  },
  playButton: {
    backgroundColor: '#4CAF50',
  },
});
