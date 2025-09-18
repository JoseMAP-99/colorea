import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { PrimaryButton, ColorBlock, RGBSliders, PrecisionBar } from '@/components';
import { useGameStore } from '@/store/game';
import { getTheme } from '@/utils/theme';
import { 
  RGB, 
  precisionPercent, 
  generateSeededColor, 
  createSeededRNG, 
  dailySeed,
  rgbToHex
} from '@/utils/color';
// import HapticFeedback from 'react-native-haptic-feedback';

type RootStackParamList = {
  Home: undefined;
  ModeDaily: undefined;
  ColorChain: { isDaily?: boolean };
  GradientGap: undefined;
  MemoryMix: undefined;
};

type ColorChainScreenRouteProp = RouteProp<RootStackParamList, 'ColorChain'>;

// Sin límite de pasos - el usuario decide cuándo parar

export const ColorChainScreen: React.FC = () => {
  const route = useRoute<ColorChainScreenRouteProp>();
  const navigation = useNavigation();
  const { 
    isDarkMode,
    showPrecisionBar, 
    showHexValue, 
    showRGBLabels, 
    bestColorChain, 
    setBestColorChain,
    setDailyChallengeCompleted,
    setDailyChallengeScore,
    setDailyChallengeDate
  } = useGameStore();
  
  const theme = getTheme(isDarkMode);
  
  const isDaily = route.params?.isDaily || false;
  
  const [targetColor, setTargetColor] = useState<RGB>({ r: 0, g: 0, b: 0 });
  const [currentColor, setCurrentColor] = useState<RGB>({ r: 0, g: 0, b: 0 });
  const [currentStep, setCurrentStep] = useState(1);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [currentPrecision, setCurrentPrecision] = useState(0);
  const [stepCount, setStepCount] = useState(0);
  const [levelHistory, setLevelHistory] = useState<number[]>([]);
  const [averageLevel, setAverageLevel] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);
  const [showLevelResults, setShowLevelResults] = useState(false);
  const [levelResult, setLevelResult] = useState(0);
  const [totalStepsAllLevels, setTotalStepsAllLevels] = useState(0);
  const [finalStats, setFinalStats] = useState({
    finalAverage: 0,
    totalSteps: 0,
    levelReached: 0
  });

  useEffect(() => {
    initializeGame();
  }, [isDaily]);

  useEffect(() => {
    const precision = precisionPercent(currentColor, targetColor);
    setCurrentPrecision(precision);
    
    // Haptics en umbrales de precisión
    // if (precision >= 90) {
    //   HapticFeedback.trigger('notificationSuccess');
    // } else if (precision >= 70) {
    //   HapticFeedback.trigger('impactLight');
    // }
  }, [currentColor, targetColor]);


  const handleSliderRelease = () => {
    // Incrementar contador de pasos cuando el usuario suelta el slider
    setStepCount(prev => prev + 1);
  };

  const initializeGame = () => {
    const seed = isDaily ? dailySeed(new Date()) : Date.now().toString();
    const rng = createSeededRNG(seed);
    
    const target = generateSeededColor(rng);
    
    setTargetColor(target);
    setCurrentColor({ r: 128, g: 128, b: 128 }); // Empezar con gris medio
    setCurrentStep(1);
    setGameCompleted(false);
    setStepCount(0);
    setLevelHistory([]);
    setAverageLevel(0);
    setGameFinished(false);
    setShowLevelResults(false);
    setTotalStepsAllLevels(0);
    setFinalStats({
      finalAverage: 0,
      totalSteps: 0,
      levelReached: 0
    });
  };

  const handleCheck = () => {
    // Guardar el nivel actual (precisión) en el historial
    const currentLevel = Math.round(currentPrecision);
    setLevelResult(currentLevel);
    
    // Solo actualizar la mejor precisión si las ayudas están desactivadas
    const areAidsDisabled = !showPrecisionBar && !showHexValue && !showRGBLabels;
    if (areAidsDisabled) {
      setBestColorChain(currentLevel);
    }
    
    // Si es reto diario, guardar la puntuación
    if (isDaily) {
      setDailyChallengeCompleted(true);
      setDailyChallengeScore(currentLevel);
      setDailyChallengeDate(new Date().toDateString());
    }
    
    setShowLevelResults(true);
  };


  const handleNextLevel = () => {
    // Guardar el nivel actual en el historial
    const newLevelHistory = [...levelHistory, levelResult];
    setLevelHistory(newLevelHistory);
    
    // Acumular pasos totales
    setTotalStepsAllLevels(prev => prev + stepCount);
    
    // Calcular la media de todos los niveles
    const average = newLevelHistory.reduce((sum, level) => sum + level, 0) / newLevelHistory.length;
    setAverageLevel(Math.round(average));
    
    // Generar nuevos colores para el siguiente nivel
    const seed = isDaily ? dailySeed(new Date()) : Date.now().toString();
    const rng = createSeededRNG(seed);
    
    const newTarget = generateSeededColor(rng);
    
    setTargetColor(newTarget);
    setCurrentColor({ r: 128, g: 128, b: 128 }); // Empezar con gris medio
    
    // Avanzar al siguiente nivel
    setCurrentStep(prev => prev + 1);
    setStepCount(0); // Resetear contador de pasos para el nuevo nivel
    setShowLevelResults(false);
  };

  const handleFinishGame = () => {
    // Guardar el nivel final en el historial
    const finalLevelHistory = [...levelHistory, levelResult];
    
    // Calcular la media final
    const finalAverage = finalLevelHistory.reduce((sum, level) => sum + level, 0) / finalLevelHistory.length;
    
    // Incluir los pasos del nivel actual en el total
    const finalTotalSteps = totalStepsAllLevels + stepCount;
    
    setFinalStats({
      finalAverage: Math.round(finalAverage),
      totalSteps: finalTotalSteps,
      levelReached: currentStep
    });
    
    setGameFinished(true);
  };

  const handleRestart = () => {
    initializeGame();
  };

  if (gameCompleted) {
    return (
      <View style={styles.container}>
        <View style={styles.completedContainer}>
          <Text style={styles.completedTitle}>¡Completado!</Text>
          <Text style={styles.completedText}>
            Precisión final: {Math.round(currentPrecision)}%
          </Text>
          <View style={styles.completedButtonsContainer}>
            <PrimaryButton
              title="Jugar de nuevo"
              onPress={handleRestart}
              style={styles.button}
            />
            <PrimaryButton
              title="Volver al menú"
              onPress={() => navigation.navigate('MainTabs' as never)}
              style={styles.menuButton}
            />
          </View>
        </View>
      </View>
    );
  }

  if (gameFinished) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.finalStatsContainer}>
          <Text style={[styles.finalStatsTitle, { color: theme.text }]}>¡Partida Finalizada!</Text>
          
          <View style={styles.finalStatsSection}>
            <Text style={[styles.finalStatsSubtitle, { color: theme.textSecondary }]}>Estadísticas Finales</Text>
            
            <View style={styles.finalStatsGrid}>
              <View style={[styles.finalStatCard, { backgroundColor: theme.surface }]}>
                <Text style={[styles.finalStatValue, { color: theme.text }]}>{finalStats.finalAverage}%</Text>
                <Text style={[styles.finalStatLabel, { color: theme.textSecondary }]}>Media Final</Text>
              </View>
              
              <View style={[styles.finalStatCard, { backgroundColor: theme.surface }]}>
                <Text style={[styles.finalStatValue, { color: theme.text }]}>{finalStats.totalSteps}</Text>
                <Text style={[styles.finalStatLabel, { color: theme.textSecondary }]}>Pasos Totales</Text>
              </View>
            </View>
            
            <View style={[styles.finalStatCardFull, { backgroundColor: theme.surface }]}>
              <Text style={[styles.finalStatValue, { color: theme.text }]}>{finalStats.levelReached}</Text>
              <Text style={[styles.finalStatLabel, { color: theme.textSecondary }]}>Nivel Alcanzado</Text>
            </View>
          </View>
          
          <View style={styles.finalButtonsContainer}>
            <PrimaryButton
              title="Jugar de nuevo"
              onPress={handleRestart}
              style={styles.restartButton}
            />
            <PrimaryButton
              title="Volver al menú"
              onPress={() => navigation.navigate('MainTabs' as never)}
              style={styles.menuButton}
            />
          </View>
        </View>
      </View>
    );
  }

  if (showLevelResults) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.resultsContainer}>
          <Text style={[styles.resultsTitle, { color: theme.text }]}>¡Nivel {currentStep} Completado!</Text>
          
          <View style={[styles.targetColorSection, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.targetColorLabel, { color: theme.text }]}>Color objetivo</Text>
            <View style={styles.targetColorWrapper}>
              <ColorBlock rgb={targetColor} size="large" />
            </View>
            <Text style={[styles.hexCode, { color: theme.text }]}>{rgbToHex(targetColor).toUpperCase()}</Text>
          </View>
          
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
              <Text style={[styles.statValue, { color: theme.text }]}>{levelResult}%</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Precisión</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
              <Text style={[styles.statValue, { color: theme.text }]}>{stepCount}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Pasos</Text>
            </View>
          </View>

          <View style={styles.resultsButtonsContainer}>
            {isDaily ? (
              <PrimaryButton
                title="Volver al menú"
                onPress={() => navigation.navigate('MainTabs' as never)}
                style={styles.menuButton}
              />
            ) : (
              <>
                <PrimaryButton
                  title="Siguiente Nivel"
                  onPress={handleNextLevel}
                  style={styles.nextButton}
                />
                <PrimaryButton
                  title="Finalizar Partida"
                  onPress={handleFinishGame}
                  style={styles.finishButton}
                />
              </>
            )}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: theme.text }]}>Color Chain</Text>
          {isDaily && (
            <View style={styles.dailyBadge}>
              <Text style={styles.dailyBadgeText}>🎯 RETO DIARIO</Text>
            </View>
          )}
        </View>
      {!isDaily && (
        <View style={styles.statsContainer}>
          <Text style={[styles.statText, { color: theme.textSecondary }]}>Pasos: {stepCount}</Text>
          <Text style={[styles.statText, { color: theme.textSecondary }]}>
            Media: {averageLevel > 0 ? `${averageLevel}%` : 'Desconocido'}
          </Text>
          <Text style={[styles.statText, { color: theme.textSecondary }]}>
            Mejor: {bestColorChain > 0 ? `${bestColorChain}%` : 'N/A'}
          </Text>
        </View>
      )}
      </View>

      {!isDaily && (
        <View style={styles.levelContainer}>
          <Text style={[styles.levelText, { color: theme.text }]}>Nivel {currentStep}</Text>
        </View>
      )}

      <View style={styles.colorsContainer}>
        <ColorBlock
          rgb={targetColor}
          label="Meta"
          size="medium"
          showHex={showHexValue}
        />
      </View>

      <View style={styles.currentColorContainer}>
        <Text style={[styles.currentLabel, { color: theme.text }]}>Tu color</Text>
        <ColorBlock
          rgb={currentColor}
          size="large"
          showHex
        />
      </View>

      {showPrecisionBar && (
        <View style={styles.precisionContainer}>
          <PrecisionBar precision={currentPrecision} />
        </View>
      )}

      <View style={styles.slidersContainer}>
        <RGBSliders
          rgb={currentColor}
          onRGBChange={setCurrentColor}
          onSliderRelease={handleSliderRelease}
        />
      </View>

      <View style={styles.buttonsContainer}>
        <PrimaryButton
          title="Comprobar"
          onPress={handleCheck}
          style={styles.checkButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  dailyBadge: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.5)',
  },
  dailyBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFD700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 10,
  },
  statText: {
    fontSize: 14,
    fontWeight: '600',
  },
  levelContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  levelText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  colorsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  currentColorContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  currentLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  precisionContainer: {
    marginBottom: 20,
  },
  slidersContainer: {
    marginBottom: 30,
  },
  buttonsContainer: {
    gap: 12,
  },
  checkButton: {
    backgroundColor: '#4CAF50',
  },
  disabledButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.3)',
  },
  finishButton: {
    backgroundColor: '#FF9800',
  },
  resultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  resultCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 40,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 40,
    minWidth: 200,
  },
  resultValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 8,
  },
  resultLabel: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
  stepsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 30,
    minWidth: 150,
  },
  stepsValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF9800',
    marginBottom: 8,
  },
  stepsLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
  resultsButtonsContainer: {
    width: '100%',
    gap: 12,
  },
  nextButton: {
    backgroundColor: '#4CAF50',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 40,
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 25,
    borderRadius: 20,
    alignItems: 'center',
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  statValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  statLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  finalButtonsContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
  },
  restartButton: {
    backgroundColor: '#4CAF50',
    minWidth: 200,
  },
  menuButton: {
    backgroundColor: '#FF9800',
    minWidth: 200,
  },
  finalStatsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  finalStatsTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
  },
  finalStatsSection: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 25,
    padding: 30,
    marginBottom: 40,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  finalStatsSubtitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 30,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  finalStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 15,
    marginBottom: 20,
  },
  finalStatCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 25,
    borderRadius: 20,
    alignItems: 'center',
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  finalStatCardFull: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 25,
    borderRadius: 20,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  finalStatValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  finalStatLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    textAlign: 'center',
    lineHeight: 16,
  },
  resultsTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 30,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  targetColorSection: {
    alignItems: 'center',
    marginBottom: 40,
    padding: 25,
    borderRadius: 20,
    borderWidth: 2,
  },
  targetColorLabel: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 15,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  targetColorWrapper: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  hexCode: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 15,
    fontFamily: 'monospace',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    letterSpacing: 1,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 40,
    gap: 20,
  },
  completedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 16,
  },
  completedText: {
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 30,
  },
  button: {
    minWidth: 200,
  },
  completedButtonsContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
  },
});
