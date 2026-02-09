import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Upload, FileText, CheckCircle, AlertCircle, Plus, X, User,
    Mail, Building, FileUp, Trash2, Edit, Eye, ExternalLink, Download, Loader2, Save
} from 'lucide-react';
import { useAccessControl } from '../../context/AccessControlContext';
import { useTheme } from '../../theme/ThemeContext';
import { PERMISSIONS } from '../../security/policy';

const Documents = () => {
    const { can } = useAccessControl();
    const { theme } = useTheme();
    const [docs, setDocs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('upload'); // 'upload' or 'edit'
    const [selectedDocId, setSelectedDocId] = useState(null);
    const [uploadData, setUploadData] = useState({ name: '', email: '', company: '' });
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState({ type: '', msg: '' });

    // Preview state
    const [showPreview, setShowPreview] = useState(false);
    const [previewUrl, setPreviewUrl] = useState('');
    const [previewName, setPreviewName] = useState('');

    // Profile state
    const [showProfile, setShowProfile] = useState(false);
    const [profileData, setProfileData] = useState(null);

    const API_URL = 'http://localhost:5000/api/documents';
    const BASE_URL = 'http://localhost:5000';
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    const isDark = theme === 'dark' || theme === 'night';
    const bgColor = theme === 'light' ? '#f8fafc' : theme === 'dark' ? '#0f172a' : '#020617';
    const cardBg = theme === 'light' ? '#ffffff' : theme === 'dark' ? 'rgba(30, 41, 59, 0.5)' : 'rgba(15, 23, 42, 0.5)';
    const textColor = isDark ? '#f1f5f9' : '#0f172a';
    const subTextColor = isDark ? '#94a3b8' : '#64748b';
    const borderColor = isDark ? 'rgba(255, 255, 255, 0.05)' : '#e2e8f0';
    const accentColor = isDark ? '#10b981' : '#059669';

    useEffect(() => {
        fetchDocs();
    }, []);

    const fetchDocs = async () => {
        try {
            const res = await axios.get(API_URL, { headers });
            setDocs(res.data);
        } catch (err) {
            console.error('Failed to fetch documents');
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        const allowed = ['.doc', '.docx', '.pdf'];
        const ext = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();

        if (!allowed.includes(ext)) {
            setStatus({ type: 'error', msg: 'Restriction Breach: Only .doc, .docx, and .pdf files are accepted!' });
            setFile(null);
            return;
        }

        setFile(selectedFile);
        setStatus({ type: '', msg: '' });
    };

    const handleOpenUpload = () => {
        setModalMode('upload');
        setUploadData({ name: '', email: '', company: '' });
        setFile(null);
        setStatus({ type: '', msg: '' });
        setShowModal(true);
    };

    const handleOpenEdit = (doc) => {
        setModalMode('edit');
        setSelectedDocId(doc._id);
        setUploadData({ name: doc.name, email: doc.email, company: doc.company });
        setFile(null); // Optional: if they don't select a file, we keep the old one
        setStatus({ type: '', msg: '' });
        setShowModal(true);
    };

    const handleOpenProfile = (doc) => {
        setProfileData(doc);
        setShowProfile(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('name', uploadData.name);
            formData.append('email', uploadData.email);
            formData.append('company', uploadData.company);
            if (file) {
                formData.append('file', file);
            }

            if (modalMode === 'upload') {
                if (!file) {
                    setStatus({ type: 'error', msg: 'Please select a valid mission dossier.' });
                    setLoading(false);
                    return;
                }
                await axios.post(API_URL, formData, {
                    headers: { ...headers, 'Content-Type': 'multipart/form-data' }
                });
                setStatus({ type: 'success', msg: 'Intelligence document synchronized successfully!' });
            } else {
                await axios.put(`${API_URL}/${selectedDocId}`, formData, {
                    headers: { ...headers, 'Content-Type': 'multipart/form-data' }
                });
                setStatus({ type: 'success', msg: 'Intelligence and metadata updated.' });
            }

            fetchDocs();
            setTimeout(() => {
                setShowModal(false);
                setStatus({ type: '', msg: '' });
            }, 1500);
        } catch (err) {
            setStatus({ type: 'error', msg: err.response?.data?.error || 'Transmission failed' });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to decommission this document? This action is irreversible.')) return;

        try {
            await axios.delete(`${API_URL}/${id}`, { headers });
            fetchDocs();
            alert('Document purged successfully.');
        } catch (err) {
            alert('Failed to delete document.');
        }
    };

    const openPreview = (doc) => {
        const url = `${API_URL}/view/${doc._id}`;
        setPreviewUrl(url);
        setPreviewName(doc.fileName);
        setSelectedDocId(doc._id); // Set selectedDocId for download in preview
        setShowPreview(true);
    };

    return (
        <div className="p-10 min-h-screen font-['Inter'] transition-colors duration-500 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ backgroundColor: bgColor, color: textColor }}>
            {/* Header */}
            <div className="flex justify-between items-center mb-12">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-emerald-600 p-2 rounded-xl shadow-lg shadow-emerald-500/20">
                            <FileText size={20} className="text-white" />
                        </div>
                        <span className="text-emerald-600 font-black text-[10px] uppercase tracking-[0.2em]">Logistics Hub</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tight mb-2 uppercase" style={{ color: textColor }}>Secure Vault</h1>
                    <p className="text-lg font-medium" style={{ color: subTextColor }}>Classified repository for contracts, briefs, and official mission reports.</p>
                </div>
                {(can(PERMISSIONS.LEADS.MANAGE) || can(PERMISSIONS.LEADS.ROOT)) && (
                    <button
                        onClick={handleOpenUpload}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-2xl shadow-xl shadow-emerald-500/20 transition-all flex items-center gap-3 font-black text-xs uppercase tracking-widest active:scale-95"
                    >
                        <Plus size={20} strokeWidth={3} /> Initialize Upload
                    </button>
                )}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {docs.map(doc => (
                    <div
                        key={doc._id}
                        className="p-8 rounded-[3rem] shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border group overflow-hidden relative cursor-default"
                        style={{ backgroundColor: cardBg, borderColor: borderColor }}
                    >
                        {/* Status Label */}
                        <div className="absolute top-8 right-8 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-colors"
                            style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc', borderColor: borderColor, color: subTextColor }}>
                            {doc.fileType?.replace('.', '') || 'DOC'}
                        </div>

                        {/* Top Section Clickable for Preview */}
                        <div className="cursor-pointer" onClick={() => openPreview(doc)}>
                            <div className="flex items-start justify-between mb-8">
                                <div className="p-6 rounded-[2rem] transition-colors duration-500" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9' }}>
                                    <FileText size={40} className="text-emerald-600 group-hover:text-emerald-400 transition-colors duration-500" />
                                </div>
                            </div>

                            <div className="mb-8">
                                <h3 className="text-2xl font-black mb-2 truncate group-hover:text-emerald-500 transition-colors" style={{ color: textColor }} title={doc.fileName}>{doc.fileName}</h3>
                                <div className="flex items-center gap-2 font-bold uppercase text-[10px] tracking-[0.1em]" style={{ color: subTextColor }}>
                                    <Building size={14} className="text-emerald-500" /> {doc.company}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 py-6 border-y text-slate-500" style={{ borderColor: borderColor }}>
                            <div className="cursor-pointer p-2 rounded-xl transition-all" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc' }} onClick={(e) => { e.stopPropagation(); handleOpenProfile(doc); }}>
                                <p className="text-[9px] font-black uppercase tracking-widest mb-1 opacity-50">Owner Profile</p>
                                <div className="flex items-center gap-2 text-xs font-black truncate" style={{ color: textColor }}>
                                    <User size={12} className="text-emerald-500" /> {doc.name}
                                </div>
                            </div>
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest mb-1 opacity-50">Timestamp</p>
                                <p className="text-xs font-black" style={{ color: textColor }}>
                                    {new Date(doc.createdAt).toLocaleDateString(undefined, {
                                        day: 'numeric',
                                        month: 'numeric',
                                        year: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-8">
                            <div className="flex gap-2">
                                <button
                                    onClick={(e) => { e.stopPropagation(); openPreview(doc); }}
                                    className="p-3 bg-slate-500/5 text-subTextColor hover:bg-emerald-500/10 hover:text-emerald-500 rounded-xl transition-all"
                                    title="Quick Preview"
                                >
                                    <Eye size={18} />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        window.open(`${API_URL}/view/${doc._id}`, '_blank');
                                    }}
                                    className="p-3 bg-slate-500/5 text-subTextColor hover:bg-emerald-500/10 hover:text-emerald-500 rounded-xl transition-all"
                                    title="Open Internal Storage"
                                >
                                    <ExternalLink size={18} />
                                </button>
                                <a
                                    href={`${API_URL}/download/${doc._id}`}
                                    className="p-3 bg-slate-500/5 text-subTextColor hover:bg-emerald-500/10 hover:text-emerald-500 rounded-xl transition-all flex items-center justify-center"
                                    title="Force Download from Vault"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <Download size={18} />
                                </a>
                            </div>

                            <div className="flex gap-2">
                                {can(PERMISSIONS.LEADS.MANAGE) && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleOpenEdit(doc);
                                        }}
                                        className="p-3 text-subTextColor hover:text-emerald-500 transition-all hover:bg-emerald-500/5 rounded-xl"
                                        title="Edit Intelligence"
                                    >
                                        <Edit size={18} />
                                    </button>
                                )}
                                {(can(PERMISSIONS.LEADS.DELETE) || can(PERMISSIONS.LEADS.ROOT)) && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(doc._id);
                                        }}
                                        className="p-3 text-slate-300 hover:text-red-500 transition-all hover:bg-slate-50 rounded-xl"
                                        title="Purge Document"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {docs.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-40 rounded-[4rem] border-4 border-dashed" style={{ backgroundColor: cardBg, borderColor: borderColor }}>
                        <div className="p-12 rounded-[2.5rem] mb-8" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc', color: subTextColor }}>
                            <Upload size={80} strokeWidth={1} />
                        </div>
                        <h3 className="text-3xl font-black uppercase tracking-tight mb-2" style={{ color: subTextColor, opacity: 0.5 }}>Vault Empty</h3>
                        <p className="text-lg font-medium opacity-50" style={{ color: subTextColor }}>No intelligence documents have been cataloged in this sector.</p>
                    </div>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xl flex items-center justify-center z-50 p-6 animate-in fade-in duration-300">
                    <div className="p-12 rounded-[4rem] w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-500 overflow-hidden relative border"
                        style={{ backgroundColor: cardBg, borderColor: borderColor, color: textColor }}>
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h2 className="text-4xl font-black tracking-tight uppercase" style={{ color: textColor }}>
                                    {modalMode === 'upload' ? 'Initialize Upload' : 'Update Intelligence'}
                                </h2>
                                <p className="font-black mt-1 uppercase text-[10px] tracking-[0.2em]" style={{ color: accentColor }}>Transmission Protocol Active</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-4 rounded-full hover:bg-rose-500/10 hover:text-rose-500 transition-all active:scale-90" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2" style={{ color: subTextColor }}><User size={14} /> Assignee Name</label>
                                    <input
                                        type="text"
                                        className="w-full border-2 rounded-2xl p-5 font-bold outline-none transition-all shadow-sm"
                                        style={{ backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : '#f8fafc', borderColor: borderColor, color: textColor }}
                                        placeholder="Full Name"
                                        value={uploadData.name}
                                        onChange={e => setUploadData({ ...uploadData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2" style={{ color: subTextColor }}><Mail size={14} /> Contact Email</label>
                                    <input
                                        type="email"
                                        className="w-full border-2 rounded-2xl p-5 font-bold outline-none transition-all shadow-sm"
                                        style={{ backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : '#f8fafc', borderColor: borderColor, color: textColor }}
                                        placeholder="agent@agency.com"
                                        value={uploadData.email}
                                        onChange={e => setUploadData({ ...uploadData, email: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2" style={{ color: subTextColor }}><Building size={14} /> Associated Company</label>
                                <input
                                    type="text"
                                    className="w-full border-2 rounded-2xl p-5 font-bold outline-none transition-all shadow-sm"
                                    style={{ backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : '#f8fafc', borderColor: borderColor, color: textColor }}
                                    placeholder="Entity Name"
                                    value={uploadData.company}
                                    onChange={e => setUploadData({ ...uploadData, company: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="relative border-4 border-dashed rounded-[3rem] p-12 text-center cursor-pointer transition-all group overflow-hidden"
                                style={{ borderColor: borderColor, backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc' }}>
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                    accept=".doc,.docx,.pdf"
                                />
                                <div className="flex flex-col items-center gap-6">
                                    <div className={`p-8 rounded-[2.5rem] transition-all duration-500 ${file
                                        ? 'bg-emerald-500/20 text-emerald-500 scale-110 shadow-lg shadow-emerald-500/10'
                                        : 'bg-slate-500/10 text-subTextColor group-hover:scale-110 group-hover:text-emerald-500 group-hover:bg-emerald-500/10'}`}>
                                        {file ? <CheckCircle size={56} /> : <FileUp size={56} />}
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-xl font-black tracking-tight" style={{ color: file ? '#10b981' : textColor }}>
                                            {file ? file.name : (modalMode === 'edit' ? 'Replace Intelligence File (Optional)' : 'Select Intelligence File')}
                                        </p>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: subTextColor }}>Restricted to PDF or DOC dossiers</p>
                                    </div>
                                </div>
                            </div>

                            {status.msg && (
                                <div className={`flex items-center gap-4 p-6 rounded-3xl animate-in slide-in-from-top-4 ${status.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                    {status.type === 'success' ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
                                    <span className="font-black uppercase text-xs tracking-wider">{status.msg}</span>
                                </div>
                            )}

                            <div className="flex gap-4">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 p-6 rounded-2xl font-black uppercase text-xs tracking-widest opacity-60 hover:bg-rose-500/10 hover:text-rose-500 transition-all active:scale-95" style={{ color: textColor }}>Abort Mission</button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-[2] bg-emerald-600 hover:bg-emerald-700 text-white p-6 rounded-3xl font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-4 disabled:opacity-50 active:scale-95"
                                >
                                    {loading ? <Loader2 size={24} className="animate-spin" /> : (modalMode === 'upload' ? <FileUp size={24} /> : <Save size={24} />)}
                                    {loading ? 'Transmitting...' : (modalMode === 'upload' ? 'Commit to Vault' : 'Sync Changes')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Agent Profile Modal */}
            {showProfile && profileData && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl flex items-center justify-center z-[110] p-6 animate-in fade-in duration-300">
                    <div className="rounded-[4rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 border"
                        style={{ backgroundColor: cardBg, borderColor: borderColor }}>
                        <div className="bg-emerald-600 p-12 text-center relative">
                            <button onClick={() => setShowProfile(false)} className="absolute top-8 right-8 text-white/50 hover:text-white transition-all">
                                <X size={24} />
                            </button>
                            <div className="bg-white/20 p-8 rounded-full inline-block mb-6 backdrop-blur-md">
                                <User size={64} className="text-white" strokeWidth={1} />
                            </div>
                            <h2 className="text-4xl font-black text-white uppercase tracking-tight">{profileData.name}</h2>
                            <p className="text-emerald-100 font-bold uppercase text-xs tracking-widest mt-2 px-4 py-1 bg-white/10 rounded-full inline-block">Official Assignee</p>
                        </div>
                        <div className="p-12 space-y-8">
                            <div className="space-y-4">
                                {[
                                    { icon: <Mail size={20} />, label: 'Comm Network', value: profileData.email },
                                    { icon: <Building size={20} />, label: 'Affiliated Entity', value: profileData.company },
                                    { icon: <FileText size={20} />, label: 'Uploader Status', value: profileData.uploadedBy }
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-4 p-5 rounded-3xl" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc' }}>
                                        <div className="text-emerald-500">{item.icon}</div>
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-widest mb-1 opacity-50" style={{ color: subTextColor }}>{item.label}</p>
                                            <p className="text-base font-black truncate" style={{ color: textColor }}>{item.value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button onClick={() => setShowProfile(false)} className="w-full bg-emerald-600 text-white py-6 rounded-3xl font-black uppercase text-xs tracking-widest hover:bg-emerald-700 transition-all active:scale-95 shadow-xl shadow-emerald-500/20">Dismiss Dossier</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Document Preview Modal */}
            {showPreview && (
                <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[100] flex flex-col p-10 animate-in fade-in duration-500">
                    <div className="flex justify-between items-center mb-6 px-4">
                        <div className="flex items-center gap-4">
                            <div className="bg-emerald-600 p-2 rounded-xl">
                                <FileText size={20} className="text-white" />
                            </div>
                            <h2 className="text-white text-2xl font-black uppercase tracking-tight">{previewName}</h2>
                        </div>
                        <div className="flex gap-4">
                            <a href={`${API_URL}/download/${selectedDocId || (docs.find(d => d.fileName === previewName)?._id)}`} className="p-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all flex items-center gap-2 font-black uppercase text-[10px] tracking-widest">
                                <Download size={18} /> Download Dossier
                            </a>
                            <button onClick={() => setShowPreview(false)} className="p-4 bg-rose-600/80 hover:bg-rose-600 text-white rounded-2xl transition-all active:scale-90 shadow-xl shadow-rose-900/20">
                                <X size={24} />
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 rounded-[3rem] overflow-hidden shadow-2xl relative group border" style={{ backgroundColor: cardBg, borderColor: borderColor }}>
                        {previewUrl.toLowerCase().includes('.pdf') ? (
                            <iframe
                                src={`${previewUrl}#toolbar=0`}
                                className="w-full h-full border-none"
                                title="Doc Preview"
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center p-20">
                                <div className="p-20 rounded-[4rem] mb-10 text-emerald-600" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc' }}>
                                    <FileText size={120} strokeWidth={1} />
                                </div>
                                <h3 className="text-4xl font-black uppercase tracking-tight mb-4" style={{ color: textColor }}>Direct Viewing Restricted</h3>
                                <p className="text-xl font-medium max-w-2xl mx-auto leading-relaxed mb-10 opacity-60" style={{ color: subTextColor }}>
                                    This document format (.doc/.docx) cannot be previewed directly in the terminal interface.
                                    Please download the file to inspect the intelligence.
                                </p>
                                <a href={`${API_URL}/download/${selectedDocId || (docs.find(d => d.fileName === previewName)?._id)}`} className="bg-emerald-600 hover:bg-emerald-700 text-white px-12 py-6 rounded-[2rem] font-black uppercase tracking-widest shadow-2xl shadow-emerald-500/20 transition-all flex items-center gap-4">
                                    <Download size={24} /> Download Intelligence
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Documents;

