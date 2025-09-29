'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingBarProps {
  className?: string;
  progress?: number; // For determinate progress (0-100)
  indeterminate?: boolean;
}

export function LoadingBar({ className, progress, indeterminate = true }: LoadingBarProps) {
  if (indeterminate) {
    return (
      <div className={cn('absolute bottom-0 left-0 h-1 w-full bg-[#1E2424]/10 overflow-hidden', className)}>
        <div className="h-full bg-[#C5F547] animate-[indeterminate_2s_linear_infinite] w-1/3" />
      </div>
    );
  }

  return (
    <div className={cn('h-1 w-full bg-[#1E2424]/10 overflow-hidden', className)}>
      <div 
        className="h-full bg-[#C5F547] transition-all duration-300 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, progress || 0))}%` }}
      />
    </div>
  );
} 