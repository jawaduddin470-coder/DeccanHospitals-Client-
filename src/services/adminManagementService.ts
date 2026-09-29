import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut as secondarySignOut } from 'firebase/auth';
import { db } from '../firebase/firestore';
import { firebaseConfig } from '../firebase/config';
import { authService } from '../firebase/authService';
import type { AdminProfile, AdminRole, AdminAuditLog } from '../types';

export const ADMIN_COLLECTION = 'admins';
export const AUDIT_COLLECTION = 'admin_audit_logs';

export const ROOT_SUPERADMIN_EMAIL = 'deccancarehospital.24ths@gmail.com';

export interface CreateAdminInput {
  name: string;
  email: string;
  password: string;
  role: AdminRole;
}

export const adminManagementService = {
  /**
   * Fetch all registered administrator accounts
   */
  async getAllAdmins(): Promise<AdminProfile[]> {
    try {
      const q = query(collection(db, ADMIN_COLLECTION), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        return snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            uid: docSnap.id,
            name: data.name || (data.email?.split('@')[0] || 'Administrator'),
            email: data.email || '',
            role: (data.role === 'superadmin' || data.role === 'hospital_admin' ? 'superadmin' : 'admin') as AdminRole,
            active: data.active !== false,
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt,
            createdBy: data.createdBy,
            lastLoginAt: data.lastLoginAt,
          };
        });
      }

      // Fallback: If no records exist, return empty array
      return [];
    } catch (err) {
      console.warn('getAllAdmins error, falling back to direct query:', err);
      const snapshot = await getDocs(collection(db, ADMIN_COLLECTION));
      return snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          uid: docSnap.id,
          name: data.name || (data.email?.split('@')[0] || 'Administrator'),
          email: data.email || '',
          role: (data.role === 'superadmin' || data.role === 'hospital_admin' ? 'superadmin' : 'admin') as AdminRole,
          active: data.active !== false,
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt,
          createdBy: data.createdBy,
          lastLoginAt: data.lastLoginAt,
        };
      });
    }
  },

  /**
   * Create a new administrator account using isolated secondary Firebase Auth instance
   * to avoid disconnecting the currently authenticated Super Admin session.
   */
  async createAdmin(
    input: CreateAdminInput,
    performedBy: { uid: string; email: string }
  ): Promise<AdminProfile> {
    const cleanEmail = input.email.trim().toLowerCase();
    const cleanName = input.name.trim();

    if (!cleanName || !cleanEmail || !input.password) {
      throw new Error('Please fill in all required fields: name, email, and password.');
    }

    if (input.password.length < 8) {
      throw new Error('Temporary password must be at least 8 characters long for hospital security.');
    }

    // 1. Check if email already registered in Firestore admins
    const allAdmins = await this.getAllAdmins();
    const existing = allAdmins.find((a) => a.email.toLowerCase() === cleanEmail);
    if (existing) {
      throw new Error(`An administrator with email "${cleanEmail}" already exists in the system.`);
    }

    // 2. Create user in Firebase Auth via temporary secondary app
    const tempAppName = `admin-create-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const tempApp = initializeApp(firebaseConfig, tempAppName);
    const tempAuth = getAuth(tempApp);

    let newUid = '';

    try {
      const cred = await createUserWithEmailAndPassword(tempAuth, cleanEmail, input.password);
      newUid = cred.user.uid;
      await secondarySignOut(tempAuth);
    } catch (authErr: any) {
      if (authErr?.code === 'auth/email-already-in-use') {
        throw new Error('This email address is already registered in Firebase Authentication.');
      } else if (authErr?.code === 'auth/invalid-email') {
        throw new Error('The email address format is invalid.');
      } else if (authErr?.code === 'auth/weak-password') {
        throw new Error('Password is too weak. Please use a stronger combination.');
      }
      throw new Error(authErr?.message || 'Failed to create administrator authentication account.');
    } finally {
      await deleteApp(tempApp);
    }

    // 3. Create administrator profile in Firestore
    const nowIso = new Date().toISOString();
    const adminDocRef = doc(db, ADMIN_COLLECTION, newUid);

    const newProfile: AdminProfile = {
      uid: newUid,
      name: cleanName,
      email: cleanEmail,
      role: input.role,
      active: true,
      createdAt: nowIso,
      updatedAt: nowIso,
      createdBy: performedBy.email,
    };

    await setDoc(adminDocRef, {
      ...newProfile,
      serverCreatedAt: serverTimestamp(),
      serverUpdatedAt: serverTimestamp(),
    });

    // 4. Log audit record
    await this.logAudit({
      action: 'ADMIN_CREATED',
      targetAdminUid: newUid,
      targetAdminEmail: cleanEmail,
      performedByUid: performedBy.uid,
      performedByEmail: performedBy.email,
      details: {
        name: cleanName,
        assignedRole: input.role,
      },
    });

    return newProfile;
  },

  /**
   * Update administrator details (Name or Role)
   */
  async updateAdmin(
    targetUid: string,
    updates: { name?: string; role?: AdminRole },
    performedBy: { uid: string; email: string }
  ): Promise<void> {
    const adminDocRef = doc(db, ADMIN_COLLECTION, targetUid);
    const adminSnap = await getDoc(adminDocRef);

    if (!adminSnap.exists()) {
      throw new Error('Administrator record not found.');
    }

    const currentData = adminSnap.data() as AdminProfile;
    const nowIso = new Date().toISOString();
    const cleanUpdates: Record<string, any> = {
      updatedAt: nowIso,
      serverUpdatedAt: serverTimestamp(),
    };

    if (updates.name !== undefined) {
      cleanUpdates.name = updates.name.trim();
    }

    // Self-Protection check on role modification
    if (updates.role !== undefined && updates.role !== currentData.role) {
      if (currentData.role === 'superadmin' && updates.role !== 'superadmin') {
        // Check if there is at least one other active superadmin
        const allAdmins = await this.getAllAdmins();
        const activeSuperAdmins = allAdmins.filter(
          (a) => a.role === 'superadmin' && a.active !== false && a.uid !== targetUid
        );

        if (activeSuperAdmins.length === 0) {
          throw new Error(
            'Cannot downgrade this role. There must be at least one active Super Admin in the hospital system.'
          );
        }
      }

      cleanUpdates.role = updates.role;
    }

    await updateDoc(adminDocRef, cleanUpdates);

    // Audit log
    await this.logAudit({
      action: updates.role && updates.role !== currentData.role ? 'ROLE_CHANGED' : 'ADMIN_UPDATED',
      targetAdminUid: targetUid,
      targetAdminEmail: currentData.email,
      performedByUid: performedBy.uid,
      performedByEmail: performedBy.email,
      details: {
        previousRole: currentData.role,
        newRole: updates.role || currentData.role,
        updatedName: updates.name || currentData.name,
      },
    });
  },

  /**
   * Activate or Deactivate an administrator account
   */
  async toggleAdminStatus(
    targetUid: string,
    newStatus: boolean,
    performedBy: { uid: string; email: string }
  ): Promise<void> {
    // 1. Self-protection: Cannot deactivate yourself
    if (targetUid === performedBy.uid) {
      throw new Error('Self-protection rule: You cannot deactivate your own administrator account.');
    }

    const adminDocRef = doc(db, ADMIN_COLLECTION, targetUid);
    const adminSnap = await getDoc(adminDocRef);

    if (!adminSnap.exists()) {
      throw new Error('Administrator record not found.');
    }

    const currentData = adminSnap.data() as AdminProfile;

    // 2. Self-protection: Cannot deactivate the last remaining active superadmin
    if (!newStatus && currentData.role === 'superadmin') {
      const allAdmins = await this.getAllAdmins();
      const otherActiveSuperAdmins = allAdmins.filter(
        (a) => a.role === 'superadmin' && a.active !== false && a.uid !== targetUid
      );

      if (otherActiveSuperAdmins.length === 0) {
        throw new Error(
          'Cannot deactivate this account. There must be at least one active Super Admin remaining in the system.'
        );
      }
    }

    const nowIso = new Date().toISOString();
    await updateDoc(adminDocRef, {
      active: newStatus,
      updatedAt: nowIso,
      serverUpdatedAt: serverTimestamp(),
    });

    // Audit log
    await this.logAudit({
      action: newStatus ? 'ADMIN_ACTIVATED' : 'ADMIN_DEACTIVATED',
      targetAdminUid: targetUid,
      targetAdminEmail: currentData.email,
      performedByUid: performedBy.uid,
      performedByEmail: performedBy.email,
      details: {
        previousStatus: currentData.active,
        newStatus,
      },
    });
  },

  /**
   * Delete an administrator record from Firestore
   */
  async deleteAdmin(
    targetUid: string,
    performedBy: { uid: string; email: string }
  ): Promise<void> {
    // 1. Self-protection: Cannot delete yourself
    if (targetUid === performedBy.uid) {
      throw new Error('Self-protection rule: You cannot delete your own administrator account.');
    }

    const adminDocRef = doc(db, ADMIN_COLLECTION, targetUid);
    const adminSnap = await getDoc(adminDocRef);

    if (!adminSnap.exists()) {
      throw new Error('Administrator record not found.');
    }

    const currentData = adminSnap.data() as AdminProfile;

    // 2. Self-protection: Cannot delete the last remaining superadmin
    if (currentData.role === 'superadmin') {
      const allAdmins = await this.getAllAdmins();
      const otherSuperAdmins = allAdmins.filter(
        (a) => a.role === 'superadmin' && a.uid !== targetUid
      );

      if (otherSuperAdmins.length === 0) {
        throw new Error(
          'Cannot delete this account. There must be at least one Super Admin remaining in the hospital system.'
        );
      }
    }

    // Delete Firestore document
    await deleteDoc(adminDocRef);

    // Audit log
    await this.logAudit({
      action: 'ADMIN_DELETED',
      targetAdminUid: targetUid,
      targetAdminEmail: currentData.email,
      performedByUid: performedBy.uid,
      performedByEmail: performedBy.email,
      details: {
        deletedAdminName: currentData.name,
        deletedAdminRole: currentData.role,
      },
    });
  },

  /**
   * Send password reset email to administrator
   */
  async sendPasswordReset(
    email: string,
    performedBy: { uid: string; email: string }
  ): Promise<void> {
    await authService.resetPassword(email);

    await this.logAudit({
      action: 'PASSWORD_RESET_REQUESTED',
      targetAdminUid: '',
      targetAdminEmail: email,
      performedByUid: performedBy.uid,
      performedByEmail: performedBy.email,
    });
  },

  /**
   * Append audit log record to Firestore (immutable trail)
   */
  async logAudit(entry: Omit<AdminAuditLog, 'id' | 'timestamp'>): Promise<void> {
    try {
      const logRef = doc(collection(db, AUDIT_COLLECTION));
      const logData: AdminAuditLog = {
        id: logRef.id,
        ...entry,
        timestamp: new Date().toISOString(),
      };

      await setDoc(logRef, {
        ...logData,
        serverTimestamp: serverTimestamp(),
      });
    } catch (err) {
      console.warn('Audit log write warning:', err);
    }
  },

  /**
   * Fetch recent audit logs for the Super Admin audit drawer/tab
   */
  async getAuditLogs(maxRecords = 30): Promise<AdminAuditLog[]> {
    try {
      const q = query(
        collection(db, AUDIT_COLLECTION),
        orderBy('timestamp', 'desc'),
        limit(maxRecords)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      } as AdminAuditLog));
    } catch (err) {
      console.warn('getAuditLogs error:', err);
      return [];
    }
  },
};
