import React, { useState, useEffect } from 'react';
import { Container } from '../components/common/Container';
import { SectionHeading } from '../components/common/SectionHeading';
import { SectionLabel } from '../components/common/SectionLabel';
import { Card } from '../components/common/Card';
import { BackgroundPattern } from '../components/common/BackgroundPattern';
import { Button } from '../components/common/Button';
import { PageTransition } from '../components/layout/PageTransition';
import { hospitalService, type HospitalInfoData } from '../services';
import { HOSPITAL_CONFIG } from '../config/constants';
import { MapPin, Phone, Mail, Clock, ExternalLink, Navigation } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [info, setInfo] = useState<HospitalInfoData>({
    name: HOSPITAL_CONFIG.name,
    fullName: HOSPITAL_CONFIG.fullName,
    subHeading: HOSPITAL_CONFIG.subHeading,
    locationCity: HOSPITAL_CONFIG.locationCity,
    phone1: HOSPITAL_CONFIG.phones[0].number,
    phone2: HOSPITAL_CONFIG.phones[1].number,
    email: HOSPITAL_CONFIG.email.address,
    addressLine1: HOSPITAL_CONFIG.address.line1,
    area: HOSPITAL_CONFIG.address.area,
    city: HOSPITAL_CONFIG.address.city,
    state: HOSPITAL_CONFIG.address.state,
    pincode: HOSPITAL_CONFIG.address.pincode,
    fullFormattedAddress: HOSPITAL_CONFIG.address.fullFormatted,
    emergencyHours: HOSPITAL_CONFIG.hours.emergency,
    opdHours: HOSPITAL_CONFIG.hours.opd,
  });

  useEffect(() => {
    let isMounted = true;
    hospitalService.getHospitalInfo().then((data) => {
      if (isMounted && data) {
        setInfo(data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const primaryPhoneRaw = `tel:+91${info.phone1.replace(/\s+/g, '')}`;
  const secondaryPhoneRaw = `tel:+91${info.phone2.replace(/\s+/g, '')}`;
  const emailRaw = `mailto:${info.email}`;

  return (
    <PageTransition>
      {/* Header */}
      <BackgroundPattern variant="boxes" opacity="ultralight" className="py-14 sm:py-20 border-b border-[#D6EAF1] bg-[#F7FCFE]">
        <Container>
          <div className="max-w-3xl space-y-4">
            <SectionLabel variant="blue">Location &amp; Helpdesk</SectionLabel>
            <SectionHeading
              title={`Contact ${info.name} Hospital`}
              subtitle={`Reach our hospital reception, maternity desk, or emergency casualty service in ${info.area}, ${info.city}.`}
              titleSize="xl"
            />
          </div>
        </Container>
      </BackgroundPattern>

      {/* Main Content */}
      <section className="py-16 sm:py-20 bg-white">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left: Contact Info Cards */}
            <div className="lg:col-span-5 space-y-6">
              {/* Emergency Call Box */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-[#103A50] to-[#0B2737] text-white border border-[#19A4CF]/30 shadow-lg space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D93636]/30 text-[#E2F4F9] border border-[#D93636]/50 text-xs font-semibold uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D93636] animate-pulse" />
                  24/7 Immediate Helpdesk
                </div>
                <h3 className="font-serif text-2xl font-normal">
                  Emergency Medical Support
                </h3>
                <p className="text-xs text-[#E2F4F9]/80 leading-relaxed">
                  Call our duty medical desk directly for urgent admissions, ambulance coordination, or labor emergencies.
                </p>
                <div className="pt-2">
                  <Button
                    href={primaryPhoneRaw}
                    variant="emergency"
                    size="lg"
                    icon={<Phone className="w-4 h-4" />}
                    fullWidth
                  >
                    CALL: {info.phone1}
                  </Button>
                </div>
              </div>

              {/* Verified Contact Details Card */}
              <Card variant="default" padding="lg" className="border border-[#D6EAF1] space-y-5">
                <div className="border-b border-[#D6EAF1] pb-3">
                  <h4 className="font-serif text-lg text-[#103A50]">
                    Hospital Contact Directory
                  </h4>
                </div>

                <div className="space-y-4 text-xs">
                  {/* Location */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#EEF8FB] text-[#0879A5] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-semibold text-[#103A50] block text-sm">Hospital Location</span>
                      <address className="not-italic text-[#617786] mt-0.5 leading-relaxed">
                        {info.addressLine1},<br />
                        {info.area}, {info.city},<br />
                        {info.state} - {info.pincode}, India
                      </address>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#EEF8FB] text-[#0879A5] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-semibold text-[#103A50] block text-sm">Phone Lines</span>
                      <a href={primaryPhoneRaw} className="text-[#0879A5] font-medium block hover:underline">
                        Primary: {info.phone1}
                      </a>
                      <a href={secondaryPhoneRaw} className="text-[#0879A5] font-medium block hover:underline">
                        Helpline: {info.phone2}
                      </a>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#EEF8FB] text-[#0879A5] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-semibold text-[#103A50] block text-sm">Email Address</span>
                      <a href={emailRaw} className="text-[#0879A5] font-medium hover:underline break-all">
                        {info.email}
                      </a>
                    </div>
                  </div>

                  {/* Timing */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#EEF8FB] text-[#0879A5] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-semibold text-[#103A50] block text-sm">Hours of Care</span>
                      <p className="text-[#617786]">
                        Emergency &amp; Maternity: <span className="font-semibold text-[#103A50]">{info.emergencyHours}</span>
                      </p>
                      <p className="text-[#617786]">
                        OPD Consultation: <span className="font-semibold text-[#103A50]">{info.opdHours}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right: Map Architecture Placeholder */}
            <div className="lg:col-span-7 space-y-6">
              <Card variant="default" padding="lg" className="border border-[#D6EAF1] shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-[#D6EAF1] pb-3">
                  <div className="flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-[#0879A5]" />
                    <h3 className="font-serif text-xl text-[#103A50]">
                      Hospital Location Map
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-[#0879A5] bg-[#E2F4F9] px-2 py-0.5 rounded">
                    Leaflet Map Ready
                  </span>
                </div>

                {/* Map Graphic / Architecture Container */}
                <div className="h-80 rounded-xl bg-[#F7FCFE] border border-dashed border-[#0879A5]/30 relative flex flex-col items-center justify-center p-6 text-center overflow-hidden">
                  {/* Subtle Grid in Map Placeholder */}
                  <div className="absolute inset-0 bg-medical-grid opacity-30 pointer-events-none" />

                  <div className="relative z-10 space-y-3 max-w-md">
                    <div className="w-12 h-12 rounded-full bg-[#E2F4F9] text-[#0879A5] border border-[#D6EAF1] flex items-center justify-center mx-auto shadow-xs">
                      <MapPin className="w-6 h-6 text-[#D93636]" />
                    </div>
                    <div>
                      <h4 className="font-serif text-lg text-[#103A50]">
                        Deccan Care Maternity &amp; General Hospital
                      </h4>
                      <p className="text-xs text-[#617786] mt-1">
                        Near Quadri Chowk, Opp. Bharat Petrol Bunk, Sheikh Roza, Kalaburagi - 585101
                      </p>
                    </div>
                    <div className="pt-2">
                      <Button
                        href={HOSPITAL_CONFIG.address.googleMapsSearchQuery}
                        variant="secondary"
                        size="sm"
                        icon={<ExternalLink className="w-3.5 h-3.5" />}
                      >
                        Open in Google Maps
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[#EEF8FB] border border-[#D6EAF1] text-xs text-[#617786] flex items-center justify-between">
                  <span>Interactive Leaflet Map will be integrated during Phase 2.</span>
                  <span className="font-mono text-[#0879A5] text-[11px]">17.3297° N, 76.8343° E</span>
                </div>
              </Card>
            </div>
          </div>
        </Container>
      </section>
    </PageTransition>
  );
};
