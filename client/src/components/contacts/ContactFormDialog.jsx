
import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Dialog, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { User, Mail, Phone, Building, Briefcase, Tag, PlusCircle } from "lucide-react";

const contactTypes = [
  { id: "attendee", label: "Attendee" },
  { id: "vendor", label: "Vendor" },
  { id: "speaker", label: "Speaker" },
  { id: "sponsor", label: "Sponsor" },
  { id: "other", label: "Other" },
];

export function ContactFormDialog({ open, onOpenChange, onSubmit, initialData, mode = "create" }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    role: "",
    type: "attendee",
    otherType: ""
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      if (initialData) {
        const isOther = !contactTypes.some(t => t.id === initialData.type) && initialData.type;
        setFormData({
          name: initialData.name || "",
          email: initialData.email || "",
          phone: initialData.phone || "",
          company: initialData.company || "",
          role: initialData.role || "",
          type: isOther ? "other" : (initialData.type || "attendee"),
          otherType: isOther ? initialData.type : ""
        });
      } else {
        setFormData({
          name: "",
          email: "",
          phone: "",
          company: "",
          role: "",
          type: "attendee",
          otherType: ""
        });
      }
    }
  }, [open, initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      alert("Name and email are required");
      return;
    }

    setLoading(true);
    try {
      const finalData = { ...formData };
      if (formData.type === 'other') {
        finalData.type = formData.otherType;
      }
      delete finalData.otherType;
      await onSubmit(finalData);
      onOpenChange(false);
    } catch (err) {
      console.error("Error saving contact:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>
          {mode === "create" ? "Add New Contact" : "Edit Contact Parameters"}
        </DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <Label htmlFor="name" style={{ display: 'flex', alignItems: 'center' }}><User size={14} style={{ marginRight: '6px' }} /> Full Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Sarah Johnson"
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <Label htmlFor="email" style={{ display: 'flex', alignItems: 'center' }}><Mail size={14} style={{ marginRight: '6px' }} /> Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="sarah@example.com"
              required
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <Label htmlFor="phone" style={{ display: 'flex', alignItems: 'center' }}><Phone size={14} style={{ marginRight: '6px' }} /> Phone Number</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1 555-0123"
              required
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <Label htmlFor="company" style={{ display: 'flex', alignItems: 'center' }}><Building size={14} style={{ marginRight: '6px' }} /> Company</Label>
            <Input
              id="company"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              placeholder="TechCorp Inc."
              required
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <Label htmlFor="role" style={{ display: 'flex', alignItems: 'center' }}><Briefcase size={14} style={{ marginRight: '6px' }} /> Professional Role</Label>
            <Input
              id="role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              placeholder="Marketing Director"
              required
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <Label htmlFor="type" style={{ display: 'flex', alignItems: 'center' }}><Tag size={14} style={{ marginRight: '6px' }} /> Contact Designation</Label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {contactTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formData.type === 'other' && (
              <div style={{ position: 'relative' }}>
                <PlusCircle size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <Input
                  value={formData.otherType}
                  onChange={(e) => setFormData({ ...formData, otherType: e.target.value })}
                  placeholder="Specify custom designation..."
                  required
                  style={{ paddingLeft: '34px' }}
                />
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading} variant="primary">
            {loading ? "Processing..." : mode === "create" ? "Add Contact" : "Update Record"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
