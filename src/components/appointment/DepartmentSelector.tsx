import React from 'react';
import { Baby, Activity, Stethoscope, HeartPulse, Sparkles, Building2 } from 'lucide-react';

export interface DepartmentOption {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
}

export const DEPARTMENTS: DepartmentOption[] = [
  {
    id: 'maternity',
    name: 'Maternity & Obstetrics',
    icon: <Baby className="w-5 h-5" />,
    description: 'Antenatal care, normal delivery, high-risk pregnancy & post-natal review',
  },
  {
    id: 'gynecology',
    name: 'Gynaecology & Women’s Health',
    icon: <Sparkles className="w-5 h-5" />,
    description: 'Women wellness, hormonal health, pelvic care & gynaecological reviews',
  },
  {
    id: 'pediatrics',
    name: 'Pediatrics & Neonatal Care',
    icon: <HeartPulse className="w-5 h-5" />,
    description: 'Child health checks, immunizations, infant care & growth monitoring',
  },
  {
    id: 'general_medicine',
    name: 'General Medicine & OPD',
    icon: <Stethoscope className="w-5 h-5" />,
    description: 'Diagnosis and clinical management of fevers, hypertension, diabetes & acute illness',
  },
  {
    id: 'general_surgery',
    name: 'General Surgery Consultation',
    icon: <Activity className="w-5 h-5" />,
    description: 'Surgical evaluations, minor procedures, wound management & post-op care',
  },
  {
    id: 'all',
    name: 'All Hospital Specialists',
    icon: <Building2 className="w-5 h-5" />,
    description: 'Browse all available clinical doctors across Deccan Care Hospital',
  },
];

interface DepartmentSelectorProps {
  selectedDepartment: string;
  onSelectDepartment: (deptId: string) => void;
}

export const DepartmentSelector: React.FC<DepartmentSelectorProps> = ({
  selectedDepartment,
  onSelectDepartment,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-serif text-lg sm:text-xl text-[#103A50] font-medium">
            Step 1: Select Department or Specialty
          </h3>
          <p className="text-xs text-[#617786] mt-0.5">
            Choose the clinical discipline for your appointment
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {DEPARTMENTS.map((dept) => {
          const isSelected = selectedDepartment === dept.id;
          return (
            <button
              key={dept.id}
              type="button"
              onClick={() => onSelectDepartment(dept.id)}
              className={`text-left p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0879A5] ${
                isSelected
                  ? 'border-[#0879A5] bg-[#EEF8FB] shadow-xs'
                  : 'border-[#D6EAF1] bg-white hover:border-[#19A4CF] hover:bg-[#F7FCFE]'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-[#0879A5] text-white'
                      : 'bg-[#EEF8FB] text-[#0879A5]'
                  }`}
                >
                  {dept.icon}
                </div>
                <div>
                  <h4 className="font-serif text-sm font-semibold text-[#103A50] leading-snug">
                    {dept.name}
                  </h4>
                  <p className="text-[11px] text-[#617786] mt-1 leading-relaxed line-clamp-2">
                    {dept.description}
                  </p>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-[#D6EAF1]/50 flex items-center justify-between text-[11px] font-mono">
                <span className={isSelected ? 'text-[#0879A5] font-semibold' : 'text-[#617786]'}>
                  {isSelected ? '✓ Selected' : 'Select'}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
