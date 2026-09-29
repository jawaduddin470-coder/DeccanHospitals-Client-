import React, { useState } from 'react';
import type { GalleryItem } from '../../types';
import { Maximize2, ImageOff } from 'lucide-react';

interface GalleryCardProps {
  item: GalleryItem;
  onClick: (item: GalleryItem) => void;
  isFeatured?: boolean;
}

export const GalleryCard: React.FC<GalleryCardProps> = ({
  item,
  onClick,
  isFeatured = false,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const photo = item.imageUrl || item.image || '';
  const alt = item.altText || item.title || 'Deccan Care Hospital facility photo';

  const aspectClass = isFeatured ? 'aspect-[16/10]' : 'aspect-[4/3]';

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick(item)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(item);
        }
      }}
      className="group relative rounded-2xl sm:rounded-3xl border border-[#D6EAF1] bg-white overflow-hidden shadow-xs hover:shadow-md hover:border-[#19A4CF] transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0879A5] flex flex-col justify-between"
      aria-label={`View photo: ${item.title}`}
    >
      {/* Image Container with Controlled Aspect Ratio */}
      <div className={`relative w-full ${aspectClass} bg-[#EEF8FB] overflow-hidden`}>
        {/* Loading skeleton shimmer */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-gradient-to-r from-[#EEF8FB] via-[#E2F4F9] to-[#EEF8FB] animate-pulse" />
        )}

        {/* Error Fallback */}
        {imageError ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-[#617786] p-4 text-center space-y-2 bg-[#F7FCFE]">
            <ImageOff className="w-8 h-8 text-[#0879A5]/50" />
            <span className="text-xs font-mono">Image unavailable</span>
          </div>
        ) : (
          <img
            src={photo}
            alt={alt}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            className={`w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}

        {/* Top-Right Category Pill */}
        <div className="absolute top-3 right-3 z-10">
          <span className="text-[10px] font-mono font-semibold uppercase text-[#103A50] bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-md border border-[#D6EAF1] shadow-xs">
            {item.category}
          </span>
        </div>

        {/* Hover Overlay with Expand Icon */}
        <div className="absolute inset-0 bg-[#103A50]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
          <div className="w-10 h-10 rounded-full bg-white/90 text-[#0879A5] flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-200">
            <Maximize2 className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Caption Content */}
      <div className="p-4 sm:p-5 space-y-1">
        <h3 className="font-serif text-lg sm:text-xl text-[#103A50] font-normal leading-snug group-hover:text-[#0879A5] transition-colors">
          {item.title}
        </h3>
        {item.description && (
          <p className="text-xs text-[#617786] line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        )}
      </div>
    </div>
  );
};
