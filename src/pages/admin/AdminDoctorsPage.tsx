import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { ConfirmationModal } from '../../components/admin/ConfirmationModal';
import { doctorService, syncService, type AdminDoctor } from '../../services';
import { cloudinaryService } from '../../services/cloudinaryService';
import type { DoctorProfileType } from '../../types';
import {
  Users,
  PlusCircle,
  Edit2,
  Trash2,
  Search,
  AlertCircle,
  X,
  RefreshCw,
  Database,
  CheckCircle2,
} from 'lucide-react';

interface DoctorFormData {
  id?: string;
  name: string;
  designation: string;
  specialization: string;
  qualification: string;
  description: string;
  profileType: DoctorProfileType;
  displayOrder: number;
  active: boolean;
  featured: boolean;
  imageUrl?: string;
  imagePublicId?: string;
}

export const AdminDoctorsPage: React.FC = () => {
  const [doctors, setDoctors] = useState<AdminDoctor[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [syncing, setSyncing] = useState<boolean>(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingDoctorId, setEditingDoctorId] = useState<string | null>(null);
  const [formData, setFormData] = useState<DoctorFormData>({
    name: '',
    designation: '',
    specialization: '',
    qualification: '',
    description: '',
    profileType: 'directory',
    displayOrder: 1,
    active: true,
    featured: false,
  });
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [modalLoading, setModalLoading] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Delete Modal state
  const [deleteDoctorId, setDeleteDoctorId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const loadDoctors = async () => {
    setIsLoading(true);
    try {
      const data = await doctorService.getAllDoctorsAdmin();
      setDoctors(data);
    } catch (err) {
      console.warn('Error loading doctors:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDoctors();
  }, []);

  const unseededCount = useMemo(() => {
    return doctors.filter((d) => d._source === 'fallback').length;
  }, [doctors]);

  const handleSyncAllDoctors = async () => {
    setSyncing(true);
    setSyncFeedback(null);
    try {
      const result = await syncService.syncDoctorsOnly();
      setSyncFeedback(
        `Successfully synced ${result.added} doctor profile(s) to Firestore (${result.skipped} already existed).`
      );
      await loadDoctors();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sync failed.';
      setSyncFeedback(`Sync error: ${msg}`);
    } finally {
      setSyncing(false);
    }
  };

  const filteredDoctors = useMemo(() => {
    return doctors.filter(
      (d) =>
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.designation.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [doctors, searchQuery]);

  const handleOpenAddModal = () => {
    setEditingDoctorId(null);
    setFormData({
      name: 'Dr. ',
      designation: 'Consultant',
      specialization: '',
      qualification: '',
      description: '',
      profileType: 'directory',
      displayOrder: doctors.length + 1,
      active: true,
      featured: false,
    });
    setSelectedImageFile(null);
    setImagePreview(null);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (doctor: AdminDoctor) => {
    setEditingDoctorId(doctor.id);
    setFormData({
      id: doctor.id,
      name: doctor.name,
      designation: doctor.designation,
      specialization: doctor.specialization,
      qualification: doctor.qualification || '',
      description: doctor.description || '',
      profileType: doctor.profileType,
      displayOrder: doctor.displayOrder,
      active: doctor.active,
      featured: doctor.featured || false,
      imageUrl: doctor.imageUrl,
      imagePublicId: doctor.imagePublicId,
    });
    setSelectedImageFile(null);
    setImagePreview(doctor.imageUrl || null);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validation = cloudinaryService.validateImage(file);
      if (!validation.isValid) {
        setModalError(validation.error || 'Please upload a JPG, PNG, or WebP image under 10MB.');
        return;
      }
      setSelectedImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setModalError(null);
    }
  };

  const handleSaveDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.specialization.trim()) {
      setModalError('Please fill in doctor name and clinical specialization.');
      return;
    }

    setModalLoading(true);
    setModalError(null);

    try {
      if (editingDoctorId) {
        await doctorService.updateDoctor(
          editingDoctorId,
          {
            name: formData.name.trim(),
            designation: formData.designation.trim() || 'Consultant',
            specialization: formData.specialization.trim(),
            qualification: formData.qualification.trim(),
            description: formData.description.trim(),
            profileType: formData.profileType,
            displayOrder: Number(formData.displayOrder) || 1,
            active: formData.active,
            featured: formData.featured,
            imageUrl: formData.imageUrl || '',
            imagePublicId: formData.imagePublicId || '',
          },
          selectedImageFile || undefined
        );
      } else {
        await doctorService.addDoctor(
          {
            name: formData.name.trim(),
            designation: formData.designation.trim() || 'Consultant',
            specialization: formData.specialization.trim(),
            qualification: formData.qualification.trim(),
            description: formData.description.trim(),
            profileType: formData.profileType,
            displayOrder: Number(formData.displayOrder) || 1,
            active: formData.active,
            featured: formData.featured,
          },
          selectedImageFile || undefined
        );
      }

      setIsModalOpen(false);
      await loadDoctors();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save doctor record in Firestore.';
      setModalError(msg);
    } finally {
      setModalLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteDoctorId) return;
    setIsDeleting(true);
    try {
      await doctorService.deleteDoctor(deleteDoctorId);
      setDeleteDoctorId(null);
      await loadDoctors();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete doctor from Firestore.';
      alert(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#103A50]">
            Doctors Directory CMS
          </h1>
          <p className="text-xs text-[#617786] mt-0.5">
            Manage clinical consultants, featured medical profiles, and photo uploads
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {unseededCount > 0 && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              icon={<Database className="w-3.5 h-3.5" />}
              onClick={handleSyncAllDoctors}
              disabled={syncing || isLoading}
            >
              {syncing ? 'Syncing...' : `Sync ${unseededCount} Initial Doctors`}
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            icon={<RefreshCw className="w-3.5 h-3.5" />}
            onClick={loadDoctors}
            disabled={isLoading || syncing}
          >
            Refresh
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            icon={<PlusCircle className="w-4 h-4" />}
            onClick={handleOpenAddModal}
          >
            Add New Doctor
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

      {/* Search Bar */}
      <Card variant="default" padding="md" className="border-[#D6EAF1] bg-white">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#617786]">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search doctors by name, specialization, designation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-[#D6EAF1] bg-[#F7FCFE] focus:bg-white focus:border-[#0879A5] focus:outline-none"
          />
        </div>
      </Card>

      {/* Doctors Table / Cards */}
      {isLoading ? (
        <div className="p-12 text-center text-[#617786] space-y-2">
          <div className="w-6 h-6 rounded-full border-2 border-[#0879A5] border-t-transparent animate-spin mx-auto" />
          <span className="text-xs font-mono">Loading doctors roster...</span>
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div className="p-12 text-center text-[#617786] bg-white rounded-2xl border border-[#D6EAF1] space-y-2">
          <Users className="w-8 h-8 text-[#0879A5]/50 mx-auto" />
          <p className="text-sm font-semibold text-[#103A50]">No doctor records found</p>
          <p className="text-xs text-[#617786]">Try adjusting your search criteria or add a new doctor above.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-hidden rounded-2xl border border-[#D6EAF1] bg-white shadow-xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F7FCFE] border-b border-[#D6EAF1] text-[#617786] font-mono text-[11px] uppercase tracking-wider">
                  <th className="p-4 font-semibold">Doctor</th>
                  <th className="p-4 font-semibold">Specialization</th>
                  <th className="p-4 font-semibold">Profile Type</th>
                  <th className="p-4 font-semibold">Data Origin</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D6EAF1]">
                {filteredDoctors.map((doc) => (
                  <tr key={doc.id} className="hover:bg-[#F7FCFE]/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#EEF8FB] border border-[#D6EAF1] overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {doc.imageUrl ? (
                            <img
                              src={doc.imageUrl}
                              alt={doc.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Users className="w-5 h-5 text-[#0879A5]" />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-[#103A50]">{doc.name}</div>
                          <div className="text-[11px] text-[#617786]">{doc.qualification || doc.designation}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-[#103A50] font-medium">{doc.specialization}</td>
                    <td className="p-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase ${
                          doc.profileType === 'featured'
                            ? 'bg-[#E6F5FA] text-[#0879A5] border border-[#BCE1EE]'
                            : 'bg-gray-100 text-gray-600 border border-gray-200'
                        }`}
                      >
                        {doc.profileType}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-mono uppercase font-semibold border ${
                          doc._source === 'firestore'
                            ? 'bg-[#F2FBF7] text-[#1E824C] border-[#C8EAD9]'
                            : 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]'
                        }`}
                      >
                        {doc._source === 'firestore' ? 'Firestore' : 'Initial'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-semibold border ${
                          doc.active
                            ? 'bg-[#F2FBF7] text-[#1E824C] border-[#C8EAD9]'
                            : 'bg-gray-100 text-gray-500 border-gray-200'
                        }`}
                      >
                        {doc.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(doc)}
                          className="p-1.5 rounded-lg bg-[#EEF8FB] text-[#0879A5] hover:bg-[#0879A5] hover:text-white transition-colors"
                          title="Edit Doctor"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteDoctorId(doc.id)}
                          className="p-1.5 rounded-lg text-[#D93636] hover:bg-[#FFF8F8] transition-colors"
                          title="Delete Doctor"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View */}
          <div className="md:hidden space-y-3">
            {filteredDoctors.map((doc) => (
              <Card key={doc.id} variant="default" padding="md" className="border-[#D6EAF1] bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#EEF8FB] border border-[#D6EAF1] overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {doc.imageUrl ? (
                        <img src={doc.imageUrl} alt={doc.name} className="w-full h-full object-cover" />
                      ) : (
                        <Users className="w-5 h-5 text-[#0879A5]" />
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-[#103A50] text-sm">{doc.name}</div>
                      <div className="text-xs text-[#617786]">{doc.specialization}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(doc)}
                      className="p-1.5 rounded-lg bg-[#EEF8FB] text-[#0879A5]"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteDoctorId(doc.id)}
                      className="p-1.5 rounded-lg text-[#D93636]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Add / Edit Doctor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B2737]/80 backdrop-blur-sm overflow-y-auto">
          <div className="max-w-xl w-full bg-white rounded-3xl border border-[#D6EAF1] shadow-2xl p-6 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-[#D6EAF1] pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#0879A5] font-semibold">
                  Doctor Profile Management
                </span>
                <h3 className="font-serif text-xl font-bold text-[#103A50]">
                  {editingDoctorId ? `Edit ${formData.name}` : 'Add New Doctor'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
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

            <form onSubmit={handleSaveDoctor} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#103A50] mb-1">
                    Doctor Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Dr. Full Name"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#D6EAF1] bg-[#F7FCFE] focus:bg-white focus:border-[#0879A5] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#103A50] mb-1">
                    Specialization <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    placeholder="e.g. Obstetrics & Gynecology"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#D6EAF1] bg-[#F7FCFE] focus:bg-white focus:border-[#0879A5] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#103A50] mb-1">
                    Designation
                  </label>
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    placeholder="e.g. Senior Consultant"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#D6EAF1] bg-[#F7FCFE] focus:bg-white focus:border-[#0879A5] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#103A50] mb-1">
                    Qualifications
                  </label>
                  <input
                    type="text"
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    placeholder="e.g. MBBS, MS (OBG), DNB"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#D6EAF1] bg-[#F7FCFE] focus:bg-white focus:border-[#0879A5] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#103A50] mb-1">
                  Profile Presentation Category
                </label>
                <select
                  value={formData.profileType}
                  onChange={(e) => setFormData({ ...formData, profileType: e.target.value as DoctorProfileType })}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#D6EAF1] bg-[#F7FCFE] focus:bg-white focus:border-[#0879A5] focus:outline-none"
                >
                  <option value="featured">Featured Doctor (Card with Photo on Homepage/Top)</option>
                  <option value="directory">Directory Specialist (Roster Table presentation)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#103A50] mb-1">
                  Professional Bio / Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Clinical experience, areas of interest..."
                  className="w-full px-3.5 py-2 rounded-xl border border-[#D6EAF1] bg-[#F7FCFE] focus:bg-white focus:border-[#0879A5] focus:outline-none"
                />
              </div>

              {/* Photo Upload with Cloudinary */}
              <div className="space-y-2 p-3.5 rounded-2xl bg-[#F7FCFE] border border-[#D6EAF1]">
                <label className="block font-semibold text-[#103A50]">
                  Doctor Photograph (Cloudinary Upload)
                </label>
                <div className="flex items-center gap-4">
                  {imagePreview && (
                    <div className="w-14 h-14 rounded-2xl bg-white border border-[#D6EAF1] overflow-hidden flex-shrink-0">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageChange}
                      className="text-xs text-[#617786] file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border file:border-[#D6EAF1] file:bg-white file:text-[#0879A5] file:font-semibold hover:file:bg-[#EEF8FB] file:cursor-pointer cursor-pointer"
                    />
                    <p className="text-[10px] text-[#617786] mt-1">
                      JPG, PNG, or WebP under 10MB. Automatically hosted on Cloudinary.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#103A50] mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 1 })}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#D6EAF1] bg-[#F7FCFE] focus:bg-white focus:border-[#0879A5] focus:outline-none"
                  />
                </div>

                <div className="flex flex-col justify-end space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="rounded border-[#D6EAF1] text-[#0879A5] focus:ring-0"
                    />
                    <span className="text-[#103A50] font-medium">Active (Visible)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="rounded border-[#D6EAF1] text-[#0879A5] focus:ring-0"
                    />
                    <span className="text-[#103A50] font-medium">Highlight on Homepage</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#D6EAF1]">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
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
                  {modalLoading ? 'Saving to Firestore...' : 'Save Doctor'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(deleteDoctorId)}
        title="Delete Doctor Record"
        message="Are you sure you want to delete this doctor from the hospital roster? The record will be permanently deleted from Firestore."
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteDoctorId(null)}
      />
    </div>
  );
};
