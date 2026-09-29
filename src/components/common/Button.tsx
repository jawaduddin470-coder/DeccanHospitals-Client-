import React from 'react';
import { Link } from 'react-router-dom';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'emergency' | 'ghost' | 'white';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  to?: string;
  href?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  to,
  href,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  className = '',
  children,
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-sans font-medium transition-all duration-200 cursor-pointer select-none rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";

  const sizeStyles = {
    sm: "text-xs px-3.5 py-1.5 gap-1.5",
    md: "text-sm px-4.5 py-2.5 gap-2",
    lg: "text-base px-6 py-3.5 gap-2.5 font-semibold",
  };

  const variantStyles: Record<ButtonVariant, string> = {
    primary: "bg-[#0879A5] hover:bg-[#06668C] text-white shadow-sm hover:shadow hover:shadow-[#0879A5]/20 focus-visible:ring-[#0879A5] border border-transparent",
    secondary: "bg-[#E2F4F9] hover:bg-[#d4eff7] text-[#0879A5] hover:text-[#06668C] border border-[#D6EAF1] focus-visible:ring-[#0879A5]",
    outline: "bg-transparent hover:bg-[#EEF8FB] text-[#17384A] hover:text-[#0879A5] border border-[#D6EAF1] hover:border-[#19A4CF]/60 focus-visible:ring-[#0879A5]",
    emergency: "bg-[#D93636] hover:bg-[#C22B2B] text-white shadow-sm hover:shadow hover:shadow-[#D93636]/25 focus-visible:ring-[#D93636] border border-transparent animate-pulse-slow",
    ghost: "bg-transparent hover:bg-[#EEF8FB] text-[#17384A] hover:text-[#0879A5] focus-visible:ring-[#0879A5]",
    white: "bg-white hover:bg-[#F7FCFE] text-[#103A50] hover:text-[#0879A5] border border-[#D6EAF1] shadow-sm hover:shadow focus-visible:ring-[#0879A5]",
  };

  const widthClass = fullWidth ? "w-full" : "";
  const combinedClasses = `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${widthClass} ${className}`;

  const renderContent = () => (
    <>
      {icon && iconPosition === 'left' && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
      {icon && iconPosition === 'right' && <span className="flex-shrink-0">{icon}</span>}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={combinedClasses}>
        {renderContent()}
      </Link>
    );
  }

  if (href) {
    const isExternal = href.startsWith('http') || href.startsWith('tel:') || href.startsWith('mailto:');
    return (
      <a
        href={href}
        target={isExternal && !href.startsWith('tel:') && !href.startsWith('mailto:') ? "_blank" : undefined}
        rel={isExternal && !href.startsWith('tel:') && !href.startsWith('mailto:') ? "noopener noreferrer" : undefined}
        className={combinedClasses}
      >
        {renderContent()}
      </a>
    );
  }

  return (
    <button className={combinedClasses} {...props}>
      {renderContent()}
    </button>
  );
};
