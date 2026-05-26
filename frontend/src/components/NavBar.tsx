import { Link } from 'react-router-dom';
import { Github, MessageSquare } from 'lucide-react';
import prpfiyLogo from "@/assets/prpfiy-logo.png";

export const NavBar = () => {
    return (
        <nav className="absolute top-0 w-full z-50 flex items-center justify-between px-6 py-4 backdrop-blur-sm bg-black/10 border-b border-white/10">
            <div className="flex items-center gap-2">
                <div className="h-10 w-10 flex items-center justify-center">
                    <img src={prpfiyLogo} alt="PRPFIY" className="w-10 h-10 object-contain drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                </div>
                <span className="text-white font-heading font-bold text-2xl tracking-wide ml-2">Prpfiy.ai</span>
            </div>

            <div className="flex items-center gap-6">
                <Link
                    to="/chat"
                    className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium transition-all backdrop-blur-md border border-white/20 hover:scale-105"
                >
                    <MessageSquare size={18} />
                    <span>Launch App</span>
                </Link>
                <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors"
                >
                    <Github size={22} />
                </a>
            </div>
        </nav>
    );
};
