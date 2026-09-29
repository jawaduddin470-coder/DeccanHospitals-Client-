import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { ConfirmationModal } from '../../components/admin/ConfirmationModal';
import { galleryService, syncService, type AdminGalleryItem } from '../../services';
import { cloudinaryService } from '../../services/cloudinaryService';
import {
  Image as ImageIcon,
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

interface GalleryFormData {
  id?: string;
  title: string;
  description: string;
  category: string;
  aspectRatio: '16:10' | '4:3' | '1:1';
  featured: boolean;
  active: boolean;
  displayOrder: number;
  imageUrl?: string;
  imagePublicId?: string;
}

export const AdminGalleryPage: React.FC = () => {
  const [items, setItems] = useState<AdminGalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [syncing, setSyncing] = useState<boolean>(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [formData, setFormData] = useState<GalleryFormData>({
    title: '',
    description: '',
    category: 'Maternity Care',
    aspectRatio: '4:3',
    featured: false,
    active: true,
    displayOrder: 1,
  });
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [modalLoading, setModalLoading] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Delete State
  const [deleteItem, setDeleteItem] = useState<AdminGalleryItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const loadGallery = async () => {
    setIsLoading(true);
    try {
      const data = await galleryService.getAllGalleryAdmin();
      setItems(data);
    } catch (err) {
      console.warn('Error loading gallery:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGallery();
  }, []);

  const unseededCount = useMemo(() => {
    return items.filter((i) => i._source === 'fallback').length;
  }, [items]);

  const handleSyncAllGallery = async () => {
    setSyncing(true);
    setSyncFeedback(null);
    try {
      const result = await syncService.syncGalleryOnly();
      setSyncFeedback(
        `Successfully synced ${result.added} gallery media item(s) to Firestore (${result.skipped} already existed).`
      );
      await loadGallery();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sync failed.';
      setSyncFeedback(`Sync error: ${msg}`);
    } finally {
      setSyncing(false);
    }
  };

  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => {
      if (i.category) set.add(i.category);
    });
    return Array.from(set);
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCat = categoryFilter === 'all' || item.category === categoryFilter;
      return matchesSearch && matchesCat;
    });
  }, [items, searchQuery, categoryFilter]);

  const handleOpenAddModal = () => {
    setEditingItemId(null);
    setFormData({
      title: '',
      description: '',
      category: categories[0] || 'Maternity Care',
      aspectRatio: '4:3',
      featured: false,
      active: true,
      displayOrder: items.length + 1,
    });
    setSelectedImageFile(null);
    setImagePreview(null);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: AdminGalleryItem) => {
    setEditingItemId(item.id);
    setFormData({
      id: item.id,
      title: item.title,
      description: item.description || '',
      category: item.category,
      aspectRatio: item.aspectRatio || '4:3',
      featured: item.featured,
      active: item.active,
      displayOrder: item.displayOrder,
      imageUrl: item.imageUrl,
      imagePublicId: item.imagePublicId,
    });
    setSelectedImageFile(null);
    setImagePreview(item.imageUrl);
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

  const handleSaveGalleryItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.category.trim()) {
      setModalError('Please provide a photo title and category.');
      return;
    }

    if (!editingItemId && !selectedImageFile) {
      setModalError('Please upload an image file from your device.');
      return;
    }

    setModalLoading(true);
    setModalError(null);

    try {
      if (editingItemId) {
        await galleryService.updateGalleryItem(
          editingItemId,
          {
            title: formData.title.trim(),
            description: formData.description.trim(),
            category: formData.category.trim(),
            aspectRatio: formData.aspectRatio,
            featured: formData.featured,
            active: formData.active,
            displayOrder: Number(formData.displayOrder) || 1,
            imageUrl: formData.imageUrl || '',
            imagePublicId: formData.imagePublicId || '',
          },
          selectedImageFile || undefined
        );
      } else {
        if (!selectedImageFile) return;
        await galleryService.addGalleryItem(
          {
            title: formData.title.trim(),
            description: formData.description.trim(),
            category: formData.category.trim(),
            aspectRatio: formData.aspectRatio,
            featured: formData.featured,
            active: formData.active,
            displayOrder: Number(formData.displayOrder) || 1,
          },
          selectedImageFile
        );
      }

      setIsModalOpen(false);
      await loadGallery();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save gallery media in Firestore.';
      setModalError(msg);
    } finally {
      setModalLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteItem) return;
    setIsDeleting(true);
    try {
      await galleryService.deleteGalleryItem(deleteItem.id);
      setDeleteItem(null);
      await loadGallery();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete gallery item from Firestore.';
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
            Hospital Gallery CMS
          </h1>
          <p className="text-xs text-[#617786] mt-0.5">
            Manage hospital facility photos, maternity suites, diagnostic infrastructure, and Cloudinary media uploads
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {unseededCount > 0 && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              icon={<Database className="w-3.5 h-3.5" />}
              onClick={handleSyncAllGallery}
              disabled={syncing || isLoading}
            >
              {syncing ? 'Syncing...' : `Sync ${unseededCount} Initial Photos`}
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            icon={<RefreshCw className="w-3.5 h-3.5" />}
            onClick={loadGallery}
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
            Upload Photo
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

      {/* Filters Bar */}
      <Card variant="default" padding="md" className="border-[#D6EAF1] bg-white space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-8 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#617786]">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search gallery photos by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-[#D6EAF1] bg-[#F7FCFE] focus:bg-white focus:border-[#0879A5] focus:outline-none"
            />
          </div>

          <div className="sm:col-span-4">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#D6EAF1] bg-[#F7FCFE] focus:bg-white focus:border-[#0879A5] focus:outline-none"
            >
              <option value="all">All Categories ({items.length})</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Gallery Media Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-[#617786] space-y-2">
          <div className="w-6 h-6 rounded-full border-2 border-[#0879A5] border-t-transparent animate-spin mx-auto" />
          <span className="text-xs font-mono">Loading gallery from Firestore...</span>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-12 text-center text-[#617786] bg-white rounded-2xl border border-[#D6EAF1] space-y-2">
          <ImageIcon className="w-8 h-8 text-[#0879A5]/50 mx-auto" />
          <p className="text-sm font-semibold text-[#103A50]">No gallery media found</p>
          <p className="text-xs text-[#617786]">Upload a new hospital photo using the button above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item) => (
            <Card
              key={item.id}
              variant="default"
              padding="none"
              className="border-[#D6EAF1] bg-white overflow-hidden flex flex-col justify-between"
            >
              <div className="relative aspect-[4/3] bg-[#EEF8FB] overflow-hidden group">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <span
                    className={`text-[9px] font-mono px-2 py-0.5 rounded-full uppercase font-semibold backdrop-blur-xs border shadow-xs ${
                      item._source === 'firestore'
                        ? 'bg-white/90 text-[#1E824C] border-[#C8EAD9]'
                        : 'bg-white/90 text-[#D97706] border-[#FDE68A]'
                    }`}
                  >
                    {item._source === 'firestore' ? 'Firestore' : 'Initial'}
                  </span>
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-xs text-[#0879A5] border border-[#D6EAF1] uppercase font-semibold shadow-xs">
                    {item.category}
                  </span>
                </div>

                {item.featured && (
                  <span className="absolute top-2.5 right-2.5 text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#103A50] text-white uppercase font-bold shadow-xs">
                    Featured
                  </span>
                )}
              </div>

              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-serif text-base font-bold text-[#103A50] line-clamp-1">
                    {item.title}
                  </h4>
                  {item.description && (
                    <p className="text-xs text-[#617786] line-clamp-2 mt-1">
                      {item.description}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-[#D6EAF1] flex items-center justify-between text-xs">
                  <span
                    className={`text-[9px] font-mono px-2 py-0.5 rounded-full uppercase font-semibold border ${
                      item.active
                        ? 'bg-[#F2FBF7] text-[#1E824C] border-[#C8EAD9]'
                        : 'bg-gray-100 text-gray-500 border-gray-200'
                    }`}
                  >
                    {item.active ? 'Active' : 'Hidden'}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(item)}
                      className="p-1.5 rounded-lg bg-[#EEF8FB] text-[#0879A5] hover:bg-[#0879A5] hover:text-white transition-colors"
                      title="Edit Media"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteItem(item)}
                      className="p-1.5 rounded-lg text-[#D93636] hover:bg-[#FFF8F8] transition-colors"
                      title="Delete Media"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Upload / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B2737]/80 backdrop-blur-sm overflow-y-auto">
          <div className="max-w-xl w-full bg-white rounded-3xl border border-[#D6EAF1] shadow-2xl p-6 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-[#D6EAF1] pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#0879A5] font-semibold">
                  Hospital Media Management
                </span>
                <h3 className="font-serif text-xl font-bold text-[#103A50]">
                  {editingItemId ? `Edit ${formData.title}` : 'Upload Gallery Photo'}
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

            <form onSubmit={handleSaveGalleryItem} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#103A50] mb-1">
                  Photo Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Maternity Care & Recovery Suite"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#D6EAF1] bg-[#F7FCFE] focus:bg-white focus:border-[#0879A5] focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#103A50] mb-1">
                    Facility Category <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g. Maternity Care, Diagnostics, Consultations"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#D6EAF1] bg-[#F7FCFE] focus:bg-white focus:border-[#0879A5] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#103A50] mb-1">
                    Aspect Ratio Presentation
                  </label>
                  <select
                    value={formData.aspectRatio}
                    onChange={(e) => setFormData({ ...formData, aspectRatio: e.target.value as '16:10' | '4:3' | '1:1' })}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#D6EAF1] bg-[#F7FCFE] focus:bg-white focus:border-[#0879A5] focus:outline-none"
                  >
                    <option value="4:3">Standard (4:3)</option>
                    <option value="16:10">Wide Landscape (16:10)</option>
                    <option value="1:1">Square (1:1)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#103A50] mb-1">
                  Facility Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the medical equipment, patient comfort, or department setup..."
                  className="w-full px-3.5 py-2 rounded-xl border border-[#D6EAF1] bg-[#F7FCFE] focus:bg-white focus:border-[#0879A5] focus:outline-none"
                />
              </div>

              {/* Photo Upload with Cloudinary */}
              <div className="space-y-2 p-3.5 rounded-2xl bg-[#F7FCFE] border border-[#D6EAF1]">
                <label className="block font-semibold text-[#103A50]">
                  Hospital Facility Photo {!editingItemId && <span className="text-red-500">*</span>}
                </label>
                <div className="flex items-center gap-4">
                  {imagePreview && (
                    <div className="w-16 h-16 rounded-2xl bg-white border border-[#D6EAF1] overflow-hidden flex-shrink-0">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageChange}
                      className="text-xs text-[#617786] file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border file:border-[#D6EAF1] file:bg-white file:text-[#0879A5] file:font-semibold hover:file:bg-[#EEF8FB] file:cursor-pointer cursor-pointer"
                      required={!editingItemId && !formData.imageUrl}
                    />
                    <p className="text-[10px] text-[#617786] mt-1">
                      JPG, PNG, or WebP under 10MB. Hosted seamlessly on Cloudinary.
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
                    <span className="text-[#103A50] font-medium">Active (Visible in Gallery)</span>
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
                  {modalLoading ? 'Uploading & Saving to Firestore...' : 'Save Gallery Photo'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(deleteItem)}
        title="Delete Gallery Photo"
        message={`Are you sure you want to delete "${deleteItem?.title}" from the hospital gallery? The record will be permanently deleted from Firestore.`}
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteItem(null)}
      />
    </div>
  );
};
