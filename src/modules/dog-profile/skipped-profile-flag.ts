import {
  deleteAsync,
  getInfoAsync,
  readAsStringAsync,
  writeAsStringAsync,
} from 'expo-file-system/legacy';

import { resolveDocumentFileUri } from '@/modules/local-photo';

import { notifyProfileDiskChanged } from './profile-disk-events';

const SKIP_FLAG_RELATIVE_PATH = 'dog-profile-skip.json';

function skipFlagUri(): string | null {
  return resolveDocumentFileUri(SKIP_FLAG_RELATIVE_PATH);
}

export async function loadSkippedDogProfile(): Promise<boolean> {
  const uri = skipFlagUri();
  if (!uri) return false;
  const info = await getInfoAsync(uri);
  if (!info.exists || info.isDirectory) return false;
  try {
    const raw = await readAsStringAsync(uri);
    const o = JSON.parse(raw) as { skipped?: unknown };
    return o?.skipped === true;
  } catch {
    return false;
  }
}

export async function setSkippedDogProfile(): Promise<void> {
  const uri = skipFlagUri();
  if (!uri) {
    throw new Error('Cannot persist skip: document directory is unavailable');
  }
  await writeAsStringAsync(uri, JSON.stringify({ skipped: true }));
  notifyProfileDiskChanged();
}

export async function deleteSkippedDogProfileFile(): Promise<void> {
  const uri = skipFlagUri();
  if (!uri) return;
  const info = await getInfoAsync(uri);
  if (info.exists) {
    await deleteAsync(uri, { idempotent: true });
  }
}
