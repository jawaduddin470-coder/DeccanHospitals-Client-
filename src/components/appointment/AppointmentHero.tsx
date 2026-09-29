import React from 'react';
import { Container } from '../common/Container';
import { SectionLabel } from '../common/SectionLabel';
import { BackgroundPattern } from '../common/BackgroundPattern';
import { HOSPITAL_CONFIG } from '../../config/constants';
import { Calendar, Phone, Clock, ShieldAlert } from 'lucide-react';

export const AppointmentHero: React.FC = () => {
  return (
    <BackgroundPattern
      variant="boxes"
      opacity="subtle"
      className="pt-10 pb-14 sm:pt-16 sm:pb-20 border-b border-[#D6EAF1] bg-[#F7FCFE]"
    >
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <SectionLabel variant="blue">OUTPATIENT CONSULTATION</SectionLabel>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#103A50] font-normal tracking-tight">
              Book a Doctor Consultation
            </h1>
            <p className="font-sans text-sm sm:text-base text-[#617786] max-w-2xl leading-relaxed">
              Schedule your consultation at Deccan Care Maternity &amp; General Hospital in Sheikh Roza, Kalaburagi. Select your preferred doctor, date, and time slot.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-[#17384A]">
              <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-[#D6EAF1] shadow-2xs">
                <Clock className="w-3.5 h-3.5 text-[#0879A5]" />
                <span>OPD: Mon–Sat 10:00 AM – 08:00 PM</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-[#D6EAF1] shadow-2xs">
                <Calendar className="w-3.5 h-3.5 text-[#0879A5]" />
                <span>Instant Slot Confirmation</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="p-4 rounded-2xl bg-[#FFF8F8] border border-[#FAD8D8] text-xs space-y-2.5">
              <div className="flex items-center gap-2 text-[#D93636] font-semibold">
                <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                <span>Need Emergency Medical Care?</span>
              </div>
              <p className="text-[#17384A] leading-relaxed">
                For urgent labor, severe trauma, or acute conditions, call our 24/7 hospital desk immediately.
              </p>
              <a
                href={HOSPITAL_CONFIG.phones[0].raw}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D93636] hover:underline"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Emergency: {HOSPITAL_CONFIG.phones[0].number}</span>
              </a>
            </div>
          </div>
        </div>
      </Container>
    </BackgroundPattern>
  );
};
