/**
 * AssetCard Component
 *
 * This component displays a single content asset with modern styling,
 * gradients, and visual effects for a more engaging user experience.
 *
 * Located in: /components/content-assets/asset-card.tsx
 */
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, FileText, ListChecks, Image as ImageIcon } from 'lucide-react';
import React from 'react';

export type AssetType = 'guide' | 'hooks' | 'library';

export interface Asset {
  id: string;
  title: string;
  description: string;
  type: AssetType;
  className?: string;
}

const assetConfig: Record<AssetType, {
  icon: React.ReactNode;
  gradient: string;
  pattern: string;
  iconBg: string;
}> = {
  guide: {
    icon: <FileText className="w-8 h-8" />,
    gradient: 'linear-gradient(135deg, #374151 0%, #1f2937 100%)',
    pattern: 'bg-[radial-gradient(circle,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:20px_20px]',
    iconBg: 'bg-white/20 text-white'
  },
  hooks: {
    icon: <ListChecks className="w-8 h-8" />,
    gradient: 'linear-gradient(135deg, #4b5563 0%, #374151 100%)',
    pattern: 'bg-[radial-gradient(circle,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:20px_20px]',
    iconBg: 'bg-white/20 text-white'
  },
  library: {
    icon: <ImageIcon className="w-8 h-8" />,
    gradient: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
    pattern: 'bg-[radial-gradient(circle,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:20px_20px]',
    iconBg: 'bg-white/20 text-white'
  },
};

interface AssetCardProps {
  asset: Asset;
}

export function AssetCard({ asset }: AssetCardProps) {
  const config = assetConfig[asset.type];
  
  return (
    <Link href={`/dashboard/content-assets/${asset.id}`} className="block group h-full">
      <Card className="h-full border-0 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl relative overflow-hidden flex flex-col">
        {/* Main gradient background */}
        <div 
          className="absolute inset-0"
          style={{ background: config.gradient }}
        />
        
        {/* Dot pattern overlay */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)`,
            backgroundSize: '20px 20px'
          }}
        />
        
        {/* Subtle overlay for better text readability */}
        <div className="absolute inset-0 bg-black/10" />
        
        {/* Arrow icon in top right */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-0 translate-x-2 transition-all duration-300">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <ArrowRight className="w-4 h-4 text-white" />
          </div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col h-full text-white">
          <CardHeader className="relative text-white p-6">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${config.iconBg} backdrop-blur-sm`}>
              {config.icon}
            </div>
            <CardTitle className="text-2xl font-bold leading-tight">
              {asset.title}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="relative text-white/90 flex flex-col justify-between p-6 pt-0">
            <CardDescription className="text-white/80 text-base leading-relaxed mb-6">
              {asset.description}
            </CardDescription>
            
            <div className="flex justify-between items-center">
              <span className="text-white/90 text-sm font-medium">Explore Resource</span>
              <div className="text-white/90 text-sm font-medium">
                Available
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    </Link>
  );
} 