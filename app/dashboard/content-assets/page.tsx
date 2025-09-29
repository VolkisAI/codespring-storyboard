/**
 * Content Assets Page
 *
 * This page displays a grid of available content assets with modern styling,
 * such as downloadable guides, hooks, and media libraries.
 *
 * Located in: /app/dashboard/content-assets/page.tsx
 */
import { AssetGrid } from "@/components/content-assets/asset-grid";
import { Asset } from "@/components/content-assets/asset-card";
import { Package } from "lucide-react";

const assets: Asset[] = [
  {
    id: 'ugc-brand-outreach-guide',
    title: "UGC Brand Outreach Guide",
    description: "A step-by-step playbook for landing paid deals with your favorite brands.",
    type: 'guide',
  },
  {
    id: '500-viral-hooks',
    title: "500 Viral Hooks",
    description: "A massive swipe file of scroll-stopping hooks you can adapt for any niche.",
    type: 'hooks',
  },
  {
    id: 'ai-broll-library',
    title: "AI B-Roll Library",
    description: "A collection of 40 high-quality, AI-generated b-roll videos for your projects.",
    type: 'library',
  },
];

export default function ContentAssetsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.05),transparent_50%),radial-gradient(circle_at_80%_20%,rgba(255,119,198,0.05),transparent_50%),radial-gradient(circle_at_40%_40%,rgba(120,219,255,0.05),transparent_50%)]" />
      
      <div className="relative z-10 p-6 lg:p-8">
        {/* Header Section */}
        <div className="mb-12 text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold tracking-tight bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-gray-100 dark:via-gray-200 dark:to-gray-100 bg-clip-text text-transparent">
                Content Assets
              </h1>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-lg lg:text-xl max-w-3xl mx-auto lg:mx-0 leading-relaxed">
            A collection of guides, resources, and tools to accelerate your content creation.
          </p>
        </div>

        {/* Assets Grid */}
        <AssetGrid assets={assets} />
      </div>
    </div>
  );
} 