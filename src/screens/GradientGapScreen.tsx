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
  rgbToHex,
  hexToRgb,
  lerpHex 
} from '@/utils/color';
// import HapticFeedback from 'react-native-haptic-feedback';



const STEPS = 5;

type RootStackParamList = {
  Home: undefined;
  Settings: undefined;
  ModeDaily: undefined;
  ColorChain: { isDaily?: boolean };
  GradientGap: { isDaily?: boolean };
  MemoryMix: { isDaily?: boolean };
};

type GradientGapScreenRouteProp = RouteProp<RootStackParamList, 'GradientGap'>;

export const GradientGapScreen: React.FC = () => {
  const route = useRoute<GradientGapScreenRouteProp>();
  const navigation = useNavigation();
  const { 
    isDarkMode,
    showPrecisionBar, 
    showHexValue, 
    showRGBLabels, 
    bestGradientGap, 
    setBestGradientGap,
    setDailyChallengeCompleted,
    setDailyChallengeScore,
    setDailyChallengeDate
  } = useGameStore();
  
  const theme = getTheme(isDarkMode);
  
  const isDaily = route.params?.isDaily || false;
  
  const [colorA, setColorA] = useState<string>('#000000');
  const [colorB, setColorB] = useState<string>('#000000');
  const [missingIndex, setMissingIndex] = useState(0);
  const [targetHex, setTargetHex] = useState<string>('#000000');
  const [currentColor, setCurrentColor] = useState<RGB>({ r: 0, g: 0, b: 0 });
  const [currentPrecision, setCurrentPrecision] = useState(0);
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
    const precision = precisionPercent(currentColor, hexToRgb(targetHex));
    setCurrentPrecision(precision);
    
    // Haptics en umbrales de precisión
    // if (precision >= 90) {
    //   HapticFeedback.trigger('notificationSuccess');
    // } else if (precision >= 70) {
    //   HapticFeedback.trigger('impactLight');
    // }
  }, [currentColor, targetHex]);

  const initializeGame = () => {
    // Usar semilla diaria si es reto diario, sino aleatorio
    const seed = isDaily ? dailySeed(new Date()) : `gradientGap_${Date.now()}_${Math.random()}`;
    const rng = createSeededRNG(seed);
    
    // Generar colores A y B
    const rgbA = generateSeededColor(rng);
    const rgbB = generateSeededColor(rng);
    const hexA = rgbToHex(rgbA);
    const hexB = rgbToHex(rgbB);
    
    // Elegir índice faltante (1-4, no los extremos)
    const missingIdx = Math.floor(rng() * (STEPS - 2)) + 1;
    const target = lerpHex(hexA, hexB, missingIdx / (STEPS - 1));
    
    setColorA(hexA);
    setColorB(hexB);
    setMissingIndex(missingIdx);
    setTargetHex(target);
    setCurrentColor({ r: 128, g: 128, b: 128 }); // Color inicial neutral
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

  const handlePlaceColor = () => {
    const finalPrecision = precisionPercent(currentColor, hexToRgb(targetHex));
    const currentLevelPrecision = Math.round(finalPrecision);
    setLevelResult(currentLevelPrecision);
    
    // Solo actualizar la mejor precisión si las ayudas están desactivadas
    const areAidsDisabled = !showPrecisionBar && !showHexValue && !showRGBLabels;
    if (areAidsDisabled) {
      setBestGradientGap(currentLevelPrecision);
    }
    
    // Si es reto diario, guardar la puntuación
    if (isDaily) {
      setDailyChallengeCompleted(true);
      setDailyChallengeScore(currentLevelPrecision);
      setDailyChallengeDate(new Date().toDateString());
    }
    
    setShowLevelResults(true);
  };


  const handleSliderRelease = () => {
    // Incrementar contador de pasos cuando el usuario suelta el slider
    setStepCount(prev => prev + 1);
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
    const seed = isDaily ? dailySeed(new Date()) : `gradientGap_${Date.now()}_${Math.random()}_${currentLevel + 1}`;
    const rng = createSeededRNG(seed);
    
    // Generar colores A y B
    const rgbA = generateSeededColor(rng);
    const rgbB = generateSeededColor(rng);
    const hexA = rgbToHex(rgbA);
    const hexB = rgbToHex(rgbB);
    
    // Elegir índice faltante (1-4, no los extremos)
    const missingIdx = Math.floor(rng() * (STEPS - 2)) + 1;
    const target = lerpHex(hexA, hexB, missingIdx / (STEPS - 1));
    
    setColorA(hexA);
    setColorB(hexB);
    setMissingIndex(missingIdx);
    setTargetHex(target);
    setCurrentColor({ r: 128, g: 128, b: 128 }); // Color inicial neutral
    setStepCount(0); // Resetear contador de pasos para el nuevo nivel
    setCurrentLevel(prev => prev + 1);
    setShowLevelResults(false);
  };

  const handleFinishGame = () => {
    // Si no hay levelResult (no se ha colocado color en este nivel), calcularlo ahora
    let finalLevelResult = levelResult;
    if (finalLevelResult === 0) {
      const finalPrecision = precisionPercent(currentColor, hexToRgb(targetHex));
      finalLevelResult = Math.round(finalPrecision);
    }
    
    // Guardar el nivel final en el historial
    const finalLevelHistory = [...levelHistory, finalLevelResult];
    
    // Calcular estadísticas finales
    const finalAverage = finalLevelHistory.reduce((sum, level) => sum + level, 0) / finalLevelHistory.length;
    
    // Incluir los pasos del nivel actual en el total
    const finalTotalSteps = totalStepsAllLevels + stepCount;
    
    setFinalStats({
      finalAverage: Math.round(finalAverage),
      totalSteps: finalTotalSteps,
      levelReached: currentLevel
    });
    
    setGameFinished(true);
  };

  const handleRestart = () => {
    initializeGame();
  };

  const renderGradientRow = () => {
    const colors = [];
    
    for (let i = 0; i < STEPS; i++) {
      if (i === 0) {
        colors.push(
          <ColorBlock
            key={i}
            rgb={hexToRgb(colorA)}
            size="small"
            showHex
          />
        );
      } else if (i === STEPS - 1) {
        colors.push(
          <ColorBlock
            key={i}
            rgb={hexToRgb(colorB)}
            size="small"
            showHex
          />
        );
      } else if (i === missingIndex) {
        colors.push(
          <ColorBlock
            key={i}
            rgb={{ r: 0, g: 0, b: 0 }}
            size="small"
            borderStyle="empty"
          />
        );
      } else {
        const t = i / (STEPS - 1);
        const interpolatedHex = lerpHex(colorA, colorB, t);
        colors.push(
          <ColorBlock
            key={i}
            rgb={hexToRgb(interpolatedHex)}
            size="small"
            showHex
          />
        );
      }
    }
    
    return colors;
  };

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
              <ColorBlock rgb={hexToRgb(targetHex)} size="large" />
            </View>
            <Text style={[styles.hexCode, { color: theme.text }]}>{targetHex.toUpperCase()}</Text>
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
          <Text style={[styles.title, { color: theme.text }]}>Gradient Gap</Text>
          {isDaily && (
            <View style={styles.dailyBadge}>
              <Text style={styles.dailyBadgeText}>🎯 RETO DIARIO</Text>
            </View>
          )}
        </View>
        <Text style={[styles.instruction, { color: theme.textSecondary }]}>
          Completa el degradado recreando el color faltante
        </Text>
      </View>

      {!isDaily && (
        <View style={styles.statsContainer}>
          <Text style={[styles.statsText, { color: theme.text }]}>Nivel: {currentLevel}</Text>
          <Text style={[styles.statsText, { color: theme.text }]}>Media: {averageLevel === 0 ? 'Desconocido' : `${averageLevel}%`}</Text>
          <Text style={[styles.statsText, { color: theme.text }]}>Mejor: {bestGradientGap > 0 ? `${bestGradientGap}%` : 'N/A'}</Text>
        </View>
      )}

      <View style={styles.gradientContainer}>
        <View style={styles.gradientRow}>
          {renderGradientRow()}
        </View>
      </View>

      <View style={styles.currentColorContainer}>
        <Text style={[styles.currentLabel, { color: theme.text }]}>Tu color</Text>
        <ColorBlock
          rgb={currentColor}
          size="medium"
          showHex={showHexValue}
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
          onPress={handlePlaceColor}
          style={styles.checkButton}
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
    color: '#FFFFFF',
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
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  statsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  gradientContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  gradientRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  currentColorContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  currentLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
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
  finalButtonsContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 25,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  targetColorLabel: {
    fontSize: 20,
    color: '#FFFFFF',
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
    color: '#FFFFFF',
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
  resultsButtonsContainer: {
    width: '100%',
    gap: 12,
  },
  nextButton: {
    backgroundColor: '#4CAF50',
  },
});
