import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Sidebar } from "@/components/Sidebar";
import { ChatHeader } from "@/components/ChatHeader";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { Settings } from "@/components/Settings";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import { toast } from "@/hooks/use-toast";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string; // ISO string for safe serialization
  framework?: string;
  mode?: "chat" | "prp";
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
    const saved = localStorage.getItem("prpfiy-spaces");
    const savedSpaces: Space[] = saved ? JSON.parse(saved) : [];
    return savedSpaces.length > 0 ? savedSpaces[0].id : "";
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [temperature, setTemperature] = useState(0.7);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

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
  }, [activeSpace?.messages?.length]);

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
          const systemMessage: Message = {
            id: Date.now().toString(),
            role: "system",
            content: `📄 Document "${file.name}" has been processed and added to the knowledge base.`,
            timestamp: new Date().toISOString(),
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

  const ensureActiveSpace = (): string => {
    if (activeSpaceId) return activeSpaceId;

    // Auto-create a space on first message
    const newSpace: Space = {
      id: Date.now().toString(),
      name: `Chat ${spaces.length + 1}`,
      messageCount: 0,
      documentCount: 0,
      messages: [],
    };
    setSpaces((prev) => [...prev, newSpace]);
    setActiveSpaceId(newSpace.id);
    return newSpace.id;
  };

  const handleSendMessage = async (
    content: string,
    files: File[],
    framework: string,
    mode: string = "chat"
  ) => {
    const spaceId = ensureActiveSpace();

    // Handle file uploads first
    if (files.length > 0) {
      await handleFileUpload(files);
    }

    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date().toISOString(),
      mode: mode as "chat" | "prp",
      attachments: files.map((f) => ({ name: f.name, type: f.type })),
    };

    // Get current messages for history
    const currentSpace = spaces.find((s) => s.id === spaceId);
    const currentMessages = currentSpace?.messages || [];

    // Build conversation history for the backend
    const history = currentMessages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({
        role: m.role,
        content: m.content,
      }));

    // Update space with user message
    setSpaces((prev) =>
      prev.map((s) =>
        s.id === spaceId
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
          mode,
          framework,
          space_id: spaceId,
          temperature,
          history,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to get response");
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response,
        timestamp: new Date().toISOString(),
        framework: mode === "prp" ? framework : undefined,
        mode: data.mode || mode,
        isStreaming: true,
      };

      setSpaces((prev) =>
        prev.map((s) =>
          s.id === spaceId
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
            s.id === spaceId
              ? {
                ...s,
                messages: s.messages.map((m) =>
                  m.id === assistantMessage.id ? { ...m, isStreaming: false } : m
                ),
              }
              : s
          )
        );
      }, Math.min(data.response.length * 10, 3000) + 100);
    } catch (error: unknown) {
      console.error("Chat error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast({
        title: "Error",
        description: errorMessage.includes("API key")
          ? "Please configure your Groq API key in Settings."
          : `Could not get a response. ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSpace = () => {
    const newSpace: Space = {
      id: Date.now().toString(),
      name: `Chat ${spaces.length + 1}`,
      messageCount: 0,
      documentCount: 0,
      messages: [],
    };
    setSpaces((prev) => [...prev, newSpace]);
    setActiveSpaceId(newSpace.id);
    toast({
      title: "Chat Created",
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
      title: "Chat Deleted",
      description: "The chat has been removed.",
    });
  };

  const handleRenameSpace = (spaceId: string, newName: string) => {
    if (!newName.trim()) return;
    setSpaces((prev) =>
      prev.map((s) => (s.id === spaceId ? { ...s, name: newName } : s))
    );
  };

  const handleGoHome = () => {
    navigate("/");
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
      description: "All documents have been removed from this chat.",
    });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link Copied",
      description: "Share link has been copied to clipboard.",
    });
  };

  const handleForkChat = async (targetSpaceId: string) => {
    if (!activeSpaceId || !activeSpace) return;

    setIsLoading(true);
    let newSpaceId = targetSpaceId;
    let isNewSpace = false;

    if (targetSpaceId === "new") {
      newSpaceId = Date.now().toString();
      isNewSpace = true;
    }

    try {
      // If there are documents, fork the knowledge base in backend
      if (activeSpace.documentCount > 0) {
        const response = await fetch(`${API_URL}/fork-knowledge-base`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            source_space_id: activeSpaceId,
            new_space_id: newSpaceId,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to connect knowledge base context");
        }
      }

      if (isNewSpace) {
        // Create new space in frontend with exact same messages
        const newSpace: Space = {
          id: newSpaceId,
          name: `${activeSpace.name} (Connected)`,
          messageCount: activeSpace.messageCount,
          documentCount: activeSpace.documentCount,
          messages: [...activeSpace.messages],
        };
        setSpaces((prev) => [...prev, newSpace]);
      } else {
        // Update document count for existing space
        setSpaces((prev) => prev.map(s =>
          s.id === newSpaceId ? {
            ...s,
            documentCount: s.documentCount + activeSpace.documentCount,
            messages: [...s.messages, {
              id: Date.now().toString(),
              role: "system",
              content: `🔗 Linked context from "${activeSpace.name}".`,
              timestamp: new Date().toISOString()
            }]
          } : s
        ));
      }

      setActiveSpaceId(newSpaceId);

      toast({
        title: "Context Connected",
        description: isNewSpace ? "Context copied to a new chat." : "Context successfully merged into chat.",
      });
    } catch (error) {
      console.error("Fork error:", error);
      toast({
        title: "Error",
        description: "Failed to connect the chat context.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion, [], "RTCFR", "chat");
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar
        spaces={spaces}
        activeSpaceId={activeSpaceId}
        onSelectSpace={setActiveSpaceId}
        onCreateSpace={handleCreateSpace}
        onDeleteSpace={handleDeleteSpace}
        onRenameSpace={handleRenameSpace}
        onGoHome={handleGoHome}
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
              spaces={spaces.map(s => ({ id: s.id, name: s.name }))}
              activeSpaceId={activeSpaceId}
              onClearKB={handleClearKB}
              onShare={handleShare}
              onForkChat={handleForkChat}
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
                    {isLoading && (
                      <LoadingIndicator />
                    )}
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
