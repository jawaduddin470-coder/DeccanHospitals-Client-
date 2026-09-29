import React from 'react';

interface SectionLabelProps {
  children: React.ReactNode;
  variant?: 'blue' | 'navy' | 'light' | 'red';
  className?: string;
  showDot?: boolean;
}

export const SectionLabel: React.FC<SectionLabelProps> = ({
  children,
  variant = 'blue',
  className = '',
  showDot = true,
}) => {
  const variantStyles = {
    blue: 'bg-[#E2F4F9] text-[#0879A5] border-[#D6EAF1]',
    navy: 'bg-[#103A50]/10 text-[#103A50] border-[#103A50]/20',
    light: 'bg-white/20 text-[#E2F4F9] border-white/20 backdrop-blur-xs',
    red: 'bg-[#D93636]/10 text-[#D93636] border-[#D93636]/20',
  };

  const dotColors = {
    blue: 'bg-[#0879A5]',
    navy: 'bg-[#103A50]',
    light: 'bg-[#19A4CF]',
    red: 'bg-[#D93636]',
  };

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[11px] sm:text-xs font-semibold uppercase tracking-[0.14em] font-sans ${variantStyles[variant]} ${className}`}
    >
      {showDot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]} flex-shrink-0 animate-pulse`}
          aria-hidden="true"
        />
      )}
      <span>{children}</span>
    </div>
  );
};
