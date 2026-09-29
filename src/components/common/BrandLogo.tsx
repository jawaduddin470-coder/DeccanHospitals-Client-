import React from 'react';
import { Link } from 'react-router-dom';

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
      {/* Precision Medical Vector Symbol */}
      <div className="relative flex-shrink-0">
        <svg
          width={isCompact ? "38" : "44"}
          height={isCompact ? "38" : "44"}
          viewBox="0 0 44 44"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform duration-300 group-hover:scale-105"
          aria-hidden="true"
        >
          {/* Subtle Outer Enclosing Geometric Rounded Square */}
          <rect
            x="1"
            y="1"
            width="42"
            height="42"
            rx="11"
            fill={isFooter ? "rgba(255, 255, 255, 0.08)" : "#EEF8FB"}
            stroke={isFooter ? "rgba(226, 244, 249, 0.25)" : "#D6EAF1"}
            strokeWidth="1.5"
          />
          {/* Primary Healthcare Blue Cross Base */}
          <rect
            x="18"
            y="9"
            width="8"
            height="26"
            rx="4"
            fill={isFooter ? "#19A4CF" : "#0879A5"}
          />
          <rect
            x="9"
            y="18"
            width="26"
            height="8"
            rx="4"
            fill={isFooter ? "#19A4CF" : "#0879A5"}
          />
          {/* Medical Red Precision Vitality Dot */}
          <circle
            cx="32.5"
            cy="11.5"
            r="3.5"
            fill="#D93636"
          />
          {/* White Inner Center Core */}
          <rect
            x="19.5"
            y="19.5"
            width="5"
            height="5"
            rx="1.5"
            fill="#FFFFFF"
          />
        </svg>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-1.5">
          <span
            className={`font-sans font-bold tracking-tight ${
              isCompact ? "text-lg leading-tight" : "text-xl sm:text-2xl leading-none"
            } ${isFooter ? "text-white" : "text-[#103A50]"}`}
          >
            DECCAN CARE
          </span>
        </div>
        <span
          className={`font-sans tracking-[0.14em] uppercase font-semibold mt-1 ${
            isCompact ? "text-[8.5px]" : "text-[9.5px] sm:text-[10px]"
          } ${isFooter ? "text-[#E2F4F9]/80" : "text-[#0879A5]"}`}
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
