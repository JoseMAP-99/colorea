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
  const { showPrecisionBar, showHexValue } = useGameStore();
  
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
  const [hasMovedSlider, setHasMovedSlider] = useState(false);

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
    setHasMovedSlider(false);
    setFinalStats({
      finalAverage: 0,
      totalSteps: 0,
      levelReached: 0
    });
  };

  const handlePlaceColor = () => {
    const finalPrecision = precisionPercent(currentColor, hexToRgb(targetHex));
    
    // Guardar el nivel actual (precisión) en el historial
    const currentLevelPrecision = Math.round(finalPrecision);
    const newLevelHistory = [...levelHistory, currentLevelPrecision];
    setLevelHistory(newLevelHistory);
    
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
    setHasMovedSlider(false);
    setCurrentLevel(prev => prev + 1);
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

  const handleFinishGame = () => {
    // Guardar el nivel final en el historial
    const finalLevel = Math.round(currentPrecision);
    const newLevelHistory = [...levelHistory, finalLevel];
    
    // Calcular estadísticas finales
    const finalAverage = newLevelHistory.reduce((sum, level) => sum + level, 0) / newLevelHistory.length;
    
    setFinalStats({
      finalAverage: Math.round(finalAverage),
      totalSteps: stepCount,
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
      <View style={styles.container}>
        <View style={styles.finalStatsContainer}>
          <Text style={styles.finalStatsTitle}>¡Partida Finalizada!</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{finalStats.finalAverage}%</Text>
              <Text style={styles.statLabel}>Media Final</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{finalStats.totalSteps}</Text>
              <Text style={styles.statLabel}>Pasos</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{finalStats.levelReached}</Text>
              <Text style={styles.statLabel}>Nivel</Text>
            </View>
          </View>
          
          <PrimaryButton
            title="Jugar de nuevo"
            onPress={handleRestart}
            style={styles.restartButton}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gradient Gap</Text>
        <Text style={styles.instruction}>
          Completa el degradado recreando el color faltante
        </Text>
      </View>

      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>Nivel: {currentLevel}</Text>
        <Text style={styles.statsText}>Media: {averageLevel === 0 ? 'Desconocido' : `${averageLevel}%`}</Text>
      </View>

      <View style={styles.gradientContainer}>
        <View style={styles.gradientRow}>
          {renderGradientRow()}
        </View>
      </View>

      <View style={styles.currentColorContainer}>
        <Text style={styles.currentLabel}>Tu color</Text>
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
          onSliderPress={handleSliderPress}
          onSliderRelease={handleSliderRelease}
        />
      </View>

      <View style={styles.buttonsContainer}>
        <PrimaryButton
          title="Comprobar"
          onPress={handlePlaceColor}
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
  finalStatsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  finalStatsTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 30,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 40,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 5,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  restartButton: {
    backgroundColor: '#4CAF50',
    minWidth: 200,
  },
});
