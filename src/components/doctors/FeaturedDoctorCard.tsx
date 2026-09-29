import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import type { Doctor } from '../../types';
import { Calendar, UserCheck, Stethoscope } from 'lucide-react';

interface FeaturedDoctorCardProps {
  doctor: Doctor;
  onSelect?: (doctor: Doctor) => void;
}

export const FeaturedDoctorCard: React.FC<FeaturedDoctorCardProps> = ({ doctor, onSelect }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const photo = doctor.imageUrl || doctor.photoUrl;

  // Fallback if image is missing or failed to load: render clean directory presentation without empty image boxes
  if (!photo || imageError) {
    return (
      <Card
        variant="interactive"
        padding="lg"
        onClick={() => onSelect?.(doctor)}
        className="h-full border-[#D6EAF1] bg-white flex flex-col justify-between hover:border-[#0879A5] transition-all duration-200"
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-semibold uppercase text-[#0879A5] bg-[#E2F4F9] px-2.5 py-1 rounded-full">
              {doctor.specialization}
            </span>
            <Stethoscope className="w-4 h-4 text-[#0879A5]" />
          </div>

          <div>
            <h3 className="font-serif text-xl text-[#103A50] font-normal leading-snug">
              {doctor.name}
            </h3>
            {doctor.qualification && (
              <p className="text-xs font-sans text-[#0879A5] font-medium mt-1">
                {doctor.qualification}
              </p>
            )}
            <p className="text-xs text-[#617786] mt-0.5">{doctor.designation}</p>
          </div>

          {doctor.description && (
            <p className="text-xs text-[#617786] leading-relaxed pt-2 border-t border-[#D6EAF1]/60">
              {doctor.description}
            </p>
          )}
        </div>

        <div className="pt-4 mt-4 border-t border-[#D6EAF1] flex items-center justify-between text-xs">
          <span className="text-[#617786]">Consultation by Appointment</span>
          <Button to="/appointment" variant="ghost" size="sm" className="px-0 text-[#0879A5]">
            Book Visit →
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card
      variant="interactive"
      padding="none"
      onClick={() => onSelect?.(doctor)}
      className="h-full border-[#D6EAF1] bg-white flex flex-col justify-between overflow-hidden group hover:border-[#19A4CF] shadow-xs hover:shadow-md transition-all duration-300"
    >
      <div>
        {/* Large Portrait Container (4:5 aspect ratio) */}
        <div className="relative w-full aspect-[4/5] bg-[#EEF8FB] overflow-hidden">
          {/* Skeleton loading shimmer */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-[#E2F4F9] animate-pulse" />
          )}

          <img
            src={photo}
            alt={`Portrait of ${doctor.name}`}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            className={`w-full h-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* Architectural Top-Right Badge */}
          <div className="absolute top-3 right-3 z-10">
            <span className="text-[10px] font-mono font-semibold uppercase text-[#103A50] bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-md border border-[#D6EAF1] shadow-xs">
              {doctor.specialization}
            </span>
          </div>

          {/* Architectural Corner Crop Accent */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none" />
        </div>

        {/* Doctor Information Body */}
        <div className="p-6 space-y-3">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#0879A5] uppercase font-semibold">
              <UserCheck className="w-3.5 h-3.5 text-[#0879A5]" />
              <span>{doctor.designation}</span>
            </div>

            <h3 className="font-serif text-2xl text-[#103A50] font-normal leading-snug mt-1">
              {doctor.name}
            </h3>

            {doctor.qualification && (
              <p className="text-xs font-sans text-[#0879A5] font-semibold mt-0.5">
                {doctor.qualification}
              </p>
            )}
          </div>

          {doctor.description && (
            <p className="text-xs text-[#617786] leading-relaxed line-clamp-2">
              {doctor.description}
            </p>
          )}
        </div>
      </div>

      {/* Card Footer CTA */}
      <div className="px-6 pb-6 pt-2 border-t border-[#D6EAF1]/70 flex items-center justify-between">
        <span className="text-[11px] text-[#617786] font-mono">By Appointment</span>
        <Button
          to="/appointment"
          variant="secondary"
          size="sm"
          icon={<Calendar className="w-3.5 h-3.5" />}
          className="text-xs"
        >
          Book Consultation
        </Button>
      </div>
    </Card>
  );
};
