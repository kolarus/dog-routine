import {
  copyAsync,
  deleteAsync,
  documentDirectory,
  getInfoAsync,
} from 'expo-file-system/legacy';

/** One safe path segment: letters, digits, `.`, `_`, `-`; must not start with `.` for clarity. */
const SEGMENT = /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/;

/**
 * Normalizes and validates a path relative to {@link documentDirectory}.
 * Rejects `..`, absolute paths, and odd segments so uploads / copies cannot escape the sandbox.
 */
export function normalizeDocumentRelativePath(relativePath: string): string {
  const trimmed = relativePath.trim().replace(/^\/+/, '');
  if (!trimmed || trimmed.includes('..')) {
    throw new Error(`Invalid relativePath: ${relativePath}`);
  }
  const segments = trimmed.split('/').filter(Boolean);
  if (segments.length === 0 || segments.length > 4) {
    throw new Error('relativePath must use 1–4 segments (e.g. "dog-avatar.jpg" or "media/avatar.jpg")');
  }
  for (const s of segments) {
    if (!SEGMENT.test(s)) {
      throw new Error(`Invalid path segment: ${s}`);
    }
  }
  return segments.join('/');
}

export function resolveDocumentFileUri(relativePath: string): string | null {
  const rel = normalizeDocumentRelativePath(relativePath);
  if (!documentDirectory) return null;
  return `${documentDirectory}${rel}`;
}

export async function documentFileExists(relativePath: string): Promise<boolean> {
  const uri = resolveDocumentFileUri(relativePath);
  if (!uri) return false;
  const info = await getInfoAsync(uri);
  return info.exists && !info.isDirectory;
}

/**
 * Replaces (or creates) a single file under the app documents directory from a picker/asset URI.
 * @returns Stable `file://` URI for the destination, or `sourceUri` when `documentDirectory` is unavailable.
 */
export async function replaceDocumentFileFromSource(
  sourceUri: string,
  relativePath: string,
): Promise<string> {
  const dest = resolveDocumentFileUri(relativePath);
  if (!dest) return sourceUri;

  const existing = await getInfoAsync(dest);
  if (existing.exists) {
    await deleteAsync(dest, { idempotent: true });
  }

  await copyAsync({ from: sourceUri, to: dest });
  return dest;
}

export async function deleteDocumentFile(relativePath: string): Promise<void> {
  const uri = resolveDocumentFileUri(relativePath);
  if (!uri) return;
  const info = await getInfoAsync(uri);
  if (info.exists) {
    await deleteAsync(uri, { idempotent: true });
  }
}
