import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "@/components/Sidebar";
import { ChatHeader } from "@/components/ChatHeader";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { toast } from "@/hooks/use-toast";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  framework?: string;
  attachments?: { name: string; type: string }[];
  isStreaming?: boolean;
}

interface Space {
  id: string;
  name: string;
  messageCount: number;
  documentCount: number;
  messages: Message[];
}

const INITIAL_SPACES: Space[] = [
  { id: "1", name: "Product Requirements", messageCount: 0, documentCount: 0, messages: [] },
  { id: "2", name: "Drone Delivery PRD", messageCount: 0, documentCount: 0, messages: [] },
  { id: "3", name: "Lost-and-Found App", messageCount: 0, documentCount: 0, messages: [] },
];

const SAMPLE_RESPONSES: Record<string, string> = {
  default: `# Product Requirement Prompt (PRP)

## 1. Role & Context
As a Product Manager, I need to define clear requirements for the proposed system, ensuring alignment between stakeholders and development teams.

## 2. Task Definition
Generate a comprehensive Product Requirements Document that covers:
- Feature specifications
- User stories
- Technical constraints
- Success metrics

## 3. Requirements
### Functional Requirements
- User authentication and authorization
- Core feature implementation
- Data management and storage
- API integrations

### Non-Functional Requirements
- Performance: < 200ms response time
- Scalability: Support for 10k concurrent users
- Security: SOC 2 compliance

## 4. Format
Deliver in Markdown format with clear sections, bullet points for specifications, and tables for comparative analysis.

---

*Generated using AIR Method (Align-Improve-Refine) with RTCFR framework*`,
};

const Index = () => {
  const [spaces, setSpaces] = useState<Space[]>(INITIAL_SPACES);
  const [activeSpaceId, setActiveSpaceId] = useState("1");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeSpace = spaces.find((s) => s.id === activeSpaceId) || spaces[0];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeSpace.messages]);

  const handleSendMessage = async (
    content: string,
    files: File[],
    framework: string,
    _mode: "rag" | "llm"
  ) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
      attachments: files.map((f) => ({ name: f.name, type: f.type })),
    };

    // Update space with user message
    setSpaces((prev) =>
      prev.map((s) =>
        s.id === activeSpaceId
          ? {
              ...s,
              messages: [...s.messages, userMessage],
              messageCount: s.messageCount + 1,
              documentCount: s.documentCount + files.length,
            }
          : s
      )
    );

    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: SAMPLE_RESPONSES.default,
        timestamp: new Date(),
        framework,
        isStreaming: true,
      };

      setSpaces((prev) =>
        prev.map((s) =>
          s.id === activeSpaceId
            ? {
                ...s,
                messages: [...s.messages, assistantMessage],
                messageCount: s.messageCount + 1,
              }
            : s
        )
      );

      setIsLoading(false);

      // Remove streaming flag after animation
      setTimeout(() => {
        setSpaces((prev) =>
          prev.map((s) =>
            s.id === activeSpaceId
              ? {
                  ...s,
                  messages: s.messages.map((m) =>
                    m.id === assistantMessage.id ? { ...m, isStreaming: false } : m
                  ),
                }
              : s
          )
        );
      }, SAMPLE_RESPONSES.default.length * 15 + 100);
    }, 1000);
  };

  const handleCreateSpace = () => {
    const newSpace: Space = {
      id: Date.now().toString(),
      name: `New Space ${spaces.length + 1}`,
      messageCount: 0,
      documentCount: 0,
      messages: [],
    };
    setSpaces((prev) => [...prev, newSpace]);
    setActiveSpaceId(newSpace.id);
    toast({
      title: "Space Created",
      description: `"${newSpace.name}" has been created.`,
    });
  };

  const handleClearKB = () => {
    setSpaces((prev) =>
      prev.map((s) =>
        s.id === activeSpaceId ? { ...s, documentCount: 0 } : s
      )
    );
    toast({
      title: "Knowledge Base Cleared",
      description: "All documents have been removed from this space.",
    });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link Copied",
      description: "Share link has been copied to clipboard.",
    });
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion, [], "RTCFR", "rag");
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar
        spaces={spaces}
        activeSpaceId={activeSpaceId}
        onSelectSpace={setActiveSpaceId}
        onCreateSpace={handleCreateSpace}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <main className="flex-1 flex flex-col min-w-0">
        <ChatHeader
          spaceName={activeSpace.name}
          documentCount={activeSpace.documentCount}
          onClearKB={handleClearKB}
          onShare={handleShare}
        />

        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {activeSpace.messages.length === 0 ? (
            <WelcomeScreen onSuggestionClick={handleSuggestionClick} />
          ) : (
            <div className="max-w-4xl mx-auto py-6 px-4">
              <AnimatePresence mode="popLayout">
                {activeSpace.messages.map((message) => (
                  <ChatMessage key={message.id} {...message} />
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
      </main>
    </div>
  );
};

export default Index;
