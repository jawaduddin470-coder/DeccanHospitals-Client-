import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User } from 'firebase/auth';
import { authService } from '../firebase/authService';
import type { AdminProfile, AdminRole } from '../types/admin';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  role: AdminRole | null;
  adminProfile: AdminProfile | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshAdminProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(false);
  const [role, setRole] = useState<AdminRole | null>(null);
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchProfileForUser = useCallback(async (currentUser: User) => {
    try {
      const profile = await authService.getAdminProfile(currentUser);
      if (profile && profile.active !== false) {
        setAdminProfile(profile);
        setRole(profile.role);
        setIsSuperAdmin(profile.role === 'superadmin');
        setIsAdmin(true);
      } else {
        setAdminProfile(null);
        setRole(null);
        setIsSuperAdmin(false);
        setIsAdmin(false);
      }
    } catch (err) {
      console.warn('Error fetching admin profile in AuthContext:', err);
      setIsAdmin(false);
      setIsSuperAdmin(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = authService.onAuthState(async (currentUser) => {
      setIsLoading(true);
      if (currentUser) {
        setUser(currentUser);
        await fetchProfileForUser(currentUser);
      } else {
        setUser(null);
        setAdminProfile(null);
        setRole(null);
        setIsAdmin(false);
        setIsSuperAdmin(false);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [fetchProfileForUser]);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const loggedUser = await authService.loginAdmin(email, pass);
      setUser(loggedUser);
      await fetchProfileForUser(loggedUser);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logoutAdmin();
      setUser(null);
      setAdminProfile(null);
      setRole(null);
      setIsAdmin(false);
      setIsSuperAdmin(false);
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    await authService.resetPassword(email);
  };

  const refreshAdminProfile = async () => {
    if (user) {
      await fetchProfileForUser(user);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        isSuperAdmin,
        role,
        adminProfile,
        isLoading,
        login,
        logout,
        resetPassword,
        refreshAdminProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
