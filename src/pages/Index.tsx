import { useState, useRef, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { Sidebar } from "@/components/Sidebar";
import { ChatHeader } from "@/components/ChatHeader";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { Settings } from "@/components/Settings";
import { toast } from "@/hooks/use-toast";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
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

const API_URL = "http://localhost:8000";

const Index = () => {
  const [spaces, setSpaces] = useState<Space[]>(() => {
    const saved = localStorage.getItem("prpfiy-spaces");
    return saved ? JSON.parse(saved) : [];
  });
  const [activeSpaceId, setActiveSpaceId] = useState<string>(() => {
    return spaces.length > 0 ? spaces[0].id : "";
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [temperature, setTemperature] = useState(0.7);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeSpace = spaces.find((s) => s.id === activeSpaceId);

  // Save spaces to localStorage
  useEffect(() => {
    localStorage.setItem("prpfiy-spaces", JSON.stringify(spaces));
  }, [spaces]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (activeSpace) {
      scrollToBottom();
    }
  }, [activeSpace?.messages]);

  const handleFileUpload = async (files: File[]) => {
    if (!activeSpaceId) return;

    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("space_id", activeSpaceId);

      try {
        const response = await fetch(`${API_URL}/upload`, {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          // Add system message about file upload
          const systemMessage: Message = {
            id: Date.now().toString(),
            role: "system",
            content: `📄 Document "${file.name}" has been processed and added to the knowledge base.`,
            timestamp: new Date(),
          };

          setSpaces((prev) =>
            prev.map((s) =>
              s.id === activeSpaceId
                ? {
                    ...s,
                    messages: [...s.messages, systemMessage],
                    documentCount: s.documentCount + 1,
                  }
                : s
            )
          );

          toast({
            title: "Document Uploaded",
            description: `"${file.name}" has been added to the knowledge base.`,
          });
        }
      } catch (error) {
        console.error("Upload error:", error);
        toast({
          title: "Upload Failed",
          description: "Could not upload document. Make sure the backend is running.",
          variant: "destructive",
        });
      }
    }
  };

  const handleSendMessage = async (
    content: string,
    files: File[],
    framework: string
  ) => {
    if (!activeSpaceId) {
      toast({
        title: "No Space Selected",
        description: "Please create a space first.",
        variant: "destructive",
      });
      return;
    }

    // Handle file uploads first
    if (files.length > 0) {
      await handleFileUpload(files);
    }

    if (!content.trim()) return;

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
            }
          : s
      )
    );

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content,
          framework,
          space_id: activeSpaceId,
          temperature,
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response,
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
      }, data.response.length * 15 + 100);
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "Connection Error",
        description: "Could not connect to the backend. Make sure it's running on http://localhost:8000",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSpace = () => {
    const newSpace: Space = {
      id: Date.now().toString(),
      name: `Space ${spaces.length + 1}`,
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

  const handleDeleteSpace = (spaceId: string) => {
    setSpaces((prev) => prev.filter((s) => s.id !== spaceId));
    if (activeSpaceId === spaceId) {
      const remaining = spaces.filter((s) => s.id !== spaceId);
      setActiveSpaceId(remaining.length > 0 ? remaining[0].id : "");
    }
    toast({
      title: "Space Deleted",
      description: "The space has been removed.",
    });
  };

  const handleClearKB = () => {
    if (!activeSpaceId) return;
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
    if (!activeSpaceId) {
      // Create a space first
      handleCreateSpace();
      setTimeout(() => {
        handleSendMessage(suggestion, [], "RTCFR");
      }, 100);
    } else {
      handleSendMessage(suggestion, [], "RTCFR");
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar
        spaces={spaces}
        activeSpaceId={activeSpaceId}
        onSelectSpace={setActiveSpaceId}
        onCreateSpace={handleCreateSpace}
        onDeleteSpace={handleDeleteSpace}
        onOpenSettings={() => setSettingsOpen(true)}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <main className="flex-1 flex flex-col min-w-0">
        {activeSpace ? (
          <>
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

            <ChatInput
              onSend={handleSendMessage}
              onFileUpload={handleFileUpload}
              temperature={temperature}
              onTemperatureChange={setTemperature}
              isLoading={isLoading}
            />
          </>
        ) : (
          <div className="flex-1 flex flex-col">
            <WelcomeScreen onSuggestionClick={handleSuggestionClick} />
            <ChatInput
              onSend={handleSendMessage}
              onFileUpload={handleFileUpload}
              temperature={temperature}
              onTemperatureChange={setTemperature}
              isLoading={isLoading}
            />
          </div>
        )}
      </main>

      <Settings isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
};

export default Index;
