import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { PrimaryButton } from '@/components';
import { useGameStore } from '@/store/game';

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
  const { bestDaily } = useGameStore();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Colorea</Text>
            <Text style={styles.subtitle}>
              Domina el arte de los colores
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.settingsIcon}
            onPress={() => navigation.navigate('Settings')}
          >
            <Text style={styles.gearIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <Text style={styles.statsLabel}>Mejor precisión diaria</Text>
        <Text style={styles.statsValue}>{bestDaily}%</Text>
      </View>


      <View style={styles.buttonsContainer}>
        <PrimaryButton
          title="Reto Diario"
          onPress={() => navigation.navigate('ModeDaily')}
          style={styles.button}
        />

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
    backgroundColor: '#0b0b0b',
  },
  content: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 40,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
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
  settingsIcon: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginLeft: 10,
  },
  gearIcon: {
    fontSize: 24,
  },
  statsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 40,
  },
  statsLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  statsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  buttonsContainer: {
    gap: 16,
  },
  button: {
    marginBottom: 0,
  },
});