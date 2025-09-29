/**
 * StatCard Component
 *
 * This component renders a card for displaying a single statistic on the dashboard.
 * It includes an icon, title, value, and a description/footer.
 * The color of the icon can be customized to match branding.
 *
 * Located in: /components/dashboard/StatCard.tsx
 */
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  footer?: string;
  iconColor?: string;
}

export function StatCard({ title, value, icon, footer, iconColor = 'text-gray-500' }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`h-6 w-6 ${iconColor}`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {footer && <p className="text-xs text-muted-foreground">{footer}</p>}
      </CardContent>
    </Card>
  );
} 