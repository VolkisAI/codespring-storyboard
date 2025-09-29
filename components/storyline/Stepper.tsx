'use client';

import React, { createContext, useContext, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface StepperContextType {
  activeStep: number;
  goNext: () => void;
  goBack: () => void;
  setStep: (step: number) => void;
}

const StepperContext = createContext<StepperContextType | undefined>(undefined);

export const useStepper = () => {
  const context = useContext(StepperContext);
  if (!context) {
    throw new Error('useStepper must be used within a StepperProvider');
  }
  return context;
};

interface StepperProps {
  children: React.ReactNode;
  totalSteps: number;
  initialStep?: number;
}

export function Stepper({ children, totalSteps, initialStep = 0 }: StepperProps) {
  const [activeStep, setActiveStep] = useState(initialStep);

  const goNext = () => {
    if (activeStep < totalSteps - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const goBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const setStep = (step: number) => {
    if (step >= 0 && step < totalSteps) {
      setActiveStep(step);
    }
  };

  const childrenArray = React.Children.toArray(children);
  const activeChild = childrenArray.find(
    (child) => React.isValidElement(child) && child.props.step === activeStep
  );

  return (
    <StepperContext.Provider value={{ activeStep, goNext, goBack, setStep }}>
      <div className="relative w-full h-full overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          {activeChild}
        </AnimatePresence>
      </div>
    </StepperContext.Provider>
  );
}

interface StepProps {
  step: number;
  children: React.ReactNode;
}

export function Step({ step, children }: StepProps) {
  return (
    <motion.div
      key={step}
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -60 }}
      transition={{
        duration: 0.4,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="absolute inset-0 w-full h-full"
    >
      {children}
    </motion.div>
  );
} 