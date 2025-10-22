'use client';

import React from 'react';
import { cn } from '@/app/lib/utils/cn';

interface ChoiceButtonProps {
  text: string;
  position: 0 | 1 | 2 | 3; 
  isSelected: boolean;
  onClick: () => void;
  isVisible: boolean;
}

export const ChoiceButton: React.FC<ChoiceButtonProps> = ({
  text,
  position,
  isSelected,
  onClick,
  isVisible
}) => {
  const getPositionClasses = () => {
    switch (position) {
      case 0: // top-left
        return 'top-[5%] left-[5%] md:top-[8%] md:left-[8%]';
      case 1: // top-right
        return 'top-[5%] right-[5%] md:top-[8%] md:right-[8%]';
      case 2: // bottom-left
        return 'bottom-[35%] left-[5%] md:bottom-[35%] md:left-[8%]';
      case 3: // bottom-right
        return 'bottom-[35%] right-[5%] md:bottom-[35%] md:right-[8%]';
      default:
        return '';
    }
  };

  const getTailClasses = () => {
    switch (position) {
      case 0: // top-left
        return 'after:bottom-[-12px] after:left-5 after:border-t-[12px] after:border-l-[12px] after:border-t-pink-200 after:border-l-transparent';
      case 1: // top-right
        return 'after:bottom-[-12px] after:right-5 after:border-t-[12px] after:border-r-[12px] after:border-t-pink-200 after:border-r-transparent';
      case 2: // bottom-left
        return 'after:bottom-[-12px] after:left-5 after:border-t-[12px] after:border-l-[12px] after:border-t-pink-200 after:border-l-transparent';
      case 3: // bottom-right
        return 'after:bottom-[-12px] after:right-5 after:border-t-[12px] after:border-r-[12px] after:border-t-pink-200 after:border-r-transparent';
      default:
        return '';
    }
  };

  const getAnimationDelay = () => {
    switch (position) {
      case 0 : return 'animate-[floatAnimation_3s_ease-in-out_infinite]';
      case 1 : return 'animate-[floatAnimation_3s_ease-in-out_infinite_0.5s]';
      case 2 : return 'animate-[floatAnimation_3s_ease-in-out_infinite_1s]';
      case 3 : return 'animate-[floatAnimation_3s_ease-in-out_infinite_1.5s]';
      default:
        return '';
    }
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'absolute bg-white/95 border-3 border-pink-200 rounded-2xl px-4 py-3 text-xs md:text-sm font-medium text-gray-800 cursor-pointer transition-all duration-300 font-sans text-center leading-tight backdrop-blur-md shadow-lg hover:shadow-xl whitespace-normal overflow-visible h-auto flex items-center justify-center break-words max-w-[180px] md:max-w-[220px] min-h-[60px] md:min-h-[70px] z-10',
        getPositionClasses(),
        getTailClasses(),
        getAnimationDelay(),
        'after:content-[""] after:absolute after:w-0 after:h-0 after:border-solid',
        isSelected && 'bg-gradient-to-br from-pink-400 to-red-500 text-white border-pink-400 scale-105',
        !isVisible && 'opacity-0 pointer-events-none',
        'hover:bg-pink-200/30 hover:border-pink-400 hover:scale-102'
      )}
      style={{
        animation: isVisible ? undefined : 'none'
      }}
    >
      {text}
    </button>
  );
};
