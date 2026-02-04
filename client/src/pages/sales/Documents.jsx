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
                        <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-200">
                            <FileText size={20} className="text-white" />
                        </div>
                        <span className="text-blue-600 font-black text-[10px] uppercase tracking-[0.2em]">Logistics Hub</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-800 tracking-tight mb-2 uppercase">Secure Vault</h1>
                    <p className="text-slate-400 text-lg font-medium">Classified repository for contracts, briefs, and official mission reports.</p>
                </div>
                {(can(PERMISSIONS.LEADS.MANAGE) || can(PERMISSIONS.LEADS.ROOT)) && (
                    <button
                        onClick={handleOpenUpload}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl shadow-xl shadow-blue-200 transition-all flex items-center gap-3 font-black text-xs uppercase tracking-widest active:scale-95"
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
                        className="bg-white p-8 rounded-[3rem] shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border border-slate-100 group overflow-hidden relative cursor-default"
                    >
                        {/* Status Label */}
                        <div className="absolute top-8 right-8 bg-slate-50 px-4 py-2 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest border border-slate-100 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                            {doc.fileType?.replace('.', '') || 'DOC'}
                        </div>

                        {/* Top Section Clickable for Preview */}
                        <div className="cursor-pointer" onClick={() => openPreview(doc)}>
                            <div className="flex items-start justify-between mb-8">
                                <div className="bg-blue-50 p-6 rounded-[2rem] group-hover:bg-blue-600 transition-colors duration-500">
                                    <FileText size={40} className="text-blue-600 group-hover:text-white transition-colors duration-500" />
                                </div>
                            </div>

                            <div className="mb-8">
                                <h3 className="text-2xl font-black text-slate-800 mb-2 truncate group-hover:text-blue-600 transition-colors" title={doc.fileName}>{doc.fileName}</h3>
                                <div className="flex items-center gap-2 text-slate-500 font-bold uppercase text-[10px] tracking-[0.1em]">
                                    <Building size={14} className="text-blue-400" /> {doc.company}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 py-6 border-y border-slate-50 text-slate-500">
                            <div className="cursor-pointer hover:bg-slate-50 p-2 rounded-xl transition-all" onClick={(e) => { e.stopPropagation(); handleOpenProfile(doc); }}>
                                <p className="text-[9px] font-black uppercase tracking-widest mb-1 text-slate-400">Owner Profile</p>
                                <div className="flex items-center gap-2 text-xs font-black text-slate-700 truncate">
                                    <User size={12} className="text-blue-500" /> {doc.name}
                                </div>
                            </div>
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest mb-1 text-slate-400">Timestamp</p>
                                <p className="text-xs font-black text-slate-700">
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
                                    className="p-3 bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all"
                                    title="Quick Preview"
                                >
                                    <Eye size={18} />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        window.open(`${API_URL}/view/${doc._id}`, '_blank');
                                    }}
                                    className="p-3 bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all"
                                    title="Open Internal Storage"
                                >
                                    <ExternalLink size={18} />
                                </button>
                                <a
                                    href={`${API_URL}/download/${doc._id}`}
                                    className="p-3 bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 rounded-xl transition-all flex items-center justify-center"
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
                                        className="p-3 text-slate-300 hover:text-blue-500 transition-all hover:bg-slate-50 rounded-xl"
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
                    <div className="col-span-full flex flex-col items-center justify-center py-40 bg-white rounded-[4rem] border-4 border-dashed border-slate-100">
                        <div className="bg-slate-50 p-12 rounded-[2.5rem] mb-8 text-slate-200">
                            <Upload size={80} strokeWidth={1} />
                        </div>
                        <h3 className="text-3xl font-black text-slate-300 uppercase tracking-tight mb-2">Vault Empty</h3>
                        <p className="text-slate-400 text-lg font-medium">No intelligence documents have been cataloged in this sector.</p>
                    </div>
                )}
            </div>

            {/* Upload/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xl flex items-center justify-center z-50 p-6">
                    <div className="bg-white p-12 rounded-[4rem] w-full max-w-2xl shadow-2xl animate-in fade-in zoom-in duration-500 overflow-hidden relative">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h2 className="text-4xl font-black text-slate-800 tracking-tight uppercase">
                                    {modalMode === 'upload' ? 'Initialize Upload' : 'Update Intelligence'}
                                </h2>
                                <p className="text-blue-600 font-black mt-1 uppercase text-[10px] tracking-[0.2em]">Transmission Protocol Active</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="bg-slate-50 p-4 rounded-full hover:bg-red-50 hover:text-red-500 transition-all active:scale-90">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2"><User size={14} /> Assignee Name</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl p-5 text-slate-800 font-bold outline-none focus:border-blue-500/20 focus:bg-white transition-all shadow-sm"
                                        placeholder="Full Name"
                                        value={uploadData.name}
                                        onChange={e => setUploadData({ ...uploadData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2"><Mail size={14} /> Contact Email</label>
                                    <input
                                        type="email"
                                        className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl p-5 text-slate-800 font-bold outline-none focus:border-blue-500/20 focus:bg-white transition-all shadow-sm"
                                        placeholder="agent@agency.com"
                                        value={uploadData.email}
                                        onChange={e => setUploadData({ ...uploadData, email: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2"><Building size={14} /> Associated Company</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl p-5 text-slate-800 font-bold outline-none focus:border-blue-500/20 focus:bg-white transition-all shadow-sm"
                                    placeholder="Entity Name"
                                    value={uploadData.company}
                                    onChange={e => setUploadData({ ...uploadData, company: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="relative border-4 border-dashed border-slate-100 rounded-[3rem] p-12 text-center cursor-pointer hover:bg-slate-50 transition-all group overflow-hidden">
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                    accept=".doc,.docx,.pdf"
                                />
                                <div className="flex flex-col items-center gap-6">
                                    <div className={`p-8 rounded-[2.5rem] transition-all duration-500 ${file ? 'bg-emerald-100 text-emerald-600 scale-110 shadow-lg shadow-emerald-100' : 'bg-slate-50 text-slate-400 group-hover:scale-110 group-hover:text-blue-600 group-hover:bg-blue-50'}`}>
                                        {file ? <CheckCircle size={56} /> : <FileUp size={56} />}
                                    </div>
                                    <div className="space-y-2">
                                        <p className={`text-xl font-black tracking-tight ${file ? 'text-emerald-700' : 'text-slate-800'}`}>
                                            {file ? file.name : (modalMode === 'edit' ? 'Replace Intelligence File (Optional)' : 'Select Intelligence File')}
                                        </p>
                                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Restricted to PDF or DOC dossiers</p>
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
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 p-6 rounded-2xl font-black uppercase text-xs tracking-widest text-slate-500 hover:bg-slate-50 transition-all active:scale-95">Abort Mission</button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-3xl font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-blue-200 transition-all flex items-center justify-center gap-4 disabled:opacity-50 active:scale-95"
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
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl flex items-center justify-center z-[110] p-6">
                    <div className="bg-white rounded-[4rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500">
                        <div className="bg-blue-600 p-12 text-center relative">
                            <button onClick={() => setShowProfile(false)} className="absolute top-8 right-8 text-white/50 hover:text-white transition-all">
                                <X size={24} />
                            </button>
                            <div className="bg-white/20 p-8 rounded-full inline-block mb-6 backdrop-blur-md">
                                <User size={64} className="text-white" strokeWidth={1} />
                            </div>
                            <h2 className="text-4xl font-black text-white uppercase tracking-tight">{profileData.name}</h2>
                            <p className="text-blue-200 font-bold uppercase text-xs tracking-widest mt-2 px-4 py-1 bg-white/10 rounded-full inline-block">Official Assignee</p>
                        </div>
                        <div className="p-12 space-y-8">
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-3xl">
                                    <Mail className="text-blue-500" size={20} />
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Comm Network</p>
                                        <p className="text-base font-black text-slate-800">{profileData.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-3xl">
                                    <Building className="text-blue-500" size={20} />
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Affiliated Entity</p>
                                        <p className="text-base font-black text-slate-800">{profileData.company}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-3xl">
                                    <FileText className="text-blue-500" size={20} />
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Uploader Status</p>
                                        <p className="text-base font-black text-slate-800">{profileData.uploadedBy}</p>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setShowProfile(false)} className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black uppercase text-xs tracking-widest hover:bg-slate-800 transition-all active:scale-95">Dismiss Dossier</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Document Preview Modal */}
            {showPreview && (
                <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[100] flex flex-col p-10 animate-in fade-in duration-500">
                    <div className="flex justify-between items-center mb-6 px-4">
                        <div className="flex items-center gap-4">
                            <div className="bg-blue-600 p-2 rounded-xl">
                                <FileText size={20} className="text-white" />
                            </div>
                            <h2 className="text-white text-2xl font-black uppercase tracking-tight">{previewName}</h2>
                        </div>
                        <div className="flex gap-4">
                            <a href={`${API_URL}/download/${selectedDocId || (docs.find(d => d.fileName === previewName)?._id)}`} className="p-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all flex items-center gap-2 font-black uppercase text-[10px] tracking-widest">
                                <Download size={18} /> Download Dossier
                            </a>
                            <button onClick={() => setShowPreview(false)} className="p-4 bg-red-600/80 hover:bg-red-600 text-white rounded-2xl transition-all active:scale-90 shadow-xl shadow-red-900/20">
                                <X size={24} />
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 bg-white rounded-[3rem] overflow-hidden shadow-2xl relative group">
                        {previewUrl.toLowerCase().includes('.pdf') ? (
                            <iframe
                                src={`${previewUrl}#toolbar=0`}
                                className="w-full h-full border-none"
                                title="Doc Preview"
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center p-20">
                                <div className="bg-slate-50 p-20 rounded-[4rem] mb-10 text-blue-600">
                                    <FileText size={120} strokeWidth={1} />
                                </div>
                                <h3 className="text-4xl font-black text-slate-800 uppercase tracking-tight mb-4">Direct Viewing Restricted</h3>
                                <p className="text-slate-500 text-xl font-medium max-w-2xl mx-auto leading-relaxed mb-10">
                                    This document format (.doc/.docx) cannot be previewed directly in the terminal interface.
                                    Please download the file to inspect the intelligence.
                                </p>
                                <a href={`${API_URL}/download/${selectedDocId || (docs.find(d => d.fileName === previewName)?._id)}`} className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-6 rounded-[2rem] font-black uppercase tracking-widest shadow-2xl shadow-blue-200 transition-all flex items-center gap-4">
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

