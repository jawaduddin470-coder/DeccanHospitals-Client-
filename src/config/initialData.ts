import type { HospitalInfo } from '../types';
import { HOSPITAL_CONFIG } from './constants';

export const initialHospitalInfo: HospitalInfo = {
  id: 'deccan-care-main',
  name: HOSPITAL_CONFIG.name,
  fullName: HOSPITAL_CONFIG.fullName,
  tagline: 'Maternity-Focused & General Healthcare in Kalaburagi',
  description: 'Deccan Care Maternity & General Hospital provides maternity-focused care, general healthcare consultations, and 24×7 emergency support located near Quadri Chowk in Sheikh Roza, Kalaburagi.',
  address: {
    line1: HOSPITAL_CONFIG.address.line1,
    landmark: 'Opp. Bharat Petrol Bunk',
    area: HOSPITAL_CONFIG.address.area,
    city: HOSPITAL_CONFIG.address.city,
    state: HOSPITAL_CONFIG.address.state,
    pincode: HOSPITAL_CONFIG.address.pincode,
    country: 'India',
    googleMapsUrl: HOSPITAL_CONFIG.address.googleMapsSearchQuery,
  },
  contact: {
    primaryPhone: HOSPITAL_CONFIG.phones[0].number,
    secondaryPhone: HOSPITAL_CONFIG.phones[1].number,
    email: HOSPITAL_CONFIG.email.address,
  },
  hours: {
    emergency: '24×7 Hospital Contact Support',
    outpatient: 'Consultation by Appointment',
    maternity: 'Maternity Consultations & Services',
  },
};
