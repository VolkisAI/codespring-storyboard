/**
 * StorylineCard Component
 * 
 * This component displays a preview of a single storyline in a grid layout.
 * It shows the storyline's name and a thumbnail image. Clicking on the card
 * navigates to the detailed view of that storyline.
 * 
 * Located in: /components/library/storyline-card.tsx
 */
'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SelectStoryline } from '@/db/schema/storyline-schema';
import { formatDistanceToNow } from 'date-fns';
import { Film, Trash2, ImageIcon, VideoIcon, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { deleteStorylineAction } from '@/actions/storyline/storyline-storage-actions';
import { toast } from '../storyline/Toast';

interface StorylineCardProps {
  storyline: SelectStoryline;
}

export function StorylineCard({ storyline }: StorylineCardProps) {
  const [isDeleting, startTransition] = useTransition();
  const imageUrls = (storyline.generatedImageUrls as string[]) || [];
  const videoUrls = (storyline.generatedVideoUrls as string[]) || [];
  const firstImage = imageUrls[0];

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteStorylineAction(storyline.id);
      if (result.isSuccess) {
        toast.success('Storyline deleted successfully!');
      } else {
        toast.error('Failed to delete storyline.', result.message);
      }
    });
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-all hover:shadow-lg">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-3 right-3 z-10 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 text-white hover:bg-red-600 hover:text-white"
            aria-label="Delete storyline"
          >
            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your storyline
              and all associated images and videos from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : 'Continue'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Link href={`/dashboard/library/${storyline.id}`} className="flex flex-col h-full">
        <div className="relative aspect-[9/16] w-full overflow-hidden">
          {firstImage ? (
            <Image
              src={firstImage}
              alt={storyline.name}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <Film className="h-10 w-10 text-muted-foreground" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>

        <div className="flex flex-1 flex-col p-4">
          <h3 className="flex-grow font-semibold leading-tight truncate">{storyline.name}</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(storyline.createdAt), { addSuffix: true })}
          </p>
          <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <ImageIcon className="h-4 w-4" />
              <span>{imageUrls.length}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <VideoIcon className="h-4 w-4" />
              <span>{videoUrls.length}</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
} 