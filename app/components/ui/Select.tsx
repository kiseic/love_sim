import React from 'react';
import { cn } from '../../lib/utils/cn';
import { ChevronDown } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  options: SelectOption[];
  error?: string;
  icon?: React.ReactNode;
  placeholder?: string;
  showEmptyOption?: boolean;
  onValueChange?: (value: string) => void;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, className, icon, placeholder = "選択してください", showEmptyOption = false, onValueChange, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {icon}
            </div>
          )}
          <select
            ref={ref}
            className={cn(
              'w-full px-4 py-3 border border-gray-300 rounded-xl',
              'focus:ring-2 focus:ring-blue-500 focus:border-transparent',
              'input-focus transition-all',
              'bg-background text-foreground shadow-sm',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'placeholder:text-muted-foreground',
              'appearance-none',
              icon && 'pl-10',
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
              className
            )}
            onChange={(e) => {
              onValueChange?.(e.target.value);
            }}
            {...props}
          >
            {showEmptyOption && (
              <option value="" className="text-muted-foreground">
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>
        {error && (
          <div className="mt-1 p-2 bg-red-50 border border-red-200 text-sm text-red-600">
            {error}
          </div>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';