import {
  launchImageLibraryAsync,
  PermissionStatus,
  requestMediaLibraryPermissionsAsync,
} from 'expo-image-picker';
import { useCallback, useState } from 'react';

import {
  normalizeDocumentRelativePath,
  replaceDocumentFileFromSource,
} from './document-file';
import type { UseLocalPhotoPickerOptions } from './types';

/**
 * Pick a single image from the device library (square crop).
 * Image stays as a temporary picker URI in state until committed to a stable path via
 * {@link commitSourceToRelativePath}.
 */
export function useLocalPhotoPicker(options: UseLocalPhotoPickerOptions = {}) {
  const { onPermissionDenied } = options;
  const [uri, setUri] = useState<string | null>(null);

  const pickFromLibrary = useCallback(async () => {
    const { status } = await requestMediaLibraryPermissionsAsync();
    if (status !== PermissionStatus.GRANTED) {
      onPermissionDenied?.();
      return;
    }

    const result = await launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (result.canceled) return;
    const picked = result.assets[0]?.uri;
    if (picked) setUri(picked);
  }, [onPermissionDenied]);

  const clear = useCallback(() => {
    setUri(null);
  }, []);

  /** Copy an explicit source URI into app documents under a validated relative path. */
  const commitSourceToRelativePath = useCallback(
    async (relativePath: string, sourceUri: string) => {
      const rel = normalizeDocumentRelativePath(relativePath);
      const dest = await replaceDocumentFileFromSource(sourceUri, rel);
      setUri(dest);
      return dest;
    },
    [],
  );

  return { uri, pickFromLibrary, clear, commitSourceToRelativePath };
}
