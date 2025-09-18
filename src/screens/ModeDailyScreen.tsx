import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { PrimaryButton } from '@/components';
import { dailySeed, createSeededRNG } from '@/utils/color';
import { useGameStore } from '@/store/game';
import { getTheme } from '@/utils/theme';

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
  const { 
    isDarkMode,
    dailyChallengeCompleted, 
    dailyChallengeScore, 
    dailyChallengeDate,
    setDailyChallengeCompleted,
    setDailyChallengeScore,
    setDailyChallengeDate
  } = useGameStore();
  
  const theme = getTheme(isDarkMode);
  
  // Generar el modo del día basado en la semilla diaria
  const today = new Date();
  const todayString = today.toDateString();
  const seed = dailySeed(today);
  const rng = createSeededRNG(seed);
  const modeIndex = Math.floor(rng() * GAME_MODES.length);
  const todaysMode = GAME_MODES[modeIndex];
  
  // Verificar si el reto de hoy ya fue completado
  const isTodayCompleted = dailyChallengeCompleted && dailyChallengeDate === todayString;
  
  // Resetear el reto si es un nuevo día
  useEffect(() => {
    if (dailyChallengeDate !== todayString) {
      setDailyChallengeCompleted(false);
      setDailyChallengeScore(0);
      setDailyChallengeDate(todayString);
    }
  }, [todayString, dailyChallengeDate, setDailyChallengeCompleted, setDailyChallengeScore, setDailyChallengeDate]);

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
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.dailyIcon}>🎯</Text>
          <Text style={styles.title}>Reto Diario</Text>
        </View>
        <Text style={[styles.date, { color: theme.textSecondary }]}>
          {today.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Text>
        <Text style={styles.subtitle}>
          Un desafío único cada día
        </Text>
      </View>

      <View style={[styles.modeContainer, { backgroundColor: isDarkMode ? 'rgba(255, 215, 0, 0.1)' : 'rgba(255, 215, 0, 0.15)', borderColor: isDarkMode ? 'rgba(255, 215, 0, 0.3)' : 'rgba(255, 215, 0, 0.5)' }]}>
        <Text style={[styles.modeTitle, { color: theme.textSecondary }]}>Modo de hoy:</Text>
        <Text style={[styles.modeName, { color: theme.text }]}>{todaysMode}</Text>
        <Text style={[styles.modeDescription, { color: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)' }]}>
          {getModeDescription(todaysMode)}
        </Text>
      </View>

      {isTodayCompleted ? (
        <View style={[styles.completedContainer, { backgroundColor: isDarkMode ? 'rgba(76, 175, 80, 0.1)' : 'rgba(76, 175, 80, 0.15)', borderColor: isDarkMode ? 'rgba(76, 175, 80, 0.3)' : 'rgba(76, 175, 80, 0.5)' }]}>
          <Text style={styles.completedTitle}>¡Reto Completado!</Text>
          <Text style={[styles.completedScore, { color: theme.text }]}>Puntuación: {dailyChallengeScore}%</Text>
          <Text style={[styles.completedText, { color: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)' }]}>
            Has completado el reto de hoy. ¡Vuelve mañana para un nuevo desafío!
          </Text>
        </View>
      ) : (
        <View style={styles.buttonsContainer}>
          <PrimaryButton
            title="Jugar"
            onPress={handlePlay}
            style={styles.playButton}
          />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 100, // Espacio para la barra de navegación
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dailyIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD700',
    textShadowColor: 'rgba(255, 215, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  date: {
    fontSize: 16,
    textTransform: 'capitalize',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 215, 0, 0.8)',
    fontStyle: 'italic',
  },
  modeContainer: {
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 40,
    borderWidth: 1,
  },
  modeTitle: {
    fontSize: 16,
    marginBottom: 8,
  },
  modeName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  modeDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  buttonsContainer: {
    gap: 16,
  },
  playButton: {
    minWidth: 200,
  },
  completedContainer: {
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
  },
  completedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 12,
  },
  completedScore: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  completedText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
