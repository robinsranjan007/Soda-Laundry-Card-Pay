import React from 'react';
import { LucideIcon } from 'lucide-react';

interface InputProps {
  type?: 'text' | 'email' | 'tel' | 'number' | 'password';
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: LucideIcon;
  className?: string;
  disabled?: boolean;
}

export function Input({
  type = 'text',
  placeholder,
  value,
  onChange,
  icon: Icon,
  className = '',
  disabled = false,
}: InputProps) {
  if (Icon) {
    return (
      <div className={`relative ${className}`}>
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-[#3B5998] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>
    );
  }

  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-[#3B5998] transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    />
  );
}
