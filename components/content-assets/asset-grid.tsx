/**
 * AssetGrid Component
 *
 * This component arranges AssetCard components in a responsive grid with
 * modern spacing and layout for an engaging user experience.
 *
 * Located in: /components/content-assets/asset-grid.tsx
 */
'use client';

import { Asset, AssetCard } from './asset-card';

interface AssetGridProps {
  assets: Asset[];
}

export function AssetGrid({ assets }: AssetGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 lg:gap-10">
      {assets.map((asset, index) => (
        <div
          key={asset.id}
          className="transform transition-all duration-300"
          style={{
            animationDelay: `${index * 150}ms`,
            animation: 'fadeInUp 0.6s ease-out forwards',
            opacity: 0
          }}
        >
          <AssetCard asset={asset} />
        </div>
      ))}
      
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
} 