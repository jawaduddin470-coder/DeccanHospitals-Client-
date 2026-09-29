import {
  collection,
  getDocs,
  query,
  where,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  getDoc,
} from 'firebase/firestore';
import { db, FIRESTORE_COLLECTIONS } from '../firebase';
import type { AvailabilitySlot, SlotStatus } from '../types';

export const parseTimeToMinutes = (tStr: string): number => {
  if (!tStr) return 0;
  const match = tStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return 0;
  let hours = parseInt(match[1], 10);
  const mins = parseInt(match[2], 10);
  const period = match[3].toUpperCase();
  if (period === 'PM' && hours < 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  return hours * 60 + mins;
};

export const availabilityService = {
  /**
   * Fetch availability slots for a specific doctor on a given date (Patient view)
   * Returns only active slots with status 'available', sorted chronologically
   */
  async getAvailableSlots(doctorId: string, date: string): Promise<AvailabilitySlot[]> {
    if (!doctorId || !date) return [];

    try {
      const q = query(
        collection(db, FIRESTORE_COLLECTIONS.AVAILABILITY),
        where('doctorId', '==', doctorId),
        where('date', '==', date)
      );

      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const slots = snapshot.docs
          .map((d) => ({ id: d.id, ...d.data() } as AvailabilitySlot))
          .filter((s) => s.active !== false && s.status === 'available');

        return slots.sort(
          (a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime)
        );
      }

      return [];
    } catch (err: unknown) {
      console.warn('Firestore fetch failed; using fallback data. Error:', err);
      return [];
    }
  },

  /**
   * Fetch all slots for a doctor & date including booked, blocked, and inactive (Admin view)
   */
  async getAllSlotsForDateAdmin(doctorId: string, date: string): Promise<AvailabilitySlot[]> {
    if (!doctorId || !date) return [];

    try {
      const q = query(
        collection(db, FIRESTORE_COLLECTIONS.AVAILABILITY),
        where('doctorId', '==', doctorId),
        where('date', '==', date)
      );

      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const slots = snapshot.docs.map(
          (d) => ({ id: d.id, ...d.data() } as AvailabilitySlot)
        );
        return slots.sort(
          (a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime)
        );
      }
      return [];
    } catch (err: unknown) {
      console.warn('getAllSlotsForDateAdmin error:', err);
      return [];
    }
  },

  /**
   * Create a single availability slot (Admin)
   */
  async createSlot(slotData: Omit<AvailabilitySlot, 'id' | 'createdAt'>): Promise<AvailabilitySlot> {
    const docRef = doc(collection(db, FIRESTORE_COLLECTIONS.AVAILABILITY));
    const nowIso = new Date().toISOString();
    const newSlot: AvailabilitySlot = {
      id: docRef.id,
      doctorId: slotData.doctorId,
      date: slotData.date,
      startTime: slotData.startTime,
      endTime: slotData.endTime,
      status: slotData.status || 'available',
      active: slotData.active !== false,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    await setDoc(docRef, {
      ...newSlot,
      serverCreatedAt: serverTimestamp(),
      serverUpdatedAt: serverTimestamp(),
    });

    return newSlot;
  },

  /**
   * Batch create multiple availability slots for a doctor & date (Admin)
   * Prevents duplicate slots for the same doctor + date + startTime + endTime
   */
  async createBatchSlots(
    doctorId: string,
    date: string,
    intervals: Array<{ startTime: string; endTime: string }>
  ): Promise<AvailabilitySlot[]> {
    if (!doctorId || !date || !intervals.length) {
      return [];
    }

    const existing = await this.getAllSlotsForDateAdmin(doctorId, date);
    const existingKeys = new Set(
      existing.map((s) => `${s.startTime.trim().toUpperCase()}_${s.endTime.trim().toUpperCase()}`)
    );

    const createdSlots: AvailabilitySlot[] = [];
    const nowIso = new Date().toISOString();

    for (const intv of intervals) {
      const key = `${intv.startTime.trim().toUpperCase()}_${intv.endTime.trim().toUpperCase()}`;
      if (existingKeys.has(key)) {
        continue; // Skip duplicate
      }

      const docRef = doc(collection(db, FIRESTORE_COLLECTIONS.AVAILABILITY));
      const slot: AvailabilitySlot = {
        id: docRef.id,
        doctorId,
        date,
        startTime: intv.startTime.trim(),
        endTime: intv.endTime.trim(),
        status: 'available',
        active: true,
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      await setDoc(docRef, {
        ...slot,
        serverCreatedAt: serverTimestamp(),
        serverUpdatedAt: serverTimestamp(),
      });

      createdSlots.push(slot);
      existingKeys.add(key);
    }

    return createdSlots;
  },

  /**
   * Update slot status (e.g. block or open slot) (Admin)
   */
  async updateSlotStatus(slotId: string, status: SlotStatus): Promise<void> {
    const docRef = doc(db, FIRESTORE_COLLECTIONS.AVAILABILITY, slotId);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      const data = snap.data() as AvailabilitySlot;
      // Do not allow making a booked slot available without handling its appointment
      if (data.status === 'booked' && status === 'available') {
        throw new Error(
          'Cannot mark a booked slot as available directly. The appointment must be cancelled first.'
        );
      }
    }

    await updateDoc(docRef, {
      status,
      updatedAt: new Date().toISOString(),
      serverUpdatedAt: serverTimestamp(),
    });
  },

  /**
   * Delete an unbooked slot (Admin)
   */
  async deleteSlot(slotId: string): Promise<void> {
    const docRef = doc(db, FIRESTORE_COLLECTIONS.AVAILABILITY, slotId);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      const data = snap.data() as AvailabilitySlot;
      if (data.status === 'booked') {
        throw new Error('Cannot delete a booked appointment slot.');
      }
    }

    await deleteDoc(docRef);
  },
};
