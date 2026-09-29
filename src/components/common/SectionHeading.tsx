import React from 'react';

interface SectionHeadingProps {
  label?: string;
  labelVariant?: 'blue' | 'navy' | 'light' | 'red';
  title: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  align?: 'left' | 'center' | 'right';
  isLight?: boolean;
  className?: string;
  titleSize?: 'sm' | 'md' | 'lg' | 'xl';
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  label,
  labelVariant = 'blue',
  title,
  subtitle,
  align = 'left',
  isLight = false,
  className = '',
  titleSize = 'lg',
}) => {
  const alignClasses = {
    left: 'text-left items-start',
    center: 'text-center items-center mx-auto',
    right: 'text-right items-end ml-auto',
  };

  const titleSizes = {
    sm: 'text-2xl sm:text-3xl',
    md: 'text-3xl sm:text-4xl',
    lg: 'text-3xl sm:text-4xl lg:text-5xl',
    xl: 'text-4xl sm:text-5xl lg:text-6xl',
  };

  return (
    <div className={`flex flex-col max-w-3xl ${alignClasses[align]} ${className}`}>
      {label && (
        <div className="mb-3">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-[0.14em] font-sans ${
              isLight
                ? 'bg-white/15 text-[#E2F4F9] border border-white/20'
                : labelVariant === 'red'
                ? 'bg-[#D93636]/10 text-[#D93636] border border-[#D93636]/20'
                : 'bg-[#E2F4F9] text-[#0879A5] border border-[#D6EAF1]'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isLight ? 'bg-[#19A4CF]' : labelVariant === 'red' ? 'bg-[#D93636]' : 'bg-[#0879A5]'
              }`}
            />
            {label}
          </span>
        </div>
      )}

      <h2
        className={`font-serif tracking-tight font-normal leading-[1.15] ${titleSizes[titleSize]} ${
          isLight ? 'text-white' : 'text-[#103A50]'
        }`}
      >
        {title}
      </h2>

      {subtitle && (
        <p
          className={`mt-4 font-sans text-base sm:text-lg leading-relaxed max-w-2xl ${
            isLight ? 'text-[#E2F4F9]/80' : 'text-[#617786]'
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
};
