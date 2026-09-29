import React from 'react';

interface BackgroundPatternProps {
  variant?: 'grid' | 'dots' | 'boxes' | 'navy-grid' | 'minimal' | 'full';
  className?: string;
  opacity?: 'subtle' | 'ultralight' | 'faint' | 'visible';
  children?: React.ReactNode;
}

export const BackgroundPattern: React.FC<BackgroundPatternProps> = ({
  variant = 'boxes',
  className = '',
  opacity = 'ultralight',
  children,
}) => {
  const opacityClasses = {
    faint: 'opacity-20',
    ultralight: 'opacity-40',
    subtle: 'opacity-70',
    visible: 'opacity-100',
  };

  const isDark = variant === 'navy-grid';

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Precision Geometric Grid Background Layer */}
      <div
        className={`absolute inset-0 pointer-events-none ${opacityClasses[opacity]} ${
          isDark ? 'bg-medical-grid-dark' : 'bg-medical-grid'
        }`}
        aria-hidden="true"
      />

      {/* Floating Geometric Structural Boxes (Architectural language) */}
      {(variant === 'boxes' || variant === 'full') && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          {/* Top-Right Technical Precision Box */}
          <div className="absolute -top-12 -right-12 w-96 h-96 rounded-3xl border border-[#0879A5]/[0.07] bg-gradient-to-br from-[#E2F4F9]/[0.3] to-transparent pointer-events-none" />
          
          {/* Subtle Inner Accent Box */}
          <div className="absolute top-24 right-20 w-48 h-48 rounded-2xl border border-[#0879A5]/[0.05] pointer-events-none" />
          
          {/* Bottom-Left Soft Structural Panel */}
          <div className="absolute -bottom-24 -left-16 w-[480px] h-[480px] rounded-[40px] border border-[#0879A5]/[0.06] bg-gradient-to-tr from-[#EEF8FB]/[0.6] to-transparent pointer-events-none" />

          {/* Precision Alignment Corner Crosshairs */}
          <div className="absolute top-12 left-12 text-[#0879A5]/20 font-mono text-[10px] tracking-widest hidden md:block">
            + DC-GRID // 585101
          </div>
          <div className="absolute bottom-12 right-12 text-[#0879A5]/20 font-mono text-[10px] tracking-widest hidden md:block">
            + 17°20'N 76°50'E
          </div>
        </div>
      )}

      {/* Dots Overlay */}
      {(variant === 'dots' || variant === 'full') && (
        <div
          className={`absolute inset-0 pointer-events-none ${
            isDark ? 'bg-medical-dots-dark opacity-25' : 'bg-medical-dots opacity-40'
          }`}
          aria-hidden="true"
        />
      )}

      {/* Foreground Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};
