import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { 
  HomeScreen, 
  ModeDailyScreen, 
  ColorChainScreen, 
  GradientGapScreen, 
  MemoryMixScreen,
  SettingsScreen
} from '@/screens';
import { BottomTabBar } from '@/components';

export type RootStackParamList = {
  MainTabs: undefined;
  ColorChain: { isDaily?: boolean };
  GradientGap: { isDaily?: boolean };
  MemoryMix: { isDaily?: boolean };
};

export type MainTabParamList = {
  Daily: undefined;
  Games: undefined;
  Settings: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Componente de pestañas principales
const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <BottomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' }, // Ocultamos la barra nativa
      }}
    >
      <Tab.Screen name="Daily" component={ModeDailyScreen} />
      <Tab.Screen name="Games" component={HomeScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="MainTabs"
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
          gestureDirection: 'horizontal',
          cardStyle: {
            backgroundColor: '#0b0b0b',
          },
          cardStyleInterpolator: ({ current, layouts }) => {
            return {
              cardStyle: {
                transform: [
                  {
                    translateX: current.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [layouts.screen.width, 0],
                    }),
                  },
                ],
                opacity: current.progress.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0, 1, 1],
                }),
              },
            };
          },
          transitionSpec: {
            open: {
              animation: 'timing',
              config: {
                duration: 300,
              },
            },
            close: {
              animation: 'timing',
              config: {
                duration: 250,
              },
            },
          },
        }}
      >
        <Stack.Screen name="MainTabs" component={MainTabNavigator} />
        <Stack.Screen name="ColorChain" component={ColorChainScreen} />
        <Stack.Screen name="GradientGap" component={GradientGapScreen} />
        <Stack.Screen name="MemoryMix" component={MemoryMixScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};