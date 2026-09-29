import React, { useState, useEffect, useMemo } from 'react';
import { Container } from '../components/common/Container';
import { Button } from '../components/common/Button';
import { PageTransition } from '../components/layout/PageTransition';
import { GalleryHero } from '../components/gallery/GalleryHero';
import { GalleryFilterBar } from '../components/gallery/GalleryFilterBar';
import { FeaturedGallerySection } from '../components/gallery/FeaturedGallerySection';
import { MainGalleryGrid } from '../components/gallery/MainGalleryGrid';
import { GalleryLightbox } from '../components/gallery/GalleryLightbox';
import { galleryService } from '../services';
import { INITIAL_GALLERY } from '../config/initialGallery';
import { HOSPITAL_CONFIG } from '../config/constants';
import type { GalleryItem } from '../types';
import { Calendar, Phone, Image as ImageIcon, MapPin } from 'lucide-react';

export const GalleryPage: React.FC = () => {
  const [items, setItems] = useState<GalleryItem[]>(() =>
    INITIAL_GALLERY.filter((item) => item.active !== false && item.isActive !== false)
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);
  const [lightboxIndex, setLightboxIndex] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;
    galleryService.getGalleryItems().then((data) => {
      if (isMounted && data) {
        setItems(data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter active images only
  const activeItems = useMemo(() => {
    return items.filter((item) => item.active !== false && item.isActive !== false);
  }, [items]);

  // Dynamically derive existing categories and their image counts
  const dynamicCategories = useMemo(() => {
    const categoryCountMap: { [key: string]: number } = {};
    activeItems.forEach((item) => {
      if (item.category) {
        categoryCountMap[item.category] = (categoryCountMap[item.category] || 0) + 1;
      }
    });

    return Object.keys(categoryCountMap).map((catName) => ({
      key: catName,
      label: catName,
      count: categoryCountMap[catName],
    }));
  }, [activeItems]);

  // Filtered gallery items
  const filteredItems = useMemo(() => {
    if (selectedCategory === 'all') {
      return activeItems;
    }
    return activeItems.filter((item) => item.category === selectedCategory);
  }, [activeItems, selectedCategory]);

  // Featured items
  const featuredItems = useMemo(() => {
    return activeItems.filter((item) => item.featured);
  }, [activeItems]);

  // Handle opening lightbox from any clicked item
  const handleOpenLightbox = (item: GalleryItem) => {
    const index = filteredItems.findIndex((i) => i.id === item.id);
    if (index !== -1) {
      setLightboxIndex(index);
      setLightboxOpen(true);
    }
  };

  const handlePrevLightbox = () => {
    setLightboxIndex((prev) => (prev > 0 ? prev - 1 : filteredItems.length - 1));
  };

  const handleNextLightbox = () => {
    setLightboxIndex((prev) => (prev < filteredItems.length - 1 ? prev + 1 : 0));
  };

  return (
    <PageTransition>
      {/* 1. GALLERY HERO */}
      <GalleryHero />

      {/* 2. DYNAMIC CATEGORY FILTER BAR */}
      <GalleryFilterBar
        categories={dynamicCategories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        totalCount={activeItems.length}
      />

      {/* 3. MAIN GALLERY PRESENTATION */}
      {activeItems.length === 0 ? (
        /* Intentional Empty / Content-Ready State */
        <section className="py-20 bg-white">
          <Container size="sm">
            <div className="text-center p-10 rounded-3xl bg-[#F7FCFE] border border-[#D6EAF1] space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#EEF8FB] text-[#0879A5] flex items-center justify-center mx-auto">
                <ImageIcon className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-2xl text-[#103A50]">
                  Hospital gallery coming soon
                </h3>
                <p className="text-xs text-[#617786] max-w-sm mx-auto">
                  Hospital images will appear here as they are added through the media repository.
                </p>
              </div>
              <div className="pt-2">
                <Button to="/contact" variant="secondary" size="sm">
                  Contact Hospital Desk
                </Button>
              </div>
            </div>
          </Container>
        </section>
      ) : (
        <>
          {/* Featured Section (Shown when "All" is active and featured items exist) */}
          {selectedCategory === 'all' && featuredItems.length > 0 && (
            <FeaturedGallerySection
              featuredItems={featuredItems}
              onOpenLightbox={handleOpenLightbox}
            />
          )}

          {/* Main Filtered Media Grid */}
          <MainGalleryGrid
            items={filteredItems}
            onOpenLightbox={handleOpenLightbox}
            title={
              selectedCategory === 'all'
                ? 'Complete Visual Archive'
                : `${selectedCategory} Media`
            }
            subtitle={
              selectedCategory === 'all'
                ? 'Browse our photographic documentation of hospital departments, diagnostic services, and care spaces.'
                : `Photographic archive covering ${selectedCategory.toLowerCase()} at Deccan Care Hospital.`
            }
          />
        </>
      )}

      {/* 4. LIGHTBOX MODAL VIEWER */}
      <GalleryLightbox
        items={filteredItems}
        currentIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onPrev={handlePrevLightbox}
        onNext={handleNextLightbox}
      />

      {/* 5. VISIT HOSPITAL CTA BANNER */}
      <section className="py-16 sm:py-20 bg-gradient-to-r from-[#103A50] via-[#0B2737] to-[#103A50] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-medical-grid-dark opacity-30 pointer-events-none" />

        <Container>
          <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#19A4CF]/20 text-[#19A4CF] border border-[#19A4CF]/30 text-xs font-semibold uppercase tracking-wider">
              <MapPin className="w-3.5 h-3.5" />
              Sheikh Roza, Kalaburagi
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-white tracking-tight">
              Experience Our Facilities in Person
            </h2>

            <p className="font-sans text-base sm:text-lg text-[#E2F4F9]/80 max-w-xl mx-auto leading-relaxed">
              Visit Deccan Care Maternity &amp; General Hospital for consultations, outpatient services, or hospital guidance.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Button
                to="/appointment"
                variant="white"
                size="lg"
                icon={<Calendar className="w-4 h-4 text-[#0879A5]" />}
                className="shadow-lg font-semibold"
              >
                Book an Appointment
              </Button>
              <Button
                href={HOSPITAL_CONFIG.phones[0].raw}
                variant="emergency"
                size="lg"
                icon={<Phone className="w-4 h-4" />}
              >
                Call {HOSPITAL_CONFIG.phones[0].number}
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </PageTransition>
  );
};
