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
  const { showPrecisionBar, showHexValue } = useGameStore();
  
  const isDaily = route.params?.isDaily || false;
  
  const [startColor, setStartColor] = useState<RGB>({ r: 0, g: 0, b: 0 });
  const [targetColor, setTargetColor] = useState<RGB>({ r: 0, g: 0, b: 0 });
  const [currentColor, setCurrentColor] = useState<RGB>({ r: 0, g: 0, b: 0 });
  const [currentStep, setCurrentStep] = useState(1);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [currentPrecision, setCurrentPrecision] = useState(0);
  const [stepCount, setStepCount] = useState(0);
  const [levelHistory, setLevelHistory] = useState<number[]>([]);
  const [averageLevel, setAverageLevel] = useState(0);
  const [hasMovedSlider, setHasMovedSlider] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
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

  const handleSliderPress = () => {
    // No necesitamos hacer nada cuando presiona
  };

  const handleSliderRelease = () => {
    // Incrementar contador de pasos cuando el usuario suelta el slider
    setStepCount(prev => prev + 1);
    // Marcar que se ha movido el slider
    setHasMovedSlider(true);
  };

  const initializeGame = () => {
    const seed = isDaily ? dailySeed(new Date()) : Date.now().toString();
    const rng = createSeededRNG(seed);
    
    const start = generateSeededColor(rng);
    const target = generateSeededColor(rng);
    
    setStartColor(start);
    setTargetColor(target);
    setCurrentColor(start);
    setCurrentStep(1);
    setGameCompleted(false);
    setStepCount(0);
    setLevelHistory([]);
    setAverageLevel(0);
    setHasMovedSlider(false);
    setGameFinished(false);
    setFinalStats({
      finalAverage: 0,
      totalSteps: 0,
      levelReached: 0
    });
  };

  const handleCheck = () => {
    // Guardar el nivel actual (precisión) en el historial
    const currentLevel = Math.round(currentPrecision);
    const newLevelHistory = [...levelHistory, currentLevel];
    setLevelHistory(newLevelHistory);
    
    // Calcular la media de todos los niveles
    const average = newLevelHistory.reduce((sum, level) => sum + level, 0) / newLevelHistory.length;
    setAverageLevel(Math.round(average));
    
    // Generar nuevos colores para el siguiente nivel
    const seed = isDaily ? dailySeed(new Date()) : Date.now().toString();
    const rng = createSeededRNG(seed);
    
    const newStart = generateSeededColor(rng);
    const newTarget = generateSeededColor(rng);
    
    setStartColor(newStart);
    setTargetColor(newTarget);
    setCurrentColor(newStart);
    
    // Avanzar al siguiente nivel
    setCurrentStep(prev => prev + 1);
    setHasMovedSlider(false);
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
        <Text style={styles.title}>Color Chain</Text>
        <View style={styles.statsContainer}>
          <Text style={styles.statText}>Pasos: {stepCount}</Text>
          <Text style={styles.statText}>
            Media: {averageLevel > 0 ? `${averageLevel}%` : 'Desconocido'}
          </Text>
        </View>
      </View>

      <View style={styles.levelContainer}>
        <Text style={styles.levelText}>Nivel {currentStep}</Text>
      </View>

      <View style={styles.colorsContainer}>
        <ColorBlock
          rgb={startColor}
          label="Inicio"
          size="medium"
          showHex
        />
        
        <ColorBlock
          rgb={targetColor}
          label="Meta"
          size="medium"
          showHex={showHexValue}
        />
      </View>

      <View style={styles.currentColorContainer}>
        <Text style={styles.currentLabel}>Tu color</Text>
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
          onSliderPress={handleSliderPress}
          onSliderRelease={handleSliderRelease}
        />
      </View>

      <View style={styles.buttonsContainer}>
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 10,
  },
  statText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
  levelContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  levelText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  colorsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
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
});
