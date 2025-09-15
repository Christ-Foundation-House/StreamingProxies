'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'shimmer' | 'wave';
  speed?: 'slow' | 'normal' | 'fast';
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = 'default', speed = 'normal', ...props }, ref) => {
    const getAnimationClass = () => {
      const speedClasses = {
        slow: 'animate-pulse [animation-duration:2s]',
        normal: 'animate-pulse',
        fast: 'animate-pulse [animation-duration:1s]'
      };

      switch (variant) {
        case 'shimmer':
          return cn(
            'relative overflow-hidden bg-gray-200 dark:bg-gray-700',
            'before:absolute before:inset-0 before:-translate-x-full',
            'before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent',
            'before:animate-[shimmer_2s_infinite]',
            speedClasses[speed]
          );
        case 'wave':
          return cn(
            'bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700',
            'bg-[length:200%_100%] animate-[wave_1.5s_ease-in-out_infinite]'
          );
        default:
          return cn('bg-gray-200 dark:bg-gray-700', speedClasses[speed]);
      }
    };

    return (
      <div
        ref={ref}
        className={cn('rounded-md', getAnimationClass(), className)}
        {...props}
      />
    );
  }
);
Skeleton.displayName = 'Skeleton';

export default Skeleton;
export { Skeleton };
