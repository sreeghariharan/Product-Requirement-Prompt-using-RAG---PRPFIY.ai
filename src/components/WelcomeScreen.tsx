import { motion } from "framer-motion";
import { Sparkles, FileText, Zap, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

const SUGGESTIONS = [
  "Generate a PRP for a drone delivery app using RTCFR",
  "Create a PRD for a YOLO-based object detection system",
  "Write product requirements for a RAG-powered chatbot",
  "Draft a mobile app PRD using COSTAR framework",
];

interface WelcomeScreenProps {
  onSuggestionClick: (suggestion: string) => void;
}

export const WelcomeScreen = ({ onSuggestionClick }: WelcomeScreenProps) => {
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
        <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center glow-primary">
          <Sparkles className="w-10 h-10 text-primary-foreground" />
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
        <span className="gradient-text">RAG-PRP Pro</span>
      </motion.h1>

      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-muted-foreground text-center max-w-md mb-12"
      >
        Generate enterprise-grade Product Requirement Prompts and Documents using AIR LLM optimization
      </motion.p>

      {/* Features */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 max-w-2xl"
      >
        {[
          { icon: FileText, title: "RAG-Enhanced", desc: "Upload docs for context-aware generation" },
          { icon: Zap, title: "AIR Optimized", desc: "Align-Improve-Refine for quality outputs" },
          { icon: Shield, title: "Local-First", desc: "Privacy-focused, runs on your hardware" },
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
              <Sparkles className="w-4 h-4 text-primary mr-3 flex-shrink-0" />
              <span className="text-sm">{suggestion}</span>
            </Button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};
