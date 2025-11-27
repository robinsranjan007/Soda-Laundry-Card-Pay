import React from 'react';

interface SectionHeaderProps {
  children: React.ReactNode;
  withDivider?: boolean;
}

export function SectionHeader({ children, withDivider = true }: SectionHeaderProps) {
  if (withDivider) {
    return (
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-gradient-to-r from-[#2347b0] to-[#8eb6dc] text-white px-4 py-2 rounded-full">
          {children}
        </div>
        <div className="h-px bg-gradient-to-r from-gray-300 to-transparent flex-1"></div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-[#2347b0] to-[#8eb6dc] text-white px-4 py-2 rounded-full inline-block mb-4">
      {children}
    </div>
  );
}
