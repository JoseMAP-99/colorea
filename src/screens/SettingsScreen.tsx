import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Toggle } from '@/components';
import { useGameStore } from '@/store/game';
import { getTheme } from '@/utils/theme';

export const SettingsScreen: React.FC = () => {
  const { 
    isDarkMode,
    setIsDarkMode,
    showPrecisionBar, 
    setShowPrecisionBar, 
    showHexValue, 
    setShowHexValue,
    showRGBLabels,
    setShowRGBLabels
  } = useGameStore();
  
  const theme = getTheme(isDarkMode);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Ajustes</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Personaliza tu experiencia de juego
        </Text>
      </View>

      <View style={[styles.settingsContainer, { backgroundColor: theme.surfaceSecondary }]}>
        <Text style={[styles.settingsTitle, { color: theme.text }]}>Apariencia</Text>
        
        <Toggle
          value={isDarkMode}
          onValueChange={setIsDarkMode}
          label="Modo oscuro"
          description="Cambia entre el tema claro y oscuro de la aplicación"
        />
      </View>

      <View style={[styles.settingsContainer, { backgroundColor: theme.surfaceSecondary }]}>
        <Text style={[styles.settingsTitle, { color: theme.text }]}>Configuración de Juego</Text>
        
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
        
        <Toggle
          value={showRGBLabels}
          onValueChange={setShowRGBLabels}
          label="Mostrar etiquetas RGB"
          description="Muestra las etiquetas R, G, B y valores numéricos en los sliders"
        />
      </View>
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
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  settingsContainer: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
  },
});
