'use client';

import React from 'react';
import { useStepper } from './Stepper';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface StepperNavigationProps {
  totalSteps: number;
}

export function StepperNavigation({ totalSteps }: StepperNavigationProps) {
  const { goNext, goBack, activeStep } = useStepper();

  return (
    <div className="fixed top-5 right-5 z-50 flex items-center gap-4">
      <Button
        variant="outline"
        onClick={goBack}
        disabled={activeStep === 0}
        className="bg-white"
      >
        <ChevronLeft className="w-4 h-4 mr-2" />
        Back
      </Button>
      <Button onClick={goNext} disabled={activeStep >= totalSteps - 1}>
        Next
        <ChevronRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
} 