import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Calendar,
  Clock,
  Users,
  Image as ImageIcon,
  Stethoscope,
  Building2,
  LogOut,
  Menu,
  X,
  Shield,
  ExternalLink,
} from 'lucide-react';

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  exact?: boolean;
}

const ADMIN_NAV_ITEMS: NavItem[] = [
  { name: 'Dashboard', path: '/admin', exact: true, icon: <LayoutDashboard className="w-4 h-4" /> },
  { name: 'Appointments', path: '/admin/appointments', icon: <Calendar className="w-4 h-4" /> },
  { name: 'Availability & Slots', path: '/admin/availability', icon: <Clock className="w-4 h-4" /> },
  { name: 'Doctors Directory', path: '/admin/doctors', icon: <Users className="w-4 h-4" /> },
  { name: 'Hospital Gallery', path: '/admin/gallery', icon: <ImageIcon className="w-4 h-4" /> },
  { name: 'Services & OPD', path: '/admin/services', icon: <Stethoscope className="w-4 h-4" /> },
  { name: 'Hospital Info', path: '/admin/hospital', icon: <Building2 className="w-4 h-4" /> },
];

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login/admin');
  };

  const currentSection = ADMIN_NAV_ITEMS.find((item) => {
    if (item.exact) return location.pathname === item.path;
    return location.pathname.startsWith(item.path);
  })?.name || 'Console';

  return (
    <div className="min-h-screen bg-[#F7FCFE] flex flex-col lg:flex-row text-[#17384A]">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-72 bg-[#0B2737] text-white border-r border-[#103A50] min-h-screen sticky top-0 z-40">
        {/* Brand Header */}
        <div className="p-6 border-b border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#0879A5] to-[#19A4CF] flex items-center justify-center text-white shadow-md">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <span className="font-serif text-lg font-bold text-white tracking-wide block">
              Deccan Care
            </span>
            <span className="text-[10px] font-mono tracking-widest text-[#19A4CF] uppercase block">
              Admin Control Center
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {ADMIN_NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-[#0879A5] text-white shadow-md font-semibold'
                    : 'text-[#E2F4F9]/70 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              {item.icon}
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Identity & Logout Footer */}
        <div className="p-4 border-t border-white/10 space-y-3">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-xs text-[#E2F4F9]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono uppercase text-[#19A4CF]">Logged In Admin</span>
              <span className="w-2 h-2 rounded-full bg-[#19A4CF] animate-pulse" />
            </div>
            <span className="font-mono text-xs text-white truncate block">
              {user?.email || 'Admin Staff'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#E2F4F9] text-xs font-mono transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Public Site</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#D93636]/20 hover:bg-[#D93636]/30 text-[#FF9E9E] text-xs font-mono transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <div className="lg:hidden bg-[#0B2737] text-white p-4 border-b border-[#103A50] flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#0879A5] flex items-center justify-center text-white">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <span className="font-serif text-sm font-bold text-white block">Deccan Care</span>
            <span className="text-[9px] font-mono text-[#19A4CF] uppercase block">
              {currentSection}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl bg-white/10 text-white"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Slide-Out Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-[#0B2737]/95 backdrop-blur-md p-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <Shield className="w-6 h-6 text-[#19A4CF]" />
                <span className="font-serif text-lg font-bold text-white">Admin Console</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-full bg-white/10 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="space-y-2">
              {ADMIN_NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.exact}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-[#0879A5] text-white font-semibold'
                        : 'text-[#E2F4F9]/80 hover:bg-white/10 text-white'
                    }`
                  }
                >
                  {item.icon}
                  <span>{item.name}</span>
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="pt-6 border-t border-white/10 space-y-3">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('/');
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/10 text-white text-sm"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Back to Public Website</span>
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#D93636] text-white text-sm font-semibold"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Top Breadcrumb Bar (Desktop) */}
        <header className="hidden lg:flex items-center justify-between px-8 py-4 bg-white border-b border-[#D6EAF1]">
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-[#617786]">Admin</span>
            <span className="text-[#0879A5]">/</span>
            <span className="text-[#103A50] font-semibold">{currentSection}</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-[#617786]">
            <span>Deccan Care Hospital Kalaburagi</span>
          </div>
        </header>

        {/* Nested Page Outlet */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
