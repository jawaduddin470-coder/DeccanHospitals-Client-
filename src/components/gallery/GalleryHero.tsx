import React from 'react';
import { motion } from 'framer-motion';
import { Container } from '../common/Container';
import { SectionLabel } from '../common/SectionLabel';
import { BackgroundPattern } from '../common/BackgroundPattern';
import { ShieldCheck, Image as ImageIcon, MapPin } from 'lucide-react';

export const GalleryHero: React.FC = () => {
  return (
    <BackgroundPattern
      variant="full"
      opacity="subtle"
      className="pt-10 pb-16 sm:pt-16 sm:pb-24 border-b border-[#D6EAF1]"
    >
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Narrative Column */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="lg:col-span-7 space-y-5"
          >
            <SectionLabel variant="blue">DECCAN CARE GALLERY</SectionLabel>

            <div className="space-y-3.5">
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#103A50] font-normal tracking-tight leading-[1.12]">
                A closer look at our hospital.
              </h1>
              <p className="font-sans text-base sm:text-lg text-[#617786] leading-relaxed max-w-xl">
                Explore moments, spaces and healthcare environments from Deccan Care Maternity &amp; General Hospital in Sheikh Roza, Kalaburagi.
              </p>
            </div>

            {/* Quick Badges */}
            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-[#17384A]">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#0879A5]" />
                <span>Sheikh Roza, Kalaburagi</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#0879A5]" />
                <span>Visual Archive</span>
              </div>
            </div>
          </motion.div>

          {/* Right Architectural Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
            className="lg:col-span-5"
          >
            <div className="relative rounded-3xl bg-gradient-to-br from-[#EEF8FB] via-[#F7FCFE] to-[#E2F4F9] border border-[#D6EAF1] p-7 shadow-sm overflow-hidden">
              <div className="absolute inset-0 bg-medical-grid opacity-35 pointer-events-none" />

              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between border-b border-[#D6EAF1] pb-3">
                  <span className="text-xs font-mono font-semibold uppercase text-[#0879A5]">
                    DC / VISUAL ARCHIVE
                  </span>
                  <span className="text-[10px] font-mono text-[#617786]">
                    KALABURAGI
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[#D6EAF1] shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-serif font-bold text-[#103A50]">
                      Hospital Media Repository
                    </span>
                    <ImageIcon className="w-4 h-4 text-[#0879A5]" />
                  </div>
                  <p className="text-xs text-[#617786] leading-relaxed">
                    Visual documentation of maternity suites, consultation rooms, diagnostic support facilities, and patient recovery areas.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#103A50] text-white flex items-center justify-between text-xs">
                  <span>Interactive Media Lightbox</span>
                  <span className="text-[#19A4CF] font-mono font-semibold">Enabled</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </Container>
    </BackgroundPattern>
  );
};
