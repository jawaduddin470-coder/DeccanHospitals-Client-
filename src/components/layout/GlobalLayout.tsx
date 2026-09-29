import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { ScrollToTop } from './ScrollToTop';
import { useIntroAnimation } from '../../hooks/useIntroAnimation';
import { IntroAnimation } from '../intro/IntroAnimation';

export const GlobalLayout: React.FC = () => {
  const { showIntro, completeIntro } = useIntroAnimation();

  return (
    <div className="min-h-screen flex flex-col bg-[#F7FCFE] text-[#17384A] font-sans selection:bg-[#0879A5] selection:text-white">
      {/* 1. First-Visit Session Intro Animation */}
      {showIntro && <IntroAnimation onComplete={completeIntro} />}

      {/* 2. Sticky Global Navigation */}
      <Navbar />

      {/* 3. Main Page Area */}
      <main className="flex-1 w-full" id="main-content">
        <Outlet />
      </main>

      {/* 4. Global Comprehensive Footer */}
      <Footer />

      {/* 5. Scroll restoration and back-to-top handler */}
      <ScrollToTop />
    </div>
  );
};
