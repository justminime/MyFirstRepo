import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export function Card({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('rounded-xl border border-gray-100 bg-white p-4 shadow-md dark:border-gray-700 dark:bg-gray-800', className)}
      {...props}
    >
      {children}
    </div>
  );
}
