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
import { cloudinaryService } from './cloudinaryService';
import { INITIAL_DOCTORS } from '../config/initialDoctors';
import type { Doctor } from '../types';

export interface AdminDoctor extends Doctor {
  _source?: 'firestore' | 'fallback';
}

export const doctorService = {
  /**
   * Fetch all active doctors with fallback to local dataset
   */
  async getDoctors(): Promise<Doctor[]> {
    try {
      const q = query(
        collection(db, FIRESTORE_COLLECTIONS.DOCTORS),
        orderBy('displayOrder', 'asc')
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        return snapshot.docs
          .map((d) => ({ id: d.id, ...d.data() } as Doctor))
          .filter((doc) => doc.active !== false && doc.isActive !== false);
      }
      return INITIAL_DOCTORS.filter((doc) => doc.active !== false && doc.isActive !== false);
    } catch (err) {
      console.warn('Firestore fetch failed; using fallback data. Error:', err);
      return INITIAL_DOCTORS.filter((doc) => doc.active !== false && doc.isActive !== false);
    }
  },

  /**
   * Fetch all doctors including inactive ones (Admin view)
   * Identifies whether each record is from Firestore or local fallback
   */
  async getAllDoctorsAdmin(): Promise<AdminDoctor[]> {
    try {
      const q = query(
        collection(db, FIRESTORE_COLLECTIONS.DOCTORS),
        orderBy('displayOrder', 'asc')
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const firestoreDoctors: AdminDoctor[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          _source: 'firestore' as const,
        } as AdminDoctor));

        const existingIds = new Set(firestoreDoctors.map((d) => d.id));
        const unseededFallbacks: AdminDoctor[] = INITIAL_DOCTORS.filter(
          (d) => !existingIds.has(d.id)
        ).map((d) => ({
          ...d,
          _source: 'fallback' as const,
        }));

        return [...firestoreDoctors, ...unseededFallbacks];
      }

      return INITIAL_DOCTORS.map((d) => ({
        ...d,
        _source: 'fallback' as const,
      }));
    } catch (err) {
      console.warn('getAllDoctorsAdmin falling back to local dataset:', err);
      return INITIAL_DOCTORS.map((d) => ({
        ...d,
        _source: 'fallback' as const,
      }));
    }
  },

  /**
   * Fetch doctor by ID
   */
  async getDoctorById(id: string): Promise<Doctor | null> {
    try {
      const docRef = doc(db, FIRESTORE_COLLECTIONS.DOCTORS, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Doctor;
      }
      const local = INITIAL_DOCTORS.find((d) => d.id === id);
      return local || null;
    } catch (err) {
      console.warn('Firestore getDoctorById falling back to local dataset:', err);
      const local = INITIAL_DOCTORS.find((d) => d.id === id);
      return local || null;
    }
  },

  /**
   * Get list of unique specializations from active doctors
   */
  async getSpecializations(): Promise<string[]> {
    const doctors = await this.getDoctors();
    const specialties = new Set<string>();
    doctors.forEach((d) => {
      if (d.specialization) {
        specialties.add(d.specialization.trim());
      }
    });
    return Array.from(specialties).sort();
  },

  /**
   * Upload Doctor Photo to Cloudinary
   */
  async uploadDoctorPhoto(file: File): Promise<{ secure_url: string; public_id: string }> {
    const result = await cloudinaryService.uploadImage(file, 'deccan-care/doctors');
    return {
      secure_url: result.secure_url,
      public_id: result.public_id,
    };
  },

  /**
   * Add a new doctor (Admin)
   */
  async addDoctor(doctorData: Omit<Doctor, 'id'>, imageFile?: File): Promise<Doctor> {
    const docRef = doc(collection(db, FIRESTORE_COLLECTIONS.DOCTORS));
    let imageUrl = doctorData.imageUrl || '';
    let imagePublicId = doctorData.imagePublicId || '';

    if (imageFile) {
      const upload = await this.uploadDoctorPhoto(imageFile);
      imageUrl = upload.secure_url;
      imagePublicId = upload.public_id;
    }

    const cleanDoctor: Doctor = {
      id: docRef.id,
      name: (doctorData.name || '').trim(),
      designation: (doctorData.designation || 'Consultant').trim(),
      specialization: (doctorData.specialization || 'General Medicine').trim(),
      qualification: (doctorData.qualification || '').trim(),
      description: (doctorData.description || '').trim(),
      profileType: doctorData.profileType || 'directory',
      displayOrder: typeof doctorData.displayOrder === 'number' ? doctorData.displayOrder : 1,
      active: doctorData.active !== false,
      featured: Boolean(doctorData.featured),
      imageUrl: imageUrl || '',
      imagePublicId: imagePublicId || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await setDoc(docRef, {
      ...cleanDoctor,
      serverCreatedAt: serverTimestamp(),
      serverUpdatedAt: serverTimestamp(),
    });

    return cleanDoctor;
  },

  /**
   * Update an existing doctor (Admin)
   * Seamlessly creates Firestore record if editing an unseeded fallback item
   */
  async updateDoctor(
    id: string,
    updates: Partial<Doctor>,
    newImageFile?: File
  ): Promise<void> {
    const docRef = doc(db, FIRESTORE_COLLECTIONS.DOCTORS, id);
    const docSnap = await getDoc(docRef);

    let imageUrl = updates.imageUrl;
    let imagePublicId = updates.imagePublicId;

    if (newImageFile) {
      const upload = await this.uploadDoctorPhoto(newImageFile);
      imageUrl = upload.secure_url;
      imagePublicId = upload.public_id;
    }

    const nowIso = new Date().toISOString();

    if (docSnap.exists()) {
      const existingData = docSnap.data() as Doctor;
      const cleanUpdates: Record<string, any> = {
        updatedAt: nowIso,
        serverUpdatedAt: serverTimestamp(),
      };

      if (updates.name !== undefined) cleanUpdates.name = updates.name.trim();
      if (updates.designation !== undefined) cleanUpdates.designation = updates.designation.trim();
      if (updates.specialization !== undefined) cleanUpdates.specialization = updates.specialization.trim();
      if (updates.qualification !== undefined) cleanUpdates.qualification = (updates.qualification || '').trim();
      if (updates.description !== undefined) cleanUpdates.description = (updates.description || '').trim();
      if (updates.profileType !== undefined) cleanUpdates.profileType = updates.profileType;
      if (updates.displayOrder !== undefined) cleanUpdates.displayOrder = Number(updates.displayOrder) || 1;
      if (updates.active !== undefined) cleanUpdates.active = updates.active;
      if (updates.featured !== undefined) cleanUpdates.featured = updates.featured;

      // Preserve image or apply new upload
      if (imageUrl !== undefined && imageUrl !== '') {
        cleanUpdates.imageUrl = imageUrl;
      } else if (imageUrl === '') {
        cleanUpdates.imageUrl = '';
      } else if (existingData.imageUrl) {
        cleanUpdates.imageUrl = existingData.imageUrl;
      }

      if (imagePublicId !== undefined && imagePublicId !== '') {
        cleanUpdates.imagePublicId = imagePublicId;
      } else if (imagePublicId === '') {
        cleanUpdates.imagePublicId = '';
      } else if (existingData.imagePublicId) {
        cleanUpdates.imagePublicId = existingData.imagePublicId;
      }

      await updateDoc(docRef, cleanUpdates);
    } else {
      // Unseeded fallback item -> create full document
      const fallback = INITIAL_DOCTORS.find((d) => d.id === id);
      const completeDoctor: Doctor = {
        id,
        name: updates.name ? updates.name.trim() : (fallback?.name || 'Dr.'),
        designation: updates.designation ? updates.designation.trim() : (fallback?.designation || 'Consultant'),
        specialization: updates.specialization ? updates.specialization.trim() : (fallback?.specialization || 'General Medicine'),
        qualification: updates.qualification !== undefined ? (updates.qualification || '').trim() : (fallback?.qualification || ''),
        description: updates.description !== undefined ? (updates.description || '').trim() : (fallback?.description || ''),
        profileType: updates.profileType || fallback?.profileType || 'directory',
        displayOrder: updates.displayOrder !== undefined ? Number(updates.displayOrder) : (fallback?.displayOrder || 1),
        active: updates.active !== undefined ? updates.active : (fallback?.active !== false),
        featured: updates.featured !== undefined ? updates.featured : (fallback?.featured || false),
        imageUrl: (imageUrl !== undefined ? imageUrl : fallback?.imageUrl) || '',
        imagePublicId: (imagePublicId !== undefined ? imagePublicId : fallback?.imagePublicId) || '',
        createdAt: fallback?.createdAt || nowIso,
        updatedAt: nowIso,
      };

      await setDoc(docRef, {
        ...completeDoctor,
        serverCreatedAt: serverTimestamp(),
        serverUpdatedAt: serverTimestamp(),
      }, { merge: true });
    }
  },

  /**
   * Delete a doctor (Admin)
   */
  async deleteDoctor(id: string): Promise<void> {
    const docRef = doc(db, FIRESTORE_COLLECTIONS.DOCTORS, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      await deleteDoc(docRef);
    } else {
      // If it was a fallback item, write an inactive record so it no longer appears in public or admin roster
      const fallback = INITIAL_DOCTORS.find((d) => d.id === id);
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
