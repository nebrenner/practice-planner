import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Button,
  Alert,
  Platform,
  ScrollView,
} from 'react-native';
import { Link } from 'expo-router';
import * as FileSystem from 'expo-file-system/legacy';
import * as DocumentPicker from 'expo-document-picker';
import { shareAsync } from 'expo-sharing';
import { useData } from '../src/contexts/DataContext';
import {
  BackupFileNotFoundError,
  BackupPermissionError,
  chooseBackupFolder,
  getBackupDirUri,
  loadBackupJson,
  saveBackupJson,
  setBackupDirUri as persistBackupDirUri,
} from '../src/features/backup';

const BACKUP_FILE_NAME = 'practice-planner.json';

function getProviderAuthority(uri?: string | null) {
  if (!uri) return null;
  const match = /^content:\/\/([^/]+)/.exec(uri);
  if (match) {
    return match[1];
  }
  return null;
}

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
  const [backupDirUri, setBackupDirUriState] = useState<string | undefined>();

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    getBackupDirUri()
      .then((uri) => setBackupDirUriState(uri ?? undefined))
      .catch(() => {});
  }, []);

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

  const ensureBackupFolder = async () => {
    let uri = backupDirUri;
    if (uri) return uri;

    try {
      const stored = await getBackupDirUri();
      if (stored) {
        setBackupDirUriState(stored);
        return stored;
      }
    } catch (error) {
      showError('Unable to access backup settings', error);
      return undefined;
    }

    try {
      const selected = await chooseBackupFolder();
      if (selected) {
        setBackupDirUriState(selected);
        return selected;
      }
    } catch (error) {
      showError('Unable to open folder picker', error);
    }

    return undefined;
  };

  const handleSetBackupFolder = async () => {
    try {
      const uri = await chooseBackupFolder(backupDirUri);
      if (!uri) return;
      setBackupDirUriState(uri);
      const authority = getProviderAuthority(uri);
      showMessage(
        'Backup folder set',
        authority
          ? `Future saves and loads will use the folder provided by ${authority}.`
          : 'Future saves and loads will use the selected folder.',
      );
    } catch (error) {
      showError('Unable to open folder picker', error);
    }
  };

  const handleSaveToFolder = async () => {
    if (Platform.OS !== 'android') {
      showMessage('Not supported', 'Backup folders are only available on Android.');
      return;
    }

    try {
      const directoryUri = await ensureBackupFolder();
      if (!directoryUri) return;

      const snapshot = exportAllData();
      const payload = JSON.stringify(snapshot, null, 2);
      const result = await saveBackupJson(BACKUP_FILE_NAME, payload);
      const authority = getProviderAuthority(result.directoryUri);
      showMessage(
        'Backup saved',
        authority
          ? `Saved ${BACKUP_FILE_NAME} to ${authority}.`
          : `Saved ${BACKUP_FILE_NAME} to your backup folder.`,
      );
    } catch (error) {
      if (error instanceof BackupPermissionError) {
        setBackupDirUriState(undefined);
        await persistBackupDirUri(undefined);
        showMessage(
          'Backup folder access lost',
          'We no longer have permission to use your backup folder. Please choose it again.',
        );
        return;
      }
      showError('Save failed', error);
    }
  };

  const performLoadFromFolder = async () => {
    if (Platform.OS !== 'android') {
      showMessage('Not supported', 'Backup folders are only available on Android.');
      return;
    }

    try {
      const directoryUri = await ensureBackupFolder();
      if (!directoryUri) return;

      const result = await loadBackupJson(BACKUP_FILE_NAME);
      try {
        const parsed = JSON.parse(result.contents);
        importAllData(parsed);
        const authority = getProviderAuthority(result.directoryUri);
        showMessage(
          'Backup loaded',
          authority
            ? `Replaced your data from ${BACKUP_FILE_NAME} stored in ${authority}.`
            : `Replaced your data from ${BACKUP_FILE_NAME}.`,
        );
      } catch (error) {
        showError('Load failed', error);
      }
    } catch (error) {
      if (error instanceof BackupPermissionError) {
        setBackupDirUriState(undefined);
        await persistBackupDirUri(undefined);
        showMessage(
          'Backup folder access lost',
          'We no longer have permission to use your backup folder. Please choose it again.',
        );
        return;
      }
      if (error instanceof BackupFileNotFoundError) {
        showMessage(
          'Backup file not found',
          `Could not find ${error.fileName} in the selected folder.`,
        );
        return;
      }
      showError('Load failed', error);
    }
  };

  const handleLoadFromFolder = () => {
    const warning =
      'Loading from your backup folder will overwrite all teams, drills, practices, and templates.';

    Alert.alert('Replace all data?', warning, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Load',
        style: 'destructive',
        onPress: () => {
          void performLoadFromFolder();
        },
      },
    ]);
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
    <ScrollView contentContainerStyle={styles.container} style={styles.scrollView}>
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
        {Platform.OS === 'android' ? (
          <>
            <Text style={styles.sectionSubtitle}>Android backup folder</Text>
            <Text style={styles.statusText}>
              {backupDirUri
                ? (() => {
                    const authority = getProviderAuthority(backupDirUri);
                    return authority
                      ? `Using folder from ${authority}.`
                      : 'Using your selected backup folder.';
                  })()
                : 'No backup folder selected yet.'}
            </Text>
            <Text style={styles.noteText}>
              Saves use {BACKUP_FILE_NAME}. The file will be replaced each time you tap
              Save.
            </Text>
            <Button
              title={backupDirUri ? 'Change Backup Folder' : 'Set Backup Folder'}
              onPress={() => {
                void handleSetBackupFolder();
              }}
            />
            <View style={styles.buttonSpacer} />
            <Button
              title="Save to Folder"
              onPress={() => {
                void handleSaveToFolder();
              }}
            />
            <View style={styles.buttonSpacer} />
            <Button
              title="Load from Folder"
              color="#d9534f"
              onPress={handleLoadFromFolder}
            />
            <View style={styles.sectionDivider} />
          </>
        ) : null}
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
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
  sectionSubtitle: {
    marginBottom: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  sectionDescription: {
    marginBottom: 16,
    color: '#444444',
    lineHeight: 20,
  },
  statusText: {
    marginBottom: 12,
    color: '#555555',
  },
  noteText: {
    marginBottom: 12,
    color: '#666666',
    lineHeight: 18,
  },
  buttonSpacer: {
    height: 12,
  },
  sectionDivider: {
    marginTop: 16,
    marginBottom: 20,
    alignSelf: 'stretch',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#cccccc',
  },
});
