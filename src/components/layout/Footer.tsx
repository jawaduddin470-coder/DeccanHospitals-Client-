import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Calendar, Clock, ArrowRight, ShieldCheck } from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';
import { Button } from '../common/Button';
import { HOSPITAL_CONFIG, NAV_LINKS } from '../../config/constants';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#103A50] text-[#E2F4F9] relative overflow-hidden border-t border-[#19A4CF]/20">
      {/* Subtle Geometric Background Grid continuing visual language into footer */}
      <div
        className="absolute inset-0 bg-medical-grid-dark opacity-30 pointer-events-none"
        aria-hidden="true"
      />

      {/* Decorative Technical Box Outlines */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-0 right-10 w-80 h-80 rounded-3xl border border-[#19A4CF]/10 bg-gradient-to-b from-[#19A4CF]/[0.03] to-transparent pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full border border-[#19A4CF]/10 pointer-events-none" />
        <div className="absolute top-8 left-8 text-[#19A4CF]/20 font-mono text-[10px] tracking-widest hidden md:block">
          + DC-FOOTER // 585101-SEC
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        {/* Top Call-To-Action Banner inside Footer */}
        <div className="mb-14 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#0B2737] via-[#103A50] to-[#0B2737] border border-[#19A4CF]/25 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#19A4CF]/20 text-[#19A4CF] border border-[#19A4CF]/30 text-xs font-semibold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D93636] animate-pulse" />
              24/7 Medical & Maternity Support
            </div>
            <h3 className="text-2xl sm:text-3xl font-serif text-white font-normal">
              Need Immediate Medical Attention or Maternity Assistance?
            </h3>
            <p className="text-sm text-[#E2F4F9]/80 max-w-xl">
              Our emergency desk and maternity specialists are available around the clock at Sheikh Roza, Kalaburagi.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 w-full sm:w-auto">
            <Button
              href={HOSPITAL_CONFIG.phones[0].raw}
              variant="emergency"
              size="lg"
              icon={<Phone className="w-4 h-4" />}
            >
              CALL NOW ({HOSPITAL_CONFIG.phones[0].number})
            </Button>
            <Button
              to="/appointment"
              variant="white"
              size="lg"
              icon={<Calendar className="w-4 h-4 text-[#0879A5]" />}
            >
              Book Appointment
            </Button>
          </div>
        </div>

        {/* 4-Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-12 border-b border-[#19A4CF]/20">
          {/* Column 1: Hospital Brand & About (Span 4) */}
          <div className="lg:col-span-4 space-y-4">
            <BrandLogo variant="footer" />
            <p className="text-sm text-[#E2F4F9]/80 leading-relaxed max-w-sm pt-2">
              Deccan Care Maternity & General Hospital provides dedicated maternal, neonatal, and comprehensive general healthcare services with precision and compassion in Kalaburagi.
            </p>
            <div className="flex items-center gap-2 pt-2 text-xs text-[#19A4CF] font-medium">
              <ShieldCheck className="w-4 h-4 text-[#19A4CF]" />
              <span>Registered Healthcare Center • Kalaburagi</span>
            </div>
          </div>

          {/* Column 2: Quick Links (Span 2) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs font-mono font-bold uppercase tracking-[0.16em] text-white flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#19A4CF]" />
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-sm">
              {NAV_LINKS.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-[#E2F4F9]/80 hover:text-white transition-colors flex items-center gap-1.5 group"
                  >
                    <ArrowRight className="w-3 h-3 text-[#19A4CF] opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                    <span>{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Patient Services (Span 2) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs font-mono font-bold uppercase tracking-[0.16em] text-white flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#19A4CF]" />
              Patient Services
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/services" className="text-[#E2F4F9]/80 hover:text-white transition-colors">
                  Emergency Care
                </Link>
              </li>
              <li>
                <Link to="/appointment" className="text-[#E2F4F9]/80 hover:text-white transition-colors">
                  Appointments
                </Link>
              </li>
              <li>
                <Link to="/doctors" className="text-[#E2F4F9]/80 hover:text-white transition-colors">
                  Doctors
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-[#E2F4F9]/80 hover:text-white transition-colors">
                  Hospital Location
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact Information (Span 4) */}
          <div className="lg:col-span-4 space-y-4">
            <h4 className="text-xs font-mono font-bold uppercase tracking-[0.16em] text-white flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#19A4CF]" />
              Hospital Contact
            </h4>
            <div className="space-y-3.5 text-sm">
              {/* Phone Numbers */}
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-[#19A4CF] mt-1 flex-shrink-0" />
                <div className="space-y-0.5">
                  <div>
                    <a
                      href={HOSPITAL_CONFIG.phones[0].raw}
                      className="text-white hover:text-[#19A4CF] transition-colors font-medium"
                    >
                      {HOSPITAL_CONFIG.phones[0].number}
                    </a>
                  </div>
                  <div>
                    <a
                      href={HOSPITAL_CONFIG.phones[1].raw}
                      className="text-white hover:text-[#19A4CF] transition-colors font-medium"
                    >
                      {HOSPITAL_CONFIG.phones[1].number}
                    </a>
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-[#19A4CF] mt-0.5 flex-shrink-0" />
                <a
                  href={HOSPITAL_CONFIG.email.raw}
                  className="text-[#E2F4F9]/80 hover:text-white transition-colors break-all"
                >
                  {HOSPITAL_CONFIG.email.address}
                </a>
              </div>

              {/* Address */}
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#19A4CF] mt-1 flex-shrink-0" />
                <address className="not-italic text-[#E2F4F9]/80 text-xs leading-relaxed">
                  Near Quadri Chowk,<br />
                  Opp. Bharat Petrol Bunk,<br />
                  Sheikh Roza, Kalaburagi,<br />
                  Karnataka - 585101
                </address>
              </div>

              {/* Hours */}
              <div className="flex items-center gap-3 pt-1">
                <Clock className="w-4 h-4 text-[#19A4CF] flex-shrink-0" />
                <span className="text-xs text-[#E2F4F9]/80">
                  {HOSPITAL_CONFIG.hours.emergency}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Strip */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#E2F4F9]/60">
          <p>
            © {new Date().getFullYear()} Deccan Care Maternity & General Hospital. All rights reserved.
          </p>
          <div className="flex items-center gap-4 sm:gap-6">
            <span className="text-[11px] font-mono text-[#19A4CF]/60">
              Phase 1 Architectural Foundation
            </span>
            <span className="text-[8.5px] font-mono tracking-wider text-[#E2F4F9]/30 select-none">
              MB
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
