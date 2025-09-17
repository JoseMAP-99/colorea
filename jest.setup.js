import 'react-native-gesture-handler/jestSetup';

// Mock react-native-reanimated
global.jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Silence the warning: Animated: `useNativeDriver` is not supported
global.jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
