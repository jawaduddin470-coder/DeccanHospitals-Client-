import { HOSPITAL_CONFIG } from '../config.js';

export interface HospitalNewAppointmentEmailData {
  bookingReference: string;
  patientName: string;
  phone: string;
  email?: string;
  doctorName: string;
  specialization: string;
  date: string;
  time: string;
  reason?: string;
  status: string;
}

export function generateHospitalNewAppointmentEmail(data: HospitalNewAppointmentEmailData): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = `New Appointment Request — ${data.bookingReference}`;

  const text = `
DECCAN CARE MATERNITY & GENERAL HOSPITAL
NEW APPOINTMENT NOTIFICATION

Booking Reference: ${data.bookingReference}
Status: ${data.status.toUpperCase()}

PATIENT DETAILS:
- Name: ${data.patientName}
- Phone: ${data.phone}
- Email: ${data.email || 'Not provided'}

CONSULTATION DETAILS:
- Doctor: ${data.doctorName}
- Specialization: ${data.specialization}
- Date: ${data.date}
- Time: ${data.time}
- Reason for Visit: ${data.reason || 'General Consultation'}

Hospital Address:
${HOSPITAL_CONFIG.address.fullFormatted}
Phones: ${HOSPITAL_CONFIG.phones.map((p) => p.display).join(' / ')}
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
    .badge { display: inline-block; padding: 6px 14px; background: #E6F5FA; color: #0879A5; font-size: 12px; font-weight: 700; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px; }
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
      <p class="header-sub">Administrative Reception Notification</p>
      <h1 class="header-title">${HOSPITAL_CONFIG.fullName}</h1>
    </div>
    <div class="content">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <span class="badge">Booking: ${data.bookingReference}</span>
        <span style="font-size: 13px; color: #D97706; font-weight: 600;">Status: Pending Review</span>
      </div>

      <div class="section-title">Patient Information</div>
      <table class="table-data">
        <tr>
          <td class="label">Patient Name</td>
          <td class="value">${data.patientName}</td>
        </tr>
        <tr>
          <td class="label">Contact Phone</td>
          <td class="value"><a href="tel:${data.phone}" style="color: #0879A5; text-decoration: none;">${data.phone}</a></td>
        </tr>
        <tr>
          <td class="label">Patient Email</td>
          <td class="value">${data.email || '<span style="color: #8C9EA8; font-weight: normal;">Not provided</span>'}</td>
        </tr>
      </table>

      <div class="section-title">Appointment Details</div>
      <table class="table-data">
        <tr>
          <td class="label">Specialist Doctor</td>
          <td class="value">${data.doctorName}</td>
        </tr>
        <tr>
          <td class="label">Specialization</td>
          <td class="value">${data.specialization}</td>
        </tr>
        <tr>
          <td class="label">Date</td>
          <td class="value">${data.date}</td>
        </tr>
        <tr>
          <td class="label">Scheduled Time</td>
          <td class="value">${data.time}</td>
        </tr>
        <tr>
          <td class="label">Reason for Visit</td>
          <td class="value">${data.reason || 'General medical consultation'}</td>
        </tr>
      </table>
    </div>
    <div class="footer">
      <strong>${HOSPITAL_CONFIG.fullName}</strong><br>
      ${HOSPITAL_CONFIG.address.fullFormatted}<br>
      Emergency & Reception: ${HOSPITAL_CONFIG.phones.map((p) => p.display).join(' / ')}
    </div>
  </div>
</body>
</html>
`.trim();

  return { subject, html, text };
}
