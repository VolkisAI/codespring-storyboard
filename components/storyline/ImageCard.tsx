'use client';

import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { RefreshCw, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageCardProps {
  id: string;
  imageUrl: string;
  segmentId: string;
  isSelected?: boolean;
  onRegenerate: (imageId: string) => void;
  onSelect: (imageId: string, selected: boolean) => void;
}

export function ImageCard({ 
  id, 
  imageUrl, 
  segmentId, 
  isSelected = false, 
  onRegenerate, 
  onSelect 
}: ImageCardProps) {
  return (
    <div className="relative group rounded-2xl overflow-hidden shadow-sm bg-white">
      <div className="relative">
        <Image
          src={imageUrl}
          alt={`Generated image for segment ${segmentId}`}
          width={250}
          height={140}
          className="object-cover w-full h-[140px]"
        />
        
        {isSelected && (
          <div className="absolute top-2 right-2 w-6 h-6 bg-[#C5F547] rounded-full flex items-center justify-center">
            <Check className="w-4 h-4 text-[#1E2424]" />
          </div>
        )}
      </div>

      <div className="absolute inset-0 bg-[#1E2424]/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-4 transition-opacity duration-200">
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onRegenerate(id);
          }}
          className="text-white hover:text-white hover:bg-white/20 rounded-xl"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Regenerate
        </Button>
        
        <Button
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(id, !isSelected);
          }}
          className={cn(
            'rounded-xl',
            isSelected 
              ? 'bg-white text-[#1E2424] hover:bg-white/90' 
              : 'bg-[#C5F547] text-[#1E2424] hover:bg-[#C5F547]/90'
          )}
        >
          {isSelected ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Selected
            </>
          ) : (
            'Select'
          )}
        </Button>
      </div>

      <div className="absolute bottom-2 left-2 bg-[#1E2424]/80 text-white text-xs px-2 py-1 rounded-md">
        {segmentId}
      </div>
    </div>
  );
} 