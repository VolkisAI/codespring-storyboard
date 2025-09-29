/**
 * AI B-Roll Library View Component
 * 
 * This component displays a collection of AI-generated B-roll images organized
 * by categories with search and download functionality.
 * 
 * Located in: /components/content-assets/ai-broll-library-view.tsx
 */
'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Download, Search, Image as ImageIcon, Grid3X3, List } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import Image from 'next/image';
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface BRollImage {
  id: string;
  title: string;
  category: string;
  tags: string[];
  url: string;
  downloadUrl: string;
  aspectRatio: 'landscape' | 'portrait' | 'square';
}

interface AIBRollLibraryViewProps {
  images: BRollImage[];
}

// Mock data for demonstration - in a real app this would come from props or API
const mockImages: BRollImage[] = [
  {
    id: '1',
    title: 'Modern Office Space',
    category: 'Business',
    tags: ['office', 'workspace', 'modern', 'productivity'],
    url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop',
    downloadUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&h=1080&fit=crop',
    aspectRatio: 'landscape'
  },
  {
    id: '2',
    title: 'City Skyline at Night',
    category: 'Urban',
    tags: ['city', 'skyline', 'night', 'lights', 'urban'],
    url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&h=600&fit=crop',
    downloadUrl: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1920&h=1080&fit=crop',
    aspectRatio: 'landscape'
  },
  {
    id: '3',
    title: 'Abstract Technology',
    category: 'Technology',
    tags: ['technology', 'abstract', 'digital', 'futuristic'],
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop',
    downloadUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1920&h=1080&fit=crop',
    aspectRatio: 'landscape'
  },
  {
    id: '4',
    title: 'Nature Landscape',
    category: 'Nature',
    tags: ['nature', 'landscape', 'mountains', 'scenic'],
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    downloadUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop',
    aspectRatio: 'landscape'
  },
  {
    id: '5',
    title: 'Creative Workspace',
    category: 'Creative',
    tags: ['creative', 'design', 'workspace', 'inspiration'],
    url: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=600&fit=crop',
    downloadUrl: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1920&h=1080&fit=crop',
    aspectRatio: 'landscape'
  },
  {
    id: '6',
    title: 'Food Photography',
    category: 'Lifestyle',
    tags: ['food', 'lifestyle', 'photography', 'delicious'],
    url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop',
    downloadUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=1920&h=1080&fit=crop',
    aspectRatio: 'square'
  },
  // Add more mock images...
];

const categories = ['All', 'Business', 'Technology', 'Nature', 'Urban', 'Creative', 'Lifestyle'];

export function AIBRollLibraryView({ images = mockImages }: AIBRollLibraryViewProps) {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredImages = useMemo(() => {
    let filtered = images;

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(img => img.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(img => 
        img.title.toLowerCase().includes(query) ||
        img.tags.some(tag => tag.toLowerCase().includes(query)) ||
        img.category.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [images, selectedCategory, searchQuery]);

  const handleDownload = (image: BRollImage) => {
    // In a real app, this would trigger an actual download
    const link = document.createElement('a');
    link.href = image.downloadUrl;
    link.download = `${image.title.replace(/\s+/g, '_')}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: 'Download started!',
      description: `${image.title} is being downloaded.`,
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header with Search and Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search images by title, tags, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="text-xs"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Results Count */}
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Showing {filteredImages.length} of {images.length} images
        </div>
      </div>

      {/* Image Gallery */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredImages.map((image) => (
            <div
              key={image.id}
              className="group bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="relative aspect-video overflow-hidden">
                <Image
                  src={image.url}
                  alt={image.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleDownload(image)}
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2 line-clamp-1">
                  {image.title}
                </h3>
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="secondary" className="text-xs">
                    {image.category}
                  </Badge>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {image.aspectRatio}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {image.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                  {image.tags.length > 3 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      +{image.tags.length - 3}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredImages.map((image) => (
            <div
              key={image.id}
              className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex gap-4">
                <div className="relative w-24 h-18 flex-shrink-0 overflow-hidden rounded">
                  <Image
                    src={image.url}
                    alt={image.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                        {image.title}
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="text-xs">
                          {image.category}
                        </Badge>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {image.aspectRatio}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {image.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(image)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredImages.length === 0 && (
        <div className="text-center py-12">
          <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No images found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try adjusting your search terms or category filter.
          </p>
        </div>
      )}
    </div>
  );
} 