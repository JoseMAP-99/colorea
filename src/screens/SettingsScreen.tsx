import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { PrimaryButton, Toggle } from '@/components';
import { useGameStore } from '@/store/game';

type RootStackParamList = {
  Home: undefined;
  Settings: undefined;
  ModeDaily: undefined;
  ColorChain: { isDaily?: boolean };
  GradientGap: undefined;
  MemoryMix: undefined;
};

type SettingsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Settings'>;

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const { 
    showPrecisionBar, 
    setShowPrecisionBar, 
    showHexValue, 
    setShowHexValue 
  } = useGameStore();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Ajustes</Text>
        <Text style={styles.subtitle}>
          Personaliza tu experiencia de juego
        </Text>
      </View>

      <View style={styles.settingsContainer}>
        <Text style={styles.settingsTitle}>Configuración de Juego</Text>
        
        <Toggle
          value={showPrecisionBar}
          onValueChange={setShowPrecisionBar}
          label="Mostrar barra de precisión"
          description="Muestra la barra de precisión en tiempo real durante el juego"
        />
        
        <Toggle
          value={showHexValue}
          onValueChange={setShowHexValue}
          label="Mostrar valor HEX"
          description="Muestra el código hexadecimal del color objetivo"
        />
      </View>

      <View style={styles.buttonsContainer}>
        <PrimaryButton
          title="Volver al Inicio"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0b0b',
  },
  content: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  settingsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 40,
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  buttonsContainer: {
    gap: 16,
  },
  backButton: {
    backgroundColor: '#4CAF50',
  },
});
