import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Container } from '../components/common/Container';
import { Card } from '../components/common/Card';
import { PageTransition } from '../components/layout/PageTransition';
import {
  AppointmentHero,
  DepartmentSelector,
  DoctorSelector,
  DateSelector,
  SlotSelector,
  PatientDetailsForm,
  AppointmentSummaryCard,
  AppointmentConfirmation,
  type PatientFormData,
  type PatientFormErrors,
} from '../components/appointment';
import { doctorService, availabilityService, appointmentService, DoubleBookingError } from '../services';
import type { Doctor, AvailabilitySlot, Appointment } from '../types';
import { HOSPITAL_CONFIG } from '../config/constants';
import { Phone, Clock, ShieldCheck, MapPin, CheckCircle2 } from 'lucide-react';

export const AppointmentPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const preselectedDoctorId = searchParams.get('doctor');
  const preselectedDept = searchParams.get('department') || 'all';

  // State Management
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState<boolean>(true);

  const [selectedDepartment, setSelectedDepartment] = useState<string>(preselectedDept);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  
  // Date default: Today in YYYY-MM-DD
  const todayStr = useMemo(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  // Slot states
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [isLoadingSlots, setIsLoadingSlots] = useState<boolean>(false);
  const [slotError, setSlotError] = useState<string | null>(null);

  // Patient form state
  const [formData, setFormData] = useState<PatientFormData>({
    patientName: '',
    phone: '',
    email: '',
    reason: '',
  });

  const [formErrors, setFormErrors] = useState<PatientFormErrors>({});

  // Submission states
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);

  // Load doctors from service
  useEffect(() => {
    let isMounted = true;
    const loadDoctors = async () => {
      setIsLoadingDoctors(true);
      try {
        const docs = await doctorService.getDoctors();
        if (isMounted) {
          setDoctors(docs);
          // If preselected doctor in URL params
          if (preselectedDoctorId) {
            const match = docs.find((d) => d.id === preselectedDoctorId);
            if (match) {
              setSelectedDoctor(match);
            }
          } else if (docs.length > 0 && !selectedDoctor) {
            setSelectedDoctor(docs[0]);
          }
        }
      } catch (err) {
        console.warn('Error loading doctors:', err);
      } finally {
        if (isMounted) setIsLoadingDoctors(false);
      }
    };

    loadDoctors();
    return () => {
      isMounted = false;
    };
  }, [preselectedDoctorId]);

  // Filter doctors by selected department
  const filteredDoctors = useMemo(() => {
    if (selectedDepartment === 'all') return doctors;

    const deptMap: { [key: string]: string[] } = {
      maternity: ['maternity', 'obstetrics', 'gynaecology', 'gynecology'],
      gynecology: ['gynecology', 'gynaecology', 'women'],
      pediatrics: ['pediatrics', 'pediatrician', 'neonatal', 'child'],
      general_medicine: ['medicine', 'physician', 'general'],
      general_surgery: ['surgery', 'surgeon'],
    };

    const keywords = deptMap[selectedDepartment] || [selectedDepartment];

    return doctors.filter((doc) => {
      const spec = (doc.specialization || '').toLowerCase();
      const desig = (doc.designation || '').toLowerCase();
      return keywords.some((kw) => spec.includes(kw) || desig.includes(kw));
    });
  }, [doctors, selectedDepartment]);

  // If filtered doctors changes and current selected doctor is not in list, auto-select first
  useEffect(() => {
    if (filteredDoctors.length > 0) {
      const exists = filteredDoctors.some((d) => d.id === selectedDoctor?.id);
      if (!exists) {
        setSelectedDoctor(filteredDoctors[0]);
      }
    } else {
      setSelectedDoctor(null);
    }
  }, [filteredDoctors, selectedDoctor]);

  // Fetch slots whenever selectedDoctor or selectedDate changes
  const fetchAvailableSlots = useCallback(async () => {
    if (!selectedDoctor?.id || !selectedDate) {
      setSlots([]);
      setSelectedSlot(null);
      return;
    }

    setIsLoadingSlots(true);
    setSlotError(null);
    setSelectedSlot(null);

    try {
      const fetchedSlots = await availabilityService.getAvailableSlots(
        selectedDoctor.id,
        selectedDate
      );
      setSlots(fetchedSlots);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Unable to load appointment availability right now. Please try again or call the hospital directly.';
      setSlotError(message);
      setSlots([]);
    } finally {
      setIsLoadingSlots(false);
    }
  }, [selectedDoctor, selectedDate]);

  useEffect(() => {
    fetchAvailableSlots();
  }, [fetchAvailableSlots]);

  // Form Field Validation
  const validateForm = (): boolean => {
    const errors: PatientFormErrors = {};
    if (!formData.patientName.trim()) {
      errors.patientName = 'Full name is required';
    } else if (formData.patientName.trim().length < 2) {
      errors.patientName = 'Please enter valid full name';
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Mobile number is required';
    } else if (formData.phone.replace(/\D/g, '').length < 10) {
      errors.phone = 'Enter valid 10-digit number';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Enter valid email address';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormChange = (field: keyof PatientFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    const errorKey = field as keyof PatientFormErrors;
    if (formErrors[errorKey]) {
      setFormErrors((prev) => ({ ...prev, [errorKey]: undefined }));
    }
    if (submissionError) {
      setSubmissionError(null);
    }
  };

  // Submit Booking with Atomic Transaction Double-Booking Protection
  const handleConfirmBooking = async () => {
    if (!validateForm()) return;

    if (!selectedDoctor || !selectedSlot) {
      setSubmissionError('Please select a doctor and available time slot.');
      return;
    }

    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      const created = await appointmentService.bookAppointment({
        patientName: formData.patientName,
        phone: formData.phone,
        email: formData.email ? formData.email : undefined,
        doctorId: selectedDoctor.id,
        doctorNameSnapshot: selectedDoctor.name,
        specializationSnapshot: selectedDoctor.specialization,
        date: selectedDate,
        slotId: selectedSlot.id,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        reason: formData.reason ? formData.reason : undefined,
      });

      setConfirmedAppointment(created);
      window.scrollTo({ top: 120, behavior: 'smooth' });
    } catch (err: unknown) {
      if (err instanceof DoubleBookingError) {
        setSubmissionError(err.message);
        // Refresh slots immediately to show latest availability
        fetchAvailableSlots();
      } else {
        const errorMsg =
          err instanceof Error
            ? err.message
            : 'An unexpected booking error occurred. Please try again or contact the hospital.';
        setSubmissionError(errorMsg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset booking form to book another appointment
  const handleBookAnother = () => {
    setConfirmedAppointment(null);
    setSelectedSlot(null);
    setFormData({
      patientName: '',
      phone: '',
      email: '',
      reason: '',
    });
    setFormErrors({});
    setSubmissionError(null);
    fetchAvailableSlots();
  };

  return (
    <PageTransition>
      {/* 1. ARCHITECTURAL HERO & HOSPITAL ADVISORY */}
      <AppointmentHero />

      {/* 2. MAIN APPOINTMENT BOOKING EXPERIENCE */}
      <section className="py-12 sm:py-18 bg-[#F7FCFE]">
        <Container>
          {confirmedAppointment ? (
            /* Booking Confirmation View */
            <AppointmentConfirmation
              appointment={confirmedAppointment}
              onBookAnother={handleBookAnother}
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Interactive Stepped Booking Workflow */}
              <div className="lg:col-span-8 space-y-8">
                {/* STEP 1: Department Selector */}
                <Card variant="default" padding="lg" className="border-[#D6EAF1] bg-white shadow-xs">
                  <DepartmentSelector
                    selectedDepartment={selectedDepartment}
                    onSelectDepartment={(deptId) => setSelectedDepartment(deptId)}
                  />
                </Card>

                {/* STEP 2: Doctor Selector */}
                <Card variant="default" padding="lg" className="border-[#D6EAF1] bg-white shadow-xs">
                  <DoctorSelector
                    doctors={filteredDoctors}
                    selectedDoctorId={selectedDoctor?.id || ''}
                    onSelectDoctor={(doc) => setSelectedDoctor(doc)}
                    isLoading={isLoadingDoctors}
                  />
                </Card>

                {/* STEP 3: Date Selector */}
                <Card variant="default" padding="lg" className="border-[#D6EAF1] bg-white shadow-xs">
                  <DateSelector
                    selectedDate={selectedDate}
                    onSelectDate={(date) => setSelectedDate(date)}
                  />
                </Card>

                {/* STEP 4 & 5: Slot Selector */}
                <Card variant="default" padding="lg" className="border-[#D6EAF1] bg-white shadow-xs">
                  <SlotSelector
                    slots={slots}
                    selectedSlot={selectedSlot}
                    onSelectSlot={(slot) => setSelectedSlot(slot)}
                    isLoading={isLoadingSlots}
                    error={slotError}
                    onRetry={fetchAvailableSlots}
                    onChangeDate={() => {
                      // Focus or scroll to date selector if needed
                    }}
                  />
                </Card>

                {/* STEP 6: Patient Contact Details */}
                {selectedSlot && (
                  <Card variant="default" padding="lg" className="border-[#D6EAF1] bg-white shadow-xs">
                    <PatientDetailsForm
                      formData={formData}
                      formErrors={formErrors}
                      onChange={handleFormChange}
                    />
                  </Card>
                )}

                {/* STEP 7: Review & Atomic Booking Confirmation */}
                {selectedSlot && (
                  <AppointmentSummaryCard
                    doctor={selectedDoctor}
                    date={selectedDate}
                    slot={selectedSlot}
                    patientName={formData.patientName}
                    phone={formData.phone}
                    email={formData.email}
                    reason={formData.reason}
                    isSubmitting={isSubmitting}
                    submissionError={submissionError}
                    onConfirmBooking={handleConfirmBooking}
                  />
                )}
              </div>

              {/* Right Column: Hospital Information & Guidance Sidebar */}
              <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
                {/* Hospital Desk Card */}
                <Card variant="subtle" padding="lg" className="border-[#D6EAF1] space-y-4">
                  <div className="flex items-center gap-2 text-[#0879A5]">
                    <Clock className="w-5 h-5" />
                    <h3 className="font-serif text-lg text-[#103A50]">
                      OPD Timings &amp; Guidelines
                    </h3>
                  </div>

                  <div className="space-y-3 text-xs text-[#617786] leading-relaxed">
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#0879A5] mt-0.5 flex-shrink-0" />
                      <span>
                        <strong>Morning OPD:</strong> 10:00 AM to 01:00 PM (Monday – Sunday)
                      </span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#0879A5] mt-0.5 flex-shrink-0" />
                      <span>
                        <strong>Evening OPD:</strong> 05:00 PM to 08:00 PM (Monday – Saturday)
                      </span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#0879A5] mt-0.5 flex-shrink-0" />
                      <span>
                        Please carry prior medical reports, scans, and doctor prescriptions.
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#D6EAF1] space-y-2 text-xs">
                    <div className="flex items-start gap-2 text-[#17384A]">
                      <MapPin className="w-4 h-4 text-[#0879A5] mt-0.5 flex-shrink-0" />
                      <span>{HOSPITAL_CONFIG.address.fullFormatted}</span>
                    </div>
                  </div>
                </Card>

                {/* Telephone Helpline Card */}
                <Card variant="default" padding="lg" className="border-[#D6EAF1] bg-white space-y-3">
                  <div className="flex items-center gap-2 text-[#0879A5]">
                    <Phone className="w-5 h-5" />
                    <h4 className="font-serif text-base text-[#103A50]">
                      Need Telephone Booking?
                    </h4>
                  </div>
                  <p className="text-xs text-[#617786] leading-relaxed">
                    If you prefer booking directly over the phone or have urgent maternity inquiries, call our reception desk.
                  </p>
                  <div className="space-y-1.5 pt-1 font-mono text-xs">
                    <a
                      href={HOSPITAL_CONFIG.phones[0].raw}
                      className="block p-2 rounded-xl bg-[#EEF8FB] text-[#0879A5] font-semibold hover:bg-[#E2F4F9] transition-colors"
                    >
                      📞 {HOSPITAL_CONFIG.phones[0].number}
                    </a>
                    <a
                      href={HOSPITAL_CONFIG.phones[1].raw}
                      className="block p-2 rounded-xl bg-[#EEF8FB] text-[#0879A5] font-semibold hover:bg-[#E2F4F9] transition-colors"
                    >
                      📞 {HOSPITAL_CONFIG.phones[1].number}
                    </a>
                  </div>
                </Card>

                {/* Privacy & Safety Note */}
                <div className="p-4 rounded-2xl bg-white border border-[#D6EAF1] flex items-start gap-3 text-xs text-[#617786]">
                  <ShieldCheck className="w-5 h-5 text-[#0879A5] flex-shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    Patient records and appointment slots are stored securely under Deccan Care hospital protocols.
                  </p>
                </div>
              </div>
            </div>
          )}
        </Container>
      </section>
    </PageTransition>
  );
};
