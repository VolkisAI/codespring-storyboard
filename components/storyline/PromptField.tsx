'use client';

import React, { useState, forwardRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { visualStyles } from '@/config/visual-styles';

interface PromptFieldProps {
  segmentId: string;
  initialPrompt?: string;
  initialStyle?: string;
  isGenerating?: boolean;
  isSelected?: boolean;
  onPromptChange: (segmentId: string, prompt: string) => void;
  onStyleChange: (segmentId: string, style: string) => void;
  className?: string;
}

export const PromptField = forwardRef<HTMLDivElement, PromptFieldProps>(
  ({ 
    segmentId, 
    initialPrompt = '', 
    initialStyle = 'realistic',
    isGenerating = false,
    isSelected = false,
    onPromptChange, 
    onStyleChange,
    className,
  }, ref) => {
    const [prompt, setPrompt] = useState(initialPrompt);
    const [style, setStyle] = useState(initialStyle);

    const handlePromptChange = (value: string) => {
      setPrompt(value);
      onPromptChange(segmentId, value);
    };

    const handleStyleChange = (value: string) => {
      setStyle(value);
      onStyleChange(segmentId, value);
    };

    return (
      <div 
        ref={ref}
        className={cn(
          'relative border rounded-xl p-4 mb-3 transition-all duration-300',
          isSelected ? 'border-[#C5F547] bg-[#C5F547]/10' : 'border-[#1E2424]/10 bg-white',
          'hover:border-[#C5F547]',
          isGenerating && 'opacity-50',
          className
        )}
      >
        {isGenerating && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-xl z-10">
            <div className="flex items-center gap-2 text-[#1E2424]">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm font-medium">Generating image...</span>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <Textarea
            value={prompt}
            onChange={(e) => handlePromptChange(e.target.value)}
            placeholder="Describe the visual you want for this segment..."
            className="resize-none border-0 p-0 focus:ring-0 text-sm text-[#1E2424] placeholder:text-[#1E2424]/50"
            rows={2}
            disabled={isGenerating}
          />

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#1E2424]/60 font-medium">Style:</span>
            <Select value={style} onValueChange={handleStyleChange} disabled={isGenerating}>
              <SelectTrigger className="h-8 w-auto min-w-[6rem] text-xs border-[#1E2424]/20 hover:border-[#C5F547]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(visualStyles).map(([key, { name }]) => (
                  <SelectItem key={key} value={key}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    );
  }
);

PromptField.displayName = 'PromptField'; 