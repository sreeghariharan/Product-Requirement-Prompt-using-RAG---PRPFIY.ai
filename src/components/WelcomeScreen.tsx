import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, Zap, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import prpfiyLogo from "@/assets/prpfiy-logo.png";

const TAGLINES = [
  "Transform your ideas into structured product requirements",
  "Generate professional PRPs with AI-powered precision",
  "From concept to documentation in seconds",
  "Intelligent Product Requirements, Simplified",
  "Your AI partner for product documentation",
];

const SUGGESTIONS = [
  "Generate a PRP for a mobile e-commerce app",
  "Create requirements for a task management system",
  "Write a PRD for a customer feedback portal",
  "Draft requirements for an inventory management app",
];

interface WelcomeScreenProps {
  onSuggestionClick: (suggestion: string) => void;
}

export const WelcomeScreen = ({ onSuggestionClick }: WelcomeScreenProps) => {
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
        <img src={prpfiyLogo} alt="PRPFIY" className="w-24 h-24 rounded-2xl glow-primary" />
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
      <motion.div
        key={currentTagline}
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -10, opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="h-8 flex items-center mb-12"
      >
        <p className="text-muted-foreground text-center max-w-md">
          {TAGLINES[currentTagline]}
        </p>
      </motion.div>

      {/* Features */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 max-w-2xl"
      >
        {[
          { icon: FileText, title: "Smart Documents", desc: "Upload docs for context-aware generation" },
          { icon: Zap, title: "9 Frameworks", desc: "RTCFR, COSTAR, CRISPE and more" },
          { icon: Target, title: "Precise Output", desc: "Professional-grade requirements" },
        ].map((feature, i) => (
          <div
            key={i}
            className="flex flex-col items-center text-center p-4 rounded-xl glass-card"
          >
            <feature.icon className="w-6 h-6 text-primary mb-2" />
            <h3 className="font-medium text-foreground text-sm">{feature.title}</h3>
            <p className="text-xs text-muted-foreground mt-1">{feature.desc}</p>
          </div>
        ))}
      </motion.div>

      {/* Suggestions */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="w-full max-w-2xl"
      >
        <p className="text-sm text-muted-foreground text-center mb-4">
          Try one of these prompts to get started:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {SUGGESTIONS.map((suggestion, i) => (
            <Button
              key={i}
              variant="outline"
              onClick={() => onSuggestionClick(suggestion)}
              className="justify-start text-left h-auto py-3 px-4 border-border hover:border-primary/50 hover:bg-primary/5 text-foreground"
            >
              <FileText className="w-4 h-4 text-primary mr-3 flex-shrink-0" />
              <span className="text-sm">{suggestion}</span>
            </Button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};
