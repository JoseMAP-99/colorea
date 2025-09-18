import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { RGB } from '@/utils/color';
import { useGameStore } from '@/store/game';
import { getTheme } from '@/utils/theme';

interface RGBSlidersProps {
  rgb: RGB;
  onRGBChange: (rgb: RGB) => void;
  disabled?: boolean;
  onSliderPress?: () => void;
  onSliderRelease?: () => void;
}

export const RGBSliders: React.FC<RGBSlidersProps> = ({
  rgb,
  onRGBChange,
  disabled = false,
  onSliderPress,
  onSliderRelease,
}) => {
  const { showRGBLabels, isDarkMode } = useGameStore();
  const theme = getTheme(isDarkMode);
  
  const updateChannel = (channel: keyof RGB, value: number) => {
    const newRGB = { ...rgb, [channel]: Math.round(value) };
    onRGBChange(newRGB);
  };

  return (
    <View style={styles.container}>
      <View style={styles.sliderContainer}>
        {showRGBLabels && <Text style={[styles.label, { color: theme.text }]}>R</Text>}
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={255}
          value={rgb.r}
          onValueChange={(value) => updateChannel('r', value)}
          onSlidingStart={onSliderPress}
          onSlidingComplete={onSliderRelease}
          minimumTrackTintColor="#FF0000"
          maximumTrackTintColor={theme.border}
          step={1}
          disabled={disabled}
        />
        {showRGBLabels && <Text style={[styles.value, { color: theme.text }]}>{rgb.r}</Text>}
      </View>

      <View style={styles.sliderContainer}>
        {showRGBLabels && <Text style={[styles.label, { color: theme.text }]}>G</Text>}
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={255}
          value={rgb.g}
          onValueChange={(value) => updateChannel('g', value)}
          onSlidingStart={onSliderPress}
          onSlidingComplete={onSliderRelease}
          minimumTrackTintColor="#00FF00"
          maximumTrackTintColor={theme.border}
          step={1}
          disabled={disabled}
        />
        {showRGBLabels && <Text style={[styles.value, { color: theme.text }]}>{rgb.g}</Text>}
      </View>

      <View style={styles.sliderContainer}>
        {showRGBLabels && <Text style={[styles.label, { color: theme.text }]}>B</Text>}
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={255}
          value={rgb.b}
          onValueChange={(value) => updateChannel('b', value)}
          onSlidingStart={onSliderPress}
          onSlidingComplete={onSliderRelease}
          minimumTrackTintColor="#0000FF"
          maximumTrackTintColor={theme.border}
          step={1}
          disabled={disabled}
        />
        {showRGBLabels && <Text style={[styles.value, { color: theme.text }]}>{rgb.b}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 16,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    width: 20,
    textAlign: 'center',
  },
  slider: {
    flex: 1,
    height: 50,
    marginHorizontal: 20,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    width: 40,
    textAlign: 'center',
  },
});
