import { Stack } from 'expo-router';
import { DataProvider } from '../src/contexts/DataContext';

export default function RootLayout() {
  return (
    <DataProvider>
      <Stack />
    </DataProvider>
  );
}

