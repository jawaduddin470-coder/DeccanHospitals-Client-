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
   */
  async addGalleryItem(
    itemData: Omit<GalleryItem, 'id' | 'imageUrl' | 'createdAt' | 'updatedAt'>,
    imageFile: File
  ): Promise<GalleryItem> {
    const docRef = doc(collection(db, FIRESTORE_COLLECTIONS.GALLERY));
    const upload = await this.uploadGalleryImage(imageFile);

    const newItem: GalleryItem = {
      ...itemData,
      id: docRef.id,
      imageUrl: upload.secure_url,
      imagePublicId: upload.public_id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await setDoc(docRef, {
      ...newItem,
      serverCreatedAt: serverTimestamp(),
      serverUpdatedAt: serverTimestamp(),
    });

    return newItem;
  },

  /**
   * Update gallery item (Admin)
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

    const updatePayload: Partial<GalleryItem> & { serverUpdatedAt?: unknown } = {
      ...updates,
      ...(imageUrl ? { imageUrl } : {}),
      ...(imagePublicId ? { imagePublicId } : {}),
      updatedAt: new Date().toISOString(),
      serverUpdatedAt: serverTimestamp(),
    };

    if (docSnap.exists()) {
      await updateDoc(docRef, updatePayload);
    } else {
      const fallback = INITIAL_GALLERY.find((g) => g.id === id);
      const completeItem: GalleryItem = {
        id,
        title: updates.title || fallback?.title || 'Hospital Photo',
        description: updates.description || fallback?.description || '',
        category: updates.category || fallback?.category || 'Hospital Facilities',
        aspectRatio: updates.aspectRatio || fallback?.aspectRatio || '4:3',
        featured: updates.featured !== undefined ? updates.featured : (fallback?.featured || false),
        active: updates.active !== undefined ? updates.active : (fallback?.active !== false),
        displayOrder: updates.displayOrder !== undefined ? updates.displayOrder : (fallback?.displayOrder || 1),
        imageUrl: imageUrl || fallback?.imageUrl || '',
        imagePublicId: imagePublicId || fallback?.imagePublicId,
        altText: updates.altText || fallback?.altText || 'Deccan Care Hospital photo',
        createdAt: fallback?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
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
