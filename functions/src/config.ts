/**
 * Deccan Care Maternity & General Hospital
 * Centralized Server-Side Configuration for Cloud Functions & Email Dispatch
 */

export const HOSPITAL_CONFIG = {
  name: 'Deccan Care',
  fullName: 'Deccan Care Maternity & General Hospital',
  subHeading: 'MATERNITY & GENERAL HOSPITAL',
  locationCity: 'Kalaburagi, Karnataka, India',
  address: {
    line1: 'Near Quadri Chowk, Opp. Bharat Petrol Bunk',
    area: 'Sheikh Roza',
    city: 'Kalaburagi',
    state: 'Karnataka',
    pincode: '585101',
    fullFormatted: 'Near Quadri Chowk, Opp. Bharat Petrol Bunk, Sheikh Roza, Kalaburagi, Karnataka - 585101',
  },
  phones: [
    { number: '74111 40480', display: '+91 74111 40480' },
    { number: '83103 65003', display: '+91 83103 65003' },
  ],
  emergencyPhone: '74111 40480',
  notificationEmail: 'deccancarehospital.24ths@gmail.com',
  // Sender identity - in production configure your verified domain (e.g. appointments@deccancarehospital.in) or Resend onboarding address
  senderEmail: process.env.EMAIL_FROM || 'Deccan Care Hospital <onboarding@resend.dev>',
};

export const FIRESTORE_COLLECTIONS = {
  APPOINTMENTS: 'appointments',
  AVAILABILITY: 'availability',
  ADMINS: 'admins',
  SETTINGS: 'settings',
};
