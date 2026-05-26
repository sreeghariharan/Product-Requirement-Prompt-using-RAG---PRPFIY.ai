import { useState } from "react";
import { motion } from "framer-motion";
import { FolderOpen, Trash2, Share2, MoreHorizontal, Link as LinkIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ChatHeaderProps {
  spaceName: string;
  documentCount: number;
  spaces: { id: string; name: string }[];
  activeSpaceId: string;
  onClearKB: () => void;
  onShare: () => void;
  onForkChat: (targetSpaceId: string) => void;
}

export const ChatHeader = ({ spaceName, documentCount, spaces, activeSpaceId, onClearKB, onShare, onForkChat }: ChatHeaderProps) => {
  const [connectOpen, setConnectOpen] = useState(false);

  const handleConnect = (targetId: string) => {
    onForkChat(targetId);
    setConnectOpen(false);
  };
  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between px-6 py-4 border-b border-border bg-background/80 backdrop-blur-lg"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
          <FolderOpen className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h2 className="font-medium text-foreground">{spaceName}</h2>
          <p className="text-xs text-muted-foreground">
            {documentCount} document{documentCount !== 1 ? "s" : ""} in knowledge base
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <AlertDialog open={connectOpen} onOpenChange={setConnectOpen}>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
            >
              <LinkIcon className="w-4 h-4 mr-1.5" />
              Connect Chat
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-card border-border max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-foreground flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-primary" />
                Connect Context
              </AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground">
                Share this chat's document context with another chat session.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="py-4 space-y-2 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
              <Button
                variant="outline"
                className="w-full justify-start border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary"
                onClick={() => handleConnect("new")}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New Chat
              </Button>

              {spaces.filter(s => s.id !== activeSpaceId).map(space => (
                <Button
                  key={space.id}
                  variant="ghost"
                  className="w-full justify-start text-foreground hover:bg-secondary border border-transparent hover:border-border"
                  onClick={() => handleConnect(space.id)}
                >
                  <FolderOpen className="w-4 h-4 mr-2 text-muted-foreground" />
                  {space.name}
                </Button>
              ))}

              {spaces.length <= 1 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No other active chats to connect to.
                </p>
              )}
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel className="bg-secondary border-0 text-foreground hover:bg-secondary/80">
                Cancel
              </AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Button
          variant="ghost"
          size="sm"
          onClick={onShare}
          className="text-muted-foreground hover:text-foreground"
        >
          <Share2 className="w-4 h-4 mr-1.5" />
          Share
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-card border-border">
            <DropdownMenuItem className="text-foreground hover:bg-secondary">
              Rename Space
            </DropdownMenuItem>
            <DropdownMenuItem className="text-foreground hover:bg-secondary">
              Export Chat
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border" />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem
                  onSelect={(e) => e.preventDefault()}
                  className="text-destructive hover:bg-destructive/10 focus:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Knowledge Base
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-card border-border">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-foreground">Clear Knowledge Base?</AlertDialogTitle>
                  <AlertDialogDescription className="text-muted-foreground">
                    This will permanently delete all uploaded documents and embeddings from this space. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-secondary border-0 text-foreground hover:bg-secondary/80">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onClearKB}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Yes, Clear All
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.header>
  );
};
