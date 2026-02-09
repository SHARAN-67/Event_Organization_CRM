import React from "react";
import ContactList from "@/components/contacts/ContactList.jsx";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "../../theme/ThemeContext";
import { Globe, ShieldCheck } from "lucide-react";

const Contacts = () => {
  const { hasPermission } = useAuth();
  const { theme } = useTheme();

  const canWrite = hasPermission('Contacts', 'Write');
  const canDelete = hasPermission('Contacts', 'Delete');

  const isDark = theme === 'dark' || theme === 'night';
  const textColor = isDark ? '#f1f5f9' : '#1a202c';
  const subTextColor = isDark ? '#94a3b8' : '#64748b';
  const cardBg = theme === 'light' ? '#ffffff' : theme === 'dark' ? 'rgba(30, 41, 59, 0.5)' : 'rgba(15, 23, 42, 0.5)';
  const bgColor = theme === 'light' ? '#f8fafc' : theme === 'dark' ? '#0f172a' : '#020617';
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.05)' : '#e2e8f0';

  return (
    <div className="p-10 min-h-screen transition-colors duration-500 animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ backgroundColor: bgColor, color: textColor }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .page-animation { animation: fadeIn 0.4s ease-out; }
      `}</style>

      <div className="page-animation">
        {/* Page Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-12 gap-8 text-left">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-emerald-600 p-2.5 rounded-xl shadow-lg shadow-emerald-500/20">
                <Globe size={20} className="text-white" />
              </div>
              <span className="text-emerald-500 font-black text-[10px] uppercase tracking-[0.3em]">Directory Intelligence Node</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-black tracking-tighter leading-none uppercase" style={{ color: textColor }}>
              GLOBAL <br /><span className="text-emerald-500">DIRECTORY</span>
            </h1>
            <p className="text-lg font-bold opacity-40 mt-6 max-w-lg leading-relaxed uppercase tracking-tight">
              A centralized repository for attendees, vendors, and sponsors. Synchronized with core biometric protocols.
            </p>
          </div>

          <div className="flex items-center gap-6 p-6 rounded-[2rem] border transition-all shadow-sm" style={{ backgroundColor: cardBg, borderColor: borderColor }}>
            <div className="text-right">
              <p className="text-[10px] font-black opacity-30 uppercase tracking-widest leading-none mb-2">Security Status</p>
              <p className="text-emerald-500 font-black text-sm uppercase tracking-wider">Active Protocol</p>
            </div>
            <div className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20">
              <ShieldCheck size={24} className="text-emerald-500" />
            </div>
          </div>
        </div>

        {/* Intelligence List Component */}
        <div className="rounded-[2.5rem] overflow-hidden" style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}>
          <ContactList canWrite={canWrite} canDelete={canDelete} />
        </div>
      </div>
    </div>
  );
};

export default Contacts;
