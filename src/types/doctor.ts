/**
 * Doctor Data Architecture (Firebase-ready schema)
 * Supports Category 1 (featured with image) and Category 2 (directory without photo)
 */

export type DoctorProfileType = 'featured' | 'directory';

export interface Doctor {
  id: string;
  name: string;
  designation: string;
  specialization: string;
  qualification?: string;
  profileType: DoctorProfileType;
  imageUrl?: string;
  imagePublicId?: string;
  photoUrl?: string; // Optional alias for backward compatibility
  description?: string;
  departmentId?: string;
  displayOrder: number;
  featured?: boolean;
  active: boolean;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Department {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  displayOrder: number;
}
