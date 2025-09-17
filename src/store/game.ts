import { create } from 'zustand';
// import { MMKV } from 'react-native-mmkv';

// const storage = new MMKV({
//   id: 'colorea',
// });

interface GameState {
  bestDaily: number;
  setBestDaily: (score: number) => void;
  resetBestDaily: () => void;
  showPrecisionBar: boolean;
  setShowPrecisionBar: (show: boolean) => void;
  showHexValue: boolean;
  setShowHexValue: (show: boolean) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  bestDaily: 0, // storage.getNumber('bestDaily') || 0,
  showPrecisionBar: true, // storage.getBoolean('showPrecisionBar') ?? true,
  showHexValue: true, // storage.getBoolean('showHexValue') ?? true,
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
  
  setShowPrecisionBar: (show: boolean) => {
    set({ showPrecisionBar: show });
    // storage.set('showPrecisionBar', show);
  },
  
  setShowHexValue: (show: boolean) => {
    set({ showHexValue: show });
    // storage.set('showHexValue', show);
  },
}));
