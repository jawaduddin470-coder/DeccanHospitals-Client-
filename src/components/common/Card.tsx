import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'subtle' | 'elevated' | 'translucent' | 'interactive' | 'navy';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  isHoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'lg',
  className = '',
  isHoverable = false,
  ...props
}) => {
  const paddingStyles = {
    none: 'p-0',
    sm: 'p-4 sm:p-5',
    md: 'p-5 sm:p-6',
    lg: 'p-6 sm:p-8',
    xl: 'p-8 sm:p-10',
  };

  const variantStyles = {
    default: 'bg-white border border-[#D6EAF1] shadow-sm text-[#17384A]',
    subtle: 'bg-[#F7FCFE] border border-[#D6EAF1] shadow-sm text-[#17384A]',
    elevated: 'bg-white border border-[#D6EAF1] shadow-md text-[#17384A]',
    translucent: 'bg-white/80 backdrop-blur-md border border-[#D6EAF1]/80 shadow-sm text-[#17384A]',
    interactive: 'bg-white border border-[#D6EAF1] shadow-sm hover:shadow-md hover:border-[#19A4CF]/60 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer text-[#17384A]',
    navy: 'bg-[#103A50] border border-[#19A4CF]/20 text-white shadow-lg',
  };

  const hoverClass = isHoverable && variant !== 'interactive' 
    ? 'transition-all duration-300 hover:shadow-md hover:border-[#19A4CF]/60 hover:-translate-y-0.5' 
    : '';

  return (
    <div
      className={`rounded-2xl ${paddingStyles[padding]} ${variantStyles[variant]} ${hoverClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
