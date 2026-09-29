import { HOSPITAL_CONFIG } from '../config.js';

export interface PatientConfirmedEmailData {
  bookingReference: string;
  patientName: string;
  doctorName: string;
  specialization: string;
  date: string;
  time: string;
}

export function generatePatientConfirmedEmail(data: PatientConfirmedEmailData): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = `Appointment Confirmed — ${data.bookingReference}`;

  const text = `
Dear ${data.patientName},

Your appointment has been confirmed at Deccan Care Maternity & General Hospital.

CONFIRMED APPOINTMENT DETAILS:
- Booking Reference: ${data.bookingReference}
- Doctor: ${data.doctorName}
- Specialization: ${data.specialization}
- Date: ${data.date}
- Time: ${data.time}
- Status: CONFIRMED

PATIENT INSTRUCTIONS:
- Please arrive 10-15 minutes prior to your scheduled consultation time.
- Carry any previous medical reports, prescriptions, or discharge summaries.
- Check in at the main reception counter with your Booking Reference (${data.bookingReference}).

HOSPITAL LOCATION & CONTACT:
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
    .header { background: #0879A5; padding: 28px 32px; color: #FFFFFF; }
    .header-sub { font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; color: #E6F5FA; font-weight: 600; margin: 0 0 6px 0; }
    .header-title { font-size: 22px; font-weight: 600; margin: 0; color: #FFFFFF; }
    .content { padding: 32px; }
    .status-badge { display: inline-block; background: #DCFCE7; color: #15803D; font-size: 13px; font-weight: 700; padding: 6px 14px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px; }
    .section-title { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #0879A5; margin: 24px 0 12px 0; border-bottom: 1px solid #EAF5F8; padding-bottom: 6px; }
    .table-data { width: 100%; border-collapse: collapse; margin-top: 8px; }
    .table-data td { padding: 10px 0; font-size: 14px; border-bottom: 1px solid #F0F6F8; vertical-align: top; }
    .table-data td.label { width: 38%; color: #617786; font-weight: 500; }
    .table-data td.value { width: 62%; color: #103A50; font-weight: 600; }
    .instructions { background: #F2FAFD; border: 1px solid #D6EAF1; border-radius: 12px; padding: 16px; margin: 24px 0; font-size: 13px; color: #103A50; line-height: 1.6; }
    .footer { background: #F7FCFE; padding: 20px 32px; border-top: 1px solid #D6EAF1; font-size: 12px; color: #617786; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <p class="header-sub">Appointment Confirmation</p>
      <h1 class="header-title">${HOSPITAL_CONFIG.fullName}</h1>
    </div>
    <div class="content">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <span class="status-badge">Confirmed</span>
        <span style="font-family: monospace; font-size: 14px; font-weight: 700; color: #0879A5;">Ref: ${data.bookingReference}</span>
      </div>

      <p style="font-size: 16px; margin-top: 0; color: #103A50;">Dear <strong>${data.patientName}</strong>,</p>
      <p style="font-size: 14px; color: #617786; line-height: 1.6;">
        Your appointment has been <strong>confirmed</strong> with our specialist team.
      </p>

      <div class="section-title">Confirmed Schedule</div>
      <table class="table-data">
        <tr>
          <td class="label">Doctor</td>
          <td class="value">${data.doctorName}</td>
        </tr>
        <tr>
          <td class="label">Specialization</td>
          <td class="value">${data.specialization}</td>
        </tr>
        <tr>
          <td class="label">Confirmed Date</td>
          <td class="value">${data.date}</td>
        </tr>
        <tr>
          <td class="label">Confirmed Time</td>
          <td class="value">${data.time}</td>
        </tr>
      </table>

      <div class="instructions">
        <strong>Important Visit Information:</strong>
        <ul style="margin: 8px 0 0 0; padding-left: 18px;">
          <li>Please arrive 10–15 minutes prior to your consultation time.</li>
          <li>Bring any prior medical records, test reports, or current prescription sheets.</li>
          <li>Mention your Booking Reference (<strong>${data.bookingReference}</strong>) at the reception desk.</li>
        </ul>
      </div>

      <div class="section-title">Hospital Address &amp; Directions</div>
      <p style="font-size: 14px; color: #17384A; margin-bottom: 4px; line-height: 1.5;">
        ${HOSPITAL_CONFIG.address.fullFormatted}
      </p>
      <p style="font-size: 13px; color: #617786; margin-top: 4px;">
        Helpdesk Contact: ${HOSPITAL_CONFIG.phones.map((p) => p.display).join(' / ')}
      </p>
    </div>
    <div class="footer">
      <strong>${HOSPITAL_CONFIG.fullName}</strong> — Kalaburagi, Karnataka<br>
      For urgent assistance or schedule changes, please call our desk: ${HOSPITAL_CONFIG.phones[0].display}
    </div>
  </div>
</body>
</html>
`.trim();

  return { subject, html, text };
}
