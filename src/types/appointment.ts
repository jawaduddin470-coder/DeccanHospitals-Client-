/**
 * Deccan Care Maternity & General Hospital
 * Appointment & Slot Availability Architecture (Firestore Schema)
 */

export type SlotStatus = 'available' | 'held' | 'booked' | 'blocked';

export interface AvailabilitySlot {
  id: string;
  doctorId: string;
  date: string; // ISO Date YYYY-MM-DD
  startTime: string; // e.g. "09:30 AM" or "09:30"
  endTime: string; // e.g. "10:00 AM" or "10:00"
  status: SlotStatus;
  bookingId?: string;
  active: boolean;
  createdAt: string;
  updatedAt?: string;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type NotificationStatus = 'pending' | 'sent' | 'failed' | 'not_applicable';

export interface NotificationMeta {
  hospitalStatus?: NotificationStatus;
  hospitalSentAt?: string;
  hospitalError?: string;
  patientStatus?: NotificationStatus;
  patientSentAt?: string;
  patientError?: string;
  confirmationSentAt?: string;
  cancellationSentAt?: string;
  lastAttemptAt?: string;
}

export interface Appointment {
  id: string;
  patientName: string;
  phone: string;
  email?: string;
  doctorId: string;
  doctorNameSnapshot: string;
  specializationSnapshot: string;
  date: string; // ISO Date YYYY-MM-DD
  slotId: string;
  startTime: string;
  endTime: string;
  reason?: string;
  status: AppointmentStatus;
  createdAt: string;
  updatedAt?: string;
  notificationStatus?: NotificationStatus;
  hospitalNotificationStatus?: NotificationStatus;
  patientNotificationStatus?: NotificationStatus;
  notificationMeta?: NotificationMeta;
}

export interface AppointmentBookingInput {
  patientName: string;
  phone: string;
  email?: string;
  doctorId: string;
  doctorNameSnapshot: string;
  specializationSnapshot: string;
  date: string;
  slotId: string;
  startTime: string;
  endTime: string;
  reason?: string;
}

// Backward compatibility alias for earlier mock schema
export interface AppointmentBooking extends Partial<Appointment> {
  patientPhone?: string;
  patientEmail?: string;
  preferredDate?: string;
  isEmergency?: boolean;
}
