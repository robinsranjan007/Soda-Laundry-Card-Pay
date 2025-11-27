import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ButtonProps {
  variant?: 'primary-blue' | 'primary-orange' | 'secondary-white' | 'ghost' | 'icon';
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  icon?: LucideIcon;
  disabled?: boolean;
  fullWidth?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export function Button({
  variant = 'primary-blue',
  children,
  onClick,
  className = '',
  icon: Icon,
  disabled = false,
  fullWidth = true,
  type = 'button',
}: ButtonProps) {
  const baseStyles = 'transition-all rounded-2xl';
  
  const variantStyles = {
    'primary-blue': `bg-gradient-to-r from-[#2347b0] to-[#8eb6dc] hover:from-[#1d3a8f] hover:to-[#7aa5cb] text-white py-4 transform hover:scale-[1.02] shadow-lg ${fullWidth ? 'w-full' : ''}`,
    'primary-orange': `bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 text-white py-4 transform hover:scale-[1.02] shadow-lg ${fullWidth ? 'w-full' : ''}`,
    'secondary-white': `bg-white text-orange-500 py-3 rounded-xl hover:bg-gray-50 ${fullWidth ? 'w-full' : ''}`,
    'ghost': `text-white hover:text-white/80 ${fullWidth ? 'w-full' : ''}`,
    'icon': 'p-2 hover:bg-gray-100 rounded-full transition-colors',
  };

  const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${disabledStyles} ${className}`}
    >
      {Icon && variant === 'icon' ? (
        <Icon className="w-5 h-5 text-[#3B5998]" />
      ) : (
        <div className="flex items-center justify-center gap-2">
          {Icon && <Icon className="w-5 h-5" />}
          {children}
        </div>
      )}
    </button>
  );
}
