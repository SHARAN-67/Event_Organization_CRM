import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, Shield, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { refreshUserRole } = useAuth(); // Get refresh function

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await axios.post('http://localhost:5000/api/auth/login', {
                email,
                password
            });

            const { token, user } = response.data;

            // Store in LocalStorage
            localStorage.setItem('token', token);
            localStorage.setItem('userId', user.id);
            localStorage.setItem('userName', user.name);
            localStorage.setItem('userRole', user.role);
            localStorage.setItem('userEmail', user.email);
            localStorage.setItem('mustChangePassword', user.mustChangePassword);

            // Sync state with context
            refreshUserRole();

            // Handle forced password change
            if (user.mustChangePassword) {
                navigate('/auth/change-password');
            } else {
                navigate('/home');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Authentication failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={containerStyle}>
            {/* Left Side: Aesthetic Panel */}
            <div style={brandingPanelStyle}>
                <div style={overlayStyle}></div>
                <div style={brandingContentStyle}>
                    <div style={logoIconContainer}>
                        <Shield size={48} color="white" />
                    </div>
                    <h1 style={brandingTitleStyle}>Event Command<br />Center</h1>
                    <p style={brandingSubtitleStyle}>Precision Management for Elite Event Logistics</p>

                    <div style={featuresListStyle}>
                        <div style={featureItemStyle}>
                            <div style={dotStyle}></div>
                            <span>Role-Based Access Control</span>
                        </div>
                        <div style={featureItemStyle}>
                            <div style={dotStyle}></div>
                            <span>Real-Time Inventory Management</span>
                        </div>
                        <div style={featureItemStyle}>
                            <div style={dotStyle}></div>
                            <span>Mission-Critical Security Protocols</span>
                        </div>
                    </div>
                </div>
                <div style={footerBrandingStyle}>
                    CN Events & Logistics • Operational Excellence
                </div>
            </div>

            {/* Right Side: Login Form */}
            <div style={formPanelStyle}>
                <div style={formContainerStyle}>
                    <div style={{ marginBottom: '40px' }}>
                        <h2 style={formTitleStyle}>Welcome Back</h2>
                        <p style={formSubtitleStyle}>Authorize your session to access the command center.</p>
                    </div>

                    {error && (
                        <div style={errorBannerStyle}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div style={inputGroupStyle}>
                            <Label htmlFor="email">Email Address</Label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', zIndex: 10 }} />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Enter your email"
                                    style={{ paddingLeft: '48px' }}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div style={inputGroupStyle}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Label htmlFor="password">Clearance Key</Label>
                                <a href="#" style={forgotStyle}>Forgot key?</a>
                            </div>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', zIndex: 10 }} />
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    style={{ paddingLeft: '48px', paddingRight: '48px' }}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={eyeButtonStyle}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
                            <input type="checkbox" id="remember" style={checkboxStyle} />
                            <label htmlFor="remember" style={checkboxLabelStyle}>Maintain active session for 24 hours</label>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            variant="primary"
                            style={{ width: '100%', padding: '18px' }}
                        >
                            {loading ? 'Authorizing Terminal...' : (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                    <LogIn size={20} />
                                    <span>Access Terminal</span>
                                    <ArrowRight size={18} />
                                </div>
                            )}
                        </Button>
                    </form>

                    <div style={alternateLinksStyle}>
                        New personnel? <a href="#" style={linkStyle}>Contact System Administrator</a>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- STYLES ---

const containerStyle = {
    display: 'flex',
    minHeight: '100vh',
    width: '100vw',
    backgroundColor: 'white',
    fontFamily: "'Inter', system-ui, sans-serif",
    overflow: 'hidden',
};

const brandingPanelStyle = {
    flex: '1.2',
    position: 'relative',
    background: 'url(\'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop\') center/cover no-repeat',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '80px',
    color: 'white',
    '@media (max-width: 1024px)': {
        display: 'none',
    },
};

const overlayStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.8) 100%)',
    zIndex: 1,
};

const brandingContentStyle = {
    position: 'relative',
    zIndex: 2,
};

const logoIconContainer = {
    marginBottom: '32px',
    width: '80px',
    height: '80px',
    borderRadius: '24px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid rgba(255, 255, 255, 0.2)',
};

const brandingTitleStyle = {
    fontSize: '56px',
    fontWeight: '900',
    lineHeight: '1.1',
    marginBottom: '24px',
    letterSpacing: '-1.5px',
};

const brandingSubtitleStyle = {
    fontSize: '20px',
    opacity: 0.9,
    marginBottom: '48px',
    maxWidth: '400px',
    lineHeight: '1.6',
};

const featuresListStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
};

const featureItemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '16px',
    fontWeight: '500',
};

const dotStyle = {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#3b82f6',
    boxShadow: '0 0 10px #3b82f6',
};

const footerBrandingStyle = {
    position: 'absolute',
    bottom: '40px',
    left: '80px',
    fontSize: '14px',
    opacity: 0.6,
    zIndex: 2,
    letterSpacing: '1px',
    textTransform: 'uppercase',
};

const formPanelStyle = {
    flex: '1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    backgroundColor: 'white',
};

const formContainerStyle = {
    width: '100%',
    maxWidth: '440px',
};

const formTitleStyle = {
    fontSize: '32px',
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: '12px',
    letterSpacing: '-0.5px',
};

const formSubtitleStyle = {
    fontSize: '16px',
    color: '#64748b',
    lineHeight: '1.5',
};

const errorBannerStyle = {
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    padding: '16px',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '24px',
    border: '1px solid #fee2e2',
};

const inputGroupStyle = {
    marginBottom: '24px',
};

const labelStyle = {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#475569',
    marginBottom: '10px',
};

const inputWrapperStyle = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
};

const iconStyle = {
    position: 'absolute',
    left: '16px',
    color: '#94a3b8',
};

const inputStyle = {
    width: '100%',
    padding: '14px 16px 14px 48px',
    borderRadius: '12px',
    border: '2px solid #f1f5f9',
    fontSize: '16px',
    outline: 'none',
    transition: 'all 0.2s',
    boxSizing: 'border-box',
    color: '#0f172a',
};

const eyeButtonStyle = {
    position: 'absolute',
    right: '16px',
    border: 'none',
    background: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
};

const forgotStyle = {
    fontSize: '14px',
    fontWeight: '600',
    color: '#3b82f6',
    textDecoration: 'none',
};

const checkboxStyle = {
    width: '18px',
    height: '18px',
    borderRadius: '6px',
    cursor: 'pointer',
};

const checkboxLabelStyle = {
    fontSize: '14px',
    color: '#64748b',
    cursor: 'pointer',
    userSelect: 'none',
};

const loginButtonStyle = {
    width: '100%',
    padding: '16px',
    borderRadius: '14px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s',
    boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.4)',
};

const loadingButtonStyle = {
    ...loginButtonStyle,
    opacity: 0.7,
    cursor: 'not-allowed',
};

const alternateLinksStyle = {
    marginTop: '32px',
    textAlign: 'center',
    fontSize: '14px',
    color: '#64748b',
};

const linkStyle = {
    color: '#0f172a',
    fontWeight: '700',
    textDecoration: 'none',
    marginLeft: '4px',
};

export default Login;
