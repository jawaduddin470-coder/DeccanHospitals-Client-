import React from 'react';
import { motion } from 'framer-motion';
import { Container } from '../components/common/Container';
import { SectionHeading } from '../components/common/SectionHeading';
import { SectionLabel } from '../components/common/SectionLabel';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { BackgroundPattern } from '../components/common/BackgroundPattern';
import { PageTransition } from '../components/layout/PageTransition';
import { HOSPITAL_CONFIG } from '../config/constants';
import {
  Phone,
  MapPin,
  Calendar,
  Baby,
  Stethoscope,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Navigation,
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  const factualHighlights = [
    {
      icon: <Baby className="w-5 h-5 text-[#0879A5]" />,
      title: 'Maternity-Focused Care',
      desc: 'Dedicated pregnancy care, maternity services, and gynaecological consultations for women and families.',
    },
    {
      icon: <Stethoscope className="w-5 h-5 text-[#0879A5]" />,
      title: 'General Healthcare',
      desc: 'Consultation, diagnosis, and medical care for common adult and pediatric health conditions.',
    },
    {
      icon: <Calendar className="w-5 h-5 text-[#0879A5]" />,
      title: 'Easy Appointment Request',
      desc: 'Convenient consultation requests and outpatient appointment scheduling through direct hospital assistance.',
    },
    {
      icon: <Phone className="w-5 h-5 text-[#0879A5]" />,
      title: 'Accessible Contact Details',
      desc: 'Direct phone lines for immediate patient guidance and an easily accessible hospital location in Kalaburagi.',
    },
  ];

  return (
    <PageTransition>
      {/* 1. EDITORIAL ABOUT HERO */}
      <BackgroundPattern
        variant="full"
        opacity="subtle"
        className="pt-10 pb-16 sm:pt-16 sm:pb-24 border-b border-[#D6EAF1]"
      >
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Narrative Column */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="lg:col-span-7 space-y-6"
            >
              <SectionLabel variant="blue">ABOUT DECCAN CARE</SectionLabel>

              <div className="space-y-4">
                <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#103A50] font-normal tracking-tight leading-[1.12]">
                  Patient-focused care, close to home.
                </h1>
                <p className="font-sans text-base sm:text-lg text-[#617786] leading-relaxed max-w-2xl">
                  Deccan Care Maternity &amp; General Hospital is located near Quadri Chowk in Sheikh Roza, Kalaburagi, Karnataka. The hospital's identity combines maternity-focused care with general healthcare services to provide accessible medical support for families.
                </p>
                <p className="font-sans text-sm sm:text-base text-[#617786] leading-relaxed max-w-2xl">
                  Our services are structured to help patients and families find medical care, contact the hospital directly for urgent guidance, and request outpatient consultations.
                </p>
              </div>

              {/* Action Triggers */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <Button
                  to="/services"
                  variant="primary"
                  size="lg"
                  icon={<ArrowRight className="w-4 h-4" />}
                  iconPosition="right"
                >
                  Explore Healthcare Services
                </Button>
                <Button
                  to="/contact"
                  variant="secondary"
                  size="lg"
                  icon={<MapPin className="w-4 h-4" />}
                >
                  Hospital Location
                </Button>
              </div>
            </motion.div>

            {/* Right Architectural Graphic Column */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
              className="lg:col-span-5"
            >
              <div className="relative rounded-3xl bg-gradient-to-br from-[#EEF8FB] via-[#F7FCFE] to-[#E2F4F9] border border-[#D6EAF1] p-8 shadow-md overflow-hidden">
                <div className="absolute inset-0 bg-medical-grid opacity-35 pointer-events-none" />

                {/* Corner Markers */}
                <div className="absolute top-4 left-5 text-[10px] font-mono text-[#0879A5]/60 tracking-wider">
                  DC-HOSPITAL // KALABURAGI
                </div>
                <div className="absolute top-4 right-5 text-[10px] font-mono bg-white/90 px-2.5 py-0.5 rounded-full border border-[#D6EAF1] text-[#0879A5]">
                  FOUNDATION
                </div>

                <div className="relative z-10 space-y-6 pt-4">
                  {/* Large 24x7 Typographic Block */}
                  <div className="p-5 rounded-2xl bg-white border border-[#D6EAF1] shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-3xl sm:text-4xl font-serif font-bold text-[#103A50] tracking-tight">
                        24×7
                      </span>
                      <span className="text-[11px] font-mono font-semibold text-[#D93636] bg-[#FFF8F8] px-2.5 py-1 rounded-full border border-[#D93636]/20 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#D93636] animate-pulse" />
                        Hospital Support
                      </span>
                    </div>
                    <p className="text-xs text-[#617786] leading-relaxed">
                      Emergency guidance and maternity contact support available around the clock.
                    </p>
                  </div>

                  {/* Location Pinpoint Panel */}
                  <div className="p-4 rounded-2xl bg-white border border-[#D6EAF1] shadow-xs space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#103A50]">
                      <MapPin className="w-4 h-4 text-[#0879A5]" />
                      <span>Sheikh Roza, Kalaburagi</span>
                    </div>
                    <p className="text-xs text-[#617786] pl-6">
                      Near Quadri Chowk, Opp. Bharat Petrol Bunk, Karnataka - 585101
                    </p>
                  </div>

                  {/* Core Focus Badge */}
                  <div className="p-4 rounded-2xl bg-[#103A50] text-white flex items-center justify-between">
                    <div>
                      <span className="text-xs text-[#E2F4F9]/80 block">Core Positioning</span>
                      <span className="text-sm font-serif font-medium">Maternity &amp; General Healthcare</span>
                    </div>
                    <ShieldCheck className="w-6 h-6 text-[#19A4CF]" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </Container>
      </BackgroundPattern>

      {/* 2. PROMINENT 24x7 HOSPITAL CONTACT INFORMATION BLOCK */}
      <section className="py-12 bg-[#EEF8FB] border-b border-[#D6EAF1]">
        <Container>
          <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-[#103A50] via-[#0B2737] to-[#103A50] text-white border border-[#19A4CF]/30 shadow-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-medical-grid-dark opacity-30 pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D93636]/30 text-[#E2F4F9] border border-[#D93636]/50 text-xs font-semibold uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D93636] animate-pulse" />
                  24×7 Hospital Contact
                </div>
                <h2 className="text-2xl sm:text-3xl font-serif text-white font-normal">
                  Immediate Guidance &amp; Hospital Inquiries
                </h2>
                <p className="text-sm text-[#E2F4F9]/80 leading-relaxed max-w-xl">
                  For urgent medical situations or questions regarding consultations, call the hospital directly using the provided numbers.
                </p>
              </div>

              <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col gap-3 justify-end">
                <Button
                  href={HOSPITAL_CONFIG.phones[0].raw}
                  variant="emergency"
                  size="lg"
                  icon={<Phone className="w-4 h-4" />}
                >
                  Call Primary: {HOSPITAL_CONFIG.phones[0].number}
                </Button>
                <Button
                  href={HOSPITAL_CONFIG.phones[1].raw}
                  variant="white"
                  size="lg"
                  icon={<Phone className="w-4 h-4 text-[#0879A5]" />}
                >
                  Call Helpline: {HOSPITAL_CONFIG.phones[1].number}
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 3. FOUR FACTUAL HIGHLIGHT MODULES */}
      <section className="py-20 bg-white border-b border-[#D6EAF1]">
        <Container>
          <div className="max-w-3xl mb-12">
            <SectionLabel variant="blue" className="mb-3">
              CARE PRINCIPLES
            </SectionLabel>
            <SectionHeading
              title="Essential Healthcare Focus"
              subtitle="Our hospital approach centers on accessible medical support, maternal care, and clear patient guidance."
              titleSize="lg"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {factualHighlights.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
              >
                <Card
                  variant="default"
                  padding="lg"
                  className="h-full flex flex-col justify-between border-[#D6EAF1] bg-[#F7FCFE] hover:bg-white hover:border-[#19A4CF] transition-all duration-200"
                >
                  <div className="space-y-3.5">
                    <div className="w-11 h-11 rounded-xl bg-[#E2F4F9] border border-[#D6EAF1] flex items-center justify-center text-[#0879A5]">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="font-serif text-lg text-[#103A50] font-normal">
                        {item.title}
                      </h3>
                      <p className="text-xs text-[#617786] leading-relaxed mt-2">
                        {item.desc}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 mt-3 border-t border-[#D6EAF1]/60 flex items-center gap-1 text-[11px] text-[#0879A5] font-mono">
                    <CheckCircle2 className="w-3 h-3 text-[#0879A5]" />
                    <span>Verified Baseline</span>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* 4. LOCATION STORY SECTION */}
      <section className="py-20 bg-[#F7FCFE] border-b border-[#D6EAF1]">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Location Narrative */}
            <div className="lg:col-span-7 space-y-6">
              <SectionLabel variant="blue">HOSPITAL LOCATION</SectionLabel>
              <SectionHeading
                title="Located in Sheikh Roza, Kalaburagi"
                subtitle="Easily reachable from major parts of Kalaburagi for planned consultations and immediate hospital visits."
                titleSize="lg"
              />

              <div className="space-y-4 text-sm text-[#617786] leading-relaxed">
                <p>
                  Deccan Care Maternity &amp; General Hospital is situated near Quadri Chowk, opposite Bharat Petrol Bunk in Sheikh Roza.
                </p>
                <div className="p-4 rounded-2xl bg-white border border-[#D6EAF1] space-y-2 text-xs text-[#17384A]">
                  <div className="flex items-start gap-2.5">
                    <Navigation className="w-4 h-4 text-[#0879A5] mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-[#103A50] block">Official Address:</span>
                      <address className="not-italic text-[#617786] mt-0.5 leading-relaxed">
                        Near Quadri Chowk, Opp. Bharat Petrol Bunk,<br />
                        Sheikh Roza, Kalaburagi, Karnataka - 585101
                      </address>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <Button
                  to="/contact"
                  variant="primary"
                  size="md"
                  icon={<MapPin className="w-4 h-4" />}
                >
                  View Hospital Location
                </Button>
                <Button
                  to="/appointment"
                  variant="secondary"
                  size="md"
                  icon={<Calendar className="w-4 h-4" />}
                >
                  Request Appointment
                </Button>
              </div>
            </div>

            {/* Right Location Card Graphic */}
            <div className="lg:col-span-5">
              <Card variant="default" padding="lg" className="border-[#D6EAF1] bg-white space-y-5">
                <div className="flex items-center justify-between border-b border-[#D6EAF1] pb-3">
                  <span className="text-xs font-mono font-semibold text-[#0879A5] uppercase">
                    Location Directory
                  </span>
                  <span className="text-[11px] font-mono text-[#617786]">PIN: 585101</span>
                </div>

                <div className="space-y-3.5 text-xs text-[#617786]">
                  <div className="flex items-center gap-2 text-[#17384A]">
                    <Clock className="w-4 h-4 text-[#0879A5]" />
                    <span>Emergency Contact: 24 Hours / 7 Days</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#17384A]">
                    <Calendar className="w-4 h-4 text-[#0879A5]" />
                    <span>Outpatient Check-up: By Appointment</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#17384A]">
                    <Phone className="w-4 h-4 text-[#0879A5]" />
                    <span>Phone: {HOSPITAL_CONFIG.phones[0].number} / {HOSPITAL_CONFIG.phones[1].number}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#D6EAF1]">
                  <Button
                    to="/contact"
                    variant="ghost"
                    size="sm"
                    className="w-full justify-between text-xs text-[#0879A5] hover:bg-[#EEF8FB]"
                  >
                    <span>View Contact &amp; Location Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </Container>
      </section>
    </PageTransition>
  );
};
