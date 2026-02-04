import React from 'react';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../context/AuthContext';
import {
    Zap, Shield, Globe, TrendingUp,
    ArrowRight, Activity, Cpu, Box
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const { theme } = useTheme();
    const { userName } = useAuth();
    const navigate = useNavigate();

    const isDark = theme === 'dark' || theme === 'night';
    const textColor = isDark ? '#f1f5f9' : '#0f172a';
    const subTextColor = isDark ? '#94a3b8' : '#64748b';
    const cardBg = theme === 'light' ? '#ffffff' : theme === 'dark' ? 'rgba(30, 41, 59, 0.5)' : 'rgba(15, 23, 42, 0.5)';
    const bgColor = theme === 'light' ? '#f8fafc' : theme === 'dark' ? '#0f172a' : '#020617';
    const borderColor = isDark ? 'rgba(255, 255, 255, 0.05)' : '#e2e8f0';

    return (
        <div className="min-h-screen transition-colors duration-500 space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000" style={{ backgroundColor: bgColor, color: textColor }}>
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-[3rem] p-12 lg:p-20 border" style={{ backgroundColor: cardBg, borderColor: borderColor }}>
                <div className="absolute top-0 right-0 p-10 opacity-5">
                    <Cpu size={300} className="text-emerald-500" />
                </div>

                <div className="relative z-10 max-w-2xl text-left">
                    <div className="flex items-center gap-2 mb-6 text-emerald-500">
                        <Zap size={18} fill="currentColor" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em]">System Protocol Active</span>
                    </div>

                    <h1 className="text-5xl lg:text-7xl font-black tracking-tighter mb-8 leading-[0.9]" style={{ color: textColor }}>
                        WELCOME <br />
                        <span className="text-emerald-500 text-6xl lg:text-8xl">COMMANDER</span>
                    </h1>

                    <p className="text-lg font-bold opacity-40 leading-relaxed mb-10 max-w-md uppercase tracking-tight">
                        Your enterprise intelligence core is synchronized. Monitor lead streams and system efficiency in real-time.
                    </p>

                    <div className="flex flex-wrap gap-4">
                        <button
                            onClick={() => navigate('/analytics')}
                            className="bg-emerald-500 text-slate-950 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-emerald-500/20"
                        >
                            Review Intel <ArrowRight size={16} />
                        </button>
                        <button
                            onClick={() => navigate('/sales/leads')}
                            className="border px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-white/5 transition-all"
                            style={{ borderColor: borderColor, color: textColor }}
                        >
                            Open Pipeline
                        </button>
                    </div>
                </div>
            </div>

            {/* Quick Stats Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'System Load', value: 'Minimal', icon: Activity, color: 'text-blue-500' },
                    { label: 'Security Level', value: 'Maximum', icon: Shield, color: 'text-emerald-500' },
                    { label: 'Network status', value: 'Global', icon: Globe, color: 'text-purple-500' }
                ].map((item, idx) => (
                    <div key={idx} className="relative group overflow-hidden border p-8 rounded-[2.5rem] transition-all duration-500 shadow-sm hover:shadow-xl hover:translate-y-[-4px]" style={{ backgroundColor: cardBg, borderColor: borderColor }}>
                        <div className="flex items-center gap-4 mb-6">
                            <div className={`p-4 rounded-2xl bg-slate-500/5 ${item.color}`}>
                                <item.icon size={24} />
                            </div>
                            <div className="text-left">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">{item.label}</h3>
                                <p className="text-xl font-black uppercase tracking-tight" style={{ color: textColor }}>{item.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Sub Features Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="border p-10 rounded-[3rem] transition-all" style={{ backgroundColor: cardBg, borderColor: borderColor }}>
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-10 h-10 bg-blue-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                            <TrendingUp size={20} />
                        </div>
                        <h2 className="text-xl font-black uppercase tracking-tighter" style={{ color: textColor }}>Efficiency Protocol</h2>
                    </div>
                    <p className="text-sm font-bold opacity-30 uppercase tracking-tight leading-relaxed text-left mb-8">
                        Automated lead scoring and sentiment analysis are currently processing 45 fragments per minute. System throughput is at 99.8%.
                    </p>
                    <div className="h-2 w-full bg-slate-500/5 rounded-full overflow-hidden mb-2">
                        <div className="h-full bg-blue-500 w-[85%] rounded-full animate-pulse" />
                    </div>
                    <div className="flex justify-between text-[8px] font-black uppercase tracking-[0.2em] opacity-30 mt-4">
                        <span>Current Load: 85%</span>
                        <span>Uptime: 2,450 Hours</span>
                    </div>
                </div>

                <div className="border p-10 rounded-[3rem] transition-all relative group overflow-hidden" style={{ backgroundColor: cardBg, borderColor: borderColor }}>
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-10 h-10 bg-purple-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
                            <Box size={20} />
                        </div>
                        <h2 className="text-xl font-black uppercase tracking-tighter" style={{ color: textColor }}>Active Modules</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {['Sales Core', 'Inventory Hub', 'Activity Tracker', 'Analytics Grid'].map((mod, i) => (
                            <div key={i} className="bg-slate-500/5 border p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center" style={{ borderColor: borderColor }}>
                                {mod}
                            </div>
                        ))}
                    </div>
                    <div className="mt-8 pt-8 border-t flex items-center justify-between" style={{ borderColor: borderColor }}>
                        <span className="text-[10px] font-black opacity-30 uppercase tracking-[0.3em]">Antigravity UI Sync</span>
                        <div className="flex -space-x-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-6 h-6 rounded-lg bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-[8px] font-bold text-slate-500">
                                    {userName ? userName[0].toUpperCase() : 'U'}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
