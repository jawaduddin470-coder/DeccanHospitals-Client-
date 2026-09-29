import React, { useState } from 'react';
import type { Appointment } from '../../types';
import { Button } from '../common/Button';
import { HOSPITAL_CONFIG } from '../../config/constants';
import { generateAppointmentPdf } from '../../utils/generateAppointmentPdf';
import {
  CheckCircle2,
  Calendar,
  Clock,
  User,
  Phone,
  MapPin,
  Printer,
  PlusCircle,
  FileCheck,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

interface AppointmentConfirmationProps {
  appointment: Appointment;
  onBookAnother: () => void;
}

export const AppointmentConfirmation: React.FC<AppointmentConfirmationProps> = ({
  appointment,
  onBookAnother,
}) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const formattedDate = new Date(`${appointment.date}T12:00:00Z`).toLocaleDateString(
    'en-US',
    {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }
  );

  const handlePrint = async () => {
    setIsGeneratingPdf(true);
    setPdfError(null);
    try {
      await generateAppointmentPdf(appointment);
    } catch (err: unknown) {
      console.error('Failed to generate appointment PDF slip:', err);
      setPdfError('Unable to generate the appointment slip. Please try again.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#D6EAF1] shadow-lg text-center space-y-6">
        {/* Success Icon */}
        <div className="w-16 h-16 rounded-3xl bg-[#E2F4F9] text-[#0879A5] flex items-center justify-center mx-auto border border-[#BDE0EC] shadow-xs">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div className="space-y-1.5">
          <span className="text-[11px] font-mono font-semibold uppercase tracking-widest text-[#0879A5] bg-[#EEF8FB] px-3 py-1 rounded-full border border-[#D6EAF1]">
            Booking Confirmed
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#103A50] font-normal pt-1">
            Appointment Confirmed
          </h2>
          <p className="text-xs sm:text-sm text-[#617786] max-w-md mx-auto leading-relaxed">
            Your outpatient consultation slot has been reserved. Please present your reference number upon arrival at the hospital reception.
          </p>
        </div>

        {/* Reference Code Box */}
        <div className="p-4 rounded-2xl bg-[#F7FCFE] border border-[#D6EAF1] flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
          <div>
            <span className="text-[10px] font-mono uppercase text-[#617786] block">
              Booking Reference ID
            </span>
            <span className="font-mono text-base sm:text-lg font-bold text-[#103A50]">
              {appointment.id.startsWith('apt_') ? appointment.id : `DEC-${appointment.id.slice(0, 8).toUpperCase()}`}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#0879A5] font-mono bg-white px-3 py-1.5 rounded-lg border border-[#D6EAF1]">
            <FileCheck className="w-4 h-4" />
            <span>Status: Pending Review</span>
          </div>
        </div>

        {/* Detailed Consultation Breakdown */}
        <div className="p-5 rounded-2xl bg-[#EEF8FB]/40 border border-[#D6EAF1] text-left space-y-3.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <span className="text-[10px] font-mono uppercase text-[#617786] block">
                Consultant Doctor
              </span>
              <span className="font-semibold text-sm text-[#103A50] block mt-0.5">
                {appointment.doctorNameSnapshot}
              </span>
              <span className="text-[#0879A5] block">
                {appointment.specializationSnapshot}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase text-[#617786] block">
                Consultation Timing
              </span>
              <div className="flex items-center gap-1.5 font-semibold text-sm text-[#103A50] mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-[#0879A5]" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-[#0879A5]">
                <Clock className="w-3.5 h-3.5" />
                <span>{appointment.startTime} – {appointment.endTime}</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#D6EAF1] grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <span className="text-[10px] font-mono uppercase text-[#617786] block">
                Patient Name
              </span>
              <div className="flex items-center gap-1.5 font-medium text-[#103A50] mt-0.5">
                <User className="w-3.5 h-3.5 text-[#617786]" />
                <span>{appointment.patientName}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase text-[#617786] block">
                Contact Mobile
              </span>
              <div className="flex items-center gap-1.5 font-mono text-[#103A50] mt-0.5">
                <Phone className="w-3.5 h-3.5 text-[#617786]" />
                <span>+91 {appointment.phone}</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#D6EAF1] flex items-start gap-2 text-[#617786]">
            <MapPin className="w-4 h-4 text-[#0879A5] flex-shrink-0 mt-0.5" />
            <span>
              <strong>Hospital Venue:</strong> {HOSPITAL_CONFIG.address.fullFormatted}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="md"
              icon={
                isGeneratingPdf ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-[#0879A5]" />
                ) : (
                  <Printer className="w-4 h-4" />
                )
              }
              onClick={handlePrint}
              disabled={isGeneratingPdf}
            >
              {isGeneratingPdf ? 'Generating PDF...' : 'Print / Save Slip'}
            </Button>
            <Button
              type="button"
              variant="primary"
              size="md"
              icon={<PlusCircle className="w-4 h-4" />}
              onClick={onBookAnother}
            >
              Book Another Consultation
            </Button>
          </div>

          {pdfError && (
            <div className="p-3 rounded-xl bg-[#FFF8F8] border border-[#D93636]/30 text-xs text-[#D93636] flex items-center justify-center gap-2 max-w-md mx-auto">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{pdfError}</span>
            </div>
          )}
        </div>

        {/* Emergency Assistance Footer Note */}
        <div className="text-xs text-[#617786] pt-2 border-t border-[#D6EAF1]">
          <span>Need to reschedule or have queries? Call our helpdesk at </span>
          <a href={HOSPITAL_CONFIG.phones[0].raw} className="font-bold text-[#0879A5] hover:underline">
            {HOSPITAL_CONFIG.phones[0].number}
          </a>
          <span> / </span>
          <a href={HOSPITAL_CONFIG.phones[1].raw} className="font-bold text-[#0879A5] hover:underline">
            {HOSPITAL_CONFIG.phones[1].number}
          </a>
        </div>
      </div>
    </div>
  );
};
