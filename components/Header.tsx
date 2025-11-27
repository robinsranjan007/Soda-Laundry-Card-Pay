import React from 'react';
import { ArrowLeft, Menu } from 'lucide-react';
import logoIcon from 'figma:asset/f9a9dbdd1c474672b67f38c73c4e0df24e169dfd.png';

interface HeaderProps {
  variant?: 'back' | 'menu' | 'simple';
  onBackClick?: () => void;
  onMenuClick?: () => void;
}

export function Header({ variant = 'simple', onBackClick, onMenuClick }: HeaderProps) {
  if (variant === 'back') {
    return (
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-center relative">
          <button 
            onClick={onBackClick}
            className="absolute left-6 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[#3B5998]" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 flex items-center justify-center">
              <img src={logoIcon} alt="Soda Laundry" className="w-6 h-6" />
            </div>
            <span className="text-[#3B5998] font-semibold">Soda Laundry</span>
          </div>
        </div>
      </header>
    );
  }

  if (variant === 'menu') {
    return (
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="w-10"></div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 flex items-center justify-center">
              <img src={logoIcon} alt="Soda Laundry" className="w-6 h-6" />
            </div>
            <span className="text-[#3B5998] font-semibold">Soda Laundry</span>
          </div>
          <button 
            onClick={onMenuClick}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Menu className="w-5 h-5 text-[#3B5998]" />
          </button>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 flex items-center justify-center">
            <img src={logoIcon} alt="Soda Laundry" className="w-6 h-6" />
          </div>
          <span className="text-[#3B5998] font-semibold">Soda Laundry</span>
        </div>
      </div>
    </header>
  );
}
