import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
}

export function Button({ variant = 'primary', className, children, disabled, ...props }: Props) {
  return (
    <button
      disabled={disabled}
      aria-disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-all',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
        'disabled:pointer-events-none disabled:opacity-50',
        variant === 'primary' && 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700',
        variant === 'secondary' && 'border border-blue-300 bg-white text-blue-600 hover:bg-blue-50 active:bg-blue-100 dark:border-blue-500 dark:bg-gray-800 dark:text-blue-400 dark:hover:bg-gray-700 dark:active:bg-gray-600',
        variant === 'ghost' && 'text-gray-600 hover:bg-gray-100 active:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-800 dark:active:bg-gray-700',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
