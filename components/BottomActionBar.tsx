import React from 'react';
import { Button } from './Button';

interface BottomActionBarProps {
  children?: React.ReactNode;
  buttonText?: string;
  onButtonClick?: () => void;
  variant?: 'blue' | 'orange';
  disabled?: boolean;
}

export function BottomActionBar({
  children,
  buttonText,
  onButtonClick,
  variant = 'blue',
  disabled = false,
}: BottomActionBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
      <div className="max-w-4xl mx-auto px-6 py-4">
        {children || (
          <Button
            variant={variant === 'blue' ? 'primary-blue' : 'primary-orange'}
            onClick={onButtonClick}
            disabled={disabled}
          >
            {buttonText || 'Continue'}
          </Button>
        )}
      </div>
    </div>
  );
}
