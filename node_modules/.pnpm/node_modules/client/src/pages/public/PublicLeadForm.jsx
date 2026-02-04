
import React, { useState } from 'react';
import axios from 'axios';
import { Send, CheckCircle, Building, Mail, User, Phone, MessageSquare, ArrowRight } from 'lucide-react';

const PublicLeadForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        company: '',
        email: '',
        phone: '',
        details: '',
        source: 'Landing Page'
    });
    const [status, setStatus] = useState('idle'); // idle, submitting, success, error
    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('submitting');
        try {
            // Ensure phone is present since it's required in schema
            if (!formData.phone) {
                setStatus('error');
                setMessage('Phone number is required.');
                return;
            }

            const response = await axios.post('http://localhost:5000/api/leads/public', formData);
            setStatus('success');
            setMessage(response.data.message);
        } catch (err) {
            setStatus('error');
            setMessage(err.response?.data?.error || 'Unable to connect to server. Please ensure the backend is running.');
        }
    };

    if (status === 'success') {
        return (
            <div style={{
                minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: '#ffffff', padding: '20px', fontFamily: 'Inter, sans-serif'
            }}>
                <div style={{
                    backgroundColor: '#ffffff', padding: '48px', borderRadius: '24px',
                    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.05)',
                    maxWidth: '500px', width: '100%', textAlign: 'center',
                    border: '1px solid #f1f5f9'
                }}>
                    <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center' }}>
                        <div style={{
                            backgroundColor: '#f0fdf4', padding: '20px', borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <CheckCircle size={48} color="#10b981" />
                        </div>
                    </div>
                    <h2 style={{ color: '#0f172a', fontSize: '28px', fontWeight: '800', marginBottom: '16px' }}>Message Received!</h2>
                    <p style={{ color: '#64748b', fontSize: '16px', lineHeight: '1.6', marginBottom: '32px' }}>
                        {message}
                    </p>
                    <button
                        onClick={() => {
                            setFormData({ name: '', company: '', email: '', phone: '', details: '', source: 'Landing Page' });
                            setStatus('idle');
                        }}
                        style={{
                            backgroundColor: '#0f172a', color: 'white', padding: '14px 32px', borderRadius: '12px',
                            border: 'none', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', margin: '0 auto'
                        }}
                    >
                        Back to Form <ArrowRight size={18} />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: '#f8fafc', padding: '40px 20px', fontFamily: 'Inter, sans-serif',
            backgroundImage: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)'
        }}>
            <div style={{
                backgroundColor: '#ffffff',
                padding: '48px', borderRadius: '32px',
                maxWidth: '650px', width: '100%',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.08)',
                border: '1px solid #ffffff'
            }}>
                <div style={{ marginBottom: '40px', textAlign: 'center' }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                        backgroundColor: '#eff6ff', color: '#2563eb', padding: '6px 16px',
                        borderRadius: '20px', fontSize: '13px', fontWeight: '700', marginBottom: '16px'
                    }}>
                        CONTACT US
                    </div>
                    <h1 style={{ color: '#0f172a', fontSize: '36px', fontWeight: '900', marginBottom: '12px', letterSpacing: '-0.02em' }}>Get in Touch</h1>
                    <p style={{ color: '#64748b', fontSize: '17px', maxWidth: '450px', margin: '0 auto', lineHeight: '1.6' }}>
                        Fill out the form below and our team will get back to you within 24 hours.
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <label style={{ color: '#334155', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <User size={16} color="#64748b" /> Full Name
                            </label>
                            <input
                                required name="name" value={formData.name} onChange={handleChange}
                                placeholder="e.g. Tony Stark"
                                style={{
                                    backgroundColor: '#f8fafc', border: '1px solid #e2e8f0',
                                    borderRadius: '12px', padding: '14px 18px', color: '#0f172a', outline: 'none',
                                    fontSize: '15px'
                                }}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <label style={{ color: '#334155', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Building size={16} color="#64748b" /> Company
                            </label>
                            <input
                                required name="company" value={formData.company} onChange={handleChange}
                                placeholder="STARK Industries"
                                style={{
                                    backgroundColor: '#f8fafc', border: '1px solid #e2e8f0',
                                    borderRadius: '12px', padding: '14px 18px', color: '#0f172a', outline: 'none',
                                    fontSize: '15px'
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <label style={{ color: '#334155', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Mail size={16} color="#64748b" /> Email Address
                            </label>
                            <input
                                required type="email" name="email" value={formData.email} onChange={handleChange}
                                placeholder="tony@stark.com"
                                style={{
                                    backgroundColor: '#f8fafc', border: '1px solid #e2e8f0',
                                    borderRadius: '12px', padding: '14px 18px', color: '#0f172a', outline: 'none',
                                    fontSize: '15px'
                                }}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <label style={{ color: '#334155', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Phone size={16} color="#64748b" /> Phone Number
                            </label>
                            <input
                                required name="phone" value={formData.phone} onChange={handleChange}
                                placeholder="+1 (555) 000-0000"
                                style={{
                                    backgroundColor: '#f8fafc', border: '1px solid #e2e8f0',
                                    borderRadius: '12px', padding: '14px 18px', color: '#0f172a', outline: 'none',
                                    fontSize: '15px'
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <label style={{ color: '#334155', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <MessageSquare size={16} color="#64748b" /> How can we help?
                        </label>
                        <textarea
                            name="details" value={formData.details} onChange={handleChange}
                            rows="4"
                            placeholder="Tell us about your project requirements..."
                            required
                            style={{
                                backgroundColor: '#f8fafc', border: '1px solid #e2e8f0',
                                borderRadius: '12px', padding: '14px 18px', color: '#0f172a', outline: 'none',
                                resize: 'none', fontSize: '15px'
                            }}
                        />
                    </div>

                    {status === 'error' && (
                        <div style={{
                            color: '#b91c1c', fontSize: '14px', fontWeight: '500',
                            backgroundColor: '#fef2f2', padding: '14px', borderRadius: '10px',
                            border: '1px solid #fecaca', textAlign: 'center'
                        }}>
                            {message}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={status === 'submitting'}
                        style={{
                            backgroundColor: '#2563eb', color: 'white', padding: '16px', borderRadius: '14px',
                            border: 'none', fontWeight: '700', fontSize: '16px', cursor: status === 'submitting' ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', marginTop: '8px',
                            boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.3)'
                        }}
                    >
                        {status === 'submitting' ? 'Processing...' : (
                            <>
                                Send Message <Send size={18} />
                            </>
                        )}
                    </button>

                    <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '13px', marginTop: '8px' }}>
                        By clicking send, you agree to our <span style={{ color: '#475569', fontWeight: '600', textDecoration: 'underline', cursor: 'pointer' }}>Privacy Policy</span>.
                    </p>
                </form>
            </div>
        </div>
    );
};

export default PublicLeadForm;
