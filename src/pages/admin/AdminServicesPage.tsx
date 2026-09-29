import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { serviceService, syncService, type AdminHospitalService } from '../../services';
import type { HospitalService, ServiceCategoryKey } from '../../types';
import { ServiceIcon } from '../../components/common/ServiceIcon';
import {
  Edit2,
  Search,
  AlertCircle,
  X,
  RefreshCw,
  ShieldCheck,
  Database,
  CheckCircle2,
} from 'lucide-react';

export const AdminServicesPage: React.FC = () => {
  const [services, setServices] = useState<AdminHospitalService[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [syncing, setSyncing] = useState<boolean>(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Edit Modal State
  const [editingService, setEditingService] = useState<AdminHospitalService | null>(null);
  const [formData, setFormData] = useState<Partial<HospitalService>>({});
  const [modalLoading, setModalLoading] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const loadServices = async () => {
    setIsLoading(true);
    try {
      const data = await serviceService.getAllServicesAdmin();
      setServices(data);
    } catch (err) {
      console.warn('Error loading services:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const unseededCount = useMemo(() => {
    return services.filter((s) => s._source === 'fallback').length;
  }, [services]);

  const handleSyncAllServices = async () => {
    setSyncing(true);
    setSyncFeedback(null);
    try {
      const result = await syncService.syncServicesOnly();
      setSyncFeedback(
        `Successfully synced ${result.added} services to Firestore (${result.skipped} already existed).`
      );
      await loadServices();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sync failed.';
      setSyncFeedback(`Sync error: ${msg}`);
    } finally {
      setSyncing(false);
    }
  };

  const filteredServices = useMemo(() => {
    return services.filter(
      (s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [services, searchQuery]);

  const handleOpenEdit = (svc: AdminHospitalService) => {
    setEditingService(svc);
    setFormData({
      name: svc.name,
      description: svc.description,
      category: svc.category,
      displayOrder: svc.displayOrder,
      active: svc.active,
      featured: svc.featured,
      isEmergency: svc.isEmergency,
    });
    setModalError(null);
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;

    if (!formData.name?.trim() || !formData.description?.trim()) {
      setModalError('Please enter service name and description.');
      return;
    }

    setModalLoading(true);
    setModalError(null);

    try {
      await serviceService.updateService(editingService.id, {
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: (formData.category as ServiceCategoryKey) || 'general',
        displayOrder: Number(formData.displayOrder || 1),
        active: formData.active !== false,
        featured: formData.featured || false,
        isEmergency: formData.isEmergency || false,
      });

      setEditingService(null);
      await loadServices();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update service in Firestore.';
      setModalError(msg);
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#103A50]">
            Clinical Services &amp; Facilities
          </h1>
          <p className="text-xs text-[#617786] mt-0.5">
            Manage verified hospital clinical departments, diagnostic services, and outpatient specialties
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {unseededCount > 0 && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              icon={<Database className="w-3.5 h-3.5" />}
              onClick={handleSyncAllServices}
              disabled={syncing || isLoading}
            >
              {syncing ? 'Syncing to Firestore...' : `Sync ${unseededCount} Initial Services`}
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            icon={<RefreshCw className="w-3.5 h-3.5" />}
            onClick={loadServices}
            disabled={isLoading || syncing}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Sync Feedback Message */}
      {syncFeedback && (
        <div className="p-3.5 rounded-xl bg-[#F2FBF7] border border-[#C8EAD9] flex items-center justify-between text-xs text-[#1E824C]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#1E824C]" />
            <span>{syncFeedback}</span>
          </div>
          <button
            type="button"
            onClick={() => setSyncFeedback(null)}
            className="text-[#1E824C] hover:opacity-75"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Advisory Banner */}
      <div className="p-4 rounded-2xl bg-[#EEF8FB] border border-[#D6EAF1] flex items-start gap-3 text-xs text-[#17384A]">
        <ShieldCheck className="w-5 h-5 text-[#0879A5] flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Content Accuracy Policy:</strong> Preserve verified hospital services established for Deccan Care Hospital. Any edit made will automatically persist to live Firestore.
        </p>
      </div>

      {/* Search Bar */}
      <Card variant="default" padding="md" className="border-[#D6EAF1] bg-white">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#617786]">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search services by specialty, name, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-[#D6EAF1] bg-[#F7FCFE] focus:bg-white focus:border-[#0879A5] focus:outline-none"
          />
        </div>
      </Card>

      {/* Services Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-[#617786] space-y-2">
          <div className="w-6 h-6 rounded-full border-2 border-[#0879A5] border-t-transparent animate-spin mx-auto" />
          <span className="text-xs font-mono">Loading services from Firestore...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServices.map((svc) => (
            <Card
              key={svc.id}
              variant="default"
              padding="md"
              className="border-[#D6EAF1] bg-white flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[#EEF8FB] text-[#0879A5] flex items-center justify-center">
                    <ServiceIcon name={svc.iconName} className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded-full uppercase font-semibold border ${
                        svc._source === 'firestore'
                          ? 'bg-[#F2FBF7] text-[#1E824C] border-[#C8EAD9]'
                          : 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]'
                      }`}
                      title={
                        svc._source === 'firestore'
                          ? 'Stored in Firestore Database'
                          : 'Initial baseline record (will save directly to Firestore upon edit)'
                      }
                    >
                      {svc._source === 'firestore' ? 'Firestore' : 'Initial'}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#EEF8FB] text-[#0879A5] border border-[#D6EAF1] uppercase font-semibold">
                      {svc.category}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-serif text-base font-bold text-[#103A50]">
                    {svc.name}
                  </h4>
                  <p className="text-xs text-[#617786] leading-relaxed mt-1 line-clamp-2">
                    {svc.description}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-[#D6EAF1] flex items-center justify-between text-xs">
                <span
                  className={`text-[9px] font-mono px-2 py-0.5 rounded-full uppercase font-semibold border ${
                    svc.active
                      ? 'bg-[#F2FBF7] text-[#1E824C] border-[#C8EAD9]'
                      : 'bg-gray-100 text-gray-500 border-gray-200'
                  }`}
                >
                  {svc.active ? 'Active' : 'Inactive'}
                </span>

                <button
                  type="button"
                  onClick={() => handleOpenEdit(svc)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#EEF8FB] text-[#0879A5] hover:bg-[#0879A5] hover:text-white transition-colors font-semibold text-[11px]"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B2737]/80 backdrop-blur-sm">
          <div className="max-w-lg w-full bg-white rounded-3xl border border-[#D6EAF1] shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#D6EAF1] pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#0879A5] font-semibold">
                  Service Editor
                </span>
                <h3 className="font-serif text-xl font-bold text-[#103A50]">
                  Edit {editingService.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingService(null)}
                className="p-2 rounded-xl text-[#617786] hover:bg-[#EEF8FB]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 rounded-xl bg-[#FFF8F8] border border-[#FADCDA] flex items-start gap-2 text-xs text-[#D93636]">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveService} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#103A50] mb-1">
                  Service Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#D6EAF1] bg-[#F7FCFE] focus:bg-white focus:border-[#0879A5] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-[#103A50] mb-1">
                  Clinical Category
                </label>
                <select
                  value={formData.category || 'general'}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as ServiceCategoryKey })}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#D6EAF1] bg-[#F7FCFE] focus:bg-white focus:border-[#0879A5] focus:outline-none"
                >
                  <option value="maternity">Maternity &amp; Obstetrics</option>
                  <option value="general">General Healthcare</option>
                  <option value="specialist">Clinical Specialties</option>
                  <option value="diagnostic">Diagnostics &amp; Investigations</option>
                  <option value="emergency">24/7 Emergency &amp; Triage</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#103A50] mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#D6EAF1] bg-[#F7FCFE] focus:bg-white focus:border-[#0879A5] focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#103A50] mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.displayOrder || 1}
                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 1 })}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#D6EAF1] bg-[#F7FCFE] focus:bg-white focus:border-[#0879A5] focus:outline-none"
                  />
                </div>

                <div className="flex flex-col justify-end space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.active !== false}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="rounded border-[#D6EAF1] text-[#0879A5] focus:ring-0"
                    />
                    <span className="text-[#103A50] font-medium">Active (Visible)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.featured || false}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="rounded border-[#D6EAF1] text-[#0879A5] focus:ring-0"
                    />
                    <span className="text-[#103A50] font-medium">Featured on Home</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#D6EAF1]">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingService(null)}
                  disabled={modalLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={modalLoading}
                >
                  {modalLoading ? 'Saving Changes to Firestore...' : 'Save to Firestore'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
