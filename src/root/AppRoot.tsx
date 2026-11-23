import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { ThemeProvider, useTheme } from '../theme/ThemeContext';
import { RootNavigator } from '../navigation/RootNavigator';
import { initDatabase } from '../services/database';
import { useTrashStore } from '../store/trashStore';
import { useSettingsStore } from '../store/settingsStore';

function NavigationWrapper() {
  const { isDark } = useTheme();

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </>
  );
}

export function AppRoot() {
  useEffect(() => {
    initDatabase().then(() => {
      useSettingsStore.getState().loadSettings();
      useTrashStore.getState().loadTrash();
      useTrashStore.getState().cleanupExpired();
    });
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <ThemeProvider>
          <NavigationWrapper />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
