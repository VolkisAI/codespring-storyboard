/**
 * Dashboard page for Template App
 * Displays the main dashboard interface for authenticated users
 * Features a sidebar navigation and content area
 * Requires a paid membership to access
 */
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getStorylinesByUserId } from '@/db/queries/storyline-queries';
import { getProfileByUserId } from '@/db/queries/profiles-queries';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { StatCard } from '@/components/dashboard/StatCard';
import { RecentStorylinesTable } from '@/components/dashboard/RecentStorylinesTable';
import { Film, ImageIcon, VideoIcon, Clock, Zap, Star } from 'lucide-react';

/**
 * Main dashboard page component
 * The profile is provided by the parent layout component
 */
export default async function DashboardPage() {
  const user = await currentUser();
  if (!user) {
    redirect('/login');
  }

  const [profile, storylines] = await Promise.all([
    getProfileByUserId(user.id),
    getStorylinesByUserId(user.id)
  ]);

  const userName = user?.firstName || user?.emailAddresses[0]?.emailAddress.split('@')[0] || null;

  const storylineCount = storylines.length;
  
  const imageCount = storylines.reduce((acc, s) => {
    const images = s.generatedImageUrls as string[] | null;
    return acc + (images ? images.length : 0);
  }, 0);

  const videoCount = storylines.reduce((acc, s) => {
    const videos = s.generatedVideoUrls as string[] | null;
    return acc + (videos ? videos.length : 0);
  }, 0);
  
  const timeSaved = storylineCount * 2; // Rough estimate: 2 hours saved per storyline

  const creditsUsed = profile?.usedCredits ?? 0;
  const totalCredits = profile?.usageCredits ?? 5; // Default to free plan credits (5)
  const creditsLeft = totalCredits - creditsUsed;

  return (
    <main className="p-6 md:p-10">
      <DashboardHeader userName={userName} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Storylines Created"
          value={storylineCount}
          icon={<Film />}
          iconColor="text-[#C5F547]"
        />
        <StatCard
          title="Images Generated"
          value={imageCount}
          icon={<ImageIcon />}
          iconColor="text-blue-500"
        />
        <StatCard
          title="Videos Generated"
          value={videoCount}
          icon={<VideoIcon />}
          iconColor="text-purple-500"
        />
        <StatCard
          title="Hours Saved"
          value={`~${timeSaved}`}
          icon={<Clock />}
          iconColor="text-yellow-500"
          footer="Est. 2 hours per storyline"
        />
        <StatCard
          title="Credits Used"
          value={creditsUsed}
          icon={<Zap />}
          iconColor="text-red-500"
          footer={`out of ${totalCredits} this cycle`}
        />
        <StatCard
          title="Credits Remaining"
          value={creditsLeft}
          icon={<Star />}
          iconColor="text-teal-500"
          footer={profile?.nextCreditRenewal 
            ? `Resets ${new Date(profile.nextCreditRenewal).toLocaleDateString()}`
            : 'Renews next month'}
        />
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold tracking-tight mb-4">Recent Activity</h2>
        <RecentStorylinesTable storylines={storylines} />
      </div>
    </main>
  );
} 