'use client';

import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PrimaryButtonProps extends ButtonProps {
  children: React.ReactNode;
}

export function PrimaryButton({ children, className, ...props }: PrimaryButtonProps) {
  return (
    <Button
      className={cn(
        'bg-[#C5F547] text-[#1E2424] hover:bg-[#C5F547]/90 hover:shadow-[0_0_0_3px_rgba(197,245,71,0.4)] transition-all duration-200 font-medium rounded-2xl px-6 py-3 h-auto',
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
} 