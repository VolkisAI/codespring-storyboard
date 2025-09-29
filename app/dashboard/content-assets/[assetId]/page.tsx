/**
 * Dynamic Asset Detail Page
 *
 * This page displays the detailed content for a single asset.
 * It currently supports rendering a rich text guide and downloading it as a PDF.
 *
 * Located in: /app/dashboard/content-assets/[assetId]/page.tsx
 */
'use client';

import { notFound } from 'next/navigation';
import React, { useRef } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Button } from '@/components/ui/button';
import { Download, FileText, ArrowLeft, Copy, ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { viralHooks } from '@/lib/hooks-data';
import { ViralHooksView } from '@/components/content-assets/viral-hooks-view';
import { UGCGuideView } from '@/components/content-assets/ugc-guide-view';
import { AIBRollLibraryView } from '@/components/content-assets/ai-broll-library-view';

// --- Mock Data ---
const ugcGuideContent = {
  title: "UGC Brand Outreach Guide",
  subtitle: "How to Land Paid Brand Deals as a Beginner UGC Creator",
  parts: [
    {
      title: "PART 1: INSTRUCTIONS",
      sections: [
        {
          title: "Section 1: Before You Reach Out",
          content: [
            {
              subtitle: "1. Know Your Value",
              text: "Before you message any brand, be clear on:\n• What niche or industry you create content in.\n• What type of UGC you specialize in (product demos, testimonials, lifestyle, etc.).\n• What problems you help solve (e.g. trust-building content for ads, scroll-stopping visuals, etc.)."
            },
            {
              subtitle: "2. Build a UGC Portfolio or Example Folder",
              text: "This could be a Google Drive, Notion page, or PDF showing:\n• Examples of past UGC you’ve made (even spec content).\n• Results, if you have them (engagement, conversions, etc.).\n• Your name, niche, and what you offer as a service."
            },
            {
              subtitle: "3. Research the Brand First",
              text: "• What’s their product and target customer?\n• Are they already running ads or UGC?\n• Can you identify a gap or opportunity in their content?"
            },
            {
              subtitle: "4. Find the Right Contact",
              text: "Use their website, Instagram bio, or a quick DM to ask:\n“Hi, I’d love to send over a content idea for your team. Could you share the best email to send it to?”"
            }
          ]
        },
        {
            title: "Section 2: Writing the Message (Email or DM)",
            content: [
                {
                    subtitle: "1. Hook the Brand Early",
                    text: "Whether it’s your subject line or the first sentence of a DM, lead with:\n• A compliment on something they’re doing well.\n• A reference to a recent product or campaign.\n• A brief insight or problem you can help with."
                },
                {
                    subtitle: "2. Introduce Yourself Briefly",
                    text: "One line is enough:\n“I’m [Your Name], a UGC creator specializing in [your niche].”"
                },
                {
                    subtitle: "3. Offer a Clear Benefit or Content Idea",
                    text: "Frame your message around what’s in it for them, not you. It’s often easier to FILM a sample piece of UGC content they can use, and just send it straight over for them to view. But don’t ask permission, just send it!\n\nExamples:\n• “I noticed you don’t currently use TikTok-style UGC in your ads. I’d love to help create short-form content that boosts conversions.”\n• “I have an idea for a testimonial video that could speak directly to [pain point] your customers face and filmed a quick idea of what i’m thinking, take a look.”"
                },
                {
                    subtitle: "4. Add Social Proof (If Available)",
                    text: "If you’ve had results from past videos, mention one:\n“A recent video I made for a similar brand hit 200K views and got a 12% click-through rate.”"
                },
                {
                    subtitle: "5. End with a CTA (Call to Action)",
                    text: "Invite them to:\n• See your portfolio\n• View a sample\n• Hear your ideas\n• Jump on a quick call\n\nKeep it light and easy to say yes to (if you haven’t already):\n“Would you be open to me sending over a short concept or sample video?”"
                },
                {
                    subtitle: "6. Signature or Ending",
                    text: "If emailing, include:\n• Your name\n• A link to your portfolio or Google Drive\n• Any relevant socials or website"
                }
            ]
        },
        {
            title: "Section 3: Follow-Up Strategy",
            content: [
                {
                    subtitle: "When to Follow Up:",
                    text: "Wait 1 - 2 business days if no reply."
                },
                {
                    subtitle: "How to Follow Up:",
                    text: "Keep it polite and brief. Don’t guilt them for not replying — just bump it up with a simple reminder.\n\nExample:\n“Just following up on my last message — I’d love to send over that idea when you’re ready.”\n\nAfter 2 follow-ups with no reply, move on."
                }
            ]
        },
        {
            title: "Section 4: Responding to Inbound Inquiries",
            content: [
                {
                    text: "If a brand messages you first, here’s what to do:"
                },
                {
                    subtitle: "1. Reply Promptly (Ideally Within 24–48 Hours)",
                    text: "Start with gratitude:\n“Thanks for reaching out — I’d love to explore a collaboration!”"
                },
                {
                    subtitle: "2. Ask for Details Before Quoting",
                    text: "“Can you share more about the content you’re looking for and your goals for the project?”\n\nIf they ask for rates:\n“Happy to send over pricing — do you have a budget range in mind or an idea of how many videos you need?”"
                },
                {
                    subtitle: "3. If It’s a Gifting or Free Collab and You Want Paid Work:",
                    text: "“Thanks so much for the offer. I typically work on paid UGC projects so I can fully dedicate time and quality to your brand’s success. Do you have a budget for this collaboration?”"
                },
                {
                    subtitle: "4. Keep it Professional",
                    text: "Whether the answer is yes, no, or “not now,” reply with respect. You’re building a reputation. One good conversation can lead to future deals."
                }
            ]
        }
      ]
    },
    {
      title: "PART 2: COPY-AND-PASTE SCRIPTS",
      sections: [
        {
          title: "Cold DM Template (Instagram)",
          template: "Hi [Brand Name], I’m [Your Name], a UGC creator who specializes in [niche or product type]. I’ve been following your content and really like what you’ve done with [recent product or campaign].\n\nI had a short video idea that I think could really speak to your [target audience] and boost [goal — e.g., conversions or engagement].\n\nWould it be okay if I sent over the idea or a quick sample video?"
        },
        {
            title: "Cold Email Template",
            template: "Subject: Quick content idea for [Brand Name]\n\nHi [First Name],\n\nI’ve been following [Brand] and loved your recent [campaign/product launch]. I noticed there may be an opportunity to add some short-form UGC content to better connect with [target audience] and increase conversions.\n\nI’m [Your Name], a UGC creator who helps brands like yours build trust and drive results with authentic, scroll-stopping video content.\n\nI’d love to create content for you that highlights [product or pain point] in a way that resonates with your audience. A recent video I created for a similar brand reached over 200,000 views and helped drive an 8% click-through rate on their ads.\n\nWould you be open to seeing a short concept or sample video?\n\nBest regards,\n[Your Name]\n[Portfolio Link]\n[Email / Website / Social Handle]"
        },
        {
            title: "Follow-Up Email (1 Week Later)",
            template: "Subject: Just following up\n\nHi [First Name],\n\nJust following up on my previous message about collaborating on some UGC for [Brand]. I’d still love to send over a quick concept that could help drive results for your [product or campaign].\n\nLet me know if now’s a good time, and I’ll send it your way.\n\nThanks again,\n[Your Name]"
        },
        {
            title: "Follow-Up DM",
            template: "Hi [Brand Name], just checking in to see if you saw my last message — I’d love to share a content idea that could really work for your audience. Let me know if I can send it over!"
        },
        {
            title: "Inbound Brand Message – Positive Response",
            template: "Hi [First Name], thanks so much for reaching out — I’d definitely be interested in working with [Brand]!\n\nTo make sure I meet your needs, could you share a bit more about:\n• What kind of content you’re looking for (video, photo, etc.)\n• How many pieces you need\n• Timeline or key dates\n• Any budget range you’re working within\n\nOnce I know more, I can send over my ideas and pricing.\n\nLooking forward to hearing more,\n[Your Name]"
        },
        {
            title: "Inbound Brand Message – Gifting or No Budget",
            template: "Hi [First Name], thanks so much for getting in touch and for thinking of me!\n\nI typically work on paid UGC projects so I can fully dedicate time and quality to your brand’s content. Do you have a budget set aside for this collaboration?\n\nWould love to discuss ways we can make something great together if so.\n\nBest,\n[Your Name]"
        }
      ]
    }
  ]
};

const viralHooksAsset = {
  title: "500+ Viral Hooks",
  subtitle: "Copy-and-paste hooks to create viral short-form content.",
  hooks: viralHooks
};

const aiBRollLibraryAsset = {
  title: "AI B-Roll Library",
  subtitle: "High-quality AI-generated B-roll images for your content.",
  type: "image-library"
};

const assetData: { [key: string]: any } = {
  'ugc-brand-outreach-guide': ugcGuideContent,
  '500-viral-hooks': viralHooksAsset,
  'ai-broll-library': aiBRollLibraryAsset,
};
// --- End Mock Data ---

function ScriptTemplate({ title, template }: { title: string; template: string }) {
  return (
    <div className="mb-8">
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <div className="p-4 border bg-slate-50 dark:bg-slate-900 rounded-lg text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-mono text-sm">
        {template}
      </div>
    </div>
  );
}

export default function AssetPage({ params }: { params: { assetId: string } }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const asset = assetData[params.assetId];

  if (!asset) {
    notFound();
  }

  const handleDownload = () => {
    const doc = new jsPDF();
    const content = contentRef.current;

    if (content) {
        doc.html(content, {
            callback: function (doc) {
                doc.save(`${asset.title}.pdf`);
            },
            x: 10,
            y: 10,
            width: 190,
            windowWidth: content.offsetWidth
        });
    }
  };

  const isHooksPage = params.assetId === '500-viral-hooks';

  return (
    <div className="bg-white dark:bg-gray-950 min-h-screen relative">
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-10">
        <Link href="/dashboard/content-assets">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Assets
          </Button>
        </Link>
      </div>

      <main className={`mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-10 ${isHooksPage ? 'max-w-7xl' : 'max-w-4xl'}`}>
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
              {params.assetId === 'ugc-brand-outreach-guide' && <FileText className="w-6 h-6 text-slate-600 dark:text-slate-400" />}
              {params.assetId === '500-viral-hooks' && <Copy className="w-6 h-6 text-slate-600 dark:text-slate-400" />}
              {params.assetId === 'ai-broll-library' && <ImageIcon className="w-6 h-6 text-slate-600 dark:text-slate-400" />}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-200">{asset.title}</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">{asset.subtitle}</p>
            </div>
          </div>
          {params.assetId === 'ugc-brand-outreach-guide' && (
            <Button onClick={handleDownload} className="ml-4 flex-shrink-0">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          )}
        </div>

        {params.assetId === 'ugc-brand-outreach-guide' && (
            <div ref={contentRef}>
              <UGCGuideView guide={asset} />
            </div>
        )}
        {params.assetId === '500-viral-hooks' && (
            <ViralHooksView hooks={asset.hooks} />
        )}
        {params.assetId === 'ai-broll-library' && (
            <AIBRollLibraryView images={[]} />
        )}
      </main>
    </div>
  );
} 