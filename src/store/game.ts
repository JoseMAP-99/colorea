import { create } from 'zustand';
// import { MMKV } from 'react-native-mmkv';

// const storage = new MMKV({
//   id: 'colorea',
// });

interface GameState {
  bestDaily: number;
  setBestDaily: (score: number) => void;
  resetBestDaily: () => void;
  bestColorChain: number;
  setBestColorChain: (score: number) => void;
  bestGradientGap: number;
  setBestGradientGap: (score: number) => void;
  bestMemoryMix: number;
  setBestMemoryMix: (score: number) => void;
  dailyChallengeCompleted: boolean;
  setDailyChallengeCompleted: (completed: boolean) => void;
  dailyChallengeScore: number;
  setDailyChallengeScore: (score: number) => void;
  dailyChallengeDate: string;
  setDailyChallengeDate: (date: string) => void;
  isDarkMode: boolean;
  setIsDarkMode: (isDark: boolean) => void;
  showPrecisionBar: boolean;
  setShowPrecisionBar: (show: boolean) => void;
  showHexValue: boolean;
  setShowHexValue: (show: boolean) => void;
  showRGBLabels: boolean;
  setShowRGBLabels: (show: boolean) => void;
  getOverallAverage: () => number;
}

export const useGameStore = create<GameState>((set, get) => ({
  bestDaily: 0, // storage.getNumber('bestDaily') || 0,
  bestColorChain: 0, // storage.getNumber('bestColorChain') || 0,
  bestGradientGap: 0, // storage.getNumber('bestGradientGap') || 0,
  bestMemoryMix: 0, // storage.getNumber('bestMemoryMix') || 0,
  dailyChallengeCompleted: false, // storage.getBoolean('dailyChallengeCompleted') ?? false,
  dailyChallengeScore: 0, // storage.getNumber('dailyChallengeScore') || 0,
  dailyChallengeDate: '', // storage.getString('dailyChallengeDate') || '',
  isDarkMode: true, // storage.getBoolean('isDarkMode') ?? true,
  showPrecisionBar: false, // storage.getBoolean('showPrecisionBar') ?? false,
  showHexValue: false, // storage.getBoolean('showHexValue') ?? false,
  showRGBLabels: false, // storage.getBoolean('showRGBLabels') ?? false,
  setBestDaily: (score: number) => {
    const currentBest = get().bestDaily;
    if (score > currentBest) {
      set({ bestDaily: score });
      // storage.set('bestDaily', score);
    }
  },
  
  resetBestDaily: () => {
    set({ bestDaily: 0 });
    // storage.delete('bestDaily');
  },
  
  setBestColorChain: (score: number) => {
    const currentBest = get().bestColorChain;
    if (score > currentBest) {
      set({ bestColorChain: score });
      // storage.set('bestColorChain', score);
    }
  },
  
  setBestGradientGap: (score: number) => {
    const currentBest = get().bestGradientGap;
    if (score > currentBest) {
      set({ bestGradientGap: score });
      // storage.set('bestGradientGap', score);
    }
  },
  
  setBestMemoryMix: (score: number) => {
    const currentBest = get().bestMemoryMix;
    if (score > currentBest) {
      set({ bestMemoryMix: score });
      // storage.set('bestMemoryMix', score);
    }
  },
  
  setDailyChallengeCompleted: (completed: boolean) => {
    set({ dailyChallengeCompleted: completed });
    // storage.set('dailyChallengeCompleted', completed);
  },
  
  setDailyChallengeScore: (score: number) => {
    set({ dailyChallengeScore: score });
    // storage.set('dailyChallengeScore', score);
  },
  
  setDailyChallengeDate: (date: string) => {
    set({ dailyChallengeDate: date });
    // storage.set('dailyChallengeDate', date);
  },
  
  setIsDarkMode: (isDark: boolean) => {
    set({ isDarkMode: isDark });
    // storage.set('isDarkMode', isDark);
  },
  
  setShowPrecisionBar: (show: boolean) => {
    set({ showPrecisionBar: show });
    // storage.set('showPrecisionBar', show);
  },
  
  setShowHexValue: (show: boolean) => {
    set({ showHexValue: show });
    // storage.set('showHexValue', show);
  },
  
  setShowRGBLabels: (show: boolean) => {
    set({ showRGBLabels: show });
    // storage.set('showRGBLabels', show);
  },
  
  getOverallAverage: () => {
    const { bestColorChain, bestGradientGap, bestMemoryMix } = get();
    const values = [bestColorChain, bestGradientGap, bestMemoryMix].filter(val => val > 0);
    if (values.length === 0) return 0;
    return Math.round(values.reduce((sum, val) => sum + val, 0) / values.length);
  },
}));
