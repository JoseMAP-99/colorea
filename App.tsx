/**
 * Colorea App
 * 
 * @format
 */

import React from 'react';
import { StatusBar } from 'react-native';
import { AppNavigator } from './src/navigation/AppNavigator';

function App(): React.JSX.Element {
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0b0b0b" />
      <AppNavigator />
    </>
  );
}

export default App;
