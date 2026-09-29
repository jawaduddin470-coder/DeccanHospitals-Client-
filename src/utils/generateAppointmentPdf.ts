import { jsPDF } from 'jspdf';
import type { Appointment } from '../types';
import { HOSPITAL_CONFIG } from '../config/constants';

/**
 * Generate and download a professional A4 Appointment Confirmation PDF slip
 * for Deccan Care Maternity & General Hospital.
 */
export async function generateAppointmentPdf(appointment: Appointment): Promise<void> {
  // Create A4 PDF in portrait mode (210mm x 297mm)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const margin = 18;
  const contentWidth = pageWidth - margin * 2; // 174mm

  // Format reference ID
  const refId = appointment.id.startsWith('apt_')
    ? appointment.id
    : `DEC-${appointment.id.slice(0, 8).toUpperCase()}`;

  // Format date
  const formattedDate = new Date(`${appointment.date}T12:00:00Z`).toLocaleDateString(
    'en-US',
    {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }
  );

  let y = 14;

  // 1. Top Decorative Brand Bar
  doc.setFillColor(8, 121, 165); // #0879A5
  doc.rect(margin, y, contentWidth, 3, 'F');
  y += 9;

  // 2. Hospital Header Identity
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.setTextColor(16, 58, 80); // #103A50
  doc.text('DECCAN CARE', margin, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(8, 121, 165); // #0879A5
  doc.text('MATERNITY & GENERAL HOSPITAL', margin, y + 5);

  // Hospital Address & Phone (Right aligned)
  doc.setFontSize(8);
  doc.setTextColor(97, 119, 134); // #617786
  const addr1 = 'Near Quadri Chowk, Opp. Bharat Petrol Bunk, Sheikh Roza';
  const addr2 = 'Kalaburagi, Karnataka - 585101';
  const phoneText = `Helpdesk: ${HOSPITAL_CONFIG.phones[0].number} / ${HOSPITAL_CONFIG.phones[1].number}`;

  doc.text(addr1, pageWidth - margin, y - 1, { align: 'right' });
  doc.text(addr2, pageWidth - margin, y + 3, { align: 'right' });
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 58, 80);
  doc.text(phoneText, pageWidth - margin, y + 7, { align: 'right' });

  y += 14;

  // Divider Line
  doc.setDrawColor(214, 234, 241); // #D6EAF1
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 7;

  // 3. Document Title & Badge Banner
  doc.setFillColor(244, 250, 252); // #F4FAFC
  doc.roundedRect(margin, y, contentWidth, 24, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(16, 58, 80);
  doc.text('APPOINTMENT CONFIRMATION SLIP', margin + 6, y + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(97, 119, 134);
  doc.text('Outpatient Consultation & Hospital Visit Pass', margin + 6, y + 14);

  // Status Badge on Right
  doc.setFillColor(226, 244, 249); // #E2F4F9
  doc.roundedRect(pageWidth - margin - 48, y + 5, 42, 14, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(8, 121, 165);
  doc.text('STATUS', pageWidth - margin - 27, y + 10, { align: 'center' });
  doc.setFontSize(8.5);
  doc.setTextColor(16, 58, 80);
  const statusLabel = appointment.status === 'confirmed' ? 'Confirmed' : 'Pending Review';
  doc.text(statusLabel, pageWidth - margin - 27, y + 15, { align: 'center' });

  y += 30;

  // 4. Booking Reference Box
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(8, 121, 165);
  doc.setLineWidth(0.6);
  doc.roundedRect(margin, y, contentWidth, 16, 2.5, 2.5, 'D');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(97, 119, 134);
  doc.text('BOOKING REFERENCE ID', margin + 6, y + 6);

  doc.setFont('courier', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(16, 58, 80);
  doc.text(refId, margin + 6, y + 12);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(97, 119, 134);
  doc.text('Please present this reference ID at reception', pageWidth - margin - 6, y + 9.5, { align: 'right' });

  y += 22;

  // Helper function to draw structured data sections
  const drawSection = (title: string, fields: Array<{ label: string; value: string; isBold?: boolean }>) => {
    // Section Header
    doc.setFillColor(238, 248, 251); // #EEF8FB
    doc.rect(margin, y, contentWidth, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(8, 121, 165);
    doc.text(title.toUpperCase(), margin + 4, y + 5);
    y += 9;

    // Section Content Grid
    doc.setFontSize(9);
    for (let i = 0; i < fields.length; i += 2) {
      const field1 = fields[i];
      const field2 = fields[i + 1];

      // Col 1
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(97, 119, 134);
      doc.text(field1.label, margin + 4, y + 4);
      doc.setFont('helvetica', field1.isBold ? 'bold' : 'normal');
      doc.setTextColor(23, 56, 74);
      doc.text(field1.value, margin + 45, y + 4);

      // Col 2 (if exists)
      if (field2) {
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(97, 119, 134);
        doc.text(field2.label, margin + 92, y + 4);
        doc.setFont('helvetica', field2.isBold ? 'bold' : 'normal');
        doc.setTextColor(23, 56, 74);
        doc.text(field2.value, margin + 130, y + 4);
      }

      y += 7;
    }
    y += 3;
  };

  // 5. Patient Details Section
  drawSection('1. Patient Information', [
    { label: 'Patient Name:', value: appointment.patientName, isBold: true },
    { label: 'Mobile Number:', value: `+91 ${appointment.phone}`, isBold: true },
    { label: 'Email Address:', value: appointment.email || 'Not provided' },
    { label: 'Consultation Type:', value: 'Outpatient (OPD)' },
  ]);

  // 6. Consultation Details Section
  drawSection('2. Appointment Schedule', [
    { label: 'Consultant Doctor:', value: appointment.doctorNameSnapshot, isBold: true },
    { label: 'Specialization:', value: appointment.specializationSnapshot },
    { label: 'Consultation Date:', value: formattedDate, isBold: true },
    { label: 'Slot Timing:', value: `${appointment.startTime} – ${appointment.endTime}`, isBold: true },
  ]);

  // 7. Hospital Location & Venue Section
  drawSection('3. Hospital Venue & Reporting', [
    { label: 'Hospital:', value: HOSPITAL_CONFIG.fullName, isBold: true },
    { label: 'Department:', value: appointment.specializationSnapshot },
    { label: 'Address:', value: HOSPITAL_CONFIG.address.fullFormatted },
  ]);

  // 8. Important Patient Guidelines Box
  y += 2;
  doc.setFillColor(254, 248, 248); // #FEF8F8 (Warm subtle container)
  doc.setDrawColor(217, 54, 54); // #D93636
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentWidth, 22, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(217, 54, 54);
  doc.text('IMPORTANT PATIENT INSTRUCTIONS', margin + 5, y + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(80, 90, 95);
  doc.text('• Please carry this confirmation slip or state your Booking Reference ID at the hospital reception.', margin + 5, y + 10.5);
  doc.text('• Please arrive 10 to 15 minutes before your scheduled appointment time.', margin + 5, y + 15);
  doc.text(`• 24×7 Emergency & Maternity Casualty Desk: ${HOSPITAL_CONFIG.emergencyPhone.number} / ${HOSPITAL_CONFIG.phones[1].number}`, margin + 5, y + 19.5);

  y += 28;

  // 9. Verification Footer & Timestamp
  doc.setDrawColor(214, 234, 241);
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageWidth - margin, y);
  y += 5;

  const nowFormatted = new Date().toLocaleString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(140, 155, 165);
  doc.text(`Generated on: ${nowFormatted} | Deccan Care Maternity & General Hospital`, margin, y);
  doc.text('Official Hospital Confirmation Record', pageWidth - margin, y, { align: 'right' });

  // 10. Download PDF Directly
  const sanitizedRef = refId.replace(/[^a-zA-Z0-9-_]/g, '_');
  const filename = `Deccan-Care-Appointment-${sanitizedRef}.pdf`;

  doc.save(filename);
}
