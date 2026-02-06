import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, Shield, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import './Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { refreshUserRole, refreshPermissions } = useAuth(); // Get refresh functions

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

            // CRITICAL: Fetch permissions immediately so ProtectedRoutes don't block access
            await refreshPermissions();

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

        <div className="login-container">
            {/* Left Side: Aesthetic Panel */}
            <div className="branding-panel">
                <div className="overlay"></div>
                <div className="branding-content">
                    <div className="logo-icon-container">
                        <Shield size={48} color="white" />
                    </div>
                    <h1 className="branding-title">Event Command<br />Center</h1>
                    <p className="branding-subtitle">Precision Management for Elite Event Logistics</p>

                    <div className="features-list">
                        <div className="feature-item">
                            <div className="dot"></div>
                            <span>Role-Based Access Control</span>
                        </div>
                        <div className="feature-item">
                            <div className="dot"></div>
                            <span>Real-Time Inventory Management</span>
                        </div>
                        <div className="feature-item">
                            <div className="dot"></div>
                            <span>Mission-Critical Security Protocols</span>
                        </div>
                    </div>
                </div>
                <div className="footer-branding">
                    CN Events & Logistics • Operational Excellence
                </div>
            </div>

            {/* Right Side: Login Form */}
            <div className="form-panel">
                <div className="form-container">
                    <div className="form-header">
                        <h2 className="form-title">Welcome Back</h2>
                        <p className="form-subtitle">Authorize your session to access the command center.</p>
                    </div>

                    {error && (
                        <div className="error-banner">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <Label htmlFor="email" className="field-label">Email Address</Label>
                            <div className="input-wrapper-relative">
                                <Mail size={18} className="field-icon" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Enter your email"
                                    className="custom-input"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <div className="label-row">
                                <Label htmlFor="password" className="field-label">Clearance Key</Label>
                                <a href="#" className="forgot-link">Forgot key?</a>
                            </div>
                            <div className="input-wrapper-relative">
                                <Lock size={18} className="field-icon" />
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className="custom-input custom-input-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="eye-button"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="remember-me">
                            <input type="checkbox" id="remember" className="checkbox-scan" />
                            <label htmlFor="remember" className="checkbox-label">Maintain active session for 24 hours</label>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            variant="primary"
                            className="login-button"
                        >
                            {loading ? 'Authorizing Terminal...' : (
                                <div className="button-content">
                                    <LogIn size={20} />
                                    <span>Access Terminal</span>
                                    <ArrowRight size={18} />
                                </div>
                            )}
                        </Button>
                    </form>

                    <div className="alternate-links">
                        New personnel? <a href="#" className="contact-link">Contact System Administrator</a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;


