import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { DataProvider } from '../src/contexts/DataContext';
import Header from '../src/components/Header';

export default function RootLayout() {
  return (
    <DataProvider>
      <SafeAreaProvider>
        <StatusBar translucent={false} style="auto" />
        <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
          <Stack screenOptions={{ header: () => <Header /> }} />
        </SafeAreaView>
      </SafeAreaProvider>
    </DataProvider>
  );
}

