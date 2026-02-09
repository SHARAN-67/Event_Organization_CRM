
import React from 'react';
import { useTheme } from '../../theme/ThemeContext';

export function Input({
    className = '',
    type = 'text',
    style = {},
    ...props
}) {
    const { theme } = useTheme();
    const isDark = theme === 'dark' || theme === 'night';

    const inputStyles = {
        width: '100%',
        padding: '0.75rem 1rem',
        borderRadius: '12px',
        border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0'}`,
        fontSize: '0.925rem',
        outline: 'none',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        backgroundColor: isDark ? '#0f172a' : '#f8fafc',
        color: isDark ? '#f1f5f9' : '#0f172a',
        boxSizing: 'border-box',
    };

    const accentColor = '#10b981';

    return (
        <input
            type={type}
            className={className}
            style={{
                ...inputStyles,
                ...style,
            }}
            onFocus={(e) => {
                e.target.style.borderColor = accentColor;
                e.target.style.backgroundColor = isDark ? '#1e293b' : '#ffffff';
                e.target.style.boxShadow = `0 0 0 4px ${accentColor}1a`;
                if (props.onFocus) props.onFocus(e);
            }}
            onBlur={(e) => {
                e.target.style.borderColor = isDark ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0';
                e.target.style.backgroundColor = isDark ? '#0f172a' : '#f8fafc';
                e.target.style.boxShadow = 'none';
                if (props.onBlur) props.onBlur(e);
            }}
            {...props}
        />
    );
}
