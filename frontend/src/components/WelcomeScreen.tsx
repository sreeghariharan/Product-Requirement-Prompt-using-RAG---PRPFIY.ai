import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import prpfiyLogo from "@/assets/prpfiy-logo.png";

const TAGLINES = [
  "Your AI-powered product requirements assistant",
  "Chat naturally, generate PRPs on demand",
  "From conversation to documentation in seconds",
  "Intelligent Product Requirements, Simplified",
  "Brainstorm ideas, then structure them into PRPs",
];

interface WelcomeScreenProps {
  onSuggestionClick?: (suggestion: string) => void;
}

export const WelcomeScreen = (_props: WelcomeScreenProps) => {
  const [currentTagline, setCurrentTagline] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTagline((prev) => (prev + 1) % TAGLINES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 flex flex-col items-center justify-center px-4"
    >
      {/* Logo */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="relative mb-8"
      >
        <div className="logo-blend">
          <img src={prpfiyLogo} alt="PRPFIY" className="w-24 h-24 rounded-2xl glow-primary" />
        </div>
        <div className="absolute -inset-4 bg-primary/20 rounded-3xl blur-2xl -z-10" />
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-4xl font-bold text-center mb-3"
      >
        <span className="gradient-text">PRPFIY</span>
      </motion.h1>

      {/* Alternating Tagline */}
      <div className="h-8 flex items-center mb-12 overflow-hidden relative w-full max-w-md justify-center">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={currentTagline}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute"
          >
            <p className="text-muted-foreground text-center">
              {TAGLINES[currentTagline]}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

