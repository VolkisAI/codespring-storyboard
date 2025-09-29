"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function AnimatedHero() {
  return (
    <motion.div 
      className="text-center space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
        Generate Animated Broll For Any <span className="text-[#C5F547]">Short Form Video</span> In Seconds
      </h1>
      <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
        Welcome to Story Board, the easiest way to create b-roll.
      </p>
      <div className="flex justify-center gap-4 pt-6">
        <Button asChild size="lg" className="font-medium bg-[#C5F547] text-black hover:bg-[#C5F547]/90">
          <Link href="/dashboard">
            Get Started <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </motion.div>
  );
} 