import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  helperText?: string;
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, helperText, error, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1 w-full text-left">
        <label className="text-sm font-bold text-gray-700">{label}</label>
        <input
          ref={ref}
          className={`px-4 py-3 min-h-[44px] rounded-xl border-2 transition-all focus:outline-none focus:ring-4 focus:ring-primary-500/20 disabled:cursor-not-allowed disabled:opacity-50 ${
            error 
              ? 'border-red-500 focus:border-red-500' 
              : 'border-gray-200 focus:border-primary-500'
          } ${className}`}
          aria-invalid={error ? 'true' : 'false'}
          {...(props as any)}
        />
        {helperText && (
          <p className={`text-xs ${error ? 'text-red-500' : 'text-gray-500'} font-medium`}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';
