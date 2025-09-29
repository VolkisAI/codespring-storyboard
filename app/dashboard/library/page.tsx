/**
 * Library Page
 * 
 * This page displays a grid of all storylines created by the current user.
 * It fetches storyline data and renders a StorylineCard for each one.
 * 
 * Located in: /app/dashboard/library/page.tsx
 */
import React from 'react';
import { getStorylinesByUserId } from '@/db/queries/storyline-queries';
import { auth } from '@clerk/nextjs/server';
import { StorylineCard } from '@/components/library/storyline-card';
import { redirect } from 'next/navigation';

export default async function LibraryPage() {
  const { userId } = auth();
  if (!userId) {
    redirect('/login');
  }

  const storylines = await getStorylinesByUserId(userId);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">My Library</h1>
        <p className="text-muted-foreground">
          Browse and manage your previously generated storylines.
        </p>
      </div>

      {storylines.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
          {storylines.map((storyline) => (
            <StorylineCard key={storyline.id} storyline={storyline} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 py-24 text-center">
          <h3 className="text-xl font-semibold">No storylines found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            You haven&apos;t created any storylines yet. Get started by generating one!
          </p>
        </div>
      )}
    </div>
  );
} 