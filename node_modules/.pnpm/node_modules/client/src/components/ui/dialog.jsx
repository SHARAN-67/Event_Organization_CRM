
import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { useTheme } from '../../theme/ThemeContext';

export function Dialog({ open, onOpenChange, children }) {
    const { theme } = useTheme();
    const isDark = theme === 'dark' || theme === 'night';

    const overlayStyles = {
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1.5rem',
    };

    const contentStyles = {
        backgroundColor: isDark ? '#1e293b' : '#ffffff',
        borderRadius: '1.5rem',
        padding: '2.5rem',
        maxWidth: '32rem',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        position: 'relative',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : '#f1f5f9'}`,
    };

    const closeButtonStyles = {
        position: 'absolute',
        top: '1.25rem',
        right: '1.25rem',
        padding: '0.5rem',
        backgroundColor: isDark ? '#0f172a' : '#f8fafc',
        border: 'none',
        cursor: 'pointer',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s',
        color: isDark ? '#94a3b8' : '#64748b',
    };

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                onOpenChange(false);
            }
        };

        if (open) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [open, onOpenChange]);

    if (!open) return null;

    return (
        <div
            style={overlayStyles}
            onClick={() => onOpenChange(false)}
        >
            <div
                style={contentStyles}
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    style={closeButtonStyles}
                    onClick={() => onOpenChange(false)}
                    onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = isDark ? '#1e293b' : '#f1f5f9';
                        e.currentTarget.style.color = isDark ? '#f1f5f9' : '#0f172a';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = isDark ? '#0f172a' : '#f8fafc';
                        e.currentTarget.style.color = isDark ? '#94a3b8' : '#64748b';
                    }}
                >
                    <X size={20} />
                </button>
                {children}
            </div>
        </div>
    );
}

export function DialogContent({ children, className = '', ...props }) {
    return <div className={className} {...props}>{children}</div>;
}

export function DialogHeader({ children, className = '', ...props }) {
    const headerStyles = {
        marginBottom: '2rem',
    };
    return (
        <div style={headerStyles} className={className} {...props}>
            {children}
        </div>
    );
}

export function DialogTitle({ children, className = '', ...props }) {
    const { theme } = useTheme();
    const isDark = theme === 'dark' || theme === 'night';

    const titleStyles = {
        fontSize: '1.5rem',
        fontWeight: '800',
        color: isDark ? '#f1f5f9' : '#0f172a',
        margin: 0,
        letterSpacing: '-0.02em',
    };
    return (
        <h2 style={titleStyles} className={className} {...props}>
            {children}
        </h2>
    );
}

export function DialogFooter({ children, className = '', ...props }) {
    return (
        <div
            style={{
                marginTop: '2.5rem',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '1rem'
            }}
            className={className}
            {...props}
        >
            {children}
        </div>
    );
}

export function DialogDescription({ children, className = '', ...props }) {
    const { theme } = useTheme();
    const isDark = theme === 'dark' || theme === 'night';

    return (
        <p
            style={{
                fontSize: '0.925rem',
                color: isDark ? '#94a3b8' : '#64748b',
                marginTop: '0.5rem',
                lineHeight: '1.5'
            }}
            className={className}
            {...props}
        >
            {children}
        </p>
    );
}
