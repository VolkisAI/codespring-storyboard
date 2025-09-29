/**
 * CourseVideoPlayer Component
 * 
 * This component displays the video for a lesson, along with its title,
 * description, and navigation to the next/previous lessons.
 * 
 * Located in: /components/courses/course-video-player.tsx
 */
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Clock, Eye, FileText } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface Lesson {
    id: string;
    title: string;
    description: string;
    duration: string;
    videoUrl: string;
    notes?: string;
}

interface CourseVideoPlayerProps {
    lesson: Lesson;
    courseId: string;
    // The following are simplified for now. A real implementation
    // would determine the next/prev lesson IDs based on the course structure.
    previousLessonId: string | null;
    nextLessonId: string | null;
}

export function CourseVideoPlayer({ lesson, courseId, previousLessonId, nextLessonId }: CourseVideoPlayerProps) {
    return (
        <main className="flex-1 p-6 flex justify-center overflow-y-auto">
            <div className="w-full max-w-5xl">
                <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden mb-6">
                    <iframe
                        className="w-full h-full"
                        src={lesson.videoUrl}
                        title={lesson.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </div>
                
                <div className="flex justify-between items-start mb-2">
                    <h1 className="text-2xl font-bold">{lesson.title}</h1>
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1.5" />
                        <span>{lesson.duration}</span>
                    </div>
                    <div className="flex items-center">
                        <Eye className="w-4 h-4 mr-1.5" />
                        <span>0 views</span>
                    </div>
                </div>

                <p className="text-muted-foreground mb-6 text-sm leading-relaxed">{lesson.description}</p>
                
                {lesson.notes && (
                    <div className="rounded-lg border bg-green-50/50 dark:bg-green-900/20 border-green-200/50 dark:border-green-800/30 mb-6">
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="item-1" className="border-b-0">
                                <AccordionTrigger className="p-4 text-base font-semibold hover:no-underline">
                                    <div className="flex items-center">
                                        <FileText className="w-5 h-5 mr-3 text-green-600 dark:text-green-400" style={{color: '#C5F548'}} />
                                        <span className="text-slate-800 dark:text-slate-200">Lesson Notes</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="p-4 pt-0">
                                    <pre className="text-sm font-sans whitespace-pre-wrap leading-relaxed bg-white dark:bg-slate-900 p-4 rounded-md border dark:border-slate-700">
                                        {lesson.notes}
                                    </pre>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
                )}

                <div className="flex justify-between border-t pt-4">
                    <Button variant="outline" size="sm" disabled={!previousLessonId}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Previous Lesson
                    </Button>
                    <Button size="sm" disabled={!nextLessonId}>
                        Next Lesson
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            </div>
        </main>
    );
} 