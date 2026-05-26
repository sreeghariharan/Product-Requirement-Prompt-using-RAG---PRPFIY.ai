import { useState, useEffect, forwardRef, useMemo } from "react";
import { motion } from "framer-motion";
import { User, Bot, Download, Copy, Check, FileText, Info, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import prpfiyLogo from "@/assets/prpfiy-logo.png";

interface ChatMessageProps {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  isStreaming?: boolean;
  framework?: string;
  mode?: "chat" | "prp";
  attachments?: { name: string; type: string }[];
}

/**
 * Simple markdown-to-HTML renderer for chat messages.
 * Handles: headers, bold, italic, inline code, code blocks, lists, links, hr.
 */
function renderMarkdown(text: string): string {
  // Escape HTML entities
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Code blocks (```lang\n...\n```)
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    return `<pre class="bg-black/40 rounded-lg p-4 my-3 overflow-x-auto text-sm"><code class="language-${lang || 'text'}">${code.trim()}</code></pre>`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="bg-black/40 px-1.5 py-0.5 rounded text-sm text-primary">$1</code>');

  // Headers (## before bold to avoid conflict)
  html = html.replace(/^#### (.+)$/gm, '<h4 class="text-base font-semibold text-foreground mt-4 mb-1">$1</h4>');
  html = html.replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold text-foreground mt-4 mb-2">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-foreground mt-5 mb-2">$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold text-foreground mt-5 mb-3">$1</h1>');

  // Bold + Italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="text-foreground">$1</strong>');
  // Italic
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Horizontal rules
  html = html.replace(/^---+$/gm, '<hr class="border-border my-4" />');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="text-primary hover:underline">$1</a>');

  // Unordered lists
  html = html.replace(/^(\s*)-\s+(.+)$/gm, (_, indent, content) => {
    const level = indent.length >= 4 ? 'ml-6' : indent.length >= 2 ? 'ml-4' : 'ml-2';
    return `<li class="flex items-start gap-2 ${level} my-0.5"><span class="text-primary mt-1.5 text-xs">●</span><span>${content}</span></li>`;
  });

  // Ordered lists
  html = html.replace(/^(\d+)\.\s+(.+)$/gm,
    '<li class="flex items-start gap-2 ml-2 my-0.5"><span class="text-primary font-medium min-w-[1.2em]">$1.</span><span>$2</span></li>');

  // Paragraphs — wrap loose lines (not already wrapped in HTML)
  html = html
    .split('\n')
    .map(line => {
      const trimmed = line.trim();
      if (!trimmed) return '';
      if (trimmed.startsWith('<')) return line;
      return `<p class="my-1">${line}</p>`;
    })
    .join('\n');

  return html;
}

export const ChatMessage = forwardRef<HTMLDivElement, ChatMessageProps>(({
  role,
  content,
  timestamp,
  isStreaming,
  framework,
  mode,
  attachments,
}, ref) => {
  const [displayedContent, setDisplayedContent] = useState(isStreaming ? "" : content);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isStreaming && content) {
      let index = 0;
      const speed = Math.max(5, Math.min(15, 3000 / content.length));
      const interval = setInterval(() => {
        if (index <= content.length) {
          setDisplayedContent(content.slice(0, index));
          index++;
        } else {
          clearInterval(interval);
        }
      }, speed);
      return () => clearInterval(interval);
    } else {
      setDisplayedContent(content);
    }
  }, [content, isStreaming]);

  const renderedHtml = useMemo(() => {
    if (role === "assistant") {
      return renderMarkdown(displayedContent);
    }
    return "";
  }, [displayedContent, role]);

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

  const formattedTime = (() => {
    try {
      return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  })();

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
      ref={ref}
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
          role === "user" ? "bg-secondary" : ""
        )}
      >
        {role === "user" ? (
          <User className="w-5 h-5 text-secondary-foreground" />
        ) : (
          <img src={prpfiyLogo} alt="Bot" className="w-10 h-10 rounded-xl object-contain drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-2">
          <span className="font-medium text-foreground">
            {role === "user" ? "You" : "PRPFIY"}
          </span>
          {framework && role === "assistant" && mode === "prp" && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary flex items-center gap-1">
              <Wand2 className="w-3 h-3" />
              {framework}
            </span>
          )}
          <span className="text-xs text-muted-foreground">
            {formattedTime}
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
          {role === "assistant" ? (
            <div
              className="text-foreground/90 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: renderedHtml }}
            />
          ) : (
            <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
              {displayedContent}
            </p>
          )}
          {isStreaming && displayedContent.length < content.length && (
            <span className="inline-block w-2 h-5 ml-1 bg-primary typing-pulse" />
          )}
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
                {["md", "txt"].map((format) => (
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
});

ChatMessage.displayName = "ChatMessage";