import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'blue-gradient' | 'orange' | 'section-header';
  className?: string;
}

export function Badge({ children, variant = 'blue-gradient', className = '' }: BadgeProps) {
  const variantStyles = {
    'blue-gradient': 'px-3 py-1 rounded-full bg-gradient-to-r from-[#2347b0] to-[#8eb6dc] text-white',
    'orange': 'px-3 py-1 rounded-full bg-orange-400 text-white',
    'section-header': 'bg-gradient-to-r from-[#2347b0] to-[#8eb6dc] text-white px-4 py-2 rounded-full',
  };

  return (
    <div className={`inline-block ${variantStyles[variant]} ${className}`}>
      {children}
    </div>
  );
}
