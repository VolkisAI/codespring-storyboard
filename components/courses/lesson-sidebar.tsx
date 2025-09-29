/**
 * LessonSidebar Component
 * 
 * This component displays the list of lessons for a specific course module.
 * It's designed to be used on the course detail page.
 * 
 * Located in: /components/courses/lesson-sidebar.tsx
 */
import { PlayCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Lesson {
    id: string;
    title: string;
    duration: string;
}

interface LessonGroup {
    title: string;
    lessons: Lesson[];
}

interface LessonSidebarProps {
    lessonGroups: LessonGroup[];
    courseId: string;
    activeLessonId: string;
}

export function LessonSidebar({ lessonGroups, courseId, activeLessonId }: LessonSidebarProps) {
    return (
        <aside className="w-full md:w-80 border-r bg-gray-50/50 p-4">
            <nav className="space-y-6">
                {lessonGroups.map((group) => (
                    <div key={group.title}>
                        <h3 className="mb-3 text-sm font-semibold uppercase text-gray-500">{group.title}</h3>
                        <ul className="space-y-2">
                            {group.lessons.map((lesson) => (
                                <li key={lesson.id}>
                                    <Link href={`/dashboard/courses/${courseId}?lesson=${lesson.id}`}>
                                        <div
                                            className={cn(
                                                "flex items-center p-3 rounded-lg transition-colors text-sm",
                                                activeLessonId === lesson.id
                                                    ? "bg-primary/10 text-primary font-semibold"
                                                    : "hover:bg-gray-200/50 text-gray-700"
                                            )}
                                        >
                                            <PlayCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                                            <span>{lesson.title}</span>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </nav>
        </aside>
    );
} 