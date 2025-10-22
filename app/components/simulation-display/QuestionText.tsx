'use client';

import React from 'react';
import { cn } from '@/app/lib/utils/cn';

interface QuestionTextProps {
  text: string;
  isVisible: boolean;
}

export const QuestionText: React.FC<QuestionTextProps> = ({ text, isVisible }) => {
  return (
    <div
      className={cn(
        'absolute bottom-0 left-0 right-0 z-30 w-full',
        !isVisible && 'opacity-0 pointer-events-none'
      )}
    >
      <div className="mx-auto max-w-3xl px-5 pb-6">
        <div className="relative rounded-2xl bg-black/75 backdrop-blur-md px-6 py-5 md:px-8 md:py-6 shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
          {/* グラデボーダー */}
          <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/10" />
          <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-r from-pink-500/20 via-fuchsia-500/20 to-purple-600/20 blur-[18px]" />
          <p className="relative text-white text-lg md:text-2xl font-semibold leading-relaxed md:leading-9 tracking-[0.01em]">
            {text}
          </p>
        </div>
      </div>
    </div>
  );
};
