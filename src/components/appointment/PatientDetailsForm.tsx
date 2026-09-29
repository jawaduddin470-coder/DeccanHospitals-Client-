import React from 'react';
import { User, Phone, Mail, FileText, AlertCircle } from 'lucide-react';

export interface PatientFormData {
  patientName: string;
  phone: string;
  email: string;
  reason: string;
}

export interface PatientFormErrors {
  patientName?: string;
  phone?: string;
  email?: string;
}

interface PatientDetailsFormProps {
  formData: PatientFormData;
  formErrors: PatientFormErrors;
  onChange: (field: keyof PatientFormData, value: string) => void;
}

export const PatientDetailsForm: React.FC<PatientDetailsFormProps> = ({
  formData,
  formErrors,
  onChange,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-serif text-lg sm:text-xl text-[#103A50] font-medium">
          Step 5: Enter Patient Information
        </h3>
        <p className="text-xs text-[#617786] mt-0.5">
          Provide contact details for booking confirmation and OPD desk verification
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Full Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#17384A] flex items-center justify-between">
            <span>Patient Full Name *</span>
            {formErrors.patientName && (
              <span className="text-[11px] text-[#D93636] font-normal flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {formErrors.patientName}
              </span>
            )}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#617786]">
              <User className="w-4 h-4" />
            </div>
            <input
              type="text"
              required
              placeholder="e.g. Ramesh Patil / Ayesha Begum"
              value={formData.patientName}
              onChange={(e) => onChange('patientName', e.target.value)}
              className={`w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border bg-[#F7FCFE] focus:bg-white focus:outline-none transition-colors ${
                formErrors.patientName
                  ? 'border-[#D93636] focus:border-[#D93636]'
                  : 'border-[#D6EAF1] focus:border-[#0879A5]'
              }`}
            />
          </div>
        </div>

        {/* Contact Phone */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#17384A] flex items-center justify-between">
            <span>Contact Mobile Number *</span>
            {formErrors.phone && (
              <span className="text-[11px] text-[#D93636] font-normal flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {formErrors.phone}
              </span>
            )}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#617786]">
              <Phone className="w-4 h-4" />
            </div>
            <input
              type="tel"
              required
              maxLength={10}
              placeholder="10-digit Indian mobile (e.g. 9876543210)"
              value={formData.phone}
              onChange={(e) => {
                const clean = e.target.value.replace(/\D/g, '').slice(0, 10);
                onChange('phone', clean);
              }}
              className={`w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border bg-[#F7FCFE] focus:bg-white focus:outline-none transition-colors font-mono ${
                formErrors.phone
                  ? 'border-[#D93636] focus:border-[#D93636]'
                  : 'border-[#D6EAF1] focus:border-[#0879A5]'
              }`}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Email Address (Optional) */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#17384A] flex items-center justify-between">
            <span>Email Address (Optional)</span>
            {formErrors.email && (
              <span className="text-[11px] text-[#D93636] font-normal flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {formErrors.email}
              </span>
            )}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#617786]">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              placeholder="patient@example.com"
              value={formData.email}
              onChange={(e) => onChange('email', e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-[#D6EAF1] bg-[#F7FCFE] focus:bg-white focus:border-[#0879A5] focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Reason for Visit (Optional) */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#17384A] block">
            Reason for Visit / Symptoms (Optional)
          </label>
          <div className="relative">
            <div className="absolute top-3 left-3.5 pointer-events-none text-[#617786]">
              <FileText className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="e.g. Antenatal checkup, general fever, routine scan"
              value={formData.reason}
              onChange={(e) => onChange('reason', e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-[#D6EAF1] bg-[#F7FCFE] focus:bg-white focus:border-[#0879A5] focus:outline-none transition-colors"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
