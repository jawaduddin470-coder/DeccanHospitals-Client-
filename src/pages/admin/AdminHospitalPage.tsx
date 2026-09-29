import React, { useState, useEffect } from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { hospitalService, type HospitalInfoData } from '../../services';
import {
  Building2,
  Phone,
  MapPin,
  Clock,
  Save,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

export const AdminHospitalPage: React.FC = () => {
  const [formData, setFormData] = useState<HospitalInfoData>({
    name: 'Deccan Care',
    fullName: 'Deccan Care Maternity & General Hospital',
    subHeading: 'MATERNITY & GENERAL HOSPITAL',
    locationCity: 'Kalaburagi, Karnataka, India',
    phone1: '74111 40480',
    phone2: '83103 65003',
    email: 'deccancarehospital.24ths@gmail.com',
    addressLine1: 'Near Quadri Chowk, Opp. Bharat Petrol Bunk',
    area: 'Sheikh Roza',
    city: 'Kalaburagi',
    state: 'Karnataka',
    pincode: '585101',
    fullFormattedAddress:
      'Near Quadri Chowk, Opp. Bharat Petrol Bunk, Sheikh Roza, Kalaburagi, Karnataka - 585101',
    emergencyHours: '24/7 Emergency & Maternity Services',
    opdHours: 'Consultation by appointment',
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const loadHospitalData = async () => {
    setIsLoading(true);
    try {
      const data = await hospitalService.getHospitalInfo();
      setFormData(data);
    } catch (err) {
      console.warn('Error loading hospital data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHospitalData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(null);
    setSaveError(null);

    try {
      await hospitalService.updateHospitalInfo(formData);
      setSaveSuccess('Hospital contact details successfully updated in Firestore.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update hospital information.';
      setSaveError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#103A50]">
            Hospital Contact &amp; Facility Settings
          </h1>
          <p className="text-xs text-[#617786] mt-0.5">
            Manage verified official telephone lines, reception emails, and postal address
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          icon={<RefreshCw className="w-3.5 h-3.5" />}
          onClick={loadHospitalData}
          disabled={isLoading}
        >
          Reload
        </Button>
      </div>

      <Card variant="default" padding="lg" className="border-[#D6EAF1] bg-white">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Identity */}
          <div className="space-y-4">
            <h3 className="font-serif text-base font-bold text-[#103A50] border-b border-[#D6EAF1] pb-2 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#0879A5]" />
              <span>Hospital Name &amp; Branding</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#17384A]">Short Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#D6EAF1] bg-[#F7FCFE] focus:bg-white focus:border-[#0879A5] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#17384A]">Full Legal Entity</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#D6EAF1] bg-[#F7FCFE] focus:bg-white focus:border-[#0879A5] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Telephony & Email */}
          <div className="space-y-4">
            <h3 className="font-serif text-base font-bold text-[#103A50] border-b border-[#D6EAF1] pb-2 flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#0879A5]" />
              <span>Contact Lines &amp; Support Email</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#17384A]">Primary Phone</label>
                <input
                  type="text"
                  required
                  value={formData.phone1}
                  onChange={(e) => setFormData({ ...formData, phone1: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#D6EAF1] bg-[#F7FCFE] font-mono focus:bg-white focus:border-[#0879A5] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#17384A]">Helpline Phone</label>
                <input
                  type="text"
                  required
                  value={formData.phone2}
                  onChange={(e) => setFormData({ ...formData, phone2: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#D6EAF1] bg-[#F7FCFE] font-mono focus:bg-white focus:border-[#0879A5] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#17384A]">Staff / Public Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#D6EAF1] bg-[#F7FCFE] focus:bg-white focus:border-[#0879A5] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-4">
            <h3 className="font-serif text-base font-bold text-[#103A50] border-b border-[#D6EAF1] pb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#0879A5]" />
              <span>Hospital Address in Kalaburagi</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-semibold text-[#17384A]">Landmark &amp; Road</label>
                <input
                  type="text"
                  required
                  value={formData.addressLine1}
                  onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#D6EAF1] bg-[#F7FCFE] focus:bg-white focus:border-[#0879A5] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#17384A]">Area / Locality</label>
                <input
                  type="text"
                  required
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#D6EAF1] bg-[#F7FCFE] focus:bg-white focus:border-[#0879A5] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#17384A]">City &amp; Pincode</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#D6EAF1] bg-[#F7FCFE] focus:bg-white focus:border-[#0879A5] focus:outline-none"
                  />
                  <input
                    type="text"
                    required
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#D6EAF1] bg-[#F7FCFE] font-mono focus:bg-white focus:border-[#0879A5] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Operational Hours */}
          <div className="space-y-4">
            <h3 className="font-serif text-base font-bold text-[#103A50] border-b border-[#D6EAF1] pb-2 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#0879A5]" />
              <span>Operational Timing Notice</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#17384A]">Emergency Hours</label>
                <input
                  type="text"
                  required
                  value={formData.emergencyHours}
                  onChange={(e) => setFormData({ ...formData, emergencyHours: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#D6EAF1] bg-[#F7FCFE] focus:bg-white focus:border-[#0879A5] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#17384A]">OPD Hours</label>
                <input
                  type="text"
                  required
                  value={formData.opdHours}
                  onChange={(e) => setFormData({ ...formData, opdHours: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#D6EAF1] bg-[#F7FCFE] focus:bg-white focus:border-[#0879A5] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {saveSuccess && (
            <div className="p-3.5 rounded-xl bg-[#EEF8FB] border border-[#D6EAF1] text-xs text-[#0879A5] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{saveSuccess}</span>
            </div>
          )}

          {saveError && (
            <div className="p-3.5 rounded-xl bg-[#FFF8F8] border border-[#FAD8D8] text-xs text-[#D93636] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{saveError}</span>
            </div>
          )}

          <div className="flex items-center justify-end pt-4 border-t border-[#D6EAF1]">
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isSaving}
              icon={<Save className="w-4 h-4" />}
            >
              {isSaving ? 'Saving Changes...' : 'Save Hospital Information'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
