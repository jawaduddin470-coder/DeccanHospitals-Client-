/**
 * Deccan Care Maternity & General Hospital
 * Services & Facilities Data Architecture (Firebase-ready schema)
 */

export type ServiceCategoryKey = 'all' | 'maternity' | 'general' | 'specialist' | 'diagnostic' | 'emergency';

export interface HospitalService {
  id: string;
  name: string;
  description: string;
  category: ServiceCategoryKey;
  iconName: string;
  displayOrder: number;
  featured?: boolean;
  active: boolean;
  isEmergency?: boolean;
}

export interface HospitalFacility {
  id: string;
  name: string;
  description: string;
  iconName: string;
  displayOrder: number;
  active: boolean;
}
