/**
 * UGC Guide View Component
 * 
 * This component displays the UGC Brand Outreach Guide content in a beautifully
 * formatted layout with proper typography, spacing, and visual elements.
 * 
 * Located in: /components/content-assets/ugc-guide-view.tsx
 */
'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MessageSquare, Mail, Users, Target, CheckCircle2, Copy, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface UGCGuideViewProps {
  guide: any; // The guide data object
}

function CopyableTemplate({ title, template, type = 'email' }: { title: string; template: string; type?: 'email' | 'dm' }) {
  const { toast } = useToast();
  
  const handleCopy = () => {
    navigator.clipboard.writeText(template);
    toast({
      title: 'Template copied!',
      description: 'The template is ready to be pasted.',
    });
  };

  const icon = type === 'email' ? <Mail className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />;

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {icon}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
          </div>
          <Button variant="outline" size="sm" onClick={handleCopy}>
            <Copy className="w-4 h-4 mr-2" />
            Copy Template
          </Button>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border">
          <pre className="text-sm whitespace-pre-wrap font-sans text-gray-700 dark:text-gray-300 leading-relaxed">
            {template}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
}

function InstructionSection({ title, content, icon }: { title: string; content: any[]; icon: React.ReactNode }) {
  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
            {icon}
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
        </div>
        
        <div className="space-y-6">
          {content.map((item: any, index: number) => (
            <div key={index}>
              {item.subtitle && (
                <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                  {item.subtitle}
                </h4>
              )}
              <div className="ml-7 text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {item.text}
              </div>
              {index < content.length - 1 && <Separator className="mt-6" />}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function UGCGuideView({ guide }: UGCGuideViewProps) {
  // Get the sections from the guide data
  const instructionsPart = guide.parts.find((part: any) => part.title === "PART 1: INSTRUCTIONS");
  const scriptsPart = guide.parts.find((part: any) => part.title === "PART 2: COPY-AND-PASTE SCRIPTS");

  const sectionIcons = {
    "Section 1: Before You Reach Out": <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
    "Section 2: Writing the Message (Email or DM)": <Send className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
    "Section 3: Follow-Up Strategy": <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
    "Section 4: Responding to Inbound Inquiries": <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Instructions Part */}
      {instructionsPart && (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg flex items-center justify-center font-bold text-sm">
              1
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Instructions & Strategy
            </h2>
          </div>
          
          {instructionsPart.sections.map((section: any, index: number) => (
            <InstructionSection
              key={index}
              title={section.title}
              content={section.content}
              icon={sectionIcons[section.title as keyof typeof sectionIcons] || <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
            />
          ))}
        </div>
      )}

      {/* Scripts Part */}
      {scriptsPart && (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-lg flex items-center justify-center font-bold text-sm">
              2
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Copy-and-Paste Templates
            </h2>
          </div>
          
          {scriptsPart.sections.map((section: any, index: number) => (
            <CopyableTemplate
              key={index}
              title={section.title}
              template={section.template}
              type={section.title.toLowerCase().includes('email') ? 'email' : 'dm'}
            />
          ))}
        </div>
      )}
    </div>
  );
} 