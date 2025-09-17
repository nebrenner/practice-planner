import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';

const STORAGE_KEY = 'settings.backupDirUri';
const JSON_MIME_TYPE = 'application/json';
const DEFAULT_PERMISSION_MESSAGE =
  'Access to the selected backup folder was revoked. Please choose it again.';

export class BackupFolderNotSetError extends Error {
  constructor() {
    super('No backup folder has been selected yet.');
    this.name = 'BackupFolderNotSetError';
  }
}

export class BackupFileNotFoundError extends Error {
  constructor(public readonly fileName: string) {
    super(`File not found: ${fileName}`);
    this.name = 'BackupFileNotFoundError';
  }
}

export class BackupPermissionError extends Error {
  constructor(message = DEFAULT_PERMISSION_MESSAGE) {
    super(message);
    this.name = 'BackupPermissionError';
  }
}

export type BackupSaveResult = {
  directoryUri: string;
  fileUri: string;
};

export type BackupLoadResult = {
  directoryUri: string;
  fileUri: string;
  contents: string;
};

function requireSaf(): NonNullable<typeof FileSystem.StorageAccessFramework> {
  if (Platform.OS !== 'android') {
    throw new Error('The Storage Access Framework is only available on Android.');
  }

  const saf = FileSystem.StorageAccessFramework;
  if (!saf) {
    throw new Error('Storage Access Framework is not available on this device.');
  }
  return saf;
}

function handleSafError(error: unknown): never {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (
      message.includes('permission') ||
      message.includes('access') ||
      message.includes('denied') ||
      message.includes('revoked')
    ) {
      throw new BackupPermissionError();
    }
    throw error;
  }

  throw new Error('Unexpected Storage Access Framework error.');
}

async function requireBackupDirUri(): Promise<string> {
  const directoryUri = await getBackupDirUri();
  if (!directoryUri) {
    throw new BackupFolderNotSetError();
  }
  return directoryUri;
}

export async function getBackupDirUri(): Promise<string | undefined> {
  const value = await AsyncStorage.getItem(STORAGE_KEY);
  return value ?? undefined;
}

export async function setBackupDirUri(uri?: string): Promise<void> {
  if (!uri) {
    await AsyncStorage.removeItem(STORAGE_KEY);
    return;
  }
  await AsyncStorage.setItem(STORAGE_KEY, uri);
}

export async function chooseBackupFolder(
  initialUri?: string,
): Promise<string | undefined> {
  const saf = requireSaf();
  const result = await saf.requestDirectoryPermissionsAsync(initialUri);
  if (result.granted && result.directoryUri) {
    await setBackupDirUri(result.directoryUri);
    return result.directoryUri;
  }
  return undefined;
}

export async function saveBackupJson(
  fileName: string,
  contents: string,
): Promise<BackupSaveResult> {
  const saf = requireSaf();
  const directoryUri = await requireBackupDirUri();

  let entries: string[] = [];
  try {
    entries = await saf.readDirectoryAsync(directoryUri);
  } catch (error) {
    handleSafError(error);
  }

  let targetUri = entries.find((uri) => uri.endsWith(`/${fileName}`));

  if (!targetUri) {
    try {
      targetUri = await saf.createFileAsync(directoryUri, fileName, JSON_MIME_TYPE);
    } catch (error) {
      handleSafError(error);
    }
  }

  if (!targetUri) {
    throw new Error('Unable to resolve the backup file location.');
  }

  try {
    await FileSystem.writeAsStringAsync(targetUri, contents, {
      encoding: FileSystem.EncodingType.UTF8,
    });
  } catch (error) {
    handleSafError(error);
  }

  return { directoryUri, fileUri: targetUri };
}

export async function loadBackupJson(fileName: string): Promise<BackupLoadResult> {
  const saf = requireSaf();
  const directoryUri = await requireBackupDirUri();

  let entries: string[] = [];
  try {
    entries = await saf.readDirectoryAsync(directoryUri);
  } catch (error) {
    handleSafError(error);
  }

  const fileUri = entries.find((uri) => uri.endsWith(`/${fileName}`));
  if (!fileUri) {
    throw new BackupFileNotFoundError(fileName);
  }

  try {
    const contents = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    return { directoryUri, fileUri, contents };
  } catch (error) {
    handleSafError(error);
  }
}
