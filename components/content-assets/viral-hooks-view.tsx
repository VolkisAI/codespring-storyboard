'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, FileText } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface Hook {
  category: string;
  hooks: string[];
}

interface ViralHooksViewProps {
  hooks: Hook[];
}

// Group categories by theme for better organization
const categoryGroups = [
  {
    title: "LIFESTYLE & PERSONAL",
    categories: ["Sports", "Self-Improvement", "Fashion / Beauty / Thrifting", "Home & DIY", "Outdoors / Hiking / Walking"]
  },
  {
    title: "BUSINESS & TECH",
    categories: ["Business / Entrepreneurship / Personal Finance", "AI", "World Economics"]
  },
  {
    title: "CREATIVE & CULTURE",
    categories: ["Photography / Cinematography", "Cooking", "Languages", "Comedy"]
  },
  {
    title: "KNOWLEDGE & STORIES",
    categories: ["World Politics", "Religion", "Ancient History", "Science & Space", "War Stories"]
  },
  {
    title: "ENTERTAINMENT",
    categories: ["Cars", "Scary Stories", "Bizarre & Weird Facts"]
  }
];

export function ViralHooksView({ hooks }: ViralHooksViewProps) {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>(hooks[0]?.category);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard!',
      description: 'The hook is ready to be pasted.',
    });
  };

  const selectedHooks = useMemo(() => {
    return hooks.find(h => h.category === selectedCategory)?.hooks || [];
  }, [selectedCategory, hooks]);

  const getHookCount = (category: string) => {
    return hooks.find(h => h.category === category)?.hooks.length || 0;
  };

  return (
    <div className="flex gap-8">
      {/* Left Sidebar Navigation */}
      <aside className="w-80 flex-shrink-0">
        <div className="sticky top-6 space-y-6">
          {categoryGroups.map((group) => (
            <div key={group.title}>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">
                {group.title}
              </h3>
              <div className="space-y-2">
                {group.categories.map((category) => {
                  const hookData = hooks.find(h => h.category === category);
                  if (!hookData) return null;
                  
                  const isSelected = selectedCategory === category;
                  return (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={cn(
                        "w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors",
                        isSelected
                          ? "bg-gray-200 dark:bg-gray-800"
                          : "hover:bg-gray-100 dark:hover:bg-gray-900"
                      )}
                    >
                      <div className="flex items-center min-w-0">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0",
                          isSelected 
                            ? "bg-green-100 dark:bg-green-900" 
                            : "bg-gray-100 dark:bg-gray-800"
                        )}>
                          <FileText className={cn(
                            "w-3 h-3",
                            isSelected 
                              ? "text-green-600 dark:text-green-400" 
                              : "text-gray-500 dark:text-gray-400"
                          )} />
                        </div>
                        <span className={cn(
                          "text-sm font-medium truncate",
                          isSelected 
                            ? "text-gray-900 dark:text-gray-100" 
                            : "text-gray-700 dark:text-gray-300"
                        )}>
                          {category}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">
                        {getHookCount(category)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {selectedCategory}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {selectedHooks.length} viral hooks ready to copy
          </p>
        </div>

        <div className="space-y-3">
          {selectedHooks.map((hook, index) => (
            <div
              key={index}
              className="group flex items-start gap-4 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-gray-300 dark:hover:border-gray-700 transition-colors"
            >
              <div className="flex-shrink-0 w-6 h-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-400 mt-0.5">
                {index + 1}
              </div>
              <p className="flex-1 text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                {hook}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(hook)}
                className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
              >
                <Copy className="h-4 w-4 mr-1" />
                Copy
              </Button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
} 