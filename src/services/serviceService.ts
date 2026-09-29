import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db, FIRESTORE_COLLECTIONS } from '../firebase';
import { INITIAL_SERVICES, INITIAL_FACILITIES } from '../config/initialServices';
import type { HospitalService, HospitalFacility, ServiceCategoryKey } from '../types';

export interface AdminHospitalService extends HospitalService {
  _source?: 'firestore' | 'fallback';
}

export const serviceService = {
  /**
   * Fetch all active hospital services for public website with fallback resilience
   */
  async getServices(): Promise<HospitalService[]> {
    try {
      const q = query(
        collection(db, FIRESTORE_COLLECTIONS.SERVICES),
        orderBy('displayOrder', 'asc')
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        return snapshot.docs
          .map((d) => ({ id: d.id, ...d.data() } as HospitalService))
          .filter((s) => s.active !== false);
      }
      return INITIAL_SERVICES.filter((s) => s.active !== false);
    } catch (err) {
      console.warn('Firestore fetch failed; using fallback data. Error:', err);
      return INITIAL_SERVICES.filter((s) => s.active !== false);
    }
  },

  /**
   * Fetch all services for Admin CMS, distinguishing Firestore records from local fallback data
   */
  async getAllServicesAdmin(): Promise<AdminHospitalService[]> {
    try {
      const q = query(
        collection(db, FIRESTORE_COLLECTIONS.SERVICES),
        orderBy('displayOrder', 'asc')
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const firestoreServices: AdminHospitalService[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          _source: 'firestore' as const,
        } as AdminHospitalService));

        // Check if there are baseline services that haven't been seeded into Firestore yet
        const existingIds = new Set(firestoreServices.map((s) => s.id));
        const unseededFallbacks: AdminHospitalService[] = INITIAL_SERVICES.filter(
          (s) => !existingIds.has(s.id)
        ).map((s) => ({
          ...s,
          _source: 'fallback' as const,
        }));

        return [...firestoreServices, ...unseededFallbacks];
      }

      // If Firestore collection is completely empty, return initial services tagged as fallback
      return INITIAL_SERVICES.map((s) => ({
        ...s,
        _source: 'fallback' as const,
      }));
    } catch (err) {
      console.warn('getAllServicesAdmin falling back to local dataset:', err);
      return INITIAL_SERVICES.map((s) => ({
        ...s,
        _source: 'fallback' as const,
      }));
    }
  },

  /**
   * Fetch all active hospital facilities with fallback
   */
  async getFacilities(): Promise<HospitalFacility[]> {
    try {
      return INITIAL_FACILITIES.filter((f) => f.active !== false);
    } catch (err) {
      console.warn('getFacilities error, using local fallback:', err);
      return INITIAL_FACILITIES.filter((f) => f.active !== false);
    }
  },

  /**
   * Add a new service (Admin)
   */
  async addService(serviceData: Omit<HospitalService, 'id'>): Promise<HospitalService> {
    const docRef = doc(collection(db, FIRESTORE_COLLECTIONS.SERVICES));
    const newService: HospitalService = {
      id: docRef.id,
      name: (serviceData.name || '').trim(),
      description: (serviceData.description || '').trim(),
      category: ((serviceData.category || 'general').trim()) as ServiceCategoryKey,
      iconName: serviceData.iconName || 'Activity',
      displayOrder: typeof serviceData.displayOrder === 'number' ? serviceData.displayOrder : 1,
      active: serviceData.active !== false,
      featured: Boolean(serviceData.featured),
      isEmergency: Boolean(serviceData.isEmergency),
    };

    await setDoc(docRef, {
      ...newService,
      serverCreatedAt: serverTimestamp(),
      serverUpdatedAt: serverTimestamp(),
    });

    return newService;
  },

  /**
   * Update service (Admin)
   * Transparently handles both existing Firestore documents and initial fallback records
   */
  async updateService(id: string, updates: Partial<HospitalService>): Promise<void> {
    const docRef = doc(db, FIRESTORE_COLLECTIONS.SERVICES, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const cleanUpdates: Record<string, any> = {
        serverUpdatedAt: serverTimestamp(),
      };
      if (updates.name !== undefined) cleanUpdates.name = updates.name.trim();
      if (updates.description !== undefined) cleanUpdates.description = (updates.description || '').trim();
      if (updates.category !== undefined) cleanUpdates.category = updates.category.trim() as ServiceCategoryKey;
      if (updates.iconName !== undefined) cleanUpdates.iconName = updates.iconName;
      if (updates.displayOrder !== undefined) cleanUpdates.displayOrder = Number(updates.displayOrder) || 1;
      if (updates.active !== undefined) cleanUpdates.active = updates.active;
      if (updates.featured !== undefined) cleanUpdates.featured = updates.featured;
      if (updates.isEmergency !== undefined) cleanUpdates.isEmergency = updates.isEmergency;

      await updateDoc(docRef, cleanUpdates);
    } else {
      // Document does NOT exist in Firestore yet (it was a fallback record)
      // Merge with initial fallback data and create it via setDoc
      const fallback = INITIAL_SERVICES.find((s) => s.id === id);
      const completeRecord: HospitalService = {
        id,
        name: updates.name ? updates.name.trim() : (fallback?.name || id),
        description: updates.description !== undefined ? (updates.description || '').trim() : (fallback?.description || ''),
        category: (updates.category ? updates.category.trim() : (fallback?.category || 'general')) as ServiceCategoryKey,
        iconName: updates.iconName || fallback?.iconName || 'Activity',
        displayOrder: updates.displayOrder !== undefined ? Number(updates.displayOrder) : (fallback?.displayOrder || 1),
        active: updates.active !== undefined ? updates.active : (fallback?.active !== false),
        featured: updates.featured !== undefined ? updates.featured : (fallback?.featured || false),
        isEmergency: updates.isEmergency !== undefined ? updates.isEmergency : (fallback?.isEmergency || false),
      };

      await setDoc(docRef, {
        ...completeRecord,
        serverCreatedAt: serverTimestamp(),
        serverUpdatedAt: serverTimestamp(),
      }, { merge: true });
    }
  },

  /**
   * Delete service (Admin)
   */
  async deleteService(id: string): Promise<void> {
    const docRef = doc(db, FIRESTORE_COLLECTIONS.SERVICES, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      await deleteDoc(docRef);
    } else {
      // If it was a fallback document, write an inactive record so it no longer appears
      const fallback = INITIAL_SERVICES.find((s) => s.id === id);
      if (fallback) {
        await setDoc(docRef, {
          ...fallback,
          active: false,
          serverCreatedAt: serverTimestamp(),
          serverUpdatedAt: serverTimestamp(),
        });
      }
    }
  },
};
