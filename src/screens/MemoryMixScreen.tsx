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



const MEMORY_TIME = 4; // segundos

type RootStackParamList = {
  Home: undefined;
  Settings: undefined;
  ModeDaily: undefined;
  ColorChain: { isDaily?: boolean };
  GradientGap: { isDaily?: boolean };
  MemoryMix: { isDaily?: boolean };
};

type MemoryMixScreenRouteProp = RouteProp<RootStackParamList, 'MemoryMix'>;

export const MemoryMixScreen: React.FC = () => {
  const route = useRoute<MemoryMixScreenRouteProp>();
  const navigation = useNavigation();
  const { 
    isDarkMode,
    showPrecisionBar, 
    showHexValue, 
    showRGBLabels, 
    bestMemoryMix, 
    setBestMemoryMix,
    setDailyChallengeCompleted,
    setDailyChallengeScore,
    setDailyChallengeDate
  } = useGameStore();
  
  const theme = getTheme(isDarkMode);
  
  const isDaily = route.params?.isDaily || false;
  
  const [targetColor, setTargetColor] = useState<RGB>({ r: 0, g: 0, b: 0 });
  const [currentColor, setCurrentColor] = useState<RGB>({ r: 0, g: 0, b: 0 });
  const [currentPrecision, setCurrentPrecision] = useState(0);
  const [gamePhase, setGamePhase] = useState<'memorize' | 'recall' | 'completed'>('memorize');
  const [timeLeft, setTimeLeft] = useState(MEMORY_TIME);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [stepCount, setStepCount] = useState(0);
  const [levelHistory, setLevelHistory] = useState<number[]>([]);
  const [averageLevel, setAverageLevel] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [gameFinished, setGameFinished] = useState(false);
  const [finalStats, setFinalStats] = useState({
    finalAverage: 0,
    totalSteps: 0,
    levelReached: 0
  });
  const [showLevelResults, setShowLevelResults] = useState(false);
  const [levelResult, setLevelResult] = useState(0);
  const [totalStepsAllLevels, setTotalStepsAllLevels] = useState(0);

  useEffect(() => {
    initializeGame();
  }, [isDaily]);


  useEffect(() => {
    if (gamePhase === 'recall') {
      console.log('Calculating precision:', { currentColor, targetColor });
      
      // Verificar que ambos colores sean válidos
      if (targetColor && currentColor && 
          targetColor.r !== undefined && targetColor.g !== undefined && targetColor.b !== undefined &&
          currentColor.r !== undefined && currentColor.g !== undefined && currentColor.b !== undefined) {
        const precision = precisionPercent(currentColor, targetColor);
        console.log('Precision result:', precision);
        setCurrentPrecision(precision);
      } else {
        console.log('Invalid colors detected:', { currentColor, targetColor });
        setCurrentPrecision(0);
      }
      
      // Haptics en umbrales de precisión
      // if (precision >= 90) {
      //   HapticFeedback.trigger('notificationSuccess');
      // } else if (precision >= 70) {
      //   HapticFeedback.trigger('impactLight');
      // }
    } else if (gamePhase === 'memorize') {
      // Reset precision during memorize phase
      setCurrentPrecision(0);
    }
  }, [currentColor, targetColor, gamePhase]);

  useEffect(() => {
    if (gamePhase === 'memorize' && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (gamePhase === 'memorize' && timeLeft === 0) {
      setGamePhase('recall');
    }
  }, [gamePhase, timeLeft]);

  const initializeGame = () => {
    // Usar semilla diaria si es reto diario, sino aleatorio
    const seed = isDaily ? dailySeed(new Date()) : `memoryMix_${Date.now()}_${Math.random()}_${currentLevel}`;
    const rng = createSeededRNG(seed);
    const target = generateSeededColor(rng);
    console.log('Initializing game with target color:', target);
    
    setTargetColor(target);
    setCurrentColor({ r: 128, g: 128, b: 128 }); // Color inicial neutral
    setCurrentPrecision(0); // Reset precision
    setGamePhase('memorize');
    setTimeLeft(MEMORY_TIME);
    setGameCompleted(false);
    setStepCount(0);
    setLevelHistory([]);
    setAverageLevel(0);
    setCurrentLevel(1);
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
    console.log('Checking precision:', { currentColor, targetColor });
    
    // Verificar que ambos colores sean válidos antes de calcular
    if (!targetColor || !currentColor || 
        targetColor.r === undefined || targetColor.g === undefined || targetColor.b === undefined ||
        currentColor.r === undefined || currentColor.g === undefined || currentColor.b === undefined) {
      console.log('Invalid colors for precision calculation');
      return;
    }
    
    const finalPrecision = precisionPercent(currentColor, targetColor);
    console.log('Final precision result:', finalPrecision);
    
    // Verificar que la precisión sea un número válido
    if (isNaN(finalPrecision) || !isFinite(finalPrecision)) {
      console.log('Invalid precision result:', finalPrecision);
      return;
    }
    
    // Guardar el resultado del nivel actual
    const currentLevelPrecision = Math.round(finalPrecision);
    setLevelResult(currentLevelPrecision);
    
    // Solo actualizar la mejor precisión si las ayudas están desactivadas
    const areAidsDisabled = !showPrecisionBar && !showHexValue && !showRGBLabels;
    if (areAidsDisabled) {
      setBestMemoryMix(currentLevelPrecision);
    }
    
    // Si es reto diario, guardar la puntuación
    if (isDaily) {
      setDailyChallengeCompleted(true);
      setDailyChallengeScore(currentLevelPrecision);
      setDailyChallengeDate(new Date().toDateString());
    }
    
    setShowLevelResults(true);
  };

  const handleNextLevel = () => {
    const newLevelHistory = [...levelHistory, levelResult];
    setLevelHistory(newLevelHistory);
    setTotalStepsAllLevels(prev => prev + stepCount);
    const average = newLevelHistory.reduce((sum, level) => sum + level, 0) / newLevelHistory.length;
    setAverageLevel(Math.round(average));
    
    // Generar nuevos colores para el siguiente nivel
    const seed = isDaily ? dailySeed(new Date()) : `memoryMix_${Date.now()}_${Math.random()}_${currentLevel + 1}`;
    const rng = createSeededRNG(seed);
    const newTarget = generateSeededColor(rng);
    
    setTargetColor(newTarget);
    setCurrentColor({ r: 128, g: 128, b: 128 });
    
    // Avanzar al siguiente nivel
    setCurrentLevel(prev => prev + 1);
    setGamePhase('memorize');
    setTimeLeft(MEMORY_TIME);
    setStepCount(0);
    setShowLevelResults(false);
  };

  const handleFinishGame = () => {
    const finalLevelHistory = [...levelHistory, levelResult];
    const finalAverage = finalLevelHistory.reduce((sum, level) => sum + level, 0) / finalLevelHistory.length;
    const finalTotalSteps = totalStepsAllLevels + stepCount;
    
    setFinalStats({
      finalAverage: Math.round(finalAverage),
      totalSteps: finalTotalSteps,
      levelReached: currentLevel
    });
    
    setGameFinished(true);
  };


  const handleSliderRelease = () => {
    // Incrementar contador de pasos cuando el usuario suelta el slider
    setStepCount(prev => prev + 1);
  };

  const handleRestart = () => {
    initializeGame();
  };



  if (gameCompleted) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.completedContainer}>
          <Text style={styles.completedTitle}>¡Completado!</Text>
          <Text style={[styles.completedText, { color: theme.text }]}>
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
          <Text style={[styles.resultsTitle, { color: theme.text }]}>¡Nivel {currentLevel} Completado!</Text>
          
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
          <Text style={[styles.title, { color: theme.text }]}>Memory Mix</Text>
          {isDaily && (
            <View style={styles.dailyBadge}>
              <Text style={styles.dailyBadgeText}>🎯 RETO DIARIO</Text>
            </View>
          )}
        </View>
      {!isDaily && (
        <View style={styles.statsContainer}>
          <Text style={[styles.statText, { color: theme.textSecondary }]}>Nivel: {currentLevel}</Text>
          <Text style={[styles.statText, { color: theme.textSecondary }]}>
            Media: {averageLevel > 0 ? `${averageLevel}%` : 'Desconocido'}
          </Text>
          <Text style={[styles.statText, { color: theme.textSecondary }]}>
            Mejor: {bestMemoryMix > 0 ? `${bestMemoryMix}%` : 'N/A'}
          </Text>
        </View>
      )}
        
        <Text style={[styles.instruction, { color: theme.textSecondary }]}>
          {gamePhase === 'memorize' 
            ? 'Memoriza el color que aparece abajo'
            : '¿Recuerdas el color? Recréalo con los sliders'
          }
        </Text>
      </View>

      {gamePhase === 'memorize' && (
        <View style={styles.memorizeContainer}>
          <Text style={[styles.timerText, { color: theme.text }]}>{timeLeft}</Text>
          <ColorBlock
            rgb={targetColor}
            size="extra-large"
            showHex={showHexValue}
          />
        </View>
      )}

      {gamePhase === 'recall' && (
        <>
          <View style={styles.recallContainer}>
            <Text style={[styles.recallLabel, { color: theme.text }]}>¿Recuerdas?</Text>
            <ColorBlock
              rgb={{ r: 0, g: 0, b: 0 }}
              size="medium"
              borderStyle="empty"
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
        </>
      )}

      <View style={styles.buttonsContainer}>
        {gamePhase === 'recall' && (
          <>
            <PrimaryButton
              title="Comprobar"
              onPress={handleCheck}
              style={styles.checkButton}
            />
          </>
        )}
        
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
  instruction: {
    fontSize: 14,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 10,
    marginBottom: 15,
  },
  statText: {
    fontSize: 14,
    fontWeight: '600',
  },
  memorizeContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  recallContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  recallLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
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
  finalStatsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  finalTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 40,
  },
  statCard: {
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
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
  resultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  resultsTitle: {
    fontSize: 28,
    fontWeight: 'bold',
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
    borderColor: 'rgba(255, 255, 255, 0.2)',
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
  resultsButtonsContainer: {
    width: '100%',
    gap: 12,
  },
  nextButton: {
    backgroundColor: '#4CAF50',
  },
  finishButton: {
    backgroundColor: '#FF9800',
  },
  finalStatsTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
  },
  finalStatsSection: {
    width: '100%',
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
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  finalStatLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    textAlign: 'center',
    lineHeight: 16,
  },
});