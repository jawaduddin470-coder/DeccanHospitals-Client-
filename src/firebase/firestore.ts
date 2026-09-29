import { getFirestore, type Firestore } from 'firebase/firestore';
import { app } from './config';

export const db: Firestore = getFirestore(app);

export const FIRESTORE_COLLECTIONS = {
  HOSPITAL_INFO: 'hospitalInfo',
  DOCTORS: 'doctors',
  SERVICES: 'services',
  GALLERY: 'gallery',
  AVAILABILITY: 'availability',
  APPOINTMENTS: 'appointments',
} as const;

export type FirestoreCollectionName =
  typeof FIRESTORE_COLLECTIONS[keyof typeof FIRESTORE_COLLECTIONS];
