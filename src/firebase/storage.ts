import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { app } from './config';

export const storage: FirebaseStorage = getStorage(app);

export const STORAGE_PATHS = {
  DOCTORS: 'doctors',
  GALLERY: 'gallery',
  SERVICES: 'services',
} as const;

export type StoragePathName = typeof STORAGE_PATHS[keyof typeof STORAGE_PATHS];
