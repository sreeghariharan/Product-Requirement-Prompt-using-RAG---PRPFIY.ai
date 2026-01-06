import { motion } from "framer-motion";
import { FolderOpen, Trash2, Share2, MoreHorizontal } from "lucide-react";
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
  onClearKB: () => void;
  onShare: () => void;
}

export const ChatHeader = ({ spaceName, documentCount, onClearKB, onShare }: ChatHeaderProps) => {
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
