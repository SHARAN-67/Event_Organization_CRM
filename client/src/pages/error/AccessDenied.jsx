import React from 'react';
import { ShieldAlert, ChevronLeft, Home, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AccessDenied = ({ feature }) => {
    const navigate = useNavigate();
    const { userRole } = useAuth();

    return (
        <div style={containerStyle}>
            <div style={cardStyle}>
                <div style={iconContainerStyle}>
                    <ShieldAlert size={80} color="#ef4444" strokeWidth={1.5} />
                </div>

                <h1 style={titleStyle}>Security Protocol Breach</h1>
                <p style={subtitleStyle}>
                    Authorization level for <strong style={{ color: '#0f172a' }}>"{feature}"</strong> is insufficient.
                </p>

                <div style={dividerStyle}></div>

                <div style={infoBoxStyle}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Lock size={16} style={{ marginRight: '8px' }} />
                            <span>Restricted Area: Level 3 clearance required.</span>
                        </div>
                        <span style={{ fontSize: '11px', opacity: 0.7, fontFamily: 'monospace' }}>
                            ID: {userRole || 'ANONYMOUS'}
                        </span>
                    </div>
                </div>

                <div style={buttonGroupStyle}>
                    <button onClick={() => navigate(-1)} style={secondaryButtonStyle}>
                        <ChevronLeft size={18} /> Go Back
                    </button>
                    <button onClick={() => navigate('/home')} style={primaryButtonStyle}>
                        <Home size={18} /> Return Home
                    </button>
                </div>
            </div>

            <p style={footerStyle}>
                If you believe this is an error, please contact your **System Administrator**.
            </p>
        </div>
    );
};

// --- STYLES ---

const containerStyle = {
    height: '80vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(248, 250, 252, 0.5)',
    borderRadius: '32px',
    margin: '20px',
    animation: 'fadeIn 0.5s ease-out'
};

const cardStyle = {
    backgroundColor: 'white',
    padding: '60px',
    borderRadius: '32px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)',
    textAlign: 'center',
    maxWidth: '500px',
    width: '100%',
    border: '1px solid #f1f5f9'
};

const iconContainerStyle = {
    marginBottom: '24px',
    display: 'inline-flex',
    padding: '24px',
    backgroundColor: '#fef2f2',
    borderRadius: '50%',
    animation: 'pulse 2s infinite'
};

const titleStyle = {
    fontSize: '28px',
    fontWeight: '850',
    color: '#0f172a',
    marginBottom: '12px',
    letterSpacing: '-0.5px'
};

const subtitleStyle = {
    fontSize: '16px',
    color: '#64748b',
    lineHeight: '1.6',
    marginBottom: '32px'
};

const dividerStyle = {
    height: '1px',
    backgroundColor: '#f1f5f9',
    marginBottom: '32px'
};

const infoBoxStyle = {
    backgroundColor: '#f8fafc',
    padding: '12px 16px',
    borderRadius: '12px',
    color: '#94a3b8',
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '40px',
    border: '1px solid #f1f5f9'
};

const buttonGroupStyle = {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center'
};

const primaryButtonStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#0f172a',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '12px',
    fontWeight: '700',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'transform 0.2s, background-color 0.2s'
};

const secondaryButtonStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'white',
    color: '#64748b',
    border: '1px solid #e2e8f0',
    padding: '12px 24px',
    borderRadius: '12px',
    fontWeight: '700',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s'
};

const footerStyle = {
    marginTop: '32px',
    color: '#94a3b8',
    fontSize: '14px',
    maxWidth: '400px',
    textAlign: 'center'
};

export default AccessDenied;
