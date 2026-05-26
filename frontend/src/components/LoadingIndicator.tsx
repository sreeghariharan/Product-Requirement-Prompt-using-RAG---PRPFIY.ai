import { motion } from "framer-motion";
import { Loader2, Sparkles, ServerCog } from "lucide-react";
import prpfiyLogo from "@/assets/prpfiy-logo.png";
import { cn } from "@/lib/utils";

interface LoadingIndicatorProps {
    statusText?: string;
}

export const LoadingIndicator = ({ statusText = "Analyzing context..." }: LoadingIndicatorProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex gap-4 p-6 rounded-xl animate-slide-in glass-card w-full max-w-2xl"
        >
            <div className="relative w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0">
                <img
                    src={prpfiyLogo}
                    alt="PRPFIY"
                    className="w-10 h-10 rounded-xl object-contain drop-shadow-[0_0_15px_rgba(59,130,246,0.6)] animate-pulse"
                />
                <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5">
                    <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
                </div>
            </div>

            <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-foreground">PRPFIY</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center gap-1.5 animate-pulse">
                        <ServerCog className="w-3 h-3" />
                        Processing
                    </span>
                </div>

                <div className="flex items-center gap-2 text-muted-foreground mt-1 text-sm bg-gradient-to-r from-transparent via-primary/5 to-transparent py-1 rounded">
                    <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 font-medium">
                        {statusText}
                    </span>
                    <span className="typing-pulse w-1.5 h-1.5 rounded-full bg-blue-500 ml-1"></span>
                    <span className="typing-pulse w-1.5 h-1.5 rounded-full bg-purple-500 ml-0.5" style={{ animationDelay: "0.2s" }}></span>
                    <span className="typing-pulse w-1.5 h-1.5 rounded-full bg-blue-500 ml-0.5" style={{ animationDelay: "0.4s" }}></span>
                </div>
            </div>
        </motion.div>
    );
};
