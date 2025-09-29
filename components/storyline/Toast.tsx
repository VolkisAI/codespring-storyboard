'use client';

import React from 'react';
import { toast as sonnerToast } from 'sonner';
import { CheckCircle, XCircle, Info, AlertTriangle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  type: ToastType;
  title: string;
  description?: string;
}

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

export function showToast({ type, title, description }: ToastProps) {
  const Icon = iconMap[type];
  
  sonnerToast.custom((t) => (
    <div className="flex items-start gap-3 bg-[#1E2424] text-white p-4 rounded-2xl shadow-lg border-l-4 border-[#C5F547] max-w-md">
      <Icon className="w-5 h-5 mt-0.5 text-[#C5F547] flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{title}</p>
        {description && (
          <p className="text-xs text-white/70 mt-1">{description}</p>
        )}
      </div>
    </div>
  ), {
    duration: type === 'error' ? 5000 : 3000,
  });
}

// Convenience functions
export const toast = {
  success: (title: string, description?: string) => 
    showToast({ type: 'success', title, description }),
  error: (title: string, description?: string) => 
    showToast({ type: 'error', title, description }),
  info: (title: string, description?: string) => 
    showToast({ type: 'info', title, description }),
  warning: (title: string, description?: string) => 
    showToast({ type: 'warning', title, description }),
};

export { Toaster } from 'sonner'; 