import {
  collection,
  doc,
  runTransaction,
  getDoc,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp,
  type FirestoreError,
} from 'firebase/firestore';
import { db, FIRESTORE_COLLECTIONS } from '../firebase';
import type {
  Appointment,
  AppointmentBookingInput,
  AppointmentStatus,
  AvailabilitySlot,
} from '../types';

export class DoubleBookingError extends Error {
  constructor(
    message: string = 'This slot was just booked by another patient. Please select another available time.'
  ) {
    super(message);
    this.name = 'DoubleBookingError';
  }
}

export const appointmentService = {
  /**
   * Book an appointment with Atomic Double-Booking Protection using Firestore Transactions
   */
  async bookAppointment(input: AppointmentBookingInput): Promise<Appointment> {
    const slotDocRef = doc(db, FIRESTORE_COLLECTIONS.AVAILABILITY, input.slotId);
    const appointmentDocRef = doc(collection(db, FIRESTORE_COLLECTIONS.APPOINTMENTS));

    try {
      const createdAppointment = await runTransaction(db, async (transaction) => {
        // Step 1: Read the slot document within the atomic transaction
        const slotDocSnap = await transaction.get(slotDocRef);

        if (!slotDocSnap.exists()) {
          throw new Error(
            'The selected appointment slot does not exist or is no longer available.'
          );
        }

        const slotData = slotDocSnap.data() as AvailabilitySlot;

        // Step 2: Validate slot availability & active status
        if (slotData.status !== 'available' || slotData.active === false) {
          throw new DoubleBookingError(
            'This slot was just booked by another patient. Please select another available time.'
          );
        }

        // Step 3: Verify doctor ID and date match slot document to prevent tamper
        if (slotData.doctorId !== input.doctorId || slotData.date !== input.date) {
          throw new Error(
            'The selected slot does not match the chosen doctor and date.'
          );
        }

        const nowIso = new Date().toISOString();

        // Step 4: Mark slot as booked within transaction
        transaction.update(slotDocRef, {
          status: 'booked',
          bookingId: appointmentDocRef.id,
          updatedAt: nowIso,
          serverUpdatedAt: serverTimestamp(),
        });

        // Step 5: Create the permanent Appointment record with doctor snapshot
        const hasEmail = Boolean(input.email && input.email.trim());
        const appointmentRecord: Appointment = {
          id: appointmentDocRef.id,
          patientName: input.patientName.trim(),
          phone: input.phone.trim(),
          email: hasEmail ? input.email!.trim() : undefined,
          doctorId: input.doctorId,
          doctorNameSnapshot: input.doctorNameSnapshot,
          specializationSnapshot: input.specializationSnapshot,
          date: input.date,
          slotId: input.slotId,
          startTime: slotData.startTime || input.startTime,
          endTime: slotData.endTime || input.endTime,
          reason: input.reason ? input.reason.trim() : undefined,
          status: 'pending',
          createdAt: nowIso,
          updatedAt: nowIso,
          notificationStatus: 'pending',
          hospitalNotificationStatus: 'pending',
          patientNotificationStatus: hasEmail ? 'pending' : 'not_applicable',
          notificationMeta: {
            hospitalStatus: 'pending',
            patientStatus: hasEmail ? 'pending' : 'not_applicable',
          },
        };

        const cleanAppointment = Object.fromEntries(
          Object.entries(appointmentRecord).filter(([_, v]) => v !== undefined)
        );

        transaction.set(appointmentDocRef, {
          ...cleanAppointment,
          serverCreatedAt: serverTimestamp(),
          serverUpdatedAt: serverTimestamp(),
        });

        return appointmentRecord;
      });

      return createdAppointment;
    } catch (err: unknown) {
      if (err instanceof DoubleBookingError) {
        throw err;
      }

      const firestoreErr = err as FirestoreError;
      if (
        firestoreErr.code === 'permission-denied' ||
        firestoreErr.code === 'unavailable'
      ) {
        console.warn('Firestore transaction note:', firestoreErr.message);
      }

      throw err;
    }
  },

  /**
   * Fetch appointment by ID
   */
  async getAppointmentById(id: string): Promise<Appointment | null> {
    try {
      const docRef = doc(db, FIRESTORE_COLLECTIONS.APPOINTMENTS, id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() } as Appointment;
      }
      return null;
    } catch (err) {
      console.warn('getAppointmentById error:', err);
      return null;
    }
  },

  /**
   * Fetch all appointments (Admin)
   */
  async getAllAppointmentsAdmin(limitCount: number = 200): Promise<Appointment[]> {
    try {
      const q = query(
        collection(db, FIRESTORE_COLLECTIONS.APPOINTMENTS),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Appointment));
    } catch (err) {
      console.warn('getAllAppointmentsAdmin error:', err);
      return [];
    }
  },

  /**
   * Update Appointment Status with logical transition and controlled slot release on cancellation (Admin)
   */
  async updateAppointmentStatus(
    appointmentId: string,
    newStatus: AppointmentStatus
  ): Promise<void> {
    const appointmentDocRef = doc(db, FIRESTORE_COLLECTIONS.APPOINTMENTS, appointmentId);

    await runTransaction(db, async (transaction) => {
      const appSnap = await transaction.get(appointmentDocRef);
      if (!appSnap.exists()) {
        throw new Error('Appointment not found.');
      }

      const appData = appSnap.data() as Appointment;
      const currentStatus = appData.status;

      // Validate logical state transitions
      const validTransitions: { [key in AppointmentStatus]?: AppointmentStatus[] } = {
        pending: ['confirmed', 'cancelled'],
        confirmed: ['completed', 'cancelled'],
        cancelled: [],
        completed: [],
      };

      const allowed = validTransitions[currentStatus] || [];
      if (!allowed.includes(newStatus) && currentStatus !== newStatus) {
        throw new Error(
          `Invalid status transition from ${currentStatus} to ${newStatus}.`
        );
      }

      const nowIso = new Date().toISOString();

      // Step 1: Update appointment status
      transaction.update(appointmentDocRef, {
        status: newStatus,
        updatedAt: nowIso,
        serverUpdatedAt: serverTimestamp(),
      });

      // Step 2: If cancelled, release associated slot back to 'available' only if it holds this booking
      if (newStatus === 'cancelled' && appData.slotId) {
        const slotDocRef = doc(db, FIRESTORE_COLLECTIONS.AVAILABILITY, appData.slotId);
        const slotSnap = await transaction.get(slotDocRef);
        if (slotSnap.exists()) {
          const slotData = slotSnap.data();
          if (slotData.bookingId === appointmentId) {
            transaction.update(slotDocRef, {
              status: 'available',
              bookingId: null,
              updatedAt: nowIso,
              serverUpdatedAt: serverTimestamp(),
            });
          }
        }
      }
    });
  },
};
