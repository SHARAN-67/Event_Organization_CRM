import React from 'react';

const badgeStyles = {
    base: {
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.125rem 0.625rem',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: '500',
    },
    default: {
        backgroundColor: '#3b82f6',
        color: '#ffffff',
    },
    secondary: {
        backgroundColor: '#f3f4f6',
        color: '#6b7280',
    },
    success: {
        backgroundColor: '#10b981',
        color: '#ffffff',
    },
    warning: {
        backgroundColor: '#f59e0b',
        color: '#ffffff',
    },
    destructive: {
        backgroundColor: '#ef4444',
        color: '#ffffff',
    },
};

export function Badge({
    children,
    variant = 'default',
    className = '',
    style = {},
    ...props
}) {
    const variantStyle = badgeStyles[variant] || badgeStyles.default;

    return (
        <span
            className={className}
            style={{
                ...badgeStyles.base,
                ...variantStyle,
                ...style,
            }}
            {...props}
        >
            {children}
        </span>
    );
}
