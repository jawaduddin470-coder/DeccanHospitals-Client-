import React from 'react';
import { Filter } from 'lucide-react';

interface CategoryOption {
  key: string;
  label: string;
  count: number;
}

interface GalleryFilterBarProps {
  categories: CategoryOption[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  totalCount: number;
}

export const GalleryFilterBar: React.FC<GalleryFilterBarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  totalCount,
}) => {
  return (
    <div className="bg-white border-b border-[#D6EAF1] py-5 sticky top-[69px] z-30 shadow-xs backdrop-blur-md bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Dynamic Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none w-full sm:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-[#617786] pr-2 flex-shrink-0">
            <Filter className="w-3.5 h-3.5 text-[#0879A5]" />
            <span className="font-mono uppercase text-[10px]">Filter:</span>
          </div>

          <button
            type="button"
            onClick={() => onSelectCategory('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-medium transition-all duration-200 flex-shrink-0 cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#103A50] text-white shadow-xs'
                : 'bg-[#F7FCFE] text-[#17384A] border border-[#D6EAF1] hover:bg-[#EEF8FB]'
            }`}
          >
            All Archive ({totalCount})
          </button>

          {categories.map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => onSelectCategory(cat.key)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-medium transition-all duration-200 flex-shrink-0 cursor-pointer ${
                selectedCategory === cat.key
                  ? 'bg-[#103A50] text-white shadow-xs'
                  : 'bg-[#F7FCFE] text-[#17384A] border border-[#D6EAF1] hover:bg-[#EEF8FB]'
              }`}
            >
              {cat.label} ({cat.count})
            </button>
          ))}
        </div>

        {/* Counter Info */}
        <div className="hidden lg:block text-xs font-mono text-[#617786]">
          <span>Deccan Care Media Repository</span>
        </div>
      </div>
    </div>
  );
};
