import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { PrimaryButton } from '@/components';
import { useGameStore } from '@/store/game';
import { getTheme } from '@/utils/theme';

type RootStackParamList = {
  Home: undefined;
  Settings: undefined;
  ModeDaily: undefined;
  ColorChain: { isDaily?: boolean };
  GradientGap: undefined;
  MemoryMix: undefined;
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { getOverallAverage, isDarkMode } = useGameStore();
  const theme = getTheme(isDarkMode);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: theme.text }]}>Colorea</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Domina el arte de los colores
          </Text>
        </View>
      </View>

      <View style={[styles.statsContainer, { backgroundColor: theme.surface }]}>
        <Text style={[styles.statsLabel, { color: theme.textSecondary }]}>Mejor precisión general</Text>
        <Text style={[styles.statsValue, { color: theme.text }]}>{getOverallAverage()}%</Text>
      </View>

      <View style={styles.buttonsContainer}>
        <PrimaryButton
          title="Color Chain"
          onPress={() => navigation.navigate('ColorChain', { isDaily: false })}
          style={styles.button}
        />

        <PrimaryButton
          title="Gradient Gap"
          onPress={() => navigation.navigate('GradientGap')}
          style={styles.button}
        />

        <PrimaryButton
          title="Memory Mix"
          onPress={() => navigation.navigate('MemoryMix')}
          style={styles.button}
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
    marginBottom: 40,
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
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
  statsContainer: {
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 40,
  },
  statsLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  statsValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  buttonsContainer: {
    gap: 16,
  },
  button: {
    marginBottom: 0,
  },
});