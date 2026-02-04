import React, { useState } from 'react';
import { Shield, Key, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../theme/ThemeContext';

const ForceChangePassword = () => {
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const { theme } = useTheme();
    const navigate = useNavigate();

    const isDark = theme === 'dark' || theme === 'night';
    const bgColor = theme === 'light' ? '#f8fafc' : theme === 'dark' ? '#0f172a' : '#020617';
    const cardBg = theme === 'light' ? '#ffffff' : theme === 'dark' ? 'rgba(30, 41, 59, 0.5)' : 'rgba(15, 23, 42, 0.5)';
    const textColor = isDark ? '#f1f5f9' : '#0f172a';
    const borderColor = isDark ? 'rgba(255, 255, 255, 0.05)' : '#e2e8f0';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (passwords.new !== passwords.confirm) {
            setError('New passwords do not match');
            return;
        }

        if (passwords.new.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/auth/change-password', {
                currentPassword: passwords.current,
                newPassword: passwords.new
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            localStorage.setItem('mustChangePassword', 'false');
            setSuccess(true);
            setTimeout(() => {
                navigate('/home');
                window.location.reload();
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: bgColor }}>
            <div className="w-full max-w-md p-10 rounded-[2.5rem] border shadow-2xl space-y-8" style={{ backgroundColor: cardBg, borderColor: borderColor }}>
                <div className="text-center space-y-3">
                    <div className="bg-amber-500/10 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-amber-500/20">
                        <Shield size={40} className="text-amber-500" />
                    </div>
                    <h1 className="text-2xl font-black uppercase tracking-tight" style={{ color: textColor }}>Security Update Required</h1>
                    <p className="text-xs opacity-50 font-bold uppercase tracking-widest leading-relaxed">
                        To maintain operational integrity, you must update your temporary authorization key.
                    </p>
                </div>

                {success ? (
                    <div className="text-center py-10 space-y-4 animate-in zoom-in duration-300">
                        <CheckCircle2 size={64} className="text-emerald-500 mx-auto" />
                        <h3 className="text-xl font-black text-emerald-500 uppercase tracking-widest">Key Synchronized</h3>
                        <p className="text-xs opacity-50 uppercase tracking-widest font-black">Re-routing to Command Center...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-[10px] font-black uppercase tracking-widest">
                                <AlertCircle size={16} /> {error}
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black opacity-30 uppercase tracking-[0.2em] ml-1">Temporary clearance key</label>
                            <div className="relative">
                                <Key className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" size={16} />
                                <input
                                    type="password"
                                    required
                                    value={passwords.current}
                                    onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                                    className="w-full bg-slate-500/5 border rounded-2xl pl-12 pr-4 py-4 text-xs font-bold focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                                    style={{ borderColor: borderColor, color: textColor }}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black opacity-30 uppercase tracking-[0.2em] ml-1">New permanent key</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" size={16} />
                                <input
                                    type="password"
                                    required
                                    value={passwords.new}
                                    onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                    className="w-full bg-slate-500/5 border rounded-2xl pl-12 pr-4 py-4 text-xs font-bold focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                    style={{ borderColor: borderColor, color: textColor }}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black opacity-30 uppercase tracking-[0.2em] ml-1">Confirm permanent key</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" size={16} />
                                <input
                                    type="password"
                                    required
                                    value={passwords.confirm}
                                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                    className="w-full bg-slate-500/5 border rounded-2xl pl-12 pr-4 py-4 text-xs font-bold focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                    style={{ borderColor: borderColor, color: textColor }}
                                />
                            </div>
                        </div>

                        <button
                            disabled={loading}
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-blue-500/20 transition-all uppercase text-xs tracking-[0.2em] mt-4"
                        >
                            {loading ? 'Encrypting...' : 'Update & Authorize'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ForceChangePassword;
