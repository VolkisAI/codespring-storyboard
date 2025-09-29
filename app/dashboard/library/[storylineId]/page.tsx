/**
 * Storyline Detail Page
 * 
 * This server-side page fetches the data for a specific storyline,
 * including its segments. It then passes this data to the client-side
 * LibraryDetailClient component to render the interactive view.
 * 
 * Located in: /app/dashboard/library/[storylineId]/page.tsx
 */
import React from 'react';
import { getStorylineById } from '@/db/queries/storyline-queries';
import { LibraryDetailClient } from '@/components/library/library-detail-client';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { StorylineSegment } from '@/db/schema/storyline-schema';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StorylineDetailPageProps {
  params: {
    storylineId: string;
  };
}

export default async function StorylineDetailPage({ params }: StorylineDetailPageProps) {
  const { userId } = auth();
  if (!userId) {
    redirect('/login');
  }
  
  const storyline = await getStorylineById(params.storylineId);

  if (!storyline || storyline.userId !== userId) {
    notFound();
  }

  // Ensure segments is an array
  const segments = Array.isArray(storyline.segments) ? storyline.segments : [];
  
  const storylineWithSegments = {
      ...storyline,
      segments: segments as StorylineSegment[],
  }

  return (
    <div className="flex h-full flex-col">
       <header className="flex items-center gap-4 border-b bg-muted/40 px-6 py-4">
        <Link href="/dashboard/library">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
            <h1 className="text-xl font-semibold">{storyline.name}</h1>
            <p className="text-sm text-muted-foreground">Review your generated images and videos.</p>
        </div>
      </header>
      <LibraryDetailClient storyline={storylineWithSegments} />
    </div>
  );
} 