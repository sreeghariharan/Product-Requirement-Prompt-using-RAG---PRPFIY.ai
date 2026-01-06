import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Paperclip, Sparkles, Search, BookOpen, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const FRAMEWORKS = [
  { value: "RTCFR", label: "RTCFR", description: "Role-Task-Context-Format-Requirements" },
  { value: "RTF", label: "RTF", description: "Role-Task-Format" },
  { value: "CRISPE", label: "CRISPE", description: "Capacity-Request-Insight-Statement-Personality-Experiment" },
  { value: "COSTAR", label: "COSTAR", description: "Context-Objective-Style-Tone-Audience-Response" },
  { value: "TASK-SPEC", label: "TASK-SPEC", description: "Task-Action-Style-Knowledge-Special-Persona-Examples-Constraints" },
  { value: "A-I-C", label: "A-I-C", description: "Actor-Instruction-Context" },
  { value: "SPAR", label: "SPAR", description: "Situation-Problem-Action-Result" },
  { value: "CoT", label: "CoT", description: "Chain of Thought" },
  { value: "ReAct", label: "ReAct", description: "Reasoning + Acting" },
];

interface ChatInputProps {
  onSend: (message: string, files: File[], framework: string, mode: "rag" | "llm") => void;
  isLoading?: boolean;
}

export const ChatInput = ({ onSend, isLoading }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [framework, setFramework] = useState("RTCFR");
  const [mode, setMode] = useState<"rag" | "llm">("rag");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if (message.trim() || files.length > 0) {
      onSend(message, files, framework, mode);
      setMessage("");
      setFiles([]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t border-border bg-background/50 backdrop-blur-lg p-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center gap-2 bg-secondary rounded-lg p-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMode("rag")}
            className={cn(
              "px-3 text-sm transition-all",
              mode === "rag"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <BookOpen className="w-4 h-4 mr-1.5" />
            RAG Mode
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMode("llm")}
            className={cn(
              "px-3 text-sm transition-all",
              mode === "llm"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Sparkles className="w-4 h-4 mr-1.5" />
            Pure LLM
          </Button>
        </div>

        <Select value={framework} onValueChange={setFramework}>
          <SelectTrigger className="w-40 bg-secondary border-0 text-foreground">
            <SelectValue placeholder="Framework" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            {FRAMEWORKS.map((fw) => (
              <SelectItem
                key={fw.value}
                value={fw.value}
                className="text-foreground hover:bg-secondary"
              >
                <div className="flex flex-col">
                  <span>{fw.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-primary/30 text-primary hover:bg-primary/10"
          >
            <Sparkles className="w-4 h-4 mr-1.5" />
            Generate PRP
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-border text-muted-foreground hover:text-foreground"
          >
            <Search className="w-4 h-4 mr-1.5" />
            Search
          </Button>
        </div>
      </div>

      {/* File attachments */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-2 mb-3"
          >
            {files.map((file, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-lg text-sm group"
              >
                <FileText className="w-4 h-4 text-primary" />
                <span className="text-foreground">{file.name}</span>
                <button
                  onClick={() => removeFile(index)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3 text-muted-foreground hover:text-foreground" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div className="relative flex items-end gap-3">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.txt,.md"
          onChange={handleFileChange}
          className="hidden"
        />
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          className="flex-shrink-0 text-muted-foreground hover:text-foreground hover:bg-secondary"
        >
          <Paperclip className="w-5 h-5" />
        </Button>

        <div className="flex-1 relative">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about your documents or generate a PRP..."
            rows={1}
            className={cn(
              "min-h-[52px] max-h-[200px] resize-none",
              "bg-secondary border-0 rounded-xl",
              "text-foreground placeholder:text-muted-foreground",
              "focus-visible:ring-1 focus-visible:ring-primary",
              "pr-4 py-4"
            )}
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={isLoading || (!message.trim() && files.length === 0)}
          className={cn(
            "flex-shrink-0 h-[52px] px-6 rounded-xl",
            "bg-primary hover:bg-primary/90 text-primary-foreground",
            "transition-all duration-200",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            !isLoading && (message.trim() || files.length > 0) && "glow-primary-subtle animate-pulse-glow"
          )}
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>

      <p className="text-xs text-muted-foreground text-center mt-3">
        AIR Method: Align → Improve → Refine for optimized outputs
      </p>
    </div>
  );
};
