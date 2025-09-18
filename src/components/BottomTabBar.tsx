import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useGameStore } from '@/store/game';
import { getTheme } from '@/utils/theme';

const TAB_ITEMS = [
  {
    id: 'daily',
    label: 'Reto Diario',
    icon: '⭐',
    route: 'Daily'
  },
  {
    id: 'games',
    label: 'Juegos',
    icon: '🎨',
    route: 'Games'
  },
  {
    id: 'settings',
    label: 'Ajustes',
    icon: '🔧',
    route: 'Settings'
  }
];

export const BottomTabBar: React.FC<BottomTabBarProps> = ({ state, navigation }) => {
  const { isDarkMode } = useGameStore();
  const theme = getTheme(isDarkMode);
  
  const handleTabPress = (routeName: string) => {
    const event = navigation.emit({
      type: 'tabPress',
      target: state.routes.find(route => route.name === routeName)?.key,
      canPreventDefault: true,
    });

    if (!event.defaultPrevented) {
      navigation.navigate(routeName as never);
    }
  };

  return (
    <View style={[
      styles.container, 
      { 
        backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.95)',
        borderTopColor: theme.border
      }
    ]}>
      {TAB_ITEMS.map((item) => {
        const isActive = state.routes[state.index].name === item.route;
        return (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.tabItem,
              isActive && { backgroundColor: theme.surface }
            ]}
            onPress={() => handleTabPress(item.route)}
          >
            <Text style={[
              styles.tabIcon,
              isActive && styles.activeTabIcon
            ]}>
              {item.icon}
            </Text>
            <Text style={[
              styles.tabLabel,
              { color: isActive ? theme.text : theme.textSecondary }
            ]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingBottom: 8,
    paddingTop: 8,
    paddingHorizontal: 16,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  activeTabIcon: {
    fontSize: 22,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
});
