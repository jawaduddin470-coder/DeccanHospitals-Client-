/**
 * Gallery Data Architecture (Firebase-ready schema)
 * Dynamic gallery items uploaded through future admin dashboard.
 */

export interface GalleryItem {
  id: string;
  imageUrl: string;
  imagePublicId?: string;
  image?: string; // Optional alias for backward compatibility
  title: string;
  description?: string;
  category: string;
  featured: boolean;
  displayOrder: number;
  active: boolean;
  isActive?: boolean; // Optional alias
  createdAt: string;
  updatedAt?: string;
  altText?: string;
  aspectRatio?: '16:10' | '4:3' | '1:1';
}

export interface GalleryCategoryOption {
  key: string;
  label: string;
  count: number;
}
