import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { RGB } from '@/utils/color';
import { useGameStore } from '@/store/game';

interface RGBWheelsProps {
  rgb: RGB;
  onRGBChange: (rgb: RGB) => void;
  disabled?: boolean;
  onPress?: () => void;
  onRelease?: () => void;
}

export const RGBWheels: React.FC<RGBWheelsProps> = ({
  rgb,
  onRGBChange,
  disabled = false,
  onPress,
  onRelease,
}) => {
  const { showRGBLabels } = useGameStore();
  
  const updateChannel = (channel: keyof RGB, value: number) => {
    const newValue = Math.max(0, Math.min(255, value));
    const newRGB = { ...rgb, [channel]: newValue };
    onRGBChange(newRGB);
  };

  const handlePress = (channel: keyof RGB, delta: number) => {
    if (disabled) return;
    updateChannel(channel, rgb[channel] + delta);
    onPress?.();
  };

  const handleRelease = () => {
    onRelease?.();
  };

  const ColorWheel = ({ channel, color, label }: { 
    channel: keyof RGB; 
    color: string; 
    label: string;
  }) => {
    const value = rgb[channel];
    const percentage = (value / 255) * 100;
    
    return (
      <View style={styles.wheelContainer}>
        {showRGBLabels && (
          <Text style={[styles.label, { color }]}>{label}</Text>
        )}
        
        <View style={styles.wheelWrapper}>
          <View style={[styles.wheel, { borderColor: color }]}>
            <View 
              style={[
                styles.wheelFill, 
                { 
                  backgroundColor: color,
                  height: `${percentage}%`,
                  opacity: 0.3 + (percentage / 100) * 0.7
                }
              ]} 
            />
            <View style={styles.wheelCenter}>
              <Text style={[styles.wheelValue, { color }]}>{value}</Text>
            </View>
          </View>
          
          <View style={styles.controls}>
            <TouchableOpacity
              style={[styles.controlButton, { borderColor: color }]}
              onPress={() => handlePress(channel, -10)}
              onPressIn={() => onPress?.()}
              onPressOut={handleRelease}
              disabled={disabled}
            >
              <Text style={[styles.controlText, { color }]}>-10</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.controlButton, { borderColor: color }]}
              onPress={() => handlePress(channel, -1)}
              onPressIn={() => onPress?.()}
              onPressOut={handleRelease}
              disabled={disabled}
            >
              <Text style={[styles.controlText, { color }]}>-1</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.controlButton, { borderColor: color }]}
              onPress={() => handlePress(channel, 1)}
              onPressIn={() => onPress?.()}
              onPressOut={handleRelease}
              disabled={disabled}
            >
              <Text style={[styles.controlText, { color }]}>+1</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.controlButton, { borderColor: color }]}
              onPress={() => handlePress(channel, 10)}
              onPressIn={() => onPress?.()}
              onPressOut={handleRelease}
              disabled={disabled}
            >
              <Text style={[styles.controlText, { color }]}>+10</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.wheelsRow}>
        <ColorWheel channel="r" color="#FF4444" label="R" />
        <ColorWheel channel="g" color="#44FF44" label="G" />
        <ColorWheel channel="b" color="#4444FF" label="B" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  wheelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    gap: 20,
  },
  wheelContainer: {
    alignItems: 'center',
    gap: 12,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  wheelWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheel: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  wheelFill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  wheelCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  wheelValue: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  controls: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  controlButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    minWidth: 40,
    alignItems: 'center',
  },
  controlText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});
