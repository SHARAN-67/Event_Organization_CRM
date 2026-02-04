import React from 'react';
import { useTheme } from './ThemeContext';
import { Sun, Moon, Ghost, Zap } from 'lucide-react';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    const getIcon = () => {
        if (theme === 'light') return <Sun className="w-4 h-4 text-amber-500" />;
        if (theme === 'dark') return <Moon className="w-4 h-4 text-blue-400" />;
        return <Ghost className="w-4 h-4 text-emerald-400" />;
    };

    const getLabel = () => {
        if (theme === 'light') return 'Aether Light';
        if (theme === 'dark') return 'Void Dark';
        return 'Phantom Night';
    };

    return (
        <button
            onClick={toggleTheme}
            className="flex items-center gap-3 px-4 py-2 bg-white/5 dark:bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl hover:border-emerald-500/50 transition-all duration-500 group shadow-lg"
        >
            <div className="relative">
                <div className={`absolute inset-0 blur-md opacity-50 group-hover:opacity-100 transition-opacity ${theme === 'light' ? 'bg-amber-500' : theme === 'dark' ? 'bg-blue-500' : 'bg-emerald-500'
                    }`} />
                <div className="relative bg-slate-950 p-2 rounded-xl border border-white/10">
                    {getIcon()}
                </div>
            </div>

            <div className="flex flex-col items-start min-w-[100px]">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 group-hover:text-emerald-500 transition-colors">
                    Core Theme
                </span>
                <span className="text-xs font-bold text-white/90 dark:text-slate-200">
                    {getLabel()}
                </span>
            </div>

            <div className="ml-2 p-1 bg-white/5 rounded-lg border border-white/5 opacity-30 group-hover:opacity-100 transition-opacity">
                <Zap className="w-3 h-3 text-slate-400" />
            </div>
        </button>
    );
};

export default ThemeToggle;
