'use client';

import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface TranscriptSegment {
  id: string;
  text: string;
  timestamp: string;
  isSelected: boolean;
}

interface TranscriptCardProps {
  segment: TranscriptSegment;
  onSelect: (id: string, selected: boolean) => void;
  onClick: () => void;
}

export function TranscriptCard({ segment, onSelect, onClick }: TranscriptCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-start gap-3 px-4 py-3 rounded-xl mb-3 border border-[#1E2424]/10 bg-white cursor-pointer transition-all duration-200 hover:border-[#C5F547] hover:shadow-sm',
        segment.isSelected && 'border-[#C5F547] bg-[#C5F547]/5'
      )}
    >
      <Checkbox
        checked={segment.isSelected}
        onCheckedChange={(checked) => onSelect(segment.id, !!checked)}
        className="mt-1 flex-shrink-0"
        onClick={(e) => e.stopPropagation()}
      />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-[#C5F547] bg-[#C5F547]/10 px-2 py-1 rounded-md">
            {segment.timestamp}
          </span>
        </div>
        
        <p className="text-sm text-[#1E2424] leading-relaxed">
          {segment.text}
        </p>
      </div>
    </div>
  );
} 