import * as admin from 'firebase-admin';
import { onDocumentCreated, onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { HOSPITAL_CONFIG, FIRESTORE_COLLECTIONS } from './config.js';
import { sendTransactionalEmail } from './services/emailService.js';
import { generateHospitalNewAppointmentEmail } from './templates/hospitalNewAppointment.js';
import { generatePatientAcknowledgementEmail } from './templates/patientBookingAcknowledgement.js';
import { generatePatientConfirmedEmail } from './templates/patientAppointmentConfirmed.js';
import { generatePatientCancelledEmail } from './templates/patientAppointmentCancelled.js';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * TRIGGER 1: onAppointmentCreated
 * Runs whenever a new appointment document is created in Firestore.
 * 1. Sends hospital administrative notification to deccancarehospital.24ths@gmail.com
 * 2. Sends patient acknowledgement email if patient email is provided
 * 3. Updates notification metadata in Firestore safely (never rolls back the appointment)
 */
export const onAppointmentCreated = onDocumentCreated(
  {
    document: `${FIRESTORE_COLLECTIONS.APPOINTMENTS}/{appointmentId}`,
    region: 'asia-south1',
  },
  async (event) => {
    const snap = event.data;
    if (!snap) {
      console.log('No snapshot data found for onAppointmentCreated event.');
      return;
    }

    const appointment = snap.data();
    const appointmentId = event.params.appointmentId;
    const bookingRef = `DEC-${appointmentId.substring(0, 6).toUpperCase()}`;

    console.log(`[onAppointmentCreated] Processing appointment ${appointmentId} (${bookingRef})`);

    const nowIso = new Date().toISOString();
    let hospitalStatus: 'sent' | 'failed' = 'failed';
    let hospitalError: string | undefined = undefined;

    let patientStatus: 'sent' | 'failed' | 'not_applicable' = 'not_applicable';
    let patientError: string | undefined = undefined;

    // 1. Send Hospital Notification to deccancarehospital.24ths@gmail.com
    try {
      const hospitalEmail = generateHospitalNewAppointmentEmail({
        bookingReference: bookingRef,
        patientName: appointment.patientName || 'Unknown Patient',
        phone: appointment.phone || 'N/A',
        email: appointment.email,
        doctorName: appointment.doctorNameSnapshot || 'Specialist Doctor',
        specialization: appointment.specializationSnapshot || 'General Medicine',
        date: appointment.date || '',
        time: appointment.startTime ? `${appointment.startTime} - ${appointment.endTime || ''}` : '',
        reason: appointment.reason,
        status: appointment.status || 'pending',
      });

      const res = await sendTransactionalEmail({
        to: HOSPITAL_CONFIG.notificationEmail,
        subject: hospitalEmail.subject,
        html: hospitalEmail.html,
        text: hospitalEmail.text,
      });

      if (res.success) {
        hospitalStatus = 'sent';
      } else {
        hospitalStatus = 'failed';
        hospitalError = res.error;
      }
    } catch (err: any) {
      console.error(`[onAppointmentCreated] Hospital notification exception for ${appointmentId}:`, err);
      hospitalStatus = 'failed';
      hospitalError = err?.message || 'Hospital email delivery exception';
    }

    // 2. Send Patient Booking Acknowledgement (if patient email provided)
    if (appointment.email && typeof appointment.email === 'string' && appointment.email.includes('@')) {
      try {
        const patientEmail = generatePatientAcknowledgementEmail({
          bookingReference: bookingRef,
          patientName: appointment.patientName || 'Patient',
          doctorName: appointment.doctorNameSnapshot || 'Specialist Doctor',
          specialization: appointment.specializationSnapshot || 'Healthcare Department',
          date: appointment.date || '',
          time: appointment.startTime ? `${appointment.startTime} - ${appointment.endTime || ''}` : '',
          status: appointment.status || 'pending',
        });

        const res = await sendTransactionalEmail({
          to: appointment.email.trim(),
          subject: patientEmail.subject,
          html: patientEmail.html,
          text: patientEmail.text,
        });

        if (res.success) {
          patientStatus = 'sent';
        } else {
          patientStatus = 'failed';
          patientError = res.error;
        }
      } catch (err: any) {
        console.error(`[onAppointmentCreated] Patient acknowledgement exception for ${appointmentId}:`, err);
        patientStatus = 'failed';
        patientError = err?.message || 'Patient acknowledgement email exception';
      }
    }

    // 3. Update Firestore Document with Notification Results
    try {
      const overallStatus =
        hospitalStatus === 'sent' && (patientStatus === 'sent' || patientStatus === 'not_applicable')
          ? 'sent'
          : 'failed';

      await snap.ref.update({
        notificationStatus: overallStatus,
        hospitalNotificationStatus: hospitalStatus,
        patientNotificationStatus: patientStatus,
        notificationMeta: {
          hospitalStatus,
          hospitalSentAt: hospitalStatus === 'sent' ? nowIso : undefined,
          hospitalError: hospitalError || null,
          patientStatus,
          patientSentAt: patientStatus === 'sent' ? nowIso : undefined,
          patientError: patientError || null,
          lastAttemptAt: nowIso,
        },
      });
      console.log(`[onAppointmentCreated] Status updated for ${appointmentId}: overall=${overallStatus}`);
    } catch (dbErr) {
      console.error(`[onAppointmentCreated] Failed to update notificationMeta for ${appointmentId}:`, dbErr);
    }
  }
);

/**
 * TRIGGER 2: onAppointmentUpdated
 * Runs whenever an appointment document is modified in Firestore.
 * Handles lifecycle state transitions:
 * - pending -> confirmed => Sends Confirmation Email to Patient
 * - * -> cancelled => Sends Cancellation Email to Patient
 * Duplicate guards prevent multiple dispatches.
 */
export const onAppointmentUpdated = onDocumentUpdated(
  {
    document: `${FIRESTORE_COLLECTIONS.APPOINTMENTS}/{appointmentId}`,
    region: 'asia-south1',
  },
  async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    const appointmentId = event.params.appointmentId;
    const appointmentRef = event.data?.after.ref;

    if (!before || !after || !appointmentRef) {
      return;
    }

    const prevStatus = before.status;
    const newStatus = after.status;

    // No status change
    if (prevStatus === newStatus) {
      return;
    }

    const bookingRef = `DEC-${appointmentId.substring(0, 6).toUpperCase()}`;
    const patientEmailAddr = after.email;
    const nowIso = new Date().toISOString();
    const existingMeta = after.notificationMeta || {};

    // TRANSITION A: pending -> confirmed
    if (prevStatus === 'pending' && newStatus === 'confirmed') {
      // Duplicate guard: check if already sent
      if (existingMeta.confirmationSentAt) {
        console.log(`[onAppointmentUpdated] Confirmation email already sent for ${appointmentId}. Skipping.`);
        return;
      }

      if (patientEmailAddr && typeof patientEmailAddr === 'string' && patientEmailAddr.includes('@')) {
        console.log(`[onAppointmentUpdated] Sending Confirmation Email for ${appointmentId}`);
        const template = generatePatientConfirmedEmail({
          bookingReference: bookingRef,
          patientName: after.patientName || 'Patient',
          doctorName: after.doctorNameSnapshot || 'Specialist Doctor',
          specialization: after.specializationSnapshot || 'General Medicine',
          date: after.date || '',
          time: after.startTime ? `${after.startTime} - ${after.endTime || ''}` : '',
        });

        const res = await sendTransactionalEmail({
          to: patientEmailAddr.trim(),
          subject: template.subject,
          html: template.html,
          text: template.text,
        });

        await appointmentRef.update({
          'notificationMeta.confirmationSentAt': res.success ? nowIso : null,
          'notificationMeta.confirmationStatus': res.success ? 'sent' : 'failed',
          'notificationMeta.lastAttemptAt': nowIso,
        });
      }
    }

    // TRANSITION B: * -> cancelled
    if (prevStatus !== 'cancelled' && newStatus === 'cancelled') {
      // Duplicate guard: check if cancellation already dispatched
      if (existingMeta.cancellationSentAt) {
        console.log(`[onAppointmentUpdated] Cancellation email already sent for ${appointmentId}. Skipping.`);
        return;
      }

      if (patientEmailAddr && typeof patientEmailAddr === 'string' && patientEmailAddr.includes('@')) {
        console.log(`[onAppointmentUpdated] Sending Cancellation Email for ${appointmentId}`);
        const template = generatePatientCancelledEmail({
          bookingReference: bookingRef,
          patientName: after.patientName || 'Patient',
          doctorName: after.doctorNameSnapshot || 'Specialist Doctor',
          date: after.date || '',
          time: after.startTime ? `${after.startTime} - ${after.endTime || ''}` : '',
          reason: after.reason,
        });

        const res = await sendTransactionalEmail({
          to: patientEmailAddr.trim(),
          subject: template.subject,
          html: template.html,
          text: template.text,
        });

        await appointmentRef.update({
          'notificationMeta.cancellationSentAt': res.success ? nowIso : null,
          'notificationMeta.cancellationStatus': res.success ? 'sent' : 'failed',
          'notificationMeta.lastAttemptAt': nowIso,
        });
      }
    }
  }
);

/**
 * CALLABLE FUNCTION: retryAppointmentNotification
 * Allows an authenticated hospital administrator to retry failed email notifications
 */
export const retryAppointmentNotification = onCall(
  { region: 'asia-south1' },
  async (request) => {
    // 1. Verify caller authentication
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Must be authenticated to trigger email retries.');
    }

    // 2. Verify admin permission
    const callerUid = request.auth.uid;
    const adminDoc = await db.collection(FIRESTORE_COLLECTIONS.ADMINS).doc(callerUid).get();
    const isAdmin = request.auth.token.admin === true || (adminDoc.exists && adminDoc.data()?.role === 'admin');

    if (!isAdmin) {
      throw new HttpsError('permission-denied', 'Only authorized administrators can trigger email retries.');
    }

    const { appointmentId } = request.data;
    if (!appointmentId || typeof appointmentId !== 'string') {
      throw new HttpsError('invalid-argument', 'Missing valid appointmentId.');
    }

    const appointmentDoc = await db.collection(FIRESTORE_COLLECTIONS.APPOINTMENTS).doc(appointmentId).get();
    if (!appointmentDoc.exists) {
      throw new HttpsError('not-found', 'Appointment record not found.');
    }

    const appointment = appointmentDoc.data()!;
    const bookingRef = `DEC-${appointmentId.substring(0, 6).toUpperCase()}`;
    const nowIso = new Date().toISOString();

    // Re-dispatch hospital email
    const hospitalEmail = generateHospitalNewAppointmentEmail({
      bookingReference: bookingRef,
      patientName: appointment.patientName || 'Unknown Patient',
      phone: appointment.phone || 'N/A',
      email: appointment.email,
      doctorName: appointment.doctorNameSnapshot || 'Specialist Doctor',
      specialization: appointment.specializationSnapshot || 'General Medicine',
      date: appointment.date || '',
      time: appointment.startTime ? `${appointment.startTime} - ${appointment.endTime || ''}` : '',
      reason: appointment.reason,
      status: appointment.status || 'pending',
    });

    const hospitalRes = await sendTransactionalEmail({
      to: HOSPITAL_CONFIG.notificationEmail,
      subject: hospitalEmail.subject,
      html: hospitalEmail.html,
      text: hospitalEmail.text,
    });

    let patientRes: import('./services/emailService.js').SendEmailResult = { success: true, simulated: false };
    if (appointment.email && appointment.email.includes('@')) {
      const patientEmail = generatePatientAcknowledgementEmail({
        bookingReference: bookingRef,
        patientName: appointment.patientName || 'Patient',
        doctorName: appointment.doctorNameSnapshot || 'Specialist Doctor',
        specialization: appointment.specializationSnapshot || 'Healthcare Department',
        date: appointment.date || '',
        time: appointment.startTime ? `${appointment.startTime} - ${appointment.endTime || ''}` : '',
        status: appointment.status || 'pending',
      });

      patientRes = await sendTransactionalEmail({
        to: appointment.email.trim(),
        subject: patientEmail.subject,
        html: patientEmail.html,
        text: patientEmail.text,
      });
    }

    const overallSuccess = hospitalRes.success && patientRes.success;

    await appointmentDoc.ref.update({
      notificationStatus: overallSuccess ? 'sent' : 'failed',
      hospitalNotificationStatus: hospitalRes.success ? 'sent' : 'failed',
      patientNotificationStatus: appointment.email ? (patientRes.success ? 'sent' : 'failed') : 'not_applicable',
      'notificationMeta.lastAttemptAt': nowIso,
      'notificationMeta.retriedBy': callerUid,
    });

    return {
      success: overallSuccess,
      hospitalSuccess: hospitalRes.success,
      patientSuccess: patientRes.success,
    };
  }
);
