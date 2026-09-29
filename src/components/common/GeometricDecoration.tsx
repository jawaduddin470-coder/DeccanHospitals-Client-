import React from 'react';

interface GeometricDecorationProps {
  className?: string;
  type?: 'cross' | 'box' | 'panel' | 'badge';
  label?: string;
}

export const GeometricDecoration: React.FC<GeometricDecorationProps> = ({
  className = '',
  type = 'box',
  label,
}) => {
  if (type === 'cross') {
    return (
      <div className={`inline-flex items-center text-[#0879A5]/30 select-none ${className}`} aria-hidden="true">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 1V11M1 6H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  if (type === 'badge' && label) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#EEF8FB] border border-[#D6EAF1] text-[11px] font-mono text-[#0879A5] ${className}`}>
        <span className="w-1 h-1 rounded-full bg-[#0879A5]" />
        <span>{label}</span>
      </div>
    );
  }

  return (
    <div className={`border border-[#D6EAF1] rounded-xl bg-white/40 backdrop-blur-xs p-3 ${className}`} aria-hidden="true">
      <div className="w-full h-full border border-dashed border-[#0879A5]/20 rounded-lg flex items-center justify-center p-2">
        {label && <span className="text-[10px] font-mono text-[#617786]/70 uppercase tracking-widest">{label}</span>}
      </div>
    </div>
  );
};
