import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert } from 'lucide-react';
import { Button } from '../common/Button';

export const AdminSuperAdminRoute: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin, isSuperAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-6">
        <div className="w-8 h-8 rounded-full border-2 border-[#0879A5] border-t-transparent animate-spin mb-3" />
        <span className="text-xs font-mono text-[#0879A5] uppercase tracking-wider">
          Verifying Super Admin Privileges...
        </span>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/login/admin" replace />;
  }

  if (!isSuperAdmin) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 rounded-3xl bg-white border border-[#D6EAF1] shadow-lg text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-[#FFF8F8] border border-[#FADCDA] text-[#D93636] flex items-center justify-center mx-auto">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#103A50]">
            Super Admin Access Required
          </h2>
          <p className="text-xs text-[#617786] mt-1.5 leading-relaxed">
            The Admin Management console is restricted to Super Administrators. Your current account has standard Administrator permissions for managing doctors, appointments, gallery, and hospital services.
          </p>
        </div>
        <div className="pt-2">
          <Button to="/admin" variant="primary" size="sm">
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return children ? <>{children}</> : <Outlet />;
};
