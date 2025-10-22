'use client';

import React from 'react';
import { Button } from '../ui/Button';

interface SelectedAnswerProps {
  answer: string;
}

export const SelectedAnswer: React.FC<SelectedAnswerProps> = ({ 
  answer
}) => {
  return (
    <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 bg-white/95 border-3 border-pink-200 rounded-2xl p-5 text-base font-medium text-gray-800 text-center leading-relaxed backdrop-blur-md shadow-lg z-30 max-w-4/5 animate-[heartbeatPulse_1.5s_ease-in-out_infinite]">
      <div>
        <p className="text-lg font-semibold text-pink-600 mb-2">あなたの選択</p>
        <p className="text-gray-800">{answer}</p>
      </div>
    </div>
  );
};
