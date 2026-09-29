import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GalleryItem } from '../../types';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface GalleryLightboxProps {
  items: GalleryItem[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export const GalleryLightbox: React.FC<GalleryLightboxProps> = ({
  items,
  currentIndex,
  isOpen,
  onClose,
  onPrev,
  onNext,
}) => {
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const currentItem = items[currentIndex];

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        onPrev();
      } else if (e.key === 'ArrowRight') {
        onNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onPrev, onNext]);

  // Touch swipe handling for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const diff = touchStartX.current - touchEndX.current;

    // Minimum swipe threshold
    if (Math.abs(diff) > 45) {
      if (diff > 0) {
        onNext(); // Swiped left -> next
      } else {
        onPrev(); // Swiped right -> prev
      }
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  if (!isOpen || !currentItem) return null;

  const photo = currentItem.imageUrl || currentItem.image || '';
  const alt = currentItem.altText || currentItem.title;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B2737]/95 backdrop-blur-md p-4 sm:p-6 select-none"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-label="Image Lightbox Viewer"
      >
        {/* Top Control Bar */}
        <div className="absolute top-4 left-4 right-4 z-50 flex items-center justify-between text-white pointer-events-auto">
          {/* Index Counter */}
          <div className="text-xs font-mono bg-white/10 px-3 py-1.5 rounded-full border border-white/20 text-[#E2F4F9]">
            {currentIndex + 1} / {items.length}
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#19A4CF] cursor-pointer"
            aria-label="Close lightbox"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Previous Button (Desktop / Tablet) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#19A4CF] cursor-pointer hover:scale-105"
          aria-label="Previous image"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Next Button (Desktop / Tablet) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#19A4CF] cursor-pointer hover:scale-105"
          aria-label="Next image"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Central Modal Content Container */}
        <motion.div
          key={currentItem.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="relative max-w-5xl w-full max-h-[85vh] flex flex-col items-center justify-center pointer-events-auto"
        >
          {/* Main Large Image */}
          <div className="relative max-h-[68vh] rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black/40">
            <img
              src={photo}
              alt={alt}
              className="max-h-[68vh] w-auto max-w-full object-contain rounded-2xl"
            />
          </div>

          {/* Caption & Category Footer */}
          <div className="mt-4 text-center text-white space-y-1 max-w-2xl px-4">
            <div className="inline-flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#19A4CF] bg-white/10 px-2.5 py-0.5 rounded-full border border-white/15">
                {currentItem.category}
              </span>
            </div>
            <h2 className="font-serif text-xl sm:text-2xl text-white font-normal">
              {currentItem.title}
            </h2>
            {currentItem.description && (
              <p className="text-xs sm:text-sm text-[#E2F4F9]/80 leading-relaxed">
                {currentItem.description}
              </p>
            )}
          </div>
        </motion.div>

        {/* Mobile Navigation Buttons Bar */}
        <div className="sm:hidden absolute bottom-4 left-4 right-4 flex items-center justify-between z-50 pointer-events-auto">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
            className="p-2.5 rounded-xl bg-white/15 text-white border border-white/20 text-xs font-mono flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Prev</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            className="p-2.5 rounded-xl bg-white/15 text-white border border-white/20 text-xs font-mono flex items-center gap-1"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </AnimatePresence>
  );
};
