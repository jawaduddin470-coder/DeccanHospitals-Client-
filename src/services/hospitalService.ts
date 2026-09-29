import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, FIRESTORE_COLLECTIONS } from '../firebase';
import { HOSPITAL_CONFIG } from '../config/constants';

export interface HospitalInfoData {
  name: string;
  fullName: string;
  subHeading: string;
  locationCity: string;
  phone1: string;
  phone2: string;
  email: string;
  addressLine1: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  fullFormattedAddress: string;
  emergencyHours: string;
  opdHours: string;
  updatedAt?: string;
}

const DEFAULT_HOSPITAL_DATA: HospitalInfoData = {
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
};

export const hospitalService = {
  /**
   * Fetch hospital contact information with fallback
   */
  async getHospitalInfo(): Promise<HospitalInfoData> {
    try {
      const docRef = doc(db, FIRESTORE_COLLECTIONS.HOSPITAL_INFO, 'general');
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { ...DEFAULT_HOSPITAL_DATA, ...docSnap.data() } as HospitalInfoData;
      }
      return DEFAULT_HOSPITAL_DATA;
    } catch (err) {
      console.warn('Firestore fetch failed; using fallback data. Error:', err);
      return DEFAULT_HOSPITAL_DATA;
    }
  },

  /**
   * Update hospital contact information
   */
  async updateHospitalInfo(data: Partial<HospitalInfoData>): Promise<void> {
    const docRef = doc(db, FIRESTORE_COLLECTIONS.HOSPITAL_INFO, 'general');
    await setDoc(
      docRef,
      {
        ...data,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  },
};
