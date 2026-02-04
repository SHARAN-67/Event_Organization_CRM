import React from "react";
import { ArrowLeft, Mail, Phone, Building, User, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const typeConfig = {
  attendee: { label: "Attendee", color: "#3b82f6" },
  vendor: { label: "Vendor", color: "#f59e0b" },
  speaker: { label: "Speaker", color: "#10b981" },
  sponsor: { label: "Sponsor", color: "#8b5cf6" },
};

const profileStyles = {
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
    color: '#6b7280',
    fontSize: '0.875rem',
    borderRadius: '0.375rem',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  avatar: {
    width: '80px',
    height: '80px',
    fontSize: '1.5rem',
  },
  name: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#111827',
    margin: 0,
  },
  role: {
    fontSize: '0.875rem',
    color: '#6b7280',
    marginTop: '0.25rem',
  },
  actions: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '0.75rem',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '0.5rem',
    padding: '1.5rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    marginBottom: '1rem',
  },
  cardTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '1rem',
  },
  infoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 0',
    borderBottom: '1px solid #f3f4f6',
  },
  infoLabel: {
    color: '#6b7280',
    fontSize: '0.875rem',
  },
  infoValue: {
    color: '#111827',
    fontWeight: '500',
  },
};

export function ContactProfile({ contact, onBack, onEdit, onDelete }) {
  const typeInfo = typeConfig[contact.type] || { label: contact.type, color: '#6b7280' };

  return (
    <div style={profileStyles.container}>
      <button
        style={profileStyles.backButton}
        onClick={onBack}
        onMouseEnter={(e) => { e.target.style.backgroundColor = '#f3f4f6'; }}
        onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent'; }}
      >
        <ArrowLeft size={18} />
        Back to Contacts
      </button>

      <div style={profileStyles.header}>
        <Avatar style={{
          ...profileStyles.avatar,
          backgroundColor: typeInfo.color + '20',
          color: typeInfo.color
        }}>
          <AvatarFallback style={{ fontSize: '1.5rem' }}>
            {contact.name.split(" ").map((n) => n[0]).join("")}
          </AvatarFallback>
        </Avatar>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h1 style={profileStyles.name}>{contact.name}</h1>
            <Badge style={{ backgroundColor: typeInfo.color + '20', color: typeInfo.color }}>
              {typeInfo.label}
            </Badge>
          </div>
          <p style={profileStyles.role}>{contact.role} at {contact.company}</p>
          <div style={profileStyles.actions}>
            <Button variant="outline" onClick={onEdit}>
              <Pencil size={14} />
              Edit
            </Button>
            <Button variant="destructive" onClick={onDelete}>
              <Trash2 size={14} />
              Delete
            </Button>
          </div>
        </div>
      </div>

      <div style={profileStyles.card}>
        <h3 style={profileStyles.cardTitle}>Contact Information</h3>

        <div style={profileStyles.infoRow}>
          <Mail size={18} color="#6b7280" />
          <div>
            <div style={profileStyles.infoLabel}>Email</div>
            <div style={profileStyles.infoValue}>{contact.email}</div>
          </div>
        </div>

        <div style={profileStyles.infoRow}>
          <Phone size={18} color="#6b7280" />
          <div>
            <div style={profileStyles.infoLabel}>Phone</div>
            <div style={profileStyles.infoValue}>{contact.phone || 'Not provided'}</div>
          </div>
        </div>

        <div style={profileStyles.infoRow}>
          <Building size={18} color="#6b7280" />
          <div>
            <div style={profileStyles.infoLabel}>Company</div>
            <div style={profileStyles.infoValue}>{contact.company || 'Not provided'}</div>
          </div>
        </div>

        <div style={{ ...profileStyles.infoRow, borderBottom: 'none' }}>
          <User size={18} color="#6b7280" />
          <div>
            <div style={profileStyles.infoLabel}>Role</div>
            <div style={profileStyles.infoValue}>{contact.role || 'Not provided'}</div>
          </div>
        </div>
      </div>

      <div style={profileStyles.card}>
        <h3 style={profileStyles.cardTitle}>Events</h3>
        {contact.events && contact.events.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {contact.events.map((event, index) => (
              <Badge key={index} variant="secondary">{event}</Badge>
            ))}
          </div>
        ) : (
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>No events assigned</p>
        )}
      </div>
    </div>
  );
}
