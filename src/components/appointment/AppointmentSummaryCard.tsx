import React from 'react';
import type { Doctor, AvailabilitySlot } from '../../types';
import { Button } from '../common/Button';
import {
  Calendar,
  Clock,
  User,
  Phone,
  Stethoscope,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

interface AppointmentSummaryCardProps {
  doctor: Doctor | null;
  date: string;
  slot: AvailabilitySlot | null;
  patientName: string;
  phone: string;
  email?: string;
  reason?: string;
  isSubmitting: boolean;
  submissionError: string | null;
  onConfirmBooking: () => void;
  onEditStep?: (step: number) => void;
}

export const AppointmentSummaryCard: React.FC<AppointmentSummaryCardProps> = ({
  doctor,
  date,
  slot,
  patientName,
  phone,
  email,
  reason,
  isSubmitting,
  submissionError,
  onConfirmBooking,
}) => {
  if (!doctor || !slot) return null;

  // Format date nicely
  const formattedDate = new Date(`${date}T12:00:00Z`).toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-serif text-lg sm:text-xl text-[#103A50] font-medium">
          Step 6: Review &amp; Confirm Booking
        </h3>
        <p className="text-xs text-[#617786] mt-0.5">
          Verify consultation details before securing your time slot
        </p>
      </div>

      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#EEF8FB] via-white to-[#F7FCFE] border border-[#D6EAF1] shadow-xs space-y-4">
        {/* Doctor & Slot Header */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-[#D6EAF1]">
          {/* Doctor Info */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0879A5] text-white flex items-center justify-center flex-shrink-0">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#0879A5] font-semibold block">
                Doctor / Specialist
              </span>
              <h4 className="font-serif text-base font-bold text-[#103A50]">
                {doctor.name}
              </h4>
              <p className="text-xs text-[#617786]">
                {doctor.specialization} {doctor.qualification ? `(${doctor.qualification})` : ''}
              </p>
            </div>
          </div>

          {/* Schedule Info */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#103A50] text-white flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#0879A5] font-semibold block">
                Date &amp; Time Slot
              </span>
              <h4 className="font-serif text-base font-bold text-[#103A50]">
                {formattedDate}
              </h4>
              <div className="flex items-center gap-1.5 text-xs text-[#0879A5] font-mono font-medium mt-0.5">
                <Clock className="w-3.5 h-3.5" />
                <span>{slot.startTime} – {slot.endTime}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Patient Details Snapshot */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-white border border-[#D6EAF1]">
            <div className="flex items-center gap-1.5 text-[#617786] mb-1">
              <User className="w-3.5 h-3.5 text-[#0879A5]" />
              <span className="text-[10px] font-mono uppercase">Patient Name</span>
            </div>
            <span className="font-semibold text-[#103A50] block truncate">
              {patientName || '—'}
            </span>
            {email && (
              <span className="text-[10px] text-[#617786] block truncate mt-0.5">
                {email}
              </span>
            )}
          </div>

          <div className="p-3 rounded-xl bg-white border border-[#D6EAF1]">
            <div className="flex items-center gap-1.5 text-[#617786] mb-1">
              <Phone className="w-3.5 h-3.5 text-[#0879A5]" />
              <span className="text-[10px] font-mono uppercase">Mobile Number</span>
            </div>
            <span className="font-mono font-semibold text-[#103A50] block">
              +91 {phone || '—'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white border border-[#D6EAF1]">
            <div className="flex items-center gap-1.5 text-[#617786] mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0879A5]" />
              <span className="text-[10px] font-mono uppercase">Location</span>
            </div>
            <span className="font-semibold text-[#103A50] block truncate">
              Sheikh Roza, Kalaburagi
            </span>
          </div>
        </div>

        {reason && (
          <div className="text-xs text-[#617786] bg-white p-3 rounded-xl border border-[#D6EAF1]">
            <span className="font-semibold text-[#103A50]">Visit Reason: </span>
            <span>{reason}</span>
          </div>
        )}

        {/* Error Banner if submission fails (e.g. Double Booking) */}
        {submissionError && (
          <div className="p-3.5 rounded-xl bg-[#FFF8F8] border border-[#FAD8D8] text-xs text-[#D93636] flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block">Booking Conflict</span>
              <span>{submissionError}</span>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2">
          <Button
            type="button"
            variant="primary"
            size="lg"
            fullWidth
            disabled={isSubmitting || !patientName || phone.length < 10}
            onClick={onConfirmBooking}
            icon={<ShieldCheck className="w-5 h-5" />}
          >
            {isSubmitting ? 'Securing Time Slot...' : 'Confirm & Book Slot'}
          </Button>
          <p className="text-[11px] font-mono text-center text-[#617786] mt-2">
            Atomic transaction locks your selected slot instantaneously upon confirmation.
          </p>
        </div>
      </div>
    </div>
  );
};
