import { Stack } from 'expo-router';
import { DataProvider } from '../src/contexts/DataContext';
import Header from '../src/components/Header';

export default function RootLayout() {
  return (
    <DataProvider>
      <Stack screenOptions={{ header: () => <Header /> }} />
    </DataProvider>
  );
}

