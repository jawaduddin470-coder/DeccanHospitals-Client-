import React from 'react';
import type { Doctor } from '../../types';
import { Check, Stethoscope } from 'lucide-react';

interface DoctorSelectorProps {
  doctors: Doctor[];
  selectedDoctorId: string;
  onSelectDoctor: (doctor: Doctor) => void;
  isLoading?: boolean;
}

export const DoctorSelector: React.FC<DoctorSelectorProps> = ({
  doctors,
  selectedDoctorId,
  onSelectDoctor,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="font-serif text-lg sm:text-xl text-[#103A50] font-medium">
          Step 2: Select Specialist Doctor
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-4 rounded-2xl border border-[#D6EAF1] bg-white animate-pulse flex items-center gap-3.5"
            >
              <div className="w-12 h-12 rounded-full bg-[#EEF8FB]" />
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-[#EEF8FB] rounded-md w-3/4" />
                <div className="h-3 bg-[#EEF8FB] rounded-md w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (doctors.length === 0) {
    return (
      <div className="p-8 rounded-2xl border border-[#D6EAF1] bg-[#F7FCFE] text-center space-y-2">
        <Stethoscope className="w-8 h-8 text-[#0879A5] mx-auto opacity-60" />
        <h4 className="font-serif text-base text-[#103A50]">
          No doctors found for this specialty
        </h4>
        <p className="text-xs text-[#617786]">
          Please select another department or choose "All Hospital Specialists".
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-serif text-lg sm:text-xl text-[#103A50] font-medium">
            Step 2: Select Specialist Doctor
          </h3>
          <p className="text-xs text-[#617786] mt-0.5">
            Choose a consultant for your appointment
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {doctors.map((doctor) => {
          const isSelected = selectedDoctorId === doctor.id;
          const hasPhoto = doctor.profileType === 'featured' && Boolean(doctor.imageUrl);

          return (
            <button
              key={doctor.id}
              type="button"
              onClick={() => onSelectDoctor(doctor)}
              className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0879A5] ${
                isSelected
                  ? 'border-[#0879A5] bg-[#EEF8FB] shadow-xs ring-1 ring-[#0879A5]'
                  : 'border-[#D6EAF1] bg-white hover:border-[#19A4CF] hover:bg-[#F7FCFE]'
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                {/* Doctor Avatar: Photo for Featured, Initials/Icon Monogram for Directory */}
                {hasPhoto ? (
                  <img
                    src={doctor.imageUrl}
                    alt={doctor.name}
                    className="w-13 h-13 rounded-2xl object-cover border border-[#D6EAF1] flex-shrink-0"
                  />
                ) : (
                  <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-[#E2F4F9] to-[#D6EAF1] border border-[#D6EAF1] flex flex-col items-center justify-center text-[#0879A5] flex-shrink-0">
                    <span className="font-serif font-bold text-sm tracking-wider">
                      {doctor.name
                        .replace('Dr.', '')
                        .trim()
                        .split(' ')
                        .slice(0, 2)
                        .map((n) => n[0])
                        .join('')}
                    </span>
                  </div>
                )}

                {/* Info Text */}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-serif text-sm sm:text-base font-semibold text-[#103A50] truncate">
                      {doctor.name}
                    </h4>
                  </div>
                  <p className="text-xs text-[#0879A5] font-medium truncate mt-0.5">
                    {doctor.specialization}
                  </p>
                  {doctor.qualification && (
                    <p className="text-[11px] font-mono text-[#617786] truncate mt-0.5">
                      {doctor.qualification}
                    </p>
                  )}
                </div>
              </div>

              {/* Selection Indicator */}
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 border transition-colors ${
                  isSelected
                    ? 'bg-[#0879A5] border-[#0879A5] text-white'
                    : 'border-[#D6EAF1] bg-white text-transparent'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
