import {
  deleteDocumentFile,
  documentFileExists,
  resolveDocumentFileUri,
} from './document-file';

/** Canonical relative path for the single dog profile photo on disk. */
export const DOG_AVATAR_RELATIVE_PATH = 'dog-avatar.jpg';

export function getDogAvatarFileUri(): string | null {
  return resolveDocumentFileUri(DOG_AVATAR_RELATIVE_PATH);
}

export function dogAvatarFileExists(): Promise<boolean> {
  return documentFileExists(DOG_AVATAR_RELATIVE_PATH);
}

export function deleteDogAvatarFile(): Promise<void> {
  return deleteDocumentFile(DOG_AVATAR_RELATIVE_PATH);
}
