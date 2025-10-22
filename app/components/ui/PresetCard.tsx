import React from 'react';
import { cn } from '../../lib/utils/cn';

export interface PresetData {
  id: string;
  emoji: string;
  title: string;
  description: string;
  color: 'blue' | 'pink' | 'purple' | 'green' | 'red' | 'yellow' | 'indigo' | 'teal' | 'orange' | 'cyan';
}

interface PresetCardProps {
  preset: PresetData;
  onClick: (presetId: string) => void;
  variant?: 'mobile' | 'desktop';
  className?: string;
  disabled?: boolean;
}

export const PresetCard: React.FC<PresetCardProps> = ({
  preset,
  onClick,
  variant = 'desktop',
  className,
  disabled = false
}) => {
  const colorClasses = {
    blue: 'hover:border-blue-400 hover:bg-blue-50',
    pink: 'hover:border-pink-400 hover:bg-pink-50',
    purple: 'hover:border-purple-400 hover:bg-purple-50',
    green: 'hover:border-green-400 hover:bg-green-50',
    red: 'hover:border-red-400 hover:bg-red-50',
    yellow: 'hover:border-yellow-400 hover:bg-yellow-50',
    indigo: 'hover:border-indigo-400 hover:bg-indigo-50',
    teal: 'hover:border-teal-400 hover:bg-teal-50',
    orange: 'hover:border-orange-400 hover:bg-orange-50',
    cyan: 'hover:border-cyan-400 hover:bg-cyan-50'
  };

  const buttonColors = {
    blue: 'bg-blue-500 hover:bg-blue-600',
    pink: 'bg-pink-500 hover:bg-pink-600',
    purple: 'bg-purple-500 hover:bg-purple-600',
    green: 'bg-green-500 hover:bg-green-600',
    red: 'bg-red-500 hover:bg-red-600',
    yellow: 'bg-yellow-500 hover:bg-yellow-600',
    indigo: 'bg-indigo-500 hover:bg-indigo-600',
    teal: 'bg-teal-500 hover:bg-teal-600',
    orange: 'bg-orange-500 hover:bg-orange-600',
    cyan: 'bg-cyan-500 hover:bg-cyan-600'
  };

  if (variant === 'mobile') {
    return (
      <div className={cn(
        "flex-shrink-0 w-48 border-2 border-gray-200 rounded-xl p-3 transition-all",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
        !disabled && colorClasses[preset.color],
        className
      )} onClick={disabled ? undefined : () => onClick(preset.id)}>
        <div className="text-center mb-2">
          <div className="text-2xl mb-1">{preset.emoji}</div>
          <h3 className="font-bold text-gray-800 text-sm">{preset.title}</h3>
        </div>
        <div className="text-xs text-gray-600 space-y-1">
          {preset.description.split('\n').map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </div>
        <button 
          type="button" 
          disabled={disabled}
          className={cn(
            "w-full mt-2 px-3 py-1.5 text-white rounded-lg transition-colors text-xs",
            disabled ? "bg-gray-400 cursor-not-allowed" : buttonColors[preset.color]
          )}
        >
          選択
        </button>
      </div>
    );
  }

  return (
    <div className={cn(
      "border-2 border-gray-200 rounded-xl p-4 transition-all",
      disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
      !disabled && colorClasses[preset.color],
      className
    )} onClick={disabled ? undefined : () => onClick(preset.id)}>
      <div className="text-center mb-3">
        <div className="text-3xl mb-2">{preset.emoji}</div>
        <h3 className="font-bold text-gray-800">{preset.title}</h3>
      </div>
      <div className="text-sm text-gray-600 space-y-1">
        {preset.description.split('\n').map((line, index) => (
          <p key={index}>{line}</p>
        ))}
      </div>
      <button 
        type="button" 
        disabled={disabled}
        className={cn(
          "w-full mt-3 px-4 py-2 text-white rounded-lg transition-colors text-sm",
          disabled ? "bg-gray-400 cursor-not-allowed" : buttonColors[preset.color]
        )}
      >
        選択
      </button>
    </div>
  );
};
