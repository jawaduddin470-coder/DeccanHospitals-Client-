import React, { useState, useEffect, useMemo } from 'react';
import { Container } from '../components/common/Container';
import { Button } from '../components/common/Button';
import { PageTransition } from '../components/layout/PageTransition';
import { DoctorsHero } from '../components/doctors/DoctorsHero';
import { DoctorSearchFilter } from '../components/doctors/DoctorSearchFilter';
import { FeaturedDoctorsSection } from '../components/doctors/FeaturedDoctorsSection';
import { MedicalDirectorySection } from '../components/doctors/MedicalDirectorySection';
import { doctorService } from '../services';
import { INITIAL_DOCTORS } from '../config/initialDoctors';
import { HOSPITAL_CONFIG } from '../config/constants';
import type { Doctor } from '../types';
import { Calendar, Phone, SearchX, Clock } from 'lucide-react';

export const DoctorsPage: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>(() =>
    INITIAL_DOCTORS.filter((doc) => doc.active !== false && doc.isActive !== false)
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');

  useEffect(() => {
    let isMounted = true;
    doctorService.getDoctors().then((data) => {
      if (isMounted && data) {
        setDoctors(data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Active doctors only
  const activeDoctors = useMemo(() => {
    return doctors.filter((doc) => doc.active !== false && doc.isActive !== false);
  }, [doctors]);

  // Dynamically derive existing specialties
  const availableSpecialties = useMemo(() => {
    const specialtiesSet = new Set<string>();
    activeDoctors.forEach((doc) => {
      if (doc.specialization) {
        specialtiesSet.add(doc.specialization);
      }
    });
    return Array.from(specialtiesSet);
  }, [activeDoctors]);

  // Filtered doctors based on search query and specialty filter
  const filteredDoctors = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return activeDoctors.filter((doctor) => {
      // Specialty check
      const matchesSpecialty =
        selectedSpecialty === 'all' || doctor.specialization === selectedSpecialty;

      // Query check
      const matchesQuery =
        !query ||
        doctor.name.toLowerCase().includes(query) ||
        doctor.designation.toLowerCase().includes(query) ||
        doctor.specialization.toLowerCase().includes(query) ||
        (doctor.qualification && doctor.qualification.toLowerCase().includes(query));

      return matchesSpecialty && matchesQuery;
    });
  }, [activeDoctors, searchQuery, selectedSpecialty]);

  // Split into Category 1 (Featured with images) and Category 2 (Directory)
  const featuredDoctors = useMemo(() => {
    return filteredDoctors.filter((doc) => doc.profileType === 'featured');
  }, [filteredDoctors]);

  const directoryDoctors = useMemo(() => {
    return filteredDoctors.filter((doc) => doc.profileType === 'directory');
  }, [filteredDoctors]);

  return (
    <PageTransition>
      {/* 1. DOCTORS HERO */}
      <DoctorsHero />

      {/* 2. STICKY SEARCH & DYNAMIC SPECIALTY FILTERS */}
      <DoctorSearchFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedSpecialty={selectedSpecialty}
        onSelectSpecialty={setSelectedSpecialty}
        availableSpecialties={availableSpecialties}
        totalResults={filteredDoctors.length}
      />

      {/* 3. MAIN DOCTOR LISTINGS */}
      {filteredDoctors.length === 0 ? (
        <section className="py-20 bg-white">
          <Container size="sm">
            <div className="text-center p-10 rounded-3xl bg-[#F7FCFE] border border-[#D6EAF1] space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#EEF8FB] text-[#0879A5] flex items-center justify-center mx-auto">
                <SearchX className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-2xl text-[#103A50]">
                  No doctors match your search
                </h3>
                <p className="text-xs text-[#617786] max-w-sm mx-auto">
                  Try adjusting your search terms or selecting 'All Specialties' to browse the complete medical team.
                </p>
              </div>
              <div className="pt-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedSpecialty('all');
                  }}
                >
                  Reset All Filters
                </Button>
              </div>
            </div>
          </Container>
        </section>
      ) : (
        <>
          {/* Category 1: Featured Doctors Section */}
          <FeaturedDoctorsSection doctors={featuredDoctors} />

          {/* Category 2: Medical Directory Section */}
          <MedicalDirectorySection doctors={directoryDoctors} />
        </>
      )}

      {/* 4. APPOINTMENT CTA SECTION */}
      <section className="py-16 sm:py-20 bg-gradient-to-r from-[#103A50] via-[#0B2737] to-[#103A50] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-medical-grid-dark opacity-30 pointer-events-none" />

        <Container>
          <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#19A4CF]/20 text-[#19A4CF] border border-[#19A4CF]/30 text-xs font-semibold uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5" />
              Consultation Guidance
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-white tracking-tight">
              Ready to plan your visit?
            </h2>

            <p className="font-sans text-base sm:text-lg text-[#E2F4F9]/80 max-w-xl mx-auto leading-relaxed">
              Request an appointment with the hospital.
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
    </PageTransition>
  );
};
