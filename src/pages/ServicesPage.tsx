import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Container } from '../components/common/Container';
import { SectionHeading } from '../components/common/SectionHeading';
import { SectionLabel } from '../components/common/SectionLabel';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { BackgroundPattern } from '../components/common/BackgroundPattern';
import { PageTransition } from '../components/layout/PageTransition';
import { ServiceIcon } from '../components/common/ServiceIcon';
import { serviceService } from '../services';
import { INITIAL_SERVICES, INITIAL_FACILITIES, SERVICE_CATEGORIES } from '../config/initialServices';
import { HOSPITAL_CONFIG } from '../config/constants';
import type { HospitalService, HospitalFacility, ServiceCategoryKey } from '../types';
import {
  Phone,
  Calendar,
  ShieldAlert,
  Baby,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const ServicesPage: React.FC = () => {
  const [services, setServices] = useState<HospitalService[]>(() =>
    INITIAL_SERVICES.filter((s) => s.active !== false)
  );
  const [facilities, setFacilities] = useState<HospitalFacility[]>(() =>
    INITIAL_FACILITIES.filter((f) => f.active !== false)
  );
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategoryKey>('all');
  const [expandedServiceId, setExpandedServiceId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    serviceService.getServices().then((data) => {
      if (isMounted && data) {
        setServices(data);
      }
    });
    serviceService.getFacilities().then((data) => {
      if (isMounted && data) {
        setFacilities(data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Filtered services based on selected category
  const filteredServices = useMemo(() => {
    if (selectedCategory === 'all') {
      return services;
    }
    return services.filter((service) => service.category === selectedCategory);
  }, [services, selectedCategory]);

  const toggleExpand = (id: string) => {
    setExpandedServiceId((prev) => (prev === id ? null : id));
  };

  // Featured key services
  const emergencyService = useMemo(() => {
    return services.find((s) => s.id === 'emergency-care') || INITIAL_SERVICES.find((s) => s.id === 'emergency-care');
  }, [services]);

  const maternityService = useMemo(() => {
    return services.find((s) => s.id === 'obstetrics-gynaecology') || INITIAL_SERVICES.find((s) => s.id === 'obstetrics-gynaecology');
  }, [services]);

  return (
    <PageTransition>
      {/* 1. SERVICES HERO */}
      <BackgroundPattern
        variant="full"
        opacity="subtle"
        className="pt-10 pb-16 sm:pt-16 sm:pb-24 border-b border-[#D6EAF1]"
      >
        <Container>
          <div className="max-w-3xl space-y-4">
            <SectionLabel variant="blue">HEALTHCARE SERVICES</SectionLabel>
            <SectionHeading
              title="Medical services for your family"
              subtitle="The services listed below represent our clinical departments and diagnostic facilities, providing maternity-focused care and general medicine in Kalaburagi."
              titleSize="xl"
            />
          </div>
        </Container>
      </BackgroundPattern>

      {/* 2. FEATURED HERO CALLOUTS: EMERGENCY & MATERNITY (VISUAL HIERARCHY) */}
      <section className="py-12 bg-[#F7FCFE] border-b border-[#D6EAF1]">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Featured Box 1: Emergency Care (24x7) */}
            {emergencyService && (
              <div className="lg:col-span-6">
                <Card
                  variant="default"
                  padding="lg"
                  className="h-full border-2 border-[#D93636]/30 bg-gradient-to-br from-[#FFF8F8] via-white to-[#FFF8F8] shadow-sm flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-[#D93636]/10 text-[#D93636] flex items-center justify-center">
                        <ShieldAlert className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-mono font-bold text-[#D93636] bg-[#D93636]/10 px-3 py-1 rounded-full border border-[#D93636]/20 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#D93636] animate-pulse" />
                        24×7 SUPPORT
                      </span>
                    </div>

                    <div>
                      <h2 className="font-serif text-2xl text-[#103A50]">
                        {emergencyService.name}
                      </h2>
                      <p className="text-sm text-[#617786] leading-relaxed mt-2">
                        {emergencyService.description}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white border border-[#D93636]/20 text-xs text-[#17384A] space-y-1">
                      <span className="font-bold text-[#D93636] block">Immediate Assistance:</span>
                      <p className="text-[#617786]">
                        Call the hospital desk directly for prompt guidance.
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 mt-4 border-t border-[#D93636]/15 flex flex-wrap items-center gap-3">
                    <Button
                      href={HOSPITAL_CONFIG.phones[0].raw}
                      variant="emergency"
                      size="md"
                      icon={<Phone className="w-4 h-4" />}
                    >
                      Call {HOSPITAL_CONFIG.phones[0].number}
                    </Button>
                    <Button
                      to="/contact"
                      variant="outline"
                      size="md"
                    >
                      Emergency Location
                    </Button>
                  </div>
                </Card>
              </div>
            )}

            {/* Featured Box 2: Obstetrics & Gynaecology (Maternity Core) */}
            {maternityService && (
              <div className="lg:col-span-6">
                <Card
                  variant="default"
                  padding="lg"
                  className="h-full border border-[#0879A5]/40 bg-gradient-to-br from-[#EEF8FB] via-white to-[#F7FCFE] shadow-sm flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-[#E2F4F9] text-[#0879A5] flex items-center justify-center">
                        <Baby className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-mono font-bold text-[#0879A5] bg-[#E2F4F9] px-3 py-1 rounded-full border border-[#D6EAF1]">
                        CORE SPECIALTY
                      </span>
                    </div>

                    <div>
                      <h2 className="font-serif text-2xl text-[#103A50]">
                        {maternityService.name}
                      </h2>
                      <p className="text-sm text-[#617786] leading-relaxed mt-2">
                        {maternityService.description}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white border border-[#D6EAF1] text-xs text-[#17384A] space-y-1">
                      <span className="font-semibold text-[#0879A5] block">Maternal Healthcare:</span>
                      <p className="text-[#617786]">
                        Consultations for pregnancy care, women's health, and maternity services.
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 mt-4 border-t border-[#D6EAF1] flex flex-wrap items-center gap-3">
                    <Button
                      to="/appointment"
                      variant="primary"
                      size="md"
                      icon={<Calendar className="w-4 h-4" />}
                    >
                      Schedule Consultation
                    </Button>
                    <Button
                      to="/about"
                      variant="secondary"
                      size="md"
                    >
                      About Maternity Unit
                    </Button>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </Container>
      </section>

      {/* 3. CATEGORIZED CLINICAL SERVICES DIRECTORY */}
      <section className="py-20 bg-white border-b border-[#D6EAF1]">
        <Container>
          {/* Header & Filter Controls */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
            <div>
              <SectionLabel variant="blue" className="mb-3">
                SERVICES DIRECTORY
              </SectionLabel>
              <SectionHeading
                title="Clinical Services & Consultations"
                subtitle="Select a category to filter departments, or browse through our full list of medical services."
                titleSize="lg"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {SERVICE_CATEGORIES.map((category) => (
                <button
                  key={category.key}
                  type="button"
                  onClick={() => setSelectedCategory(category.key)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-mono font-medium transition-all duration-200 cursor-pointer ${
                    selectedCategory === category.key
                      ? 'bg-[#103A50] text-white shadow-xs'
                      : 'bg-[#F7FCFE] text-[#17384A] border border-[#D6EAF1] hover:bg-[#EEF8FB] hover:border-[#0879A5]/50'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          {/* Services Grid with Interactive Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredServices.map((service, index) => {
                const isExpanded = expandedServiceId === service.id;

                return (
                  <motion.div
                    key={service.id}
                    layout
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.25, delay: index * 0.02 }}
                  >
                    <Card
                      variant="interactive"
                      padding="lg"
                      onClick={() => toggleExpand(service.id)}
                      className={`h-full flex flex-col justify-between border-[#D6EAF1] ${
                        service.isEmergency ? 'bg-[#FFFDFD] hover:border-[#D93636]' : 'bg-white hover:border-[#19A4CF]'
                      } ${isExpanded ? 'ring-2 ring-[#0879A5]/30' : ''}`}
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div
                            className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                              service.isEmergency
                                ? 'bg-[#D93636]/10 text-[#D93636]'
                                : 'bg-[#EEF8FB] text-[#0879A5]'
                            }`}
                          >
                            <ServiceIcon name={service.iconName} className="w-5 h-5" />
                          </div>

                          <span className="text-[10px] font-mono text-[#0879A5] bg-[#E2F4F9] px-2.5 py-1 rounded-full uppercase font-medium">
                            {service.category}
                          </span>
                        </div>

                        <div>
                          <h3 className="font-serif text-xl text-[#103A50] font-normal leading-snug">
                            {service.name}
                          </h3>
                          <p className="text-xs text-[#617786] leading-relaxed mt-2">
                            {service.description}
                          </p>
                        </div>

                        {/* Expanded Detail Panel */}
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="pt-3 border-t border-[#D6EAF1] space-y-2 text-xs"
                          >
                            <div className="p-3 rounded-lg bg-[#F7FCFE] border border-[#D6EAF1] space-y-1">
                              <span className="font-semibold text-[#103A50] block">
                                Hospital Consultation Info:
                              </span>
                              <p className="text-[#617786]">
                                Outpatient visits are scheduled by appointment. For acute concerns, contact the 24/7 hospital desk.
                              </p>
                            </div>
                            <Button
                              to="/appointment"
                              variant="secondary"
                              size="sm"
                              fullWidth
                              className="text-xs"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Request Appointment
                            </Button>
                          </motion.div>
                        )}
                      </div>

                      <div className="pt-4 mt-4 border-t border-[#D6EAF1]/70 flex items-center justify-between text-xs text-[#0879A5] font-semibold">
                        <span className="font-sans text-[11px]">
                          {isExpanded ? 'Show less' : 'View detail'}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-[#0879A5]" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-[#0879A5]" />
                        )}
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </Container>
      </section>

      {/* 4. HOSPITAL FACILITIES SECTION (DISTINCT HORIZONTAL ARCHITECTURAL DESIGN) */}
      <section className="py-20 bg-[#F7FCFE] border-b border-[#D6EAF1]">
        <Container>
          <div className="max-w-3xl mb-12">
            <SectionLabel variant="blue" className="mb-3">
              FACILITY SUPPORT
            </SectionLabel>
            <SectionHeading
              title="Hospital Facilities"
              subtitle="Essential diagnostic, laboratory, pharmacy, and patient transport facilities available at Deccan Care Hospital."
              titleSize="lg"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {facilities.map((facility, index) => (
              <motion.div
                key={facility.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
              >
                <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[#D6EAF1] shadow-sm hover:border-[#19A4CF] transition-colors relative overflow-hidden flex flex-col justify-between h-full">
                  {/* Subtle Geometric Panel Stripe */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#EEF8FB] to-transparent rounded-bl-full pointer-events-none" />

                  <div className="space-y-4 relative z-10">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-[#EEF8FB] text-[#0879A5] border border-[#D6EAF1] flex items-center justify-center">
                        <ServiceIcon name={facility.iconName} className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-mono font-semibold uppercase text-[#0879A5] bg-[#E2F4F9] px-2.5 py-1 rounded-md">
                        Facility Unit
                      </span>
                    </div>

                    <div>
                      <h3 className="font-serif text-2xl text-[#103A50] font-normal">
                        {facility.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#617786] leading-relaxed mt-2">
                        {facility.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-[#D6EAF1]/80 flex items-center gap-2 text-xs text-[#17384A] relative z-10">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0879A5]" />
                    <span className="font-mono text-[11px] text-[#617786]">
                      Deccan Care • Sheikh Roza
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* 5. APPOINTMENT & CONTACT ACTION BANNER */}
      <section className="py-16 bg-white">
        <Container>
          <div className="p-8 sm:p-10 rounded-3xl bg-[#EEF8FB] border border-[#D6EAF1] flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center lg:text-left">
              <span className="text-xs font-mono font-semibold text-[#0879A5] uppercase tracking-wider">
                Consultation &amp; Inquiries
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#103A50] font-normal">
                Need to Schedule a Medical Visit?
              </h2>
              <p className="text-xs sm:text-sm text-[#617786] max-w-xl">
                Contact our reception desk for outpatient appointment requests or emergency assistance.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button
                to="/appointment"
                variant="primary"
                size="lg"
                icon={<Calendar className="w-4 h-4" />}
              >
                Book Appointment
              </Button>
              <Button
                href={HOSPITAL_CONFIG.phones[0].raw}
                variant="emergency"
                size="lg"
                icon={<Phone className="w-4 h-4" />}
              >
                Call {HOSPITAL_CONFIG.phones[0].number}
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </PageTransition>
  );
};
