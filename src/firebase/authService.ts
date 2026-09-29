import {
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth } from './auth';
import { db } from './firestore';
import type { AdminProfile, AdminRole } from '../types/admin';

export const ROOT_ADMIN_EMAIL = 'deccancarehospital.24ths@gmail.com';

export const authService = {
  /**
   * Log in administrator with email and password
   */
  async loginAdmin(email: string, pass: string): Promise<User> {
    const userCredential = await signInWithEmailAndPassword(auth, email.trim(), pass);
    const user = userCredential.user;

    // Force refresh token to ensure freshest authentication context and custom claims
    await user.getIdToken(true);

    if (import.meta.env.DEV) {
      console.info(
        `[Admin Auth Diagnostics] Authenticated UID: ${user.uid} | Email: ${user.email} | Provider: ${
          user.providerData[0]?.providerId || 'password'
        }`
      );
    }

    // Verify administrator authorization
    const isAuthorized = await this.verifyAdminAuthorization(user);
    if (!isAuthorized) {
      await signOut(auth);
      throw new Error(
        'Access denied: This account does not have administrator privileges for Deccan Care Hospital or has been deactivated.'
      );
    }

    return user;
  },

  /**
   * Fetch admin profile and role from Firestore
   */
  async getAdminProfile(user: User): Promise<AdminProfile | null> {
    if (!user) return null;

    const email = (user.email || '').toLowerCase().trim();
    const isRoot = email === ROOT_ADMIN_EMAIL;

    try {
      const adminDocRef = doc(db, 'admins', user.uid);
      const adminDocSnap = await getDoc(adminDocRef);

      if (adminDocSnap.exists()) {
        const data = adminDocSnap.data();
        const role: AdminRole = isRoot
          ? 'superadmin'
          : data.role === 'superadmin' || data.role === 'hospital_admin'
          ? 'superadmin'
          : 'admin';

        return {
          uid: user.uid,
          name: data.name || user.displayName || email.split('@')[0] || 'Administrator',
          email: data.email || user.email || '',
          role,
          active: isRoot ? true : data.active !== false,
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt,
          createdBy: data.createdBy,
          lastLoginAt: data.lastLoginAt,
        };
      }

      // Root administrator auto-bootstrap
      if (isRoot) {
        await this.bootstrapAdminRecord(user.uid, user.email || ROOT_ADMIN_EMAIL);
        return {
          uid: user.uid,
          name: 'Deccan Care Superadmin',
          email: ROOT_ADMIN_EMAIL,
          role: 'superadmin',
          active: true,
          createdAt: new Date().toISOString(),
        };
      }

      return null;
    } catch (err) {
      console.warn('Error fetching admin profile:', err);
      if (isRoot) {
        return {
          uid: user.uid,
          name: 'Deccan Care Superadmin',
          email: ROOT_ADMIN_EMAIL,
          role: 'superadmin',
          active: true,
          createdAt: new Date().toISOString(),
        };
      }
      return null;
    }
  },

  /**
   * Verify if authenticated user has administrator privileges
   * Checks Custom Claim (token.admin) and Firestore admin record (admins/{uid})
   */
  async verifyAdminAuthorization(user: User): Promise<boolean> {
    if (!user) return false;

    // 1. Hospital root administrator check & auto-bootstrap
    if (user.email && user.email.toLowerCase().trim() === ROOT_ADMIN_EMAIL) {
      try {
        await this.bootstrapAdminRecord(user.uid, user.email);
      } catch (bootstrapErr) {
        console.warn('Bootstrap admin warning:', bootstrapErr);
      }
      return true;
    }

    try {
      // 2. Check custom claim from ID token
      const idTokenResult = await user.getIdTokenResult(true);
      if (idTokenResult.claims.admin === true || idTokenResult.claims.role === 'superadmin') {
        return true;
      }

      // 3. Check if user document exists in admins collection and is active
      const adminDocRef = doc(db, 'admins', user.uid);
      const adminDocSnap = await getDoc(adminDocRef);
      if (adminDocSnap.exists() && adminDocSnap.data()?.active !== false) {
        return true;
      }

      return false;
    } catch (err) {
      console.warn('Admin authorization verification error:', err);
      return false;
    }
  },

  /**
   * Helper for initial bootstrapping of an admin record
   */
  async bootstrapAdminRecord(uid: string, email: string): Promise<void> {
    try {
      const adminDocRef = doc(db, 'admins', uid);
      await setDoc(
        adminDocRef,
        {
          uid,
          email,
          name: 'Deccan Care Superadmin',
          role: 'superadmin',
          active: true,
          createdAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (err) {
      console.warn('Bootstrap admin error:', err);
    }
  },

  /**
   * Sign out administrator
   */
  async logoutAdmin(): Promise<void> {
    await signOut(auth);
  },

  /**
   * Send password reset email
   */
  async resetPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email.trim());
  },

  /**
   * Subscribe to auth state changes
   */
  onAuthState(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  },
};
