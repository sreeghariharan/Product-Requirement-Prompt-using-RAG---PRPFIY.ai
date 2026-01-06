import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Bot, Download, Copy, Check, FileText, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  framework?: string;
  attachments?: { name: string; type: string }[];
}

export const ChatMessage = ({
  role,
  content,
  timestamp,
  isStreaming,
  framework,
  attachments,
}: ChatMessageProps) => {
  const [displayedContent, setDisplayedContent] = useState(isStreaming ? "" : content);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isStreaming && content) {
      let index = 0;
      const interval = setInterval(() => {
        if (index <= content.length) {
          setDisplayedContent(content.slice(0, index));
          index++;
        } else {
          clearInterval(interval);
        }
      }, 15);
      return () => clearInterval(interval);
    } else {
      setDisplayedContent(content);
    }
  }, [content, isStreaming]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (format: string) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `response.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (role === "system") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 p-4 mx-4 my-2 rounded-lg bg-primary/10 border border-primary/20"
      >
        <Info className="w-5 h-5 text-primary flex-shrink-0" />
        <p className="text-sm text-foreground">{content}</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex gap-4 p-6 rounded-xl animate-slide-in",
        role === "assistant" && "glass-card"
      )}
    >
      <div
        className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
          role === "user" ? "bg-secondary" : "bg-primary glow-primary-subtle"
        )}
      >
        {role === "user" ? (
          <User className="w-5 h-5 text-secondary-foreground" />
        ) : (
          <Bot className="w-5 h-5 text-primary-foreground" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-2">
          <span className="font-medium text-foreground">
            {role === "user" ? "You" : "PRPFIY"}
          </span>
          {framework && role === "assistant" && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
              {framework}
            </span>
          )}
          <span className="text-xs text-muted-foreground">
            {timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>

        {attachments && attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {attachments.map((file, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-lg text-sm">
                <FileText className="w-4 h-4 text-primary" />
                <span className="text-foreground">{file.name}</span>
              </div>
            ))}
          </div>
        )}

        <div className="prose prose-invert prose-sm max-w-none">
          <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
            {displayedContent}
            {isStreaming && displayedContent.length < content.length && (
              <span className="inline-block w-2 h-5 ml-1 bg-primary typing-pulse" />
            )}
          </p>
        </div>

        {role === "assistant" && !isStreaming && (
          <div className="flex items-center gap-2 mt-4">
            <Button variant="ghost" size="sm" onClick={handleCopy} className="text-muted-foreground hover:text-foreground">
              {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
              {copied ? "Copied" : "Copy"}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="bg-card border-border">
                {["md", "txt", "pdf", "docx"].map((format) => (
                  <DropdownMenuItem key={format} onClick={() => handleDownload(format)} className="text-foreground hover:bg-secondary">
                    .{format}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </motion.div>
  );
};