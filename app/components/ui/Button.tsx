import React from 'react';
import { cn } from '@/app/lib/utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  children: React.ReactNode;
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'md',
  className,
  children,
  isLoading = false,
  disabled,
  ...props
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
  
  const variantStyles = {
    primary: 'bg-primary text-primary-foreground border-2 border-primary shadow-md focus-visible:ring-primary',
    secondary: 'bg-secondary text-secondary-foreground border-2 border-secondary shadow-sm focus-visible:ring-secondary',
    outline: 'border-2 border-border bg-background focus-visible:ring-border',
    ghost: 'focus-visible:ring-muted',
    destructive: 'bg-red-500 text-white border-2 border-red-500 shadow-sm focus-visible:ring-red-500'
  };
  
  const sizeStyles = {
    sm: 'h-8 px-3 text-sm gap-1.5',
    md: 'h-10 px-4 text-base gap-2',
    lg: 'h-14 px-6 text-lg gap-2',
    icon: 'h-10 w-10'
  };
  
  return (
    <button
      ref={ref}
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          {size !== 'icon' && <span>読み込み中...</span>}
        </>
      ) : (
        children
      )}
    </button>
  );
});

Button.displayName = 'Button';