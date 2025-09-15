import { Alert, Platform } from 'react-native';
import type { Drill } from '../contexts/DataContext';

const DEFAULT_MESSAGE = 'No description provided.';

export function showDrillDescription(drill?: Pick<Drill, 'name' | 'description'>) {
  if (!drill) {
    return;
  }

  const message = drill.description?.trim() ? drill.description : DEFAULT_MESSAGE;

  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && typeof window.alert === 'function') {
      window.alert(`${drill.name}\n\n${message}`);
    } else {
      // eslint-disable-next-line no-console
      console.warn('Unable to display drill description: alert is not available.');
    }
    return;
  }

  Alert.alert(drill.name, message);
}
