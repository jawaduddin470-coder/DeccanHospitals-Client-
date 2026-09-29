import React from 'react';
import { Card } from '../common/Card';
import type { Doctor } from '../../types';
import { ArrowRight, User } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DirectoryDoctorRowProps {
  doctor: Doctor;
  onSelect?: (doctor: Doctor) => void;
}

export const DirectoryDoctorRow: React.FC<DirectoryDoctorRowProps> = ({ doctor, onSelect }) => {
  return (
    <Card
      variant="interactive"
      padding="md"
      onClick={() => onSelect?.(doctor)}
      className="h-full border-[#D6EAF1] bg-white flex flex-col justify-between group hover:border-[#0879A5] transition-all duration-200"
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono font-semibold uppercase text-[#0879A5] bg-[#EEF8FB] px-2.5 py-0.5 rounded-md border border-[#D6EAF1]">
            {doctor.specialization}
          </span>
          <div className="w-6 h-6 rounded-full bg-[#F7FCFE] text-[#617786] group-hover:text-[#0879A5] flex items-center justify-center transition-colors">
            <User className="w-3.5 h-3.5" />
          </div>
        </div>

        <div>
          <h4 className="font-serif text-xl text-[#103A50] font-normal leading-snug group-hover:text-[#0879A5] transition-colors">
            {doctor.name}
          </h4>

          {doctor.qualification && (
            <p className="text-xs font-sans text-[#0879A5] font-medium mt-0.5">
              {doctor.qualification}
            </p>
          )}

          <p className="text-xs text-[#617786] mt-1">{doctor.designation}</p>
        </div>
      </div>

      <div className="pt-3 mt-3 border-t border-[#D6EAF1]/70 flex items-center justify-between text-xs">
        <span className="text-[11px] font-mono text-[#617786]">Hospital Directory</span>
        <Link
          to="/appointment"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1 font-sans text-xs font-semibold text-[#0879A5] hover:underline"
        >
          <span>Schedule</span>
          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </Card>
  );
};
