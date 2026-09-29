/**
 * Deccan Care Maternity & General Hospital
 * Hospital Information Types (Firebase-ready schema)
 */

export interface HospitalAddress {
  line1: string;
  landmark: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  googleMapsUrl?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface HospitalContact {
  primaryPhone: string;
  secondaryPhone: string;
  emergencyPhone?: string;
  email: string;
  supportEmail?: string;
}

export interface HospitalHours {
  emergency: string;
  outpatient: string;
  maternity: string;
}

export interface HospitalInfo {
  id: string;
  name: string;
  fullName: string;
  tagline: string;
  description: string;
  address: HospitalAddress;
  contact: HospitalContact;
  hours: HospitalHours;
  updatedAt?: string;
}
