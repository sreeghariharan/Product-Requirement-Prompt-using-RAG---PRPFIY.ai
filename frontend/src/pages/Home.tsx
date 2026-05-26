import { Hero3D } from '@/components/Hero3D';
import { NavBar } from '@/components/NavBar';
import { ArrowRight, Code, FileText, Zap, BrainCircuit } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const FeatureCard = ({ icon: Icon, title, description, delay }: { icon: any, title: string, description: string, delay: number }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.5 }}
        className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-colors shadow-xl"
    >
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
            <Icon className="text-white" size={24} />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
        <p className="text-white/60 leading-relaxed">{description}</p>
    </motion.div>
);

const Home = () => {
    return (
        <div className="relative min-h-screen bg-slate-950 overflow-hidden selection:bg-blue-500/30">
            <Hero3D />
            <NavBar />

            <main className="relative z-10 container mx-auto px-6 pt-32 pb-20 mt-10 min-h-[calc(100vh-80px)] flex flex-col justify-center">
                <div className="max-w-4xl mx-auto text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/80 text-sm mb-8 shadow-sm">
                            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                            Next-Gen AI Workspace
                        </div>

                        <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/60 tracking-tight mb-8">
                            Transform Your Workflow with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 drop-shadow-sm">Prpfiy AI</span>
                        </h1>

                        <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
                            Experience the power of dual-mode conversation, seamless document generation, and 1-click intelligent coding, all in a unified and stunning interface.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link to="/chat" className="group relative px-8 py-4 bg-white text-black font-semibold rounded-full overflow-hidden transition-all hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-purple-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <span className="relative flex items-center justify-center gap-2 text-lg">
                                    Get Started for Free <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </span>
                            </Link>
                        </div>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12 w-full max-w-7xl mx-auto">
                    <FeatureCard
                        icon={BrainCircuit}
                        title="Dual-Mode AI"
                        description="Switch effortlessly between standard conversation and specialized PRP document generation mode."
                        delay={0.2}
                    />
                    <FeatureCard
                        icon={Code}
                        title="1-Click Coding"
                        description="Instantly generate, preview, and apply code snippets crafted specifically for your project framework."
                        delay={0.4}
                    />
                    <FeatureCard
                        icon={FileText}
                        title="Smart Knowledge Base"
                        description="Upload documents seamlessly and instantly let the AI consume, analyze, and retrieve information."
                        delay={0.6}
                    />
                    <FeatureCard
                        icon={Zap}
                        title="Lightning Fast"
                        description="Powered by Prpfiy.ai's high-speed inference engine for near-instantaneous, high-quality responses."
                        delay={0.8}
                    />
                </div>
            </main>
        </div>
    );
};

export default Home;
