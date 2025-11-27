import React from 'react';

interface CardProps {
  children: React.ReactNode;
  variant?: 'standard' | 'selected' | 'clickable';
  onClick?: () => void;
  className?: string;
  padding?: 'small' | 'medium' | 'large';
  selected?: boolean;
  selectedColor?: 'blue' | 'orange';
}

export function Card({
  children,
  variant = 'standard',
  onClick,
  className = '',
  padding = 'medium',
  selected = false,
  selectedColor = 'blue',
}: CardProps) {
  const paddingStyles = {
    small: 'p-4',
    medium: 'p-5',
    large: 'p-6',
  };

  const borderColor = selectedColor === 'blue' ? 'border-[#3B5998]' : 'border-orange-500';
  
  const variantStyles = {
    standard: 'bg-white rounded-2xl border-2 border-gray-200',
    selected: `bg-white rounded-2xl border-3 ${borderColor} shadow-lg`,
    clickable: `bg-white rounded-2xl border-2 border-gray-200 hover:${borderColor} transition-all cursor-pointer`,
  };

  const actualVariant = selected ? 'selected' : variant;

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={`${variantStyles[actualVariant]} ${paddingStyles[padding]} ${className} text-left w-full`}
      >
        {children}
      </button>
    );
  }

  return (
    <div className={`${variantStyles[actualVariant]} ${paddingStyles[padding]} ${className}`}>
      {children}
    </div>
  );
}
