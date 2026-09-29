import React from 'react';
import { Search, X, Filter } from 'lucide-react';

interface DoctorSearchFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedSpecialty: string;
  onSelectSpecialty: (specialty: string) => void;
  availableSpecialties: string[];
  totalResults: number;
}

export const DoctorSearchFilter: React.FC<DoctorSearchFilterProps> = ({
  searchQuery,
  onSearchChange,
  selectedSpecialty,
  onSelectSpecialty,
  availableSpecialties,
  totalResults,
}) => {
  const isFiltered = searchQuery.trim().length > 0 || selectedSpecialty !== 'all';

  const clearAllFilters = () => {
    onSearchChange('');
    onSelectSpecialty('all');
  };

  return (
    <div className="bg-white border-b border-[#D6EAF1] py-6 sticky top-[69px] z-30 shadow-xs backdrop-blur-md bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        {/* Search Bar + Active Count */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-lg">
            <Search className="w-4 h-4 text-[#617786] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search doctors by name or specialty..."
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#D6EAF1] bg-[#F7FCFE] text-sm text-[#17384A] focus:bg-white focus:border-[#0879A5] focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#617786] hover:text-[#17384A]"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Results Counter & Clear Action */}
          <div className="flex items-center gap-3 text-xs text-[#617786]">
            <span>
              Showing <strong className="text-[#103A50]">{totalResults}</strong> medical professionals
            </span>
            {isFiltered && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-[#D93636] hover:underline font-medium text-xs flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Specialty Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <div className="flex items-center gap-1 text-xs text-[#617786] pr-2 flex-shrink-0">
            <Filter className="w-3.5 h-3.5 text-[#0879A5]" />
            <span className="font-mono uppercase text-[10px]">Filter:</span>
          </div>

          <button
            type="button"
            onClick={() => onSelectSpecialty('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all duration-200 flex-shrink-0 cursor-pointer ${
              selectedSpecialty === 'all'
                ? 'bg-[#103A50] text-white shadow-xs'
                : 'bg-[#F7FCFE] text-[#17384A] border border-[#D6EAF1] hover:bg-[#EEF8FB]'
            }`}
          >
            All Specialties
          </button>

          {availableSpecialties.map((specialty) => (
            <button
              key={specialty}
              type="button"
              onClick={() => onSelectSpecialty(specialty)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all duration-200 flex-shrink-0 cursor-pointer ${
                selectedSpecialty === specialty
                  ? 'bg-[#103A50] text-white shadow-xs'
                  : 'bg-[#F7FCFE] text-[#17384A] border border-[#D6EAF1] hover:bg-[#EEF8FB]'
              }`}
            >
              {specialty}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
