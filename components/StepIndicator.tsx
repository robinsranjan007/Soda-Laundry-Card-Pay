import React from 'react';

interface StepIndicatorProps {
  children: React.ReactNode;
  variant?: 'blue' | 'orange' | 'brand-blue';
}

export function StepIndicator({ children, variant = 'blue' }: StepIndicatorProps) {
  const variantStyles = {
    'blue': 'bg-[#8eb6dc]',
    'orange': 'bg-orange-400',
    'brand-blue': 'bg-[#3B5998]',
  };

  return (
    <div className={`flex-shrink-0 w-8 h-8 rounded-full ${variantStyles[variant]} text-white flex items-center justify-center`}>
      {children}
    </div>
  );
}
