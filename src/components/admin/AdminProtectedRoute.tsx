import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const AdminProtectedRoute: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B2737] flex flex-col items-center justify-center p-6 text-white">
        <div className="w-12 h-12 rounded-2xl bg-[#103A50] border border-[#19A4CF]/30 flex items-center justify-center mb-4">
          <div className="w-6 h-6 rounded-full border-2 border-[#19A4CF] border-t-transparent animate-spin" />
        </div>
        <span className="font-serif text-lg text-white font-medium">
          Verifying Administrator Authorization...
        </span>
        <span className="text-xs font-mono text-[#E2F4F9]/60 mt-1">
          Deccan Care Hospital Security Gateway
        </span>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/login/admin" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
