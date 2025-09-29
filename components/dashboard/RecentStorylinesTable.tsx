/**
 * RecentStorylinesTable Component
 *
 * This component displays a table of the user's most recent storylines.
 * Each row is a link to the specific storyline's detail page. It shows
 * a thumbnail, name, status, and creation date for each storyline.
 *
 * Located in: /components/dashboard/RecentStorylinesTable.tsx
 */
'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Film } from 'lucide-react';
import { SelectStoryline } from '@/db/schema/storyline-schema';
import { format } from 'date-fns';

interface RecentStorylinesTableProps {
  storylines: SelectStoryline[];
}

const statusVariant = {
  completed: 'default',
  processing: 'secondary',
  failed: 'destructive',
} as const;

export function RecentStorylinesTable({ storylines }: RecentStorylinesTableProps) {
  const router = useRouter();

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px] hidden sm:table-cell"></TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden md:table-cell">Date</TableHead>
            <TableHead className="text-right">Media</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {storylines.slice(0, 5).map((storyline) => {
            const imageUrls = storyline.generatedImageUrls as string[] | null;
            const videoUrls = storyline.generatedVideoUrls as string[] | null;
            const firstImage = imageUrls?.[0];

            return (
              <TableRow 
                key={storyline.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => router.push(`/dashboard/library/${storyline.id}`)}
              >
                <TableCell className="hidden sm:table-cell">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted/40 overflow-hidden">
                    {firstImage ? (
                      <Image
                        src={firstImage}
                        alt={storyline.name}
                        width={48}
                        height={48}
                        className="object-cover h-full w-full"
                      />
                    ) : (
                      <Film className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{storyline.name}</div>
                  <div className="text-sm text-muted-foreground md:hidden">
                    {format(new Date(storyline.createdAt), 'MMM d, yyyy')}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant[storyline.status as keyof typeof statusVariant] || 'default'}>
                    {storyline.status}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {format(new Date(storyline.createdAt), 'PP')}
                </TableCell>
                <TableCell className="text-right">
                  {imageUrls?.length || 0} Images / {videoUrls?.length || 0} Videos
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
       {storylines.length === 0 && (
        <div className="text-center p-8 text-muted-foreground">
          You haven&apos;t created any storylines yet.
        </div>
      )}
    </Card>
  );
} 