import React from 'react';
import { Link } from 'react-router-dom';
import redCrossImg from '../../assets/red-cross.png';

export interface BrandLogoProps {
  variant?: 'header' | 'footer' | 'compact' | 'monochrome';
  className?: string;
  linkToHome?: boolean;
  isCompact?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'header',
  className = '',
  linkToHome = true,
  isCompact: isCompactProp,
}) => {
  const isFooter = variant === 'footer';
  const isCompact = isCompactProp !== undefined ? isCompactProp : variant === 'compact';

  const logoContent = (
    <div className={`flex items-center gap-3.5 group select-none ${className}`}>
      {/* Red Medical Cross Logo Symbol */}
      <div className="relative flex-shrink-0">
        {isFooter ? (
          <div className="w-[44px] h-[44px] rounded-xl bg-white/10 border border-white/20 p-1.5 flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-105">
            <img
              src={redCrossImg}
              alt="Deccan Care Hospital Logo"
              className="w-full h-full object-contain rounded-lg bg-white"
            />
          </div>
        ) : (
          <div
            className={`relative flex items-center justify-center rounded-xl bg-white border border-[#D6EAF1] shadow-xs overflow-hidden transition-transform duration-300 group-hover:scale-105 ${
              isCompact ? 'w-[38px] h-[38px] p-1' : 'w-[44px] h-[44px] p-1.5'
            }`}
          >
            <img
              src={redCrossImg}
              alt="Deccan Care Hospital Red Cross Logo"
              className="w-full h-full object-contain rounded-lg"
            />
          </div>
        )}
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-1.5">
          <span
            className={`font-sans font-bold tracking-tight ${
              isCompact ? 'text-lg leading-tight' : 'text-xl sm:text-2xl leading-none'
            } ${isFooter ? 'text-white' : 'text-[#103A50]'}`}
          >
            DECCAN CARE
          </span>
        </div>
        <span
          className={`font-sans tracking-[0.14em] uppercase font-semibold mt-1 ${
            isCompact ? 'text-[8.5px]' : 'text-[9.5px] sm:text-[10px]'
          } ${isFooter ? 'text-[#E2F4F9]/80' : 'text-[#0879A5]'}`}
        >
          Maternity & General Hospital
        </span>
      </div>
    </div>
  );

  if (linkToHome) {
    return (
      <Link
        to="/"
        className="inline-flex focus-visible:ring-2 focus-visible:ring-[#0879A5] focus-visible:outline-none rounded-lg"
        aria-label="Deccan Care Maternity & General Hospital - Home"
      >
        {logoContent}
      </Link>
    );
  }

  return logoContent;
};
