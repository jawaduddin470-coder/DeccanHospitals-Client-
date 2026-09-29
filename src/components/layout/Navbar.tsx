import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Phone, Calendar, Menu, X, Clock, MapPin } from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';
import { Button } from '../common/Button';
import { HOSPITAL_CONFIG, NAV_LINKS } from '../../config/constants';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Handle scroll effect for sticky header height reduction and backdrop styling
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Handle ESC key to close mobile menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen]);

  return (
    <>
      {/* Top Pre-header Emergency / Quick Utility Bar (Visible on desktop/tablet) */}
      <div className="bg-[#103A50] text-[#E2F4F9] text-xs py-1.5 px-4 sm:px-6 lg:px-8 border-b border-[#19A4CF]/20 relative z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-6 text-[11px] sm:text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#D93636] animate-pulse" />
              <span className="font-medium text-white">24/7 Emergency & Maternity Services</span>
            </div>
            <div className="hidden md:flex items-center gap-1 text-[#E2F4F9]/80">
              <MapPin className="w-3 h-3 text-[#19A4CF]" />
              <span>Sheikh Roza, Kalaburagi</span>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <a
              href={HOSPITAL_CONFIG.phones[0].raw}
              className="flex items-center gap-1.5 hover:text-white transition-colors text-[11px] sm:text-xs font-medium"
            >
              <Phone className="w-3 h-3 text-[#19A4CF]" />
              <span className="hidden sm:inline">Emergency:</span>
              <span className="font-semibold text-white">{HOSPITAL_CONFIG.phones[0].number}</span>
            </a>
            <div className="hidden lg:flex items-center gap-1 text-[#E2F4F9]/80 text-[11px]">
              <Clock className="w-3 h-3 text-[#19A4CF]" />
              <span>OPD Consultation by Appointment</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Sticky Header */}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-[#D6EAF1] py-2.5'
            : 'bg-[#F7FCFE]/90 backdrop-blur-sm border-b border-[#D6EAF1]/70 py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Brand Identity */}
            <BrandLogo variant="header" isCompact={isScrolled} />

            {/* Desktop Center: Navigation Links */}
            <nav
              className="hidden lg:flex items-center gap-1 xl:gap-2"
              aria-label="Main Navigation"
            >
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 relative ${
                      isActive
                        ? 'text-[#0879A5] bg-[#E2F4F9] font-semibold shadow-xs'
                        : 'text-[#17384A] hover:text-[#0879A5] hover:bg-[#EEF8FB]'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span>{link.name}</span>
                      {isActive && (
                        <span
                          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-[#0879A5] rounded-full"
                          aria-hidden="true"
                        />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            {/* Desktop Right: Actions */}
            <div className="hidden md:flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                href={HOSPITAL_CONFIG.phones[0].raw}
                icon={<Phone className="w-3.5 h-3.5 text-[#D93636]" />}
                className="hidden xl:inline-flex border-[#D6EAF1] text-xs font-semibold"
              >
                Call Hospital
              </Button>
              <Button
                to="/appointment"
                variant="primary"
                size={isScrolled ? 'sm' : 'md'}
                icon={<Calendar className="w-4 h-4" />}
                className="font-medium shadow-xs"
              >
                Book Appointment
              </Button>
            </div>

            {/* Mobile & Tablet Hamburger Toggle */}
            <div className="flex items-center gap-2 lg:hidden">
              <Button
                to="/appointment"
                variant="primary"
                size="sm"
                icon={<Calendar className="w-3.5 h-3.5" />}
                className="sm:inline-flex text-xs px-2.5 py-1.5"
              >
                Book
              </Button>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-xl border border-[#D6EAF1] bg-white text-[#17384A] hover:text-[#0879A5] hover:bg-[#EEF8FB] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0879A5]"
                aria-expanded={isMobileMenuOpen}
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer / Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden bg-[#103A50]/60 backdrop-blur-xs transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        >
          <div
            className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-white shadow-2xl flex flex-col z-50 overflow-y-auto border-l border-[#D6EAF1]"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation Menu"
          >
            {/* Drawer Header */}
            <div className="p-5 border-b border-[#D6EAF1] flex items-center justify-between bg-[#F7FCFE]">
              <BrandLogo variant="header" isCompact={true} />
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-xl text-[#17384A] hover:bg-[#EEF8FB] border border-[#D6EAF1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0879A5]"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Emergency Ribbon inside Drawer */}
            <div className="bg-[#E2F4F9] border-b border-[#D6EAF1] px-5 py-2.5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#D93636] animate-pulse" />
              <span className="text-xs font-semibold text-[#103A50]">
                24/7 Emergency & Maternity
              </span>
            </div>

            {/* Navigation Links */}
            <div className="p-5 flex-1 flex flex-col gap-1.5">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#617786] mb-2 px-3">
                Navigation
              </span>
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-[#E2F4F9] text-[#0879A5] font-semibold border border-[#D6EAF1]'
                        : 'text-[#17384A] hover:bg-[#EEF8FB]'
                    }`
                  }
                >
                  {link.name}
                  <span className="text-xs text-[#0879A5]">→</span>
                </NavLink>
              ))}
            </div>

            {/* Drawer Bottom Actions & Contacts */}
            <div className="p-5 border-t border-[#D6EAF1] bg-[#F7FCFE] space-y-3">
              <Button
                to="/appointment"
                variant="primary"
                fullWidth
                icon={<Calendar className="w-4 h-4" />}
                className="shadow-sm"
              >
                Book Appointment
              </Button>
              <Button
                href={HOSPITAL_CONFIG.phones[0].raw}
                variant="emergency"
                fullWidth
                icon={<Phone className="w-4 h-4" />}
              >
                Call Emergency ({HOSPITAL_CONFIG.phones[0].number})
              </Button>
              <div className="pt-2 text-center">
                <p className="text-xs text-[#617786]">
                  Sheikh Roza, Kalaburagi, Karnataka - 585101
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
