
import React from 'react';
import { useTheme } from '../../theme/ThemeContext';

export function Label({
    children,
    htmlFor,
    className = '',
    style = {},
    ...props
}) {
    const { theme } = useTheme();
    const isDark = theme === 'dark' || theme === 'night';

    const labelStyles = {
        display: 'block',
        fontSize: '0.875rem',
        fontWeight: '600',
        color: isDark ? '#94a3b8' : '#334155',
        marginBottom: '0.4rem',
        letterSpacing: '-0.01em',
    };

    return (
        <label
            htmlFor={htmlFor}
            className={className}
            style={{
                ...labelStyles,
                ...style,
            }}
            {...props}
        >
            {children}
        </label>
    );
}
