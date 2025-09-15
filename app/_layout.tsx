import { useEffect } from 'react';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as SystemUI from 'expo-system-ui';
import { DataProvider } from '../src/contexts/DataContext';
import Header from '../src/components/Header';

export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS === 'android') {
      SystemUI.setBackgroundColorAsync('#000000').catch(() => {
        // Ignore failures when the system UI module is unavailable.
      });
    }
  }, []);

  const statusBarStyle = Platform.OS === 'android' ? 'light' : 'auto';

  return (
    <DataProvider>
      <SafeAreaProvider>
        <StatusBar
          translucent={false}
          style={statusBarStyle}
          backgroundColor={Platform.OS === 'android' ? '#000000' : undefined}
        />
        <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }} edges={['bottom']}>
          <Stack screenOptions={{ header: () => <Header /> }} />
        </SafeAreaView>
      </SafeAreaProvider>
    </DataProvider>
  );
}

