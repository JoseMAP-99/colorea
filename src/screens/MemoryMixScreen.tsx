import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { PrimaryButton, ColorBlock, RGBSliders, PrecisionBar } from '@/components';
import { useGameStore } from '@/store/game';
import { 
  RGB, 
  precisionPercent, 
  generateSeededColor, 
  createSeededRNG,
  dailySeed
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
  const { showPrecisionBar, showHexValue } = useGameStore();
  
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
  const [hasMovedSlider, setHasMovedSlider] = useState(false);

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
    setHasMovedSlider(false);
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
    
    // Guardar el nivel actual (precisión) en el historial
    const currentLevelPrecision = Math.round(finalPrecision);
    const newLevelHistory = [...levelHistory, currentLevelPrecision];
    setLevelHistory(newLevelHistory);
    
    // Calcular la media de todos los niveles
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
  };

  const handleSliderPress = () => {
    // No necesitamos hacer nada cuando presiona
  };

  const handleSliderRelease = () => {
    // Incrementar contador de pasos cuando el usuario suelta el slider
    setStepCount(prev => prev + 1);
    // Marcar que se ha movido el slider
    setHasMovedSlider(true);
  };

  const handleRestart = () => {
    initializeGame();
  };


  const handleFinishGame = () => {
    // Guardar el nivel final en el historial
    const finalLevel = Math.round(currentPrecision);
    const finalLevelHistory = [...levelHistory, finalLevel];
    
    // Calcular la media final
    const finalAverage = finalLevelHistory.reduce((sum, level) => sum + level, 0) / finalLevelHistory.length;
    
    setFinalStats({
      finalAverage: Math.round(finalAverage),
      totalSteps: stepCount,
      levelReached: currentLevel
    });
    
    setGameFinished(true);
  };

  if (gameCompleted) {
    return (
      <View style={styles.container}>
        <View style={styles.completedContainer}>
          <Text style={styles.completedTitle}>¡Completado!</Text>
          <Text style={styles.completedText}>
            Precisión final: {Math.round(currentPrecision)}%
          </Text>
          <PrimaryButton
            title="Jugar de nuevo"
            onPress={handleRestart}
            style={styles.button}
          />
        </View>
      </View>
    );
  }

  if (gameFinished) {
    return (
      <View style={styles.container}>
        <View style={styles.finalStatsContainer}>
          <Text style={styles.finalTitle}>¡Partida Finalizada!</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{finalStats.finalAverage}%</Text>
              <Text style={styles.statLabel}>Media Final</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{finalStats.totalSteps}</Text>
              <Text style={styles.statLabel}>Pasos Totales</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{finalStats.levelReached}</Text>
              <Text style={styles.statLabel}>Nivel</Text>
            </View>
          </View>

          <View style={styles.finalButtonsContainer}>
            <PrimaryButton
              title="Jugar de Nuevo"
              onPress={handleRestart}
              style={styles.restartButton}
            />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Memory Mix</Text>
        <View style={styles.statsContainer}>
          <Text style={styles.statText}>Nivel: {currentLevel}</Text>
          <Text style={styles.statText}>
            Media: {averageLevel > 0 ? `${averageLevel}%` : 'Desconocido'}
          </Text>
        </View>
        
        <Text style={styles.instruction}>
          {gamePhase === 'memorize' 
            ? 'Memoriza el color que aparece abajo'
            : '¿Recuerdas el color? Recréalo con los sliders'
          }
        </Text>
      </View>

      {gamePhase === 'memorize' && (
        <View style={styles.memorizeContainer}>
          <Text style={styles.timerText}>{timeLeft}</Text>
          <ColorBlock
            rgb={targetColor}
            size="large"
            showHex={showHexValue}
          />
        </View>
      )}

      {gamePhase === 'recall' && (
        <>
          <View style={styles.recallContainer}>
            <Text style={styles.recallLabel}>¿Recuerdas?</Text>
            <ColorBlock
              rgb={{ r: 0, g: 0, b: 0 }}
              size="large"
              borderStyle="empty"
            />
          </View>

          <View style={styles.currentColorContainer}>
            <Text style={styles.currentLabel}>Tu color</Text>
            <ColorBlock
              rgb={currentColor}
              size="medium"
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
              onSliderPress={handleSliderPress}
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
              style={!hasMovedSlider ? styles.disabledButton : styles.checkButton}
              disabled={!hasMovedSlider}
            />
            
            <PrimaryButton
              title="Finalizar partida"
              onPress={handleFinishGame}
              style={styles.finishButton}
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
    backgroundColor: '#0b0b0b',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  instruction: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
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
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
  memorizeContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  recallContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  recallLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
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
  finalStatsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  finalTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
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
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
    textAlign: 'center',
  },
  finalButtonsContainer: {
    width: '100%',
  },
  restartButton: {
    backgroundColor: '#4CAF50',
  },
});