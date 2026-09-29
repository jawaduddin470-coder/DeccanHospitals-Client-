import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db, FIRESTORE_COLLECTIONS } from '../firebase';
import { cloudinaryService } from './cloudinaryService';
import { INITIAL_GALLERY } from '../config/initialGallery';
import type { GalleryItem } from '../types';

export interface AdminGalleryItem extends GalleryItem {
  _source?: 'firestore' | 'fallback';
}

export const galleryService = {
  /**
   * Fetch all active gallery items with fallback
   */
  async getGalleryItems(): Promise<GalleryItem[]> {
    try {
      const q = query(
        collection(db, FIRESTORE_COLLECTIONS.GALLERY),
        orderBy('displayOrder', 'asc')
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        return snapshot.docs
          .map((d) => ({ id: d.id, ...d.data() } as GalleryItem))
          .filter((g) => g.active !== false && g.isActive !== false);
      }
      return INITIAL_GALLERY.filter((g) => g.active !== false && g.isActive !== false);
    } catch (err) {
      console.warn('Firestore fetch failed; using fallback data. Error:', err);
      return INITIAL_GALLERY.filter((g) => g.active !== false && g.isActive !== false);
    }
  },

  /**
   * Fetch all gallery items including inactive ones (Admin view)
   */
  async getAllGalleryAdmin(): Promise<AdminGalleryItem[]> {
    try {
      const q = query(
        collection(db, FIRESTORE_COLLECTIONS.GALLERY),
        orderBy('displayOrder', 'asc')
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const firestoreItems: AdminGalleryItem[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          _source: 'firestore' as const,
        } as AdminGalleryItem));

        const existingIds = new Set(firestoreItems.map((g) => g.id));
        const unseededFallbacks: AdminGalleryItem[] = INITIAL_GALLERY.filter(
          (g) => !existingIds.has(g.id)
        ).map((g) => ({
          ...g,
          _source: 'fallback' as const,
        }));

        return [...firestoreItems, ...unseededFallbacks];
      }

      return INITIAL_GALLERY.map((g) => ({
        ...g,
        _source: 'fallback' as const,
      }));
    } catch (err) {
      console.warn('getAllGalleryAdmin falling back to local dataset:', err);
      return INITIAL_GALLERY.map((g) => ({
        ...g,
        _source: 'fallback' as const,
      }));
    }
  },

  /**
   * Upload Gallery Image to Cloudinary
   */
  async uploadGalleryImage(file: File): Promise<{ secure_url: string; public_id: string }> {
    const result = await cloudinaryService.uploadImage(file, 'deccan-care/gallery');
    return {
      secure_url: result.secure_url,
      public_id: result.public_id,
    };
  },

  /**
   * Add a new gallery item (Admin)
   * Strictly normalizes optional fields to prevent Firestore undefined errors
   */
  async addGalleryItem(
    itemData: Omit<GalleryItem, 'id' | 'imageUrl' | 'createdAt' | 'updatedAt'>,
    imageFile: File
  ): Promise<GalleryItem> {
    const docRef = doc(collection(db, FIRESTORE_COLLECTIONS.GALLERY));
    const upload = await this.uploadGalleryImage(imageFile);

    const nowIso = new Date().toISOString();

    const cleanItem: GalleryItem = {
      id: docRef.id,
      title: (itemData.title || '').trim(),
      description: (itemData.description || '').trim(),
      category: (itemData.category || 'Hospital Facilities').trim(),
      aspectRatio: itemData.aspectRatio || '4:3',
      featured: Boolean(itemData.featured),
      active: itemData.active !== false,
      displayOrder: typeof itemData.displayOrder === 'number' ? itemData.displayOrder : 1,
      imageUrl: upload.secure_url || '',
      imagePublicId: upload.public_id || '',
      altText: (itemData.altText || itemData.title || 'Deccan Care Hospital photo').trim(),
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    await setDoc(docRef, {
      ...cleanItem,
      serverCreatedAt: serverTimestamp(),
      serverUpdatedAt: serverTimestamp(),
    });

    return cleanItem;
  },

  /**
   * Update gallery item (Admin)
   * Preserves existing fields while normalizing missing optional inputs
   */
  async updateGalleryItem(
    id: string,
    updates: Partial<GalleryItem>,
    newImageFile?: File
  ): Promise<void> {
    const docRef = doc(db, FIRESTORE_COLLECTIONS.GALLERY, id);
    const docSnap = await getDoc(docRef);

    let imageUrl = updates.imageUrl;
    let imagePublicId = updates.imagePublicId;

    if (newImageFile) {
      const upload = await this.uploadGalleryImage(newImageFile);
      imageUrl = upload.secure_url;
      imagePublicId = upload.public_id;
    }

    const nowIso = new Date().toISOString();

    if (docSnap.exists()) {
      const existingData = docSnap.data() as GalleryItem;
      const cleanUpdates: Record<string, any> = {
        updatedAt: nowIso,
        serverUpdatedAt: serverTimestamp(),
      };

      if (updates.title !== undefined) cleanUpdates.title = updates.title.trim();
      if (updates.description !== undefined) cleanUpdates.description = (updates.description || '').trim();
      if (updates.category !== undefined) cleanUpdates.category = updates.category.trim();
      if (updates.aspectRatio !== undefined) cleanUpdates.aspectRatio = updates.aspectRatio;
      if (updates.featured !== undefined) cleanUpdates.featured = updates.featured;
      if (updates.active !== undefined) cleanUpdates.active = updates.active;
      if (updates.displayOrder !== undefined) cleanUpdates.displayOrder = Number(updates.displayOrder) || 1;
      if (updates.altText !== undefined) cleanUpdates.altText = (updates.altText || '').trim();

      // Image handling
      if (imageUrl !== undefined && imageUrl !== '') {
        cleanUpdates.imageUrl = imageUrl;
      } else if (imageUrl === '') {
        cleanUpdates.imageUrl = '';
      } else if (existingData.imageUrl) {
        cleanUpdates.imageUrl = existingData.imageUrl;
      }

      if (imagePublicId !== undefined && imagePublicId !== '') {
        cleanUpdates.imagePublicId = imagePublicId;
      } else if (imagePublicId === '') {
        cleanUpdates.imagePublicId = '';
      } else if (existingData.imagePublicId) {
        cleanUpdates.imagePublicId = existingData.imagePublicId;
      }

      await updateDoc(docRef, cleanUpdates);
    } else {
      const fallback = INITIAL_GALLERY.find((g) => g.id === id);
      const completeItem: GalleryItem = {
        id,
        title: updates.title ? updates.title.trim() : (fallback?.title || 'Hospital Photo'),
        description: updates.description !== undefined ? (updates.description || '').trim() : (fallback?.description || ''),
        category: updates.category ? updates.category.trim() : (fallback?.category || 'Hospital Facilities'),
        aspectRatio: updates.aspectRatio || fallback?.aspectRatio || '4:3',
        featured: updates.featured !== undefined ? updates.featured : (fallback?.featured || false),
        active: updates.active !== undefined ? updates.active : (fallback?.active !== false),
        displayOrder: updates.displayOrder !== undefined ? Number(updates.displayOrder) : (fallback?.displayOrder || 1),
        imageUrl: (imageUrl !== undefined ? imageUrl : fallback?.imageUrl) || '',
        imagePublicId: (imagePublicId !== undefined ? imagePublicId : fallback?.imagePublicId) || '',
        altText: updates.altText !== undefined ? (updates.altText || '').trim() : (fallback?.altText || 'Deccan Care Hospital photo'),
        createdAt: fallback?.createdAt || nowIso,
        updatedAt: nowIso,
      };

      await setDoc(docRef, {
        ...completeItem,
        serverCreatedAt: serverTimestamp(),
        serverUpdatedAt: serverTimestamp(),
      }, { merge: true });
    }
  },

  /**
   * Delete gallery item from Firestore (Admin)
   */
  async deleteGalleryItem(id: string, _imageUrl?: string): Promise<void> {
    const docRef = doc(db, FIRESTORE_COLLECTIONS.GALLERY, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      await deleteDoc(docRef);
    } else {
      const fallback = INITIAL_GALLERY.find((g) => g.id === id);
      if (fallback) {
        await setDoc(docRef, {
          ...fallback,
          active: false,
          serverCreatedAt: serverTimestamp(),
          serverUpdatedAt: serverTimestamp(),
        });
      }
    }
  },
};
