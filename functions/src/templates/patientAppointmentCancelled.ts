import { HOSPITAL_CONFIG } from '../config.js';

export interface PatientCancelledEmailData {
  bookingReference: string;
  patientName: string;
  doctorName: string;
  date: string;
  time: string;
  reason?: string;
}

export function generatePatientCancelledEmail(data: PatientCancelledEmailData): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = `Appointment Cancellation Notice — ${data.bookingReference}`;

  const text = `
Dear ${data.patientName},

Your appointment has been cancelled at Deccan Care Maternity & General Hospital.

CANCELLED APPOINTMENT DETAILS:
- Booking Reference: ${data.bookingReference}
- Doctor: ${data.doctorName}
- Date: ${data.date}
- Time: ${data.time}
- Status: CANCELLED

If you did not request this cancellation or would like to reschedule your consultation, please contact our hospital desk or visit our website to book another convenient slot.

HOSPITAL CONTACT & ASSISTANCE:
${HOSPITAL_CONFIG.fullName}
${HOSPITAL_CONFIG.address.fullFormatted}
Helpline: ${HOSPITAL_CONFIG.phones.map((p) => p.display).join(' / ')}
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
    .header { background: #64748B; padding: 28px 32px; color: #FFFFFF; }
    .header-sub { font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; color: #E2E8F0; font-weight: 600; margin: 0 0 6px 0; }
    .header-title { font-size: 22px; font-weight: 600; margin: 0; color: #FFFFFF; }
    .content { padding: 32px; }
    .status-badge { display: inline-block; background: #FEE2E2; color: #DC2626; font-size: 13px; font-weight: 700; padding: 6px 14px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px; }
    .notice-box { background: #FEF2F2; border: 1px solid #FECACA; border-radius: 12px; padding: 16px; margin: 20px 0; color: #991B1B; font-size: 14px; line-height: 1.5; }
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
      <p class="header-sub">Appointment Cancellation</p>
      <h1 class="header-title">${HOSPITAL_CONFIG.fullName}</h1>
    </div>
    <div class="content">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <span class="status-badge">Cancelled</span>
        <span style="font-family: monospace; font-size: 14px; font-weight: 700; color: #64748B;">Ref: ${data.bookingReference}</span>
      </div>

      <p style="font-size: 16px; margin-top: 0; color: #103A50;">Dear <strong>${data.patientName}</strong>,</p>
      
      <div class="notice-box">
        <strong>Your appointment has been cancelled.</strong><br>
        The previously reserved consultation slot is no longer scheduled.
      </div>

      <div class="section-title">Cancelled Schedule Details</div>
      <table class="table-data">
        <tr>
          <td class="label">Doctor</td>
          <td class="value">${data.doctorName}</td>
        </tr>
        <tr>
          <td class="label">Cancelled Date</td>
          <td class="value">${data.date}</td>
        </tr>
        <tr>
          <td class="label">Cancelled Time</td>
          <td class="value">${data.time}</td>
        </tr>
      </table>

      <div class="section-title">Rescheduling &amp; Contact</div>
      <p style="font-size: 14px; color: #617786; line-height: 1.6; margin-bottom: 12px;">
        If you would like to book an alternative appointment date or have any questions, please contact our hospital coordination desk:
      </p>
      <p style="font-size: 13px; color: #103A50; font-weight: 600; margin: 4px 0;">
        Helpline: ${HOSPITAL_CONFIG.phones.map((p) => p.display).join(' / ')}
      </p>
    </div>
    <div class="footer">
      <strong>${HOSPITAL_CONFIG.fullName}</strong> — Kalaburagi, Karnataka<br>
      ${HOSPITAL_CONFIG.address.fullFormatted}
    </div>
  </div>
</body>
</html>
`.trim();

  return { subject, html, text };
}
