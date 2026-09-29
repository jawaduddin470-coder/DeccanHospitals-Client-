import { HOSPITAL_CONFIG } from '../config.js';

export interface PatientAcknowledgementEmailData {
  bookingReference: string;
  patientName: string;
  doctorName: string;
  specialization: string;
  date: string;
  time: string;
  status: string;
}

export function generatePatientAcknowledgementEmail(data: PatientAcknowledgementEmailData): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = `Appointment Request Received — ${data.bookingReference}`;

  const text = `
Dear ${data.patientName},

Your appointment request has been received by Deccan Care Maternity & General Hospital.

BOOKING SUMMARY:
- Booking Reference: ${data.bookingReference}
- Doctor: ${data.doctorName}
- Specialization: ${data.specialization}
- Requested Date: ${data.date}
- Scheduled Time: ${data.time}
- Current Status: Pending Review

Our hospital coordination team is reviewing your requested slot. You will receive a confirmation once reviewed.

HOSPITAL LOCATION & CONTACT:
${HOSPITAL_CONFIG.fullName}
${HOSPITAL_CONFIG.address.fullFormatted}
Contact Helpline: ${HOSPITAL_CONFIG.phones.map((p) => p.display).join(' / ')}

If you have urgent medical needs, please call our 24/7 Emergency desk directly at ${HOSPITAL_CONFIG.emergencyPhone}.
`.trim();

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F7FCFE; margin: 0; padding: 20px; color: #17384A; }
    .card { max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 16px; border: 1px solid #D6EAF1; overflow: hidden; box-shadow: 0 4px 12px rgba(8, 121, 165, 0.06); }
    .header { background: #103A50; padding: 28px 32px; color: #FFFFFF; }
    .header-sub { font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; color: #9FD8EC; font-weight: 600; margin: 0 0 6px 0; }
    .header-title { font-size: 22px; font-weight: 600; margin: 0; color: #FFFFFF; }
    .content { padding: 32px; }
    .status-box { background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 12px; padding: 16px; margin: 20px 0; color: #92400E; font-size: 14px; line-height: 1.5; }
    .section-title { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #0879A5; margin: 24px 0 12px 0; border-bottom: 1px solid #EAF5F8; padding-bottom: 6px; }
    .table-data { width: 100%; border-collapse: collapse; margin-top: 8px; }
    .table-data td { padding: 10px 0; font-size: 14px; border-bottom: 1px solid #F0F6F8; vertical-align: top; }
    .table-data td.label { width: 38%; color: #617786; font-weight: 500; }
    .table-data td.value { width: 62%; color: #103A50; font-weight: 600; }
    .footer { background: #F7FCFE; padding: 20px 32px; border-top: 1px solid #D6EAF1; font-size: 12px; color: #617786; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <p class="header-sub">Appointment Acknowledgement</p>
      <h1 class="header-title">${HOSPITAL_CONFIG.fullName}</h1>
    </div>
    <div class="content">
      <p style="font-size: 16px; margin-top: 0; color: #103A50;">Dear <strong>${data.patientName}</strong>,</p>
      <p style="font-size: 14px; color: #617786; line-height: 1.6;">
        Your appointment request has been received. Our hospital coordination desk is reviewing the schedule.
      </p>

      <div class="status-box">
        <strong>Booking Status: Pending Review</strong><br>
        Your consultation slot has been reserved. You will receive an update once the appointment is confirmed by our clinical desk.
      </div>

      <div class="section-title">Consultation Summary</div>
      <table class="table-data">
        <tr>
          <td class="label">Booking Reference</td>
          <td class="value" style="color: #0879A5; font-family: monospace; font-size: 15px;">${data.bookingReference}</td>
        </tr>
        <tr>
          <td class="label">Doctor</td>
          <td class="value">${data.doctorName}</td>
        </tr>
        <tr>
          <td class="label">Specialization</td>
          <td class="value">${data.specialization}</td>
        </tr>
        <tr>
          <td class="label">Requested Date</td>
          <td class="value">${data.date}</td>
        </tr>
        <tr>
          <td class="label">Time Slot</td>
          <td class="value">${data.time}</td>
        </tr>
      </table>

      <div class="section-title">Hospital Location</div>
      <p style="font-size: 14px; color: #17384A; margin-bottom: 4px; line-height: 1.5;">
        ${HOSPITAL_CONFIG.address.fullFormatted}
      </p>
      <p style="font-size: 13px; color: #617786; margin-top: 4px;">
        Reception Helplines: ${HOSPITAL_CONFIG.phones.map((p) => p.display).join(' / ')}
      </p>
    </div>
    <div class="footer">
      <strong>${HOSPITAL_CONFIG.fullName}</strong> — Kalaburagi, Karnataka<br>
      For urgent medical emergencies, please call our 24/7 Casualty Desk: ${HOSPITAL_CONFIG.emergencyPhone}
    </div>
  </div>
</body>
</html>
`.trim();

  return { subject, html, text };
}
