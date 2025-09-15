import { useRef } from 'react';
import type { ChangeEvent } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Button,
  Alert,
  Platform,
} from 'react-native';
import { Link } from 'expo-router';
import * as FileSystem from 'expo-file-system/legacy';
import * as DocumentPicker from 'expo-document-picker';
import { shareAsync } from 'expo-sharing';
import { useData } from '../src/contexts/DataContext';

function formatForFileName(date: Date) {
  const pad = (value: number) => value.toString().padStart(2, '0');
  return (
    `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-` +
    `${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`
  );
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return 'Something went wrong. Please try again.';
}

export default function HomeScreen() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { exportAllData, importAllData } = useData();

  const showMessage = (title: string, message?: string) => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        const text = message ? `${title}\n\n${message}` : title;
        window.alert(text);
      }
    } else {
      Alert.alert(title, message);
    }
  };

  const showError = (title: string, error: unknown) => {
    showMessage(title, getErrorMessage(error));
  };

  const handleImportContent = (text: string) => {
    try {
      const parsed = JSON.parse(text);
      importAllData(parsed);
      showMessage(
        'Import complete',
        'Existing data has been replaced with the imported backup.',
      );
    } catch (error) {
      showError('Import failed', error);
    }
  };

  const handleExport = async () => {
    const snapshot = exportAllData();
    const payload = JSON.stringify(snapshot, null, 2);
    const fileName = `practice-planner-${formatForFileName(new Date())}.json`;

    try {
      if (Platform.OS === 'web') {
        if (typeof document === 'undefined') {
          throw new Error('Downloading files is not supported in this environment.');
        }
        const blob = new Blob([payload], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        showMessage('Export started', 'Your data download should begin shortly.');
        return;
      }

      const directory =
        FileSystem.documentDirectory ?? FileSystem.cacheDirectory ?? '';
      if (!directory) {
        throw new Error('No writable directory is available for exports.');
      }
      const fileUri = directory + fileName;
      await FileSystem.writeAsStringAsync(fileUri, payload, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      await shareAsync(fileUri, {
        mimeType: 'application/json',
        dialogTitle: 'Share Practice Planner data',
        UTI: 'public.json',
      });
    } catch (error) {
      showError('Export failed', error);
    }
  };

  const pickFileForNative = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets?.length) {
        return;
      }
      const asset = result.assets[0];
      const content = await FileSystem.readAsStringAsync(asset.uri, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      handleImportContent(content);
    } catch (error) {
      showError('Import failed', error);
    }
  };

  const requestImport = () => {
    const warning =
      'Importing a backup will overwrite all existing teams, drills, practices, and templates.';

    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm(`${warning}\n\nContinue?`)) {
        fileInputRef.current?.click();
      }
      return;
    }

    Alert.alert('Replace all data?', warning, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Import', style: 'destructive', onPress: pickFileForNative },
    ]);
  };

  const handleWebFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== 'string') {
        showError('Import failed', new Error('Unable to read the selected file.'));
        return;
      }
      handleImportContent(result);
    };
    reader.onerror = () => {
      showError('Import failed', new Error('Unable to read the selected file.'));
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Practice Planner</Text>
      <Text>Plan practices and run sessions offline.</Text>
      <View style={styles.links}>
        <Link href="/teams" style={styles.link}>
          Manage Teams
        </Link>
        <Link href="/drills" style={styles.link}>
          Manage Drills
        </Link>
        <Link href="/practices" style={styles.link}>
          Manage Practices
        </Link>
        <Link href="/templates" style={styles.link}>
          Manage Templates
        </Link>
      </View>
      <View style={styles.backupSection}>
        <Text style={styles.sectionTitle}>Backups</Text>
        <Text style={styles.sectionDescription}>
          Export all teams, drills, practices, and templates to a JSON file, or
          replace everything from an existing backup.
        </Text>
        <Button title="Export Data" onPress={handleExport} />
        <View style={styles.buttonSpacer} />
        <Button title="Import Data" color="#d9534f" onPress={requestImport} />
      </View>
      {Platform.OS === 'web' ? (
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          style={{ display: 'none' }}
          onChange={handleWebFileChange}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  links: {
    marginTop: 24,
    width: '100%',
  },
  link: {
    fontSize: 18,
    color: 'blue',
    marginVertical: 8,
  },
  backupSection: {
    marginTop: 40,
    width: '100%',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionDescription: {
    marginBottom: 16,
    color: '#444444',
    lineHeight: 20,
  },
  buttonSpacer: {
    height: 12,
  },
});
