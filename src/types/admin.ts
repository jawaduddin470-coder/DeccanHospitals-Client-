/**
 * Deccan Care Maternity & General Hospital
 * Multi-Admin Management & Role-Based Access Control Architecture
 */

export type AdminRole = 'superadmin' | 'admin';

export interface AdminProfile {
  uid: string;
  name: string;
  email: string;
  role: AdminRole;
  active: boolean;
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
  lastLoginAt?: string;
}

export type AuditActionType =
  | 'ADMIN_CREATED'
  | 'ADMIN_UPDATED'
  | 'ADMIN_DEACTIVATED'
  | 'ADMIN_ACTIVATED'
  | 'ADMIN_DELETED'
  | 'ROLE_CHANGED'
  | 'PASSWORD_RESET_REQUESTED';

export interface AdminAuditLog {
  id: string;
  action: AuditActionType;
  targetAdminUid: string;
  targetAdminEmail: string;
  performedByUid: string;
  performedByEmail: string;
  timestamp: string;
  details?: Record<string, any>;
}
