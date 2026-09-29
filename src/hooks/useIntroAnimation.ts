import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const INTRO_SESSION_KEY = 'deccan-care-intro-seen';

export function useIntroAnimation() {
  const location = useLocation();

  const [showIntro, setShowIntro] = useState<boolean>(() => {
    // 1. Never show intro on admin or login routes
    if (
      location.pathname.startsWith('/admin') ||
      location.pathname.startsWith('/login/admin')
    ) {
      return false;
    }

    // 2. Check if user already saw intro in this browser session
    try {
      const seen = sessionStorage.getItem(INTRO_SESSION_KEY);
      if (seen === 'true') {
        return false;
      }
    } catch {
      // In case sessionStorage is blocked, default to false to prevent infinite loops
      return false;
    }

    // 3. Check for prefers-reduced-motion
    if (typeof window !== 'undefined' && window.matchMedia) {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) {
        try {
          sessionStorage.setItem(INTRO_SESSION_KEY, 'true');
        } catch {
          // ignore
        }
        return false;
      }
    }

    return true;
  });

  const completeIntro = () => {
    try {
      sessionStorage.setItem(INTRO_SESSION_KEY, 'true');
    } catch (e) {
      console.warn('Could not record intro completion to sessionStorage:', e);
    }
    setShowIntro(false);
  };

  // Safety fallback timeout: unconditionally dismiss intro after 3.8s maximum
  useEffect(() => {
    if (!showIntro) return;

    const safetyTimer = setTimeout(() => {
      completeIntro();
    }, 3800);

    return () => clearTimeout(safetyTimer);
  }, [showIntro]);

  return {
    showIntro,
    completeIntro,
  };
}
