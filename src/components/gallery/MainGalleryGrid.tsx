import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Container } from '../common/Container';
import { SectionHeading } from '../common/SectionHeading';
import { SectionLabel } from '../common/SectionLabel';
import { GalleryCard } from './GalleryCard';
import type { GalleryItem } from '../../types';

interface MainGalleryGridProps {
  items: GalleryItem[];
  onOpenLightbox: (item: GalleryItem) => void;
  title?: string;
  subtitle?: string;
}

export const MainGalleryGrid: React.FC<MainGalleryGridProps> = ({
  items,
  onOpenLightbox,
  title = 'Complete Visual Archive',
  subtitle = 'Browse our photographic documentation of hospital departments, diagnostic services, and care spaces.',
}) => {
  if (items.length === 0) return null;

  return (
    <section className="py-16 sm:py-20 bg-[#F7FCFE] border-b border-[#D6EAF1]">
      <Container>
        <div className="max-w-3xl mb-12">
          <SectionLabel variant="blue" className="mb-3">
            ALL MEDIA
          </SectionLabel>
          <SectionHeading title={title} subtitle={subtitle} titleSize="lg" />
        </div>

        {/* Responsive Grid: 3-column desktop, 2-column tablet, 1-column mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.25, delay: index * 0.03 }}
                className="flex flex-col"
              >
                <GalleryCard item={item} onClick={onOpenLightbox} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </Container>
    </section>
  );
};
