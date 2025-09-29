/**
 * DashboardHeader Component
 * 
 * This component displays the header for the main dashboard page.
 * It includes a personalized greeting and action buttons to navigate
 * to key sections of the application, such as the storyline generator
 * and the content library.
 * 
 * Located in: /components/dashboard/DashboardHeader.tsx
 */
'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusCircle, BookImage } from 'lucide-react';

interface DashboardHeaderProps {
  userName: string | null;
}

export function DashboardHeader({ userName }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Hello, {userName || 'Creator'}!
        </h1>
        <p className="mt-1 text-muted-foreground">
          Welcome back, here&apos;s a look at your creative impact.
        </p>
      </div>
      <div className="flex items-center gap-2 mt-4 sm:mt-0">
        <Button asChild>
          <Link href="/dashboard/storyline">
            <PlusCircle className="mr-2 h-4 w-4" />
            Generate Storyline
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/dashboard/library">
            <BookImage className="mr-2 h-4 w-4" />
            My Library
          </Link>
        </Button>
      </div>
    </div>
  );
} 