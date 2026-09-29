/**
 * Deccan Care Maternity & General Hospital
 * Firestore Initial Data Synchronization & Seeding Service
 * 
 * Safely migrates verified baseline hospital data (Services, Doctors, Gallery, Hospital Info)
 * into Firestore without overwriting administrator edits or duplicating documents.
 */

import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, FIRESTORE_COLLECTIONS } from '../firebase';
import { INITIAL_SERVICES } from '../config/initialServices';
import { INITIAL_DOCTORS } from '../config/initialDoctors';
import { INITIAL_GALLERY } from '../config/initialGallery';
import { HOSPITAL_CONFIG } from '../config/constants';

export interface SyncReport {
  servicesAdded: number;
  servicesSkipped: number;
  doctorsAdded: number;
  doctorsSkipped: number;
  galleryAdded: number;
  gallerySkipped: number;
  hospitalInfoSynced: boolean;
  timestamp: string;
}

export const syncService = {
  /**
   * Sync all initial baseline data to Firestore
   * Only creates documents that do NOT already exist.
   */
  async syncAllInitialData(): Promise<SyncReport> {
    const report: SyncReport = {
      servicesAdded: 0,
      servicesSkipped: 0,
      doctorsAdded: 0,
      doctorsSkipped: 0,
      galleryAdded: 0,
      gallerySkipped: 0,
      hospitalInfoSynced: false,
      timestamp: new Date().toISOString(),
    };

    // 1. Sync Services
    for (const service of INITIAL_SERVICES) {
      const serviceRef = doc(db, FIRESTORE_COLLECTIONS.SERVICES, service.id);
      const snap = await getDoc(serviceRef);
      if (!snap.exists()) {
        await setDoc(serviceRef, {
          ...service,
          serverCreatedAt: serverTimestamp(),
          serverUpdatedAt: serverTimestamp(),
        });
        report.servicesAdded++;
      } else {
        report.servicesSkipped++;
      }
    }

    // 2. Sync Doctors
    for (const doctor of INITIAL_DOCTORS) {
      const doctorRef = doc(db, FIRESTORE_COLLECTIONS.DOCTORS, doctor.id);
      const snap = await getDoc(doctorRef);
      if (!snap.exists()) {
        await setDoc(doctorRef, {
          ...doctor,
          serverCreatedAt: serverTimestamp(),
          serverUpdatedAt: serverTimestamp(),
        });
        report.doctorsAdded++;
      } else {
        report.doctorsSkipped++;
      }
    }

    // 3. Sync Gallery Items
    for (const item of INITIAL_GALLERY) {
      const galleryRef = doc(db, FIRESTORE_COLLECTIONS.GALLERY, item.id);
      const snap = await getDoc(galleryRef);
      if (!snap.exists()) {
        await setDoc(galleryRef, {
          ...item,
          serverCreatedAt: serverTimestamp(),
          serverUpdatedAt: serverTimestamp(),
        });
        report.galleryAdded++;
      } else {
        report.gallerySkipped++;
      }
    }

    // 4. Sync Hospital Info Document
    const infoRef = doc(db, FIRESTORE_COLLECTIONS.HOSPITAL_INFO, 'general');
    const infoSnap = await getDoc(infoRef);
    if (!infoSnap.exists()) {
      const initialHospitalInfo = {
        name: HOSPITAL_CONFIG.name,
        fullName: HOSPITAL_CONFIG.fullName,
        subHeading: HOSPITAL_CONFIG.subHeading,
        locationCity: HOSPITAL_CONFIG.locationCity,
        phone1: HOSPITAL_CONFIG.phones[0].number,
        phone2: HOSPITAL_CONFIG.phones[1].number,
        email: HOSPITAL_CONFIG.email.address,
        addressLine1: HOSPITAL_CONFIG.address.line1,
        area: HOSPITAL_CONFIG.address.area,
        city: HOSPITAL_CONFIG.address.city,
        state: HOSPITAL_CONFIG.address.state,
        pincode: HOSPITAL_CONFIG.address.pincode,
        fullFormattedAddress: HOSPITAL_CONFIG.address.fullFormatted,
        emergencyHours: HOSPITAL_CONFIG.hours.emergency,
        opdHours: HOSPITAL_CONFIG.hours.opd,
        updatedAt: new Date().toISOString(),
      };

      await setDoc(infoRef, {
        ...initialHospitalInfo,
        serverCreatedAt: serverTimestamp(),
        serverUpdatedAt: serverTimestamp(),
      });
      report.hospitalInfoSynced = true;
    }

    return report;
  },

  /**
   * Sync specifically the services collection
   */
  async syncServicesOnly(): Promise<{ added: number; skipped: number }> {
    let added = 0;
    let skipped = 0;
    for (const service of INITIAL_SERVICES) {
      const serviceRef = doc(db, FIRESTORE_COLLECTIONS.SERVICES, service.id);
      const snap = await getDoc(serviceRef);
      if (!snap.exists()) {
        await setDoc(serviceRef, {
          ...service,
          serverCreatedAt: serverTimestamp(),
          serverUpdatedAt: serverTimestamp(),
        });
        added++;
      } else {
        skipped++;
      }
    }
    return { added, skipped };
  },

  /**
   * Sync specifically the doctors collection
   */
  async syncDoctorsOnly(): Promise<{ added: number; skipped: number }> {
    let added = 0;
    let skipped = 0;
    for (const doctor of INITIAL_DOCTORS) {
      const doctorRef = doc(db, FIRESTORE_COLLECTIONS.DOCTORS, doctor.id);
      const snap = await getDoc(doctorRef);
      if (!snap.exists()) {
        await setDoc(doctorRef, {
          ...doctor,
          serverCreatedAt: serverTimestamp(),
          serverUpdatedAt: serverTimestamp(),
        });
        added++;
      } else {
        skipped++;
      }
    }
    return { added, skipped };
  },

  /**
   * Sync specifically the gallery collection
   */
  async syncGalleryOnly(): Promise<{ added: number; skipped: number }> {
    let added = 0;
    let skipped = 0;
    for (const item of INITIAL_GALLERY) {
      const galleryRef = doc(db, FIRESTORE_COLLECTIONS.GALLERY, item.id);
      const snap = await getDoc(galleryRef);
      if (!snap.exists()) {
        await setDoc(galleryRef, {
          ...item,
          serverCreatedAt: serverTimestamp(),
          serverUpdatedAt: serverTimestamp(),
        });
        added++;
      } else {
        skipped++;
      }
    }
    return { added, skipped };
  },
};
