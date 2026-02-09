
import React, { useState } from "react";
import { Search, Filter, Mail, Phone, Pencil, Trash2, Loader2, WifiOff, Building, Globe, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import ContactDetailView from "./ContactDetailView.jsx";
import { useContacts } from "@/hooks/useContacts";
import { useTheme } from "../../theme/ThemeContext";

const typeConfig = {
  attendee: { label: "Attendee", color: "#06b6d4" }, // Cyan
  vendor: { label: "Vendor", color: "#f59e0b" },
  speaker: { label: "Speaker", color: "#10b981" },
  sponsor: { label: "Sponsor", color: "#8b5cf6" },
};

const ContactList = ({ canWrite = true, canDelete = true }) => {
  const { contacts, loading, isConnected, refreshContacts } = useContacts();
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const isDark = theme === 'dark' || theme === 'night';
  const cardBg = theme === 'light' ? '#ffffff' : theme === 'dark' ? 'rgba(30, 41, 59, 0.5)' : 'rgba(15, 23, 42, 0.5)';
  const textColor = isDark ? '#f1f5f9' : '#1e293b';
  const subTextColor = isDark ? '#94a3b8' : '#64748b';
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9';
  const iconBg = isDark ? 'rgba(255, 255, 255, 0.03)' : '#f8fafc';

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.company?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRowClick = (id) => {
    setSelectedContactId(id);
    setIsDetailOpen(true);
  };

  const handleCreateNew = () => {
    setSelectedContactId(null);
    setIsDetailOpen(true);
  };

  if (loading && contacts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-pulse">
        <Loader2 size={48} className="text-emerald-500 animate-spin mb-4" />
        <p className="text-slate-600 font-black uppercase text-[10px] tracking-widest">Synchronizing Intelligence...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-['Inter']">

      {/* Offline Alert */}
      {!isConnected && (
        <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-center justify-between mb-6">
          <div className="flex items-center gap-3 text-amber-600">
            <WifiOff size={18} />
            <span className="text-sm font-bold">Encrypted Local Mode: Connection to database is compromised.</span>
          </div>
          <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-none uppercase text-[10px] font-black">LOCAL SESSION</Badge>
        </div>
      )}

      {/* Search & Actions */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="relative w-full max-w-md group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
          <Input
            placeholder="Search Contact Intelligence..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 rounded-2xl h-14 shadow-sm focus:ring-4 focus:ring-emerald-500/5 transition-all font-medium"
            style={{
              backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : '#ffffff',
              borderColor: borderColor,
              color: textColor
            }}
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="h-14 px-6 rounded-2xl font-bold uppercase text-[11px] tracking-widest transition-all"
            style={{ backgroundColor: cardBg, borderColor: borderColor, color: subTextColor }}
          >
            <Filter size={16} /> Filters
          </Button>
          {canWrite && (
            <Button
              onClick={handleCreateNew}
              className="h-14 px-8 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[11px] tracking-widest shadow-xl shadow-emerald-500/20 transition-all font-['Inter']"
            >
              Initialize New Profile
            </Button>
          )}
        </div>
      </div>

      {/* Grid view instead of table for premium feel */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredContacts.map((contact) => (
          <div
            key={contact.id || contact._id}
            onClick={() => handleRowClick(contact.id || contact._id)}
            className="group relative p-6 rounded-[2.5rem] border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
            style={{ backgroundColor: cardBg, borderColor: borderColor }}
          >
            {/* Backdrop Glow */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/5 blur-[50px] group-hover:bg-emerald-500/10 transition-all rounded-full" />

            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 rounded-2xl shadow-lg" style={{ boxShadow: isDark ? '0 10px 15px -3px rgba(0,0,0,0.3)' : '0 10px 15px -3px rgba(0,0,0,0.05)' }}>
                  <AvatarFallback className="font-black text-xl" style={{ backgroundColor: iconBg, color: textColor }}>
                    {contact.name?.split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-black group-hover:text-emerald-500 transition-colors truncate max-w-[150px]" style={{ color: textColor }}>{contact.name}</h3>
                  <div className="flex items-center gap-2 font-bold uppercase text-[10px] tracking-wider mt-1" style={{ color: subTextColor }}>
                    <Building size={12} className="text-emerald-500" /> {contact.company || 'Private Entity'}
                  </div>
                </div>
              </div>
              <Badge
                style={{
                  backgroundColor: (typeConfig[contact.type]?.color || '#64748b') + '15',
                  color: typeConfig[contact.type]?.color || '#64748b'
                }}
                className="border-none uppercase text-[9px] font-black px-3 py-1 rounded-full"
              >
                {typeConfig[contact.type]?.label || contact.type}
              </Badge>
            </div>

            <div className="space-y-3 pt-6 border-t" style={{ borderColor: borderColor }}>
              <div className="flex items-center gap-3 text-sm font-medium" style={{ color: textColor }}>
                <div className="p-2 rounded-lg" style={{ backgroundColor: iconBg }}><Mail size={14} style={{ color: subTextColor }} /></div>
                <span className="truncate">{contact.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm font-medium" style={{ color: textColor }}>
                <div className="p-2 rounded-lg" style={{ backgroundColor: iconBg }}><Phone size={14} style={{ color: subTextColor }} /></div>
                <span>{contact.phone_number || 'No Intel'}</span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div className="text-[10px] font-black uppercase tracking-widest" style={{ color: subTextColor }}>
                Last Seen: {new Date(contact.createdAt || Date.now()).toLocaleDateString()}
              </div>
              <div className="p-2 rounded-xl opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-100 transition-all" style={{ backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : '#ecfdf5', color: '#10b981' }}>
                <ChevronRight size={16} />
              </div>
            </div>
          </div>
        ))}

        {filteredContacts.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search size={40} className="text-slate-400" />
            </div>
            <h3 className="text-xl font-black text-slate-500 uppercase tracking-tight">No Intelligence Matches</h3>
            <p className="text-slate-600 font-medium">Refine your search parameters to locate specifically classified profiles.</p>
          </div>
        )}
      </div>

      <ContactDetailView
        isOpen={isDetailOpen}
        contactId={selectedContactId}
        onClose={() => setIsDetailOpen(false)}
        onRefresh={refreshContacts}
      />
    </div>
  );
};

export default ContactList;
