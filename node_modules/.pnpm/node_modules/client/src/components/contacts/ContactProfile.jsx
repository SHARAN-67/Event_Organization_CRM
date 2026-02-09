import React from "react";
import { ArrowLeft, Mail, Phone, Building, User, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTheme } from "../../theme/ThemeContext";

const typeConfig = {
  attendee: { label: "Attendee", color: "#06b6d4" },
  vendor: { label: "Vendor", color: "#f59e0b" },
  speaker: { label: "Speaker", color: "#10b981" },
  sponsor: { label: "Sponsor", color: "#8b5cf6" },
};

export function ContactProfile({ contact, onBack, onEdit, onDelete }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark' || theme === 'night';
  const typeInfo = typeConfig[contact.type] || { label: contact.type, color: '#6b7280' };

  const themeStyles = {
    container: {
      maxWidth: '800px',
      margin: '0 auto',
    },
    backButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      marginBottom: '1.5rem',
      padding: '0.5rem',
      backgroundColor: 'transparent',
      border: 'none',
      cursor: 'pointer',
      color: isDark ? '#94a3b8' : '#6b7280',
      fontSize: '0.875rem',
      borderRadius: '0.375rem',
    },
    name: {
      fontSize: '2rem',
      fontWeight: '900',
      color: isDark ? '#f1f5f9' : '#111827',
      margin: 0,
      letterSpacing: '-0.025em',
    },
    role: {
      fontSize: '0.875rem',
      color: isDark ? '#94a3b8' : '#6b7280',
      marginTop: '0.25rem',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    },
    card: {
      backgroundColor: isDark ? 'rgba(30, 41, 59, 0.5)' : '#ffffff',
      borderRadius: '2rem',
      padding: '2.5rem',
      border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9'}`,
      boxShadow: isDark ? '0 20px 25px -5px rgba(0, 0, 0, 0.2)' : '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
      marginBottom: '1.5rem',
    },
    cardTitle: {
      fontSize: '1rem',
      fontWeight: '900',
      color: isDark ? '#f1f5f9' : '#111827',
      marginBottom: '1.5rem',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      opacity: 0.5,
    },
    infoRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      padding: '1rem 0',
      borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.05)' : '#f3f4f6'}`,
    },
    infoLabel: {
      color: isDark ? '#64748b' : '#6b7280',
      fontSize: '0.75rem',
      fontWeight: '900',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    },
    infoValue: {
      color: isDark ? '#f1f5f9' : '#111827',
      fontWeight: '600',
      fontSize: '1rem',
    }
  };

  return (
    <div style={themeStyles.container}>
      <button
        style={themeStyles.backButton}
        onClick={onBack}
        onMouseEnter={(e) => { e.target.style.backgroundColor = isDark ? 'rgba(255,255,255,0.05)' : '#f3f4f6'; }}
        onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent'; }}
      >
        <ArrowLeft size={18} />
        Back to Contacts
      </button>

      <div className="flex items-center gap-6 mb-12">
        <Avatar style={{
          width: '100px',
          height: '100px',
          backgroundColor: typeInfo.color + '15',
          color: typeInfo.color,
          border: `1px solid ${typeInfo.color}30`
        }}>
          <AvatarFallback style={{ fontSize: '2rem', fontWeight: '900' }}>
            {contact.name.split(" ").map((n) => n[0]).join("")}
          </AvatarFallback>
        </Avatar>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h1 style={themeStyles.name}>{contact.name}</h1>
            <Badge style={{ backgroundColor: typeInfo.color + '15', color: typeInfo.color, border: 'none', fontWeight: '900', textTransform: 'uppercase', fontSize: '10px' }}>
              {typeInfo.label}
            </Badge>
          </div>
          <p style={themeStyles.role}>{contact.role} @ {contact.company}</p>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" onClick={onEdit} className="rounded-xl px-5 font-bold uppercase text-[10px] tracking-widest h-11 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/10">
              <Pencil size={14} />
              Edit Intelligence
            </Button>
            <Button variant="destructive" onClick={onDelete} className="rounded-xl px-5 font-bold uppercase text-[10px] tracking-widest h-11 shadow-lg shadow-red-500/20">
              <Trash2 size={14} />
              Decommission
            </Button>
          </div>
        </div>
      </div>

      <div style={themeStyles.card}>
        <h3 style={themeStyles.cardTitle}>Personnel Intelligence</h3>

        <div style={themeStyles.infoRow}>
          <div className="p-3 rounded-xl" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc' }}>
            <Mail size={20} color={typeInfo.color} />
          </div>
          <div>
            <div style={themeStyles.infoLabel}>Transmission Channel</div>
            <div style={themeStyles.infoValue}>{contact.email}</div>
          </div>
        </div>

        <div style={themeStyles.infoRow}>
          <div className="p-3 rounded-xl" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc' }}>
            <Phone size={20} color={typeInfo.color} />
          </div>
          <div>
            <div style={themeStyles.infoLabel}>Direct Line</div>
            <div style={themeStyles.infoValue}>{contact.phone || 'Classified'}</div>
          </div>
        </div>

        <div style={themeStyles.infoRow}>
          <div className="p-3 rounded-xl" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc' }}>
            <Building size={20} color={typeInfo.color} />
          </div>
          <div>
            <div style={themeStyles.infoLabel}>Organization</div>
            <div style={themeStyles.infoValue}>{contact.company || 'Independent Operative'}</div>
          </div>
        </div>

        <div style={{ ...themeStyles.infoRow, borderBottom: 'none' }}>
          <div className="p-3 rounded-xl" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc' }}>
            <User size={20} color={typeInfo.color} />
          </div>
          <div>
            <div style={themeStyles.infoLabel}>Designated Role</div>
            <div style={themeStyles.infoValue}>{contact.role || 'Unspecified'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
