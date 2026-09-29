import React from 'react';
import { motion } from 'framer-motion';
import { Container } from '../common/Container';
import { SectionHeading } from '../common/SectionHeading';
import { SectionLabel } from '../common/SectionLabel';
import { GalleryCard } from './GalleryCard';
import type { GalleryItem } from '../../types';

interface FeaturedGallerySectionProps {
  featuredItems: GalleryItem[];
  onOpenLightbox: (item: GalleryItem) => void;
}

export const FeaturedGallerySection: React.FC<FeaturedGallerySectionProps> = ({
  featuredItems,
  onOpenLightbox,
}) => {
  if (featuredItems.length === 0) return null;

  const leadItem = featuredItems[0];
  const supportingItems = featuredItems.slice(1, 3);

  return (
    <section className="py-16 sm:py-20 bg-white border-b border-[#D6EAF1]">
      <Container>
        <div className="max-w-3xl mb-12">
          <SectionLabel variant="blue" className="mb-3">
            FEATURED SPACES
          </SectionLabel>
          <SectionHeading
            title="Hospital Environments &amp; Facilities"
            subtitle="Explore primary maternal care rooms, outpatient consultation areas, and diagnostic support facilities."
            titleSize="lg"
          />
        </div>

        {/* Editorial Asymmetric Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Large Lead Featured Image */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="lg:col-span-7 flex flex-col"
          >
            <GalleryCard item={leadItem} onClick={onOpenLightbox} isFeatured={true} />
          </motion.div>

          {/* Supporting Featured Items */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
            {supportingItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: (index + 1) * 0.1 }}
                className="flex flex-col"
              >
                <GalleryCard item={item} onClick={onOpenLightbox} />
              </motion.div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
};
