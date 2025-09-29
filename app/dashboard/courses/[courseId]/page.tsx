/**
 * Dynamic Course Detail Page
 * 
 * This page displays the content for a single course module, including a sidebar
 * with lessons and a main area for the video player.
 * 
 * Located in: /app/dashboard/courses/[courseId]/page.tsx
 */
import { LessonSidebar } from "@/components/courses/lesson-sidebar";
import { CourseVideoPlayer } from "@/components/courses/course-video-player";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

// --- Mock Data ---
// In a real application, this data would be fetched from a database
// based on the courseId parameter.

const courseData = {
    'viral-short-form': {
        title: "Going Viral With Short Form",
        lessonGroups: [
            {
                title: 'Introduction',
                lessons: [
                    { 
                        id: 'introduction', 
                        title: 'Introduction', 
                        duration: '1 min', 
                        description: 'An overview of what you will learn in this course.', 
                        videoUrl: 'https://www.loom.com/embed/51879d405d3145e6a60be12ef0e63278',
                        notes: `Welcome to the course! In the following lessons, we'll break down the art and science of creating short-form videos that capture attention and drive massive engagement.`
                    },
                ]
            },
            {
                title: 'Virality Fundamentals',
                lessons: [
                    { 
                        id: 'psychology-of-virality', 
                        title: 'The Psychology of Virality', 
                        duration: '5 min', 
                        description: 'Discover the core emotions and psychological triggers behind viral content.', 
                        videoUrl: 'https://www.loom.com/embed/8569fda4028f4d78bf5c789ec64e4a9d',
                        notes: `What makes a short-form video go viral?\n• Virality = Emotion + Identity + Shareability\n\nAccording to Jonah Berger’s research (Contagious), viral content is usually:\n\t– Emotionally charged\n\t– Publicly visible\n\t– Useful or surprising\n\t– Story-driven\n\nWhy people share content:\n• To express themselves ("This is so me")\n• To look smart, funny, or in-the-know\n• To connect with others ("This reminds me of you")\n• To process emotion (outrage, joy, nostalgia)\n\nThe role of attention in virality:\n• Attention is emotional, not rational\n• The brain decides in 0.3–0.5 seconds whether to stay\n• This is where the hook matters most\n\nHow algorithms decide what goes viral:\n• Completion rate\n• Rewatches\n• Shares and saves\n• Comments that show emotion or opinion`
                    },
                    { 
                        id: 'viral-hook-formula', 
                        title: 'The Viral Hook Formula', 
                        duration: '6 min', 
                        description: 'Master the art of the first 3 seconds to stop the scroll.', 
                        videoUrl: 'https://www.loom.com/embed/a3d824cd89a3457f8e2826e74fdb339a',
                        notes: `What is a hook?\nThe first 1–3 seconds of your video that either stops the scroll… or loses the viewer.\n\nThe 3-part hook structure:\nVisual Pattern Break: (0.1 seconds)\n\t– Unexpected motion, weird angle, zoom\n\t– Something out of context\n\nOn-Screen Text: (0.1 - 1 seconds)\n\t– 70%+ of viewers scroll with no sound\n\t– Use cliffhangers, shock, or open loops\n\nAudio Hook or Spoken Line (3 seconds - 10 seconds)\n\t– High energy or intrigue\n\t– Start mid-story or mid-sentence\n\n6 hook types that consistently work:\n• Contrarian: “Why most people fail at this…”\n• Time-based: “This disappears in 24 hours.”\n• Data shock: “Only 1 in 10 people survive this.”\n• Story prompt: “He opened the door… and froze.”\n• POV relatable: “If you’ve ever done this…”\n• Visually absurd: Start with something strange or unexplained\n\nHook testing tip:\nWatch your retention graph. If 50%+ leave in the first 2 seconds, the hook failed.`
                    },
                    { 
                        id: 'retention-structure', 
                        title: 'Structure That Keeps People Watching', 
                        duration: '7 min', 
                        description: 'Learn frameworks that keep viewers engaged until the very end.', 
                        videoUrl: 'https://www.loom.com/embed/35dea9ddc6b541b58dbc9c68cc4e30f2',
                        notes: `Why structure matters:\nGoing viral isn’t about being creative. It’s about being watchable.\n\nCore retention tactics:\n• Every 3–5 seconds: give a new reason to stay\n• Remove all pauses or dead air\n• Keep energy high with cuts, movement, and pacing\n\nContent structure frameworks:\n• AIDA: Attention → Interest → Desire → Action\n• CHIP: Curiosity → Hook → Info → Payoff\n• Open loop early → close it near the end\n• Cut every 1.5–2 seconds if you're talking on camera\n\nThe dopamine drip strategy:\nGive small payoffs regularly instead of saving everything for the end.\n\nCaptions matter:\nWord-by-word bold captions boost retention by up to 40% (source: TikTok Creator Center)`
                    },
                ]
            },
            {
                title: 'Advanced Strategies',
                lessons: [
                    { 
                        id: 'shareable-content', 
                        title: 'Content People Want to Share', 
                        duration: '4 min', 
                        description: 'Engineer your content with triggers that encourage sharing and saving.', 
                        videoUrl: 'https://www.loom.com/embed/0660eb92a2ed4449853c2921341c0ed8',
                        notes: `Why do people share a video?\n• Because it reflects their identity\n• Because it makes them feel something\n• Because it’s useful, funny, or outrageous\n\nHow to create “share triggers”:\n• Use highly relatable statements\n• Be specific with the problem or scenario\n• Say the thing most people are afraid to say\n\nTactics to drive shares and saves:\n• Make content short enough to rewatch\n• End with a bold or surprising payoff\n• Use “silent punchlines” – a facial expression or reaction that lands better than a line\n\nThe comment flywheel:\n• Pin the best comment\n• Reply with a video\n• Create a follow-up or part 2\n• Repeat the cycle until one takes off\n\nMost viral creators don’t “go viral.” They engineer viral loops.`
                    },
                    { 
                        id: 'algorithm-secrets', 
                        title: 'How the Algorithm Really Works', 
                        duration: '5 min', 
                        description: 'Debunk common myths and understand the metrics that truly matter.', 
                        videoUrl: 'https://www.loom.com/embed/52549aee1ba04dc9961992f8f97a83fa',
                        notes: `The algorithm doesn’t choose who goes viral. Viewers do.\n\nKey metrics every platform tracks:\n• Completion rate (how many people watched to the end)\n• Rewatches (do people go back and rewatch the video?)\n• Shares, saves, and comments\n• Click-through rate (for YouTube Shorts)\n• Session length (i.e. time spent on the platform) - Bingeworthy\n\nVirality pattern:\n• Stage 1: Test to 100–500 viewers\n• Stage 2: If CTR and retention are high, it scales\n• Stage 3: If watch time holds, it snowballs for days or weeks\n\nDebunked myths:\n• You don’t need to post at a specific time\n• Hashtags don’t drive views—hooks do\n• The platform doesn’t “shadowban” you for flops\n\nAlgorithm-proof strategy:\nMake great videos. The algorithm just delivers them.`
                    },
                    { 
                        id: 'posting-strategy', 
                        title: 'Posting Strategy Without Burnout', 
                        duration: '6 min', 
                        description: 'Develop a sustainable system for creating and publishing content.', 
                        videoUrl: 'https://www.loom.com/embed/7ceaa1fd210341f5865efb0e933ff225',
                        notes: `You don’t need to post 5 times a day. You need a system.\n\nDOCUMENT WHAT YOU’RE DOING, and tell it as a story.\n\nThe 3 content types you need:\n• Discovery content (designed to go viral)\n• Community content (relatable, builds trust)\n• Conversion content (drives action or sales)\n\nPosting cadence:\n• Beginners: 3–4 videos/week\n• Growth mode: 1 video/day\n• Maintenance mode: 2–3/week\n\nBatching strategy:\n• Film 5–10 hooks in one session\n• Edit later using templates\n• Reuse the same format across platforms\n\nRepurpose everything:\n• 1 TikTok = TikTok + Reels + Shorts\n• Keep intros native to platform\n• Post same video 2–3 times if it flopped`
                    },
                    { 
                        id: 'viral-flywheel', 
                        title: 'The Viral Flywheel System', 
                        duration: '4 min', 
                        description: 'Turn one viral video into a looping system of continuous content.', 
                        videoUrl: 'https://www.loom.com/embed/683a9621423a4e30a3cae73972dc4e1a',
                        notes: `Virality doesn’t happen once—it can keep looping.\n\nTurn 1 video into 10:\n• Use the top comments to reply with video\n• Make sequels, “part 2,” “what you missed”\n• Turn the same idea into a story, tutorial, and reaction version\n• Rephrase the hook and post it again 2 weeks later\n\nKeep a "hook vault":\n• Save your best hooks in Notion, Apple Notes, or a Google Sheet\n• Reuse them across formats and topics\n\nMomentum matters:\nWhen a video starts getting traction, post more immediately.\n\nWatch your comments closely:\nThey’re often better content ideas than your original script.`
                    },
                ]
            }
        ]
    },
    'capcut-editing': {
        title: "Capcut Editing Course",
        lessonGroups: [
            {
                title: 'Editing Fundamentals',
                lessons: [
                    { id: 'storytelling-editing-tutorial', title: 'Storytelling - Editing Tutorial', duration: '10 min', description: 'Learn how to use editing to enhance your storytelling.', videoUrl: 'https://www.loom.com/embed/17c2c48bb4cd4557b1fd74617890a3a0' },
                    { id: 'creating-blurred-backgrounds', title: 'Creating Blurred Backgrounds', duration: '7 min', description: 'Learn how to create a professional-looking blurred background effect in your videos.', videoUrl: 'https://www.loom.com/embed/f4232bd71dfa4a199f2ce30887f04ab5' },
                ]
            },
            {
                title: 'Platform Specifics',
                lessons: [
                    { id: 'how-to-edit-branded-tiktok', title: 'How To Edit A Branded TikTok', duration: '12 min', description: 'A step-by-step guide on editing a branded TikTok video.', videoUrl: 'https://www.loom.com/embed/987d521f1dad4f65918b20359d322c70' },
                    { id: 'editing-instagram-videos', title: 'Editing Instagram Videos', duration: '9 min', description: 'Tips and tricks for editing engaging Instagram videos.', videoUrl: 'https://www.loom.com/embed/6948f2556b7448c897214b3f7af8df7d' },
                ]
            },
        ]
    }
};

type CourseId = keyof typeof courseData;

function getCourse(courseId: string) {
    if (courseId in courseData) {
        return courseData[courseId as CourseId];
    }
    return null;
}

function getLesson(courseId: string, lessonId: string) {
    const course = getCourse(courseId);
    if (!course) return null;

    for (const group of course.lessonGroups) {
        const lesson = group.lessons.find(l => l.id === lessonId);
        if (lesson) return lesson as typeof lesson & { notes?: string };
    }
    return null;
}
// --- End Mock Data ---


interface CoursePageProps {
    params: { courseId: string };
    searchParams: { [key: string]: string | string[] | undefined };
}

export default function CoursePage({ params, searchParams }: CoursePageProps) {
    const { courseId } = params;
    const course = getCourse(courseId);

    if (!course) {
        notFound();
    }

    const lessonId = typeof searchParams.lesson === 'string' 
        ? searchParams.lesson 
        : course.lessonGroups[0]?.lessons[0]?.id;

    const activeLesson = getLesson(courseId, lessonId || '');

    if (!activeLesson) {
        // Handle case where lesson isn't found but course exists
        return <div className="p-8">Lesson not found.</div>;
    }
    
    return (
        <div className="h-full flex flex-col">
            {/* Header with back button */}
            <div className="border-b bg-white/50 backdrop-blur-sm p-4">
                <Link href="/dashboard/courses">
                    <Button variant="ghost" size="sm" className="mb-2">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Modules
                    </Button>
                </Link>
                <h1 className="text-xl font-semibold text-gray-900">{course.title}</h1>
            </div>
            
            {/* Main content */}
            <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
                <LessonSidebar 
                    courseId={courseId} 
                    lessonGroups={course.lessonGroups}
                    activeLessonId={activeLesson.id}
                />
                <CourseVideoPlayer 
                    courseId={courseId}
                    lesson={activeLesson}
                    // Simplified navigation
                    previousLessonId={null}
                    nextLessonId={null}
                />
            </div>
        </div>
    );
} 