import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { 
  HomeScreen, 
  ModeDailyScreen, 
  ColorChainScreen, 
  GradientGapScreen, 
  MemoryMixScreen,
  SettingsScreen
} from '@/screens';

export type RootStackParamList = {
  Home: undefined;
  Settings: undefined;
  ModeDaily: undefined;
  ColorChain: { isDaily?: boolean };
  GradientGap: { isDaily?: boolean };
  MemoryMix: { isDaily?: boolean };
};

const Stack = createStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
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
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="ModeDaily" component={ModeDailyScreen} />
        <Stack.Screen name="ColorChain" component={ColorChainScreen} />
        <Stack.Screen name="GradientGap" component={GradientGapScreen} />
        <Stack.Screen name="MemoryMix" component={MemoryMixScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
