import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Intro3DCanvas } from './Intro3DCanvas';

interface IntroAnimationProps {
  onComplete: () => void;
}

export const IntroAnimation: React.FC<IntroAnimationProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'distant' | 'form' | 'approach' | 'settle' | 'reveal' | 'exit'>('distant');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const requestRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    // Check for prefers-reduced-motion
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (mediaQuery.matches) {
        setReducedMotion(true);
        const timer = setTimeout(() => onComplete(), 1000);
        return () => clearTimeout(timer);
      }
    }

    // High-resolution clock loop for frame-accurate 3D phase timing
    const animate = (time: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = time;
      }
      const elapsed = (time - startTimeRef.current) / 1000;
      setElapsedTime(elapsed);

      // Phase transitions according to creative direction:
      // 0.00 - 0.70s: Distant particles & gentle grid
      // 0.70 - 1.50s: Medical core forms in distance
      // 1.50 - 2.30s: Camera approaches core, rings weave depth
      // 2.30 - 2.90s: Camera slows, core reaches focal stillness
      // 2.90 - 3.50s: Identity & Editorial Typography reveal
      // 3.50 - 3.80s: Seamless transition into homepage
      if (elapsed < 0.7) {
        setPhase('distant');
      } else if (elapsed < 1.5) {
        setPhase('form');
      } else if (elapsed < 2.3) {
        setPhase('approach');
      } else if (elapsed < 2.9) {
        setPhase('settle');
      } else if (elapsed < 3.5) {
        setPhase('reveal');
      } else {
        setPhase('exit');
        setIsExiting(true);
      }

      if (elapsed < 3.8) {
        requestRef.current = requestAnimationFrame(animate);
      } else {
        onComplete();
      }
    };

    requestRef.current = requestAnimationFrame(animate);

    // Keyboard navigation listener for accessible skip
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onComplete();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
      }
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          key="cinematic-intro-overlay"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.02,
            transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
          }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-between bg-[#F7FCFE] overflow-hidden select-none pointer-events-auto"
          role="region"
          aria-label="Deccan Care Hospital Brand Opening"
        >
          {/* Subtle Geometric Architectural Medical Grid */}
          <div className="absolute inset-0 bg-medical-grid opacity-25 pointer-events-none" />

          {/* Soft Depth Atmosphere */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{
              opacity: phase === 'reveal' || phase === 'exit' ? 0.75 : 0.5,
              scale: phase === 'reveal' || phase === 'exit' ? 1.15 : 1.0,
            }}
            transition={{ duration: 1.8, ease: 'easeOut' }}
            className="absolute w-[500px] h-[500px] sm:w-[650px] sm:h-[650px] rounded-full bg-gradient-to-tr from-[#EEF8FB] via-[#E2F4F9]/60 to-transparent blur-3xl pointer-events-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          />

          {/* 3D WebGL Canvas Layer */}
          <Intro3DCanvas
            elapsedTime={elapsedTime}
            phase={phase}
            reducedMotion={reducedMotion}
          />

          {/* Top Architectural Telemetry Coordinates (Subtle, Clinical) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: phase !== 'distant' ? 1 : 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-7xl mx-auto px-6 pt-6 flex items-center justify-between pointer-events-none z-10"
          >
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0879A5]" />
              <span className="font-mono text-[9px] sm:text-[10px] text-[#0879A5]/70 tracking-widest uppercase">
                DECCAN CARE HEALTHCARE
              </span>
            </div>
            <div className="font-mono text-[9px] sm:text-[10px] text-[#617786]/60 tracking-wider">
              17.3297°N 76.8343°E
            </div>
          </motion.div>

          {/* Bottom Editorial Brand Identity Sequence (Generously spaced below the 3D core, no overlap) */}
          <div className="relative z-20 flex flex-col items-center text-center px-4 pb-12 sm:pb-16 max-w-lg mx-auto pointer-events-none">
            {/* 1. Main Hospital Name */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{
                opacity: phase === 'reveal' || phase === 'exit' ? 1 : 0,
                y: phase === 'reveal' || phase === 'exit' ? 0 : 12,
              }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#103A50] font-normal tracking-tight leading-tight">
                DECCAN CARE
              </h1>
            </motion.div>

            {/* 2. Subtitle: MATERNITY & GENERAL HOSPITAL */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{
                opacity: phase === 'reveal' || phase === 'exit' ? 1 : 0,
                y: phase === 'reveal' || phase === 'exit' ? 0 : 8,
              }}
              transition={{ duration: 0.55, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="mt-1.5"
            >
              <p className="font-sans text-[11px] sm:text-xs font-semibold tracking-[0.24em] text-[#0879A5] uppercase">
                MATERNITY &amp; GENERAL HOSPITAL
              </p>
            </motion.div>

            {/* 3. Location Designation */}
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{
                opacity: phase === 'reveal' || phase === 'exit' ? 1 : 0,
                y: phase === 'reveal' || phase === 'exit' ? 0 : 6,
              }}
              transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="mt-3 flex items-center gap-1.5 text-[#617786]"
            >
              <span className="font-mono text-[9.5px] sm:text-[10px] tracking-widest uppercase">
                KALABURAGI
              </span>
              <span className="text-[#0879A5] text-[10px]">•</span>
              <span className="font-mono text-[9.5px] sm:text-[10px] tracking-widest uppercase">
                KARNATAKA
              </span>
            </motion.div>
          </div>

          {/* Accessible Skip Button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            type="button"
            onClick={onComplete}
            className="absolute bottom-6 right-6 sm:bottom-8 sm:right-8 px-3.5 py-1.5 rounded-full text-xs font-mono text-[#617786] bg-white/90 hover:bg-white hover:text-[#103A50] border border-[#D6EAF1] transition-all shadow-xs hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0879A5]/40 cursor-pointer z-30 pointer-events-auto"
            aria-label="Skip introduction film"
          >
            Skip Intro
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
