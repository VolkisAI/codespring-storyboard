/**
 * Storyboard Academy - Courses Page
 * 
 * This page serves as the main hub for all courses, branded as "Storyboard Academy".
 * It displays a grid of available course modules.
 * 
 * Located in: /app/dashboard/courses/page.tsx
 */
import { ModuleGrid } from "@/components/courses/module-grid";
import { Module } from "@/components/courses/module-card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, BookOpen } from "lucide-react";

const modules: Module[] = [
  {
    id: 'viral-short-form',
    moduleNumber: 1,
    title: "Going Viral With Short Form",
    description: "Learn the secrets to creating short-form video content that goes viral and captures massive attention.",
    lessonCount: 8,
    gradient: 'linear-gradient(135deg, #374151 0%, #1f2937 100%)',
  },
  {
    id: 'capcut-editing',
    moduleNumber: 2,
    title: "Capcut Editing Course",
    description: "Master the art of mobile video editing with Capcut to produce professional-grade content from your phone.",
    lessonCount: 4,
    gradient: 'linear-gradient(135deg, #4b5563 0%, #374151 100%)',
  },
];

export default function CoursesPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <BookOpen className="h-8 w-8 mr-3" />
          <h1 className="text-4xl font-bold tracking-tight">Storyboard Academy</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Follow these modules in sequence to master content creation with our guided lessons.
        </p>
      </div>
      
      <Alert className="mb-8">
        <Info className="h-4 w-4" />
        <AlertTitle>Getting Started with Modules</AlertTitle>
        <AlertDescription>
          Click on a module to access its lessons. Complete modules sequentially for the best learning experience.
        </AlertDescription>
      </Alert>

      <ModuleGrid modules={modules} />
    </div>
  );
} 