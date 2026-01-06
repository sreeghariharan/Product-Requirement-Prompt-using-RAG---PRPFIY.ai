import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, FolderOpen, Settings, ChevronLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import prpfiyLogo from "@/assets/prpfiy-logo.png";
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

interface Space {
  id: string;
  name: string;
  messageCount: number;
}

interface SidebarProps {
  spaces: Space[];
  activeSpaceId: string;
  onSelectSpace: (id: string) => void;
  onCreateSpace: () => void;
  onDeleteSpace: (id: string) => void;
  onOpenSettings: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar = ({
  spaces,
  activeSpaceId,
  onSelectSpace,
  onCreateSpace,
  onDeleteSpace,
  onOpenSettings,
  isCollapsed,
  onToggleCollapse,
}: SidebarProps) => {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 72 : 280 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="h-screen bg-sidebar border-r border-sidebar-border flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <img src={prpfiyLogo} alt="PRPFIY" className="w-8 h-8 rounded-lg" />
              <span className="font-semibold text-foreground">PRPFIY</span>
            </motion.div>
          )}
        </AnimatePresence>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
        >
          <ChevronLeft className={cn("w-4 h-4 transition-transform", isCollapsed && "rotate-180")} />
        </Button>
      </div>

      {/* New Space Button */}
      <div className="p-3">
        <Button
          onClick={onCreateSpace}
          className={cn(
            "w-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30",
            "transition-all duration-200 hover:glow-primary-subtle",
            isCollapsed && "px-0"
          )}
        >
          <Plus className="w-4 h-4" />
          {!isCollapsed && <span className="ml-2">New Space</span>}
        </Button>
      </div>

      {/* Spaces List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-3 py-2">
        <AnimatePresence>
          {!isCollapsed && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 px-2"
            >
              Spaces
            </motion.p>
          )}
        </AnimatePresence>
        
        <div className="space-y-1">
          {spaces.length === 0 && !isCollapsed && (
            <p className="text-sm text-muted-foreground px-2 py-4 text-center">
              No spaces yet. Create one to get started.
            </p>
          )}
          {spaces.map((space, index) => (
            <motion.div
              key={space.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "flex items-center gap-2 group",
                isCollapsed && "justify-center"
              )}
            >
              <button
                onClick={() => onSelectSpace(space.id)}
                className={cn(
                  "flex-1 flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                  "hover:bg-sidebar-accent",
                  activeSpaceId === space.id && "bg-sidebar-accent border border-primary/30"
                )}
              >
                <FolderOpen
                  className={cn(
                    "w-4 h-4 flex-shrink-0",
                    activeSpaceId === space.id ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                {!isCollapsed && (
                  <div className="flex-1 text-left min-w-0">
                    <p className={cn(
                      "text-sm truncate",
                      activeSpaceId === space.id ? "text-foreground font-medium" : "text-sidebar-foreground"
                    )}>
                      {space.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {space.messageCount} messages
                    </p>
                  </div>
                )}
              </button>
              
              {!isCollapsed && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-card border-border">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-foreground">Delete Space?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{space.name}"? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="border-border">Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDeleteSpace(space.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border">
        <Button
          variant="ghost"
          onClick={onOpenSettings}
          className={cn(
            "w-full justify-start text-muted-foreground hover:text-foreground hover:bg-sidebar-accent",
            isCollapsed && "justify-center px-0"
          )}
        >
          <Settings className="w-4 h-4" />
          {!isCollapsed && <span className="ml-2">Settings</span>}
        </Button>
      </div>
    </motion.aside>
  );
};
