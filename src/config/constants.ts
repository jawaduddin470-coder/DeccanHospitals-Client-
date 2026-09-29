/**
 * Deccan Care Maternity & General Hospital
 * Centralized Configuration Constants
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
    googleMapsSearchQuery: 'https://maps.google.com/?q=Near+Quadri+Chowk,+Opp.+Bharat+Petrol+Bunk,+Sheikh+Roza,+Kalaburagi,+Karnataka+585101',
  },
  phones: [
    { number: '74111 40480', raw: 'tel:+917411140480', label: 'Primary Contact' },
    { number: '83103 65003', raw: 'tel:+918310365003', label: 'Helpline' },
  ],
  emergencyPhone: {
    number: '74111 40480',
    raw: 'tel:+917411140480',
    label: 'Emergency Line',
  },
  email: {
    address: 'deccancarehospital.24ths@gmail.com',
    raw: 'mailto:deccancarehospital.24ths@gmail.com',
  },
  hours: {
    emergency: '24/7 Emergency & Maternity Services',
    opd: 'Consultation by appointment',
  }
} as const;

export const NAV_LINKS = [
  { name: 'About', path: '/about' },
  { name: 'Services', path: '/services' },
  { name: 'Doctors & Team', path: '/doctors' },
  { name: 'Gallery', path: '/gallery' },
  { name: 'Appointment', path: '/appointment' },
  { name: 'Contact', path: '/contact' },
] as const;

export const ADMIN_ROUTES = {
  login: '/login/admin',
  dashboard: '/admin',
} as const;
