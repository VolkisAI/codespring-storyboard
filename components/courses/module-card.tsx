/**
 * ModuleCard Component
 * 
 * This component displays a single course module as a card with a gradient background.
 * It includes the module number, title, description, and some metadata.
 * It's designed to be used within the ModuleGrid component.
 * 
 * Located in: /components/courses/module-card.tsx
 */
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, BookCopy } from 'lucide-react';

export interface Module {
  id: string;
  moduleNumber: number;
  title: string;
  description: string;
  lessonCount: number;
  gradient: string;
}

interface ModuleCardProps {
  module: Module;
}

export function ModuleCard({ module }: ModuleCardProps) {
  return (
    <Link href={`/dashboard/courses/${module.id}`}>
      <Card className="h-[280px] transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl relative overflow-hidden group border-0">
        {/* Main gradient background */}
        <div 
          className="absolute inset-0"
          style={{ background: module.gradient }}
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
        
        <CardHeader className="relative text-white p-6">
          <Badge variant="secondary" className="w-fit mb-3 bg-white/20 text-white border-0 backdrop-blur-sm">
            Module {module.moduleNumber}
          </Badge>
          <CardTitle className="text-2xl font-bold leading-tight">
            {module.title}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="relative text-white/90 flex flex-col justify-between p-6 pt-0">
          <CardDescription className="text-white/80 text-base leading-relaxed mb-6">
            {module.description}
          </CardDescription>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center text-white/90">
              <BookCopy className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">{module.lessonCount} Lessons</span>
            </div>
            <div className="text-white/90 text-sm font-medium">
              0% Complete
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
} 