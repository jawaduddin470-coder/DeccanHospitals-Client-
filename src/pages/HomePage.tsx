import React, { Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { Container } from '../components/common/Container';
import { SectionHeading } from '../components/common/SectionHeading';
import { SectionLabel } from '../components/common/SectionLabel';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { BackgroundPattern } from '../components/common/BackgroundPattern';
import { PageTransition } from '../components/layout/PageTransition';
import { ServiceIcon } from '../components/common/ServiceIcon';
import { FeaturedDoctorCard } from '../components/doctors/FeaturedDoctorCard';
import { GalleryCard } from '../components/gallery/GalleryCard';
import { GalleryLightbox } from '../components/gallery/GalleryLightbox';

// Lazy-load signature 3D Experience to isolate Three.js chunk and boost initial bundle performance
const Hero3DContainer = lazy(() =>
  import('../components/3d/Hero3DContainer').then((m) => ({ default: m.Hero3DContainer }))
);
import { serviceService, doctorService, galleryService } from '../services';
import { INITIAL_SERVICES } from '../config/initialServices';
import { INITIAL_DOCTORS } from '../config/initialDoctors';
import { INITIAL_GALLERY } from '../config/initialGallery';
import type { HospitalService, Doctor, GalleryItem } from '../types';
import { HOSPITAL_CONFIG } from '../config/constants';
import {
  Phone,
  Calendar,
  Clock,
  MapPin,
  Users,
  Baby,
  Activity,
  ArrowRight,
  ShieldCheck,
  Building2,
  Camera,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const [services, setServices] = React.useState<HospitalService[]>(() =>
    INITIAL_SERVICES.filter((s) => s.active !== false)
  );
  const [doctors, setDoctors] = React.useState<Doctor[]>(() =>
    INITIAL_DOCTORS.filter((doc) => doc.active !== false && doc.isActive !== false)
  );
  const [gallery, setGallery] = React.useState<GalleryItem[]>(() =>
    INITIAL_GALLERY.filter((item) => item.active !== false && item.isActive !== false)
  );

  React.useEffect(() => {
    let isMounted = true;
    serviceService.getServices().then((data) => {
      if (isMounted && data) setServices(data);
    });
    doctorService.getDoctors().then((data) => {
      if (isMounted && data) setDoctors(data);
    });
    galleryService.getGalleryItems().then((data) => {
      if (isMounted && data) setGallery(data);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Quick Access 4 Interactive Modules
  const quickAccessModules = [
    {
      icon: <Activity className="w-6 h-6 text-[#D93636]" />,
      label: '24×7 Hospital Support',
      desc: 'Urgent medical assistance and emergency guidance in Sheikh Roza, Kalaburagi.',
      actionText: 'Emergency Call',
      href: HOSPITAL_CONFIG.phones[0].raw,
      isEmergency: true,
    },
    {
      icon: <Calendar className="w-6 h-6 text-[#0879A5]" />,
      label: 'Book Appointment',
      desc: 'Schedule an outpatient consultation or maternity checkup with our team.',
      actionText: 'Schedule Visit',
      to: '/appointment',
      isEmergency: false,
    },
    {
      icon: <Users className="w-6 h-6 text-[#0879A5]" />,
      label: 'Doctors & Team',
      desc: 'Meet our clinical specialists across maternity, obstetrics, and general healthcare.',
      actionText: 'View Specialists',
      to: '/doctors',
      isEmergency: false,
    },
    {
      icon: <MapPin className="w-6 h-6 text-[#0879A5]" />,
      label: 'Find Hospital',
      desc: 'Near Quadri Chowk, Opp. Bharat Petrol Bunk, Sheikh Roza, Kalaburagi.',
      actionText: 'Get Directions',
      to: '/contact',
      isEmergency: false,
    },
  ];

  // Curated Services Preview from single source of truth
  const featuredServices = React.useMemo(() => {
    const featured = services.filter((s) => s.featured);
    return (featured.length > 0 ? featured : services).slice(0, 4);
  }, [services]);

  // Curated Featured Doctors from single source of truth (Category 1)
  const featuredDoctorsPreview = React.useMemo(() => {
    const featured = doctors.filter((doc) => doc.profileType === 'featured');
    return (featured.length > 0 ? featured : doctors).slice(0, 3);
  }, [doctors]);

  // Curated Gallery Preview from single source of truth
  const galleryPreview = React.useMemo(() => {
    const featured = gallery.filter((item) => item.featured);
    return (featured.length > 0 ? featured : gallery).slice(0, 3);
  }, [gallery]);

  const [selectedGalleryItem, setSelectedGalleryItem] = React.useState<GalleryItem | null>(null);

  const selectedIndex = selectedGalleryItem
    ? galleryPreview.findIndex((i) => i.id === selectedGalleryItem.id)
    : -1;

  const handlePrevPhoto = () => {
    if (selectedIndex > 0) {
      setSelectedGalleryItem(galleryPreview[selectedIndex - 1]);
    } else {
      setSelectedGalleryItem(galleryPreview[galleryPreview.length - 1]);
    }
  };

  const handleNextPhoto = () => {
    if (selectedIndex < galleryPreview.length - 1) {
      setSelectedGalleryItem(galleryPreview[selectedIndex + 1]);
    } else {
      setSelectedGalleryItem(galleryPreview[0]);
    }
  };

  return (
    <PageTransition>
      {/* 1. HERO SECTION WITH SIGNATURE 3D HEALTHCARE EXPERIENCE */}
      <BackgroundPattern
        variant="full"
        opacity="subtle"
        className="pt-8 pb-16 sm:pt-14 sm:pb-24 border-b border-[#D6EAF1]"
      >
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center min-h-[520px]">
            {/* Left Hero Content Column */}
            <div className="lg:col-span-6 space-y-6 text-left">
              {/* 1. Section Label (Eyebrow) */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
                className="inline-flex items-center gap-2"
              >
                <SectionLabel variant="blue">
                  COMPASSIONATE HEALTHCARE IN KALABURAGI
                </SectionLabel>
              </motion.div>

              {/* 2. Main H1 Heading */}
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-3"
              >
                <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#103A50] font-normal tracking-tight leading-[1.12]">
                  Care for every stage of life.
                </h1>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.35, ease: 'easeOut' }}
                  className="font-sans text-base sm:text-lg text-[#617786] font-normal leading-relaxed max-w-xl"
                >
                  Deccan Care Maternity &amp; General Hospital provides maternity-focused and general healthcare with convenient access to medical support for families.
                </motion.p>
              </motion.div>

              {/* 3. Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.48, ease: 'easeOut' }}
                className="flex flex-wrap items-center gap-3.5 pt-1"
              >
                <Button
                  to="/appointment"
                  variant="primary"
                  size="lg"
                  icon={<Calendar className="w-4 h-4" />}
                  className="shadow-md shadow-[#0879A5]/15"
                >
                  Book an Appointment
                </Button>
                <Button
                  to="/services"
                  variant="secondary"
                  size="lg"
                  icon={<ArrowRight className="w-4 h-4" />}
                >
                  Explore Our Services
                </Button>
              </motion.div>

              {/* 4. Emergency Contact Quick Action */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.58, ease: 'easeOut' }}
                className="pt-2 flex items-center gap-3 text-xs text-[#17384A]"
              >
                <span className="w-2 h-2 rounded-full bg-[#D93636] animate-pulse" />
                <span className="text-[#617786]">Emergency Assistance:</span>
                <a
                  href={HOSPITAL_CONFIG.phones[0].raw}
                  className="font-bold text-[#D93636] hover:underline flex items-center gap-1"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call {HOSPITAL_CONFIG.phones[0].number}</span>
                </a>
              </motion.div>
            </div>

            {/* Right Hero 3D Scene Column */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.65, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-6 w-full"
            >
              <Suspense
                fallback={
                  <div className="relative w-full h-[380px] sm:h-[460px] lg:h-[540px] rounded-3xl bg-gradient-to-b from-[#F7FCFE] via-[#EEF8FB] to-[#F7FCFE] border border-[#D6EAF1] shadow-xl overflow-hidden flex flex-col items-center justify-center animate-pulse">
                    <div className="w-16 h-16 rounded-2xl bg-[#0879A5]/10 flex items-center justify-center text-[#0879A5]">
                      <Activity className="w-8 h-8 animate-spin" />
                    </div>
                    <p className="mt-4 font-mono text-xs text-[#617786] tracking-wider">
                      INITIALIZING 3D MEDICAL ECOSYSTEM...
                    </p>
                  </div>
                }
              >
                <Hero3DContainer />
              </Suspense>
            </motion.div>
          </div>
        </Container>
      </BackgroundPattern>

      {/* 2. QUICK ACCESS INTERACTIVE SECTION */}
      <section className="py-14 sm:py-18 bg-[#F7FCFE] border-b border-[#D6EAF1]">
        <Container>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {quickAccessModules.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
              >
                <Card
                  variant="interactive"
                  padding="md"
                  className="h-full flex flex-col justify-between border-[#D6EAF1] bg-white group hover:border-[#19A4CF]"
                >
                  <div className="space-y-3">
                    <div className="w-11 h-11 rounded-xl bg-[#EEF8FB] border border-[#D6EAF1] flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="font-serif text-lg text-[#103A50] font-medium leading-snug">
                        {item.label}
                      </h3>
                      <p className="text-xs text-[#617786] leading-relaxed mt-1.5">
                        {item.desc}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 mt-3 border-t border-[#D6EAF1]/60">
                    {item.to ? (
                      <Button
                        to={item.to}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-between px-0 text-xs text-[#0879A5] hover:bg-transparent font-semibold"
                      >
                        <span>{item.actionText}</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    ) : (
                      <Button
                        href={item.href}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-between px-0 text-xs text-[#D93636] hover:bg-transparent font-semibold"
                      >
                        <span>{item.actionText}</span>
                        <Phone className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* 3. HOSPITAL INTRODUCTION (ABOUT SECTION) */}
      <section className="py-20 bg-white border-b border-[#D6EAF1]">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Architectural Healthcare Graphic */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl bg-gradient-to-br from-[#EEF8FB] via-[#F7FCFE] to-[#E2F4F9] border border-[#D6EAF1] p-8 shadow-sm overflow-hidden">
                <div className="absolute inset-0 bg-medical-grid opacity-30 pointer-events-none" />

                {/* Subtle Geometric Overlay Boxes */}
                <div className="relative z-10 space-y-6">
                  <div className="flex items-center justify-between border-b border-[#D6EAF1] pb-4">
                    <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#0879A5]">
                      Hospital Overview
                    </span>
                    <span className="text-[10px] font-mono text-[#617786]">
                      SHEIKH ROZA // KALABURAGI
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="p-4 rounded-2xl bg-white border border-[#D6EAF1] shadow-xs flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-[#E2F4F9] text-[#0879A5] flex items-center justify-center flex-shrink-0">
                        <Baby className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#103A50]">Maternity-Focused Care</h4>
                        <p className="text-xs text-[#617786] mt-0.5 leading-relaxed">
                          Women's health, pregnancy care, maternity services, and gynaecological consultations.
                        </p>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-[#D6EAF1] shadow-xs flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-[#EEF8FB] text-[#0879A5] flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#103A50]">General Healthcare</h4>
                        <p className="text-xs text-[#617786] mt-0.5 leading-relaxed">
                          Consultation, diagnosis, and management of common adult medical conditions.
                        </p>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-[#D6EAF1] shadow-xs flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-[#FFF8F8] text-[#D93636] flex items-center justify-center flex-shrink-0">
                        <Activity className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#103A50]">24×7 Emergency Support</h4>
                        <p className="text-xs text-[#617786] mt-0.5 leading-relaxed">
                          Urgent medical assistance and emergency guidance available by direct phone contact.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Text & Factual Highlights */}
            <div className="lg:col-span-7 space-y-6">
              <SectionLabel variant="blue">ABOUT DECCAN CARE</SectionLabel>
              <SectionHeading
                title="Patient-focused care, close to home."
                subtitle="Deccan Care Maternity & General Hospital is located in Sheikh Roza, Kalaburagi, combining maternity-focused care with general healthcare to provide accessible medical support for families."
                titleSize="lg"
              />

              <div className="space-y-3.5 text-sm text-[#617786] leading-relaxed">
                <p>
                  Conveniently situated near Quadri Chowk, opposite Bharat Petrol Bunk, Deccan Care Hospital offers outpatient consultations and emergency guidance to the community of Kalaburagi.
                </p>
                <p>
                  Patients and families can access obstetrics and gynaecology consultations, pediatric care, general medicine, and diagnostic facilities under one roof.
                </p>
              </div>

              {/* Factual Highlights List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-2.5 text-xs text-[#17384A]">
                  <ShieldCheck className="w-4 h-4 text-[#0879A5] flex-shrink-0" />
                  <span>Located in Sheikh Roza, Kalaburagi</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-[#17384A]">
                  <ShieldCheck className="w-4 h-4 text-[#0879A5] flex-shrink-0" />
                  <span>Maternity &amp; Gynaecological Consultations</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-[#17384A]">
                  <ShieldCheck className="w-4 h-4 text-[#0879A5] flex-shrink-0" />
                  <span>Outpatient Check-ups by Appointment</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-[#17384A]">
                  <ShieldCheck className="w-4 h-4 text-[#0879A5] flex-shrink-0" />
                  <span>24×7 Emergency Guidance</span>
                </div>
              </div>

              <div className="pt-3">
                <Button to="/about" variant="secondary" size="md">
                  Learn More About Hospital
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 4. SERVICES PREVIEW SECTION (POWERED BY INITIAL_SERVICES) */}
      <section className="py-20 bg-[#F7FCFE] border-b border-[#D6EAF1]">
        <Container>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <SectionLabel variant="blue" className="mb-3">
                OUR SPECIALTIES
              </SectionLabel>
              <SectionHeading
                title="Comprehensive Healthcare for the Family"
                subtitle="Explore our primary clinical departments, organized for maternity care, general health, and diagnostic support."
                titleSize="lg"
              />
            </div>
            <Button
              to="/services"
              variant="outline"
              size="md"
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
              className="self-start md:self-auto"
            >
              View All Services
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredServices.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
              >
                <Card
                  variant="default"
                  padding="lg"
                  className="h-full flex flex-col justify-between border-[#D6EAF1] bg-white hover:border-[#19A4CF] transition-colors"
                >
                  <div className="space-y-3.5">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        service.isEmergency ? 'bg-[#FFF8F8] text-[#D93636]' : 'bg-[#EEF8FB] text-[#0879A5]'
                      }`}
                    >
                      <ServiceIcon name={service.iconName} className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-[#0879A5] uppercase tracking-wider block font-semibold">
                        {service.category}
                      </span>
                      <h3 className="font-serif text-xl text-[#103A50] font-normal mt-0.5">
                        {service.name}
                      </h3>
                      <p className="text-xs text-[#617786] leading-relaxed mt-2">
                        {service.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-[#D6EAF1]">
                    <Button
                      to="/appointment"
                      variant="ghost"
                      size="sm"
                      className="w-full justify-between px-0 text-xs text-[#0879A5] hover:bg-transparent font-semibold"
                    >
                      <span>Consultation</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* 5. DOCTOR PREVIEW (POWERED BY INITIAL_DOCTORS SINGLE SOURCE OF TRUTH) */}
      <section className="py-20 bg-white border-b border-[#D6EAF1]">
        <Container>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <SectionLabel variant="blue" className="mb-3">
                CLINICAL TEAM
              </SectionLabel>
              <SectionHeading
                title="Dedicated Doctors &amp; Medical Specialists"
                subtitle="Our clinical team comprises experienced consultants in maternity, obstetrics, gynaecology, pediatrics, and general medicine."
                titleSize="lg"
              />
            </div>
            <Button
              to="/doctors"
              variant="outline"
              size="md"
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
              className="self-start md:self-auto"
            >
              Meet Our Doctors
            </Button>
          </div>

          {/* Featured Doctors Preview Grid (Category 1) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredDoctorsPreview.map((doctor, index) => (
              <motion.div
                key={doctor.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
              >
                <FeaturedDoctorCard doctor={doctor} />
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* 6. HOSPITAL GALLERY PREVIEW (POWERED BY INITIAL_GALLERY) */}
      <section className="py-20 bg-[#F7FCFE] border-b border-[#D6EAF1]">
        <Container>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <SectionLabel variant="blue" className="mb-3">
                FACILITY GLIMPSE
              </SectionLabel>
              <SectionHeading
                title="Inside Deccan Care Hospital"
                subtitle="Explore our patient care environments, consultation rooms, and diagnostic facilities designed for safety and comfort."
                titleSize="lg"
              />
            </div>
            <Button
              to="/gallery"
              variant="outline"
              size="md"
              icon={<Camera className="w-4 h-4" />}
              iconPosition="right"
              className="self-start md:self-auto"
            >
              Explore Full Gallery
            </Button>
          </div>

          {/* Curated Gallery Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryPreview.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
              >
                <GalleryCard
                  item={item}
                  onClick={(clickedItem) => setSelectedGalleryItem(clickedItem)}
                  isFeatured={index === 0}
                />
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* 7. APPOINTMENT CTA SECTION */}
      <section className="py-16 sm:py-20 bg-gradient-to-r from-[#103A50] via-[#0B2737] to-[#103A50] text-white relative overflow-hidden">
        {/* Subtle Geometric Grid */}
        <div className="absolute inset-0 bg-medical-grid-dark opacity-30 pointer-events-none" />

        <Container>
          <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#19A4CF]/20 text-[#19A4CF] border border-[#19A4CF]/30 text-xs font-semibold uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5" />
              Patient Assistance &amp; Helpdesk
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-white tracking-tight">
              Need medical assistance?
            </h2>

            <p className="font-sans text-base sm:text-lg text-[#E2F4F9]/80 max-w-xl mx-auto leading-relaxed">
              For appointments or urgent concerns, contact the hospital directly.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Button
                to="/appointment"
                variant="white"
                size="lg"
                icon={<Calendar className="w-4 h-4 text-[#0879A5]" />}
                className="shadow-lg font-semibold"
              >
                Book an Appointment
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

      {/* Lightbox Modal for Homepage Gallery Preview */}
      <GalleryLightbox
        items={galleryPreview}
        currentIndex={selectedIndex >= 0 ? selectedIndex : 0}
        isOpen={selectedGalleryItem !== null}
        onClose={() => setSelectedGalleryItem(null)}
        onPrev={handlePrevPhoto}
        onNext={handleNextPhoto}
      />
    </PageTransition>
  );
};
