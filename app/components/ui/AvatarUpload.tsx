import React, { useState, useRef } from 'react';
import { cn } from '../../lib/utils/cn';

interface AvatarUploadProps {
  defaultEmoji: string;
  onImageChange?: (file: File | null) => void;
  size?: 'sm' | 'md' | 'lg';
  showPremium?: boolean;
  className?: string;
  disabled?: boolean;
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({
  defaultEmoji,
  onImageChange,
  size = 'md',
  showPremium = false,
  className,
  disabled = false
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'w-16 h-16 text-xl',
    md: 'w-24 h-24 text-3xl',
    lg: 'w-32 h-32 text-4xl'
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImageUrl(result);
        onImageChange?.(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleRemove = () => {
    setImageUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onImageChange?.(null);
  };

  return (
    <div className={cn("relative inline-block", className)}>
      <div
        className={cn(
          "rounded-full transition-transform",
          disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:scale-105",
          sizeClasses[size],
          imageUrl 
            ? "bg-cover bg-center" 
            : "bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white"
        )}
        style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : {}}
        onClick={handleClick}
      >
        {!imageUrl && defaultEmoji}
      </div>
      
      {showPremium && (
        <>
          <div className="absolute -top-2 -right-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">
            Premium
          </div>
          <button
            type="button"
            className="absolute -bottom-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:from-yellow-500 hover:to-orange-600 transition-all shadow-lg"
            onClick={(e) => {
              e.stopPropagation();
              // Premium機能の説明を表示する処理
            }}
          >
            💎
          </button>
        </>
      )}

      {imageUrl && !disabled && (
        <button
          type="button"
          onClick={handleRemove}
          className="absolute -top-2 -left-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors text-xs"
        >
          ×
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        disabled={disabled}
        className="hidden"
      />
    </div>
  );
};
