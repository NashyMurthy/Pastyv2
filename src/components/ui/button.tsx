import React from 'react';
import { cn } from '../../lib/utils';

// variants for when you can't decide what color you want
const variants = {
  default: 'bg-gradient-to-r from-purple-400 to-pink-600 text-white hover:opacity-90',
  outline: 'border border-gray-300 text-gray-300 hover:bg-gray-800',
  ghost: 'text-gray-300 hover:bg-gray-800',
};

// sizes for when you can't decide how big you want it
const sizes = {
  default: 'px-4 py-2',
  sm: 'px-3 py-1.5 text-sm',
  lg: 'px-6 py-3 text-lg',
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  isLoading?: boolean;
}

// a button component that's probably better than anything you've written
export const Button: React.FC<ButtonProps> = ({
  className,
  variant = 'default',
  size = 'default',
  isLoading = false,
  children,
  disabled,
  ...props
}) => {
  return (
    <button
      className={cn(
        'rounded-md font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        children
      )}
    </button>
  );
}; 