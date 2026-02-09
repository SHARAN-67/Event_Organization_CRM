
import React from "react";
import { useTheme } from "../../theme/ThemeContext";

const Button = ({ children, onClick, className, variant = "primary", ...props }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark' || theme === 'night';

    const baseStyles = {
        padding: "0.75rem 1.25rem",
        borderRadius: "12px",
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.75rem",
        fontSize: "0.875rem",
        fontWeight: "600",
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        userSelect: "none",
        ...props.style
    };

    const accentColor = "#10b981";
    const accentHover = "#059669";

    const variants = {
        primary: {
            backgroundColor: accentColor,
            color: "white",
            boxShadow: `0 4px 6px -1px ${accentColor}33, 0 2px 4px -1px ${accentColor}1a`,
        },
        secondary: {
            backgroundColor: isDark ? "#1e293b" : "#f1f5f9",
            color: isDark ? "#f1f5f9" : "#0f172a",
            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0'}`,
        },
        outline: {
            backgroundColor: "transparent",
            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0'}`,
            color: isDark ? "#94a3b8" : "#475569",
        },
        ghost: {
            backgroundColor: "transparent",
            color: isDark ? "#94a3b8" : "#475569",
        },
        danger: {
            backgroundColor: "#ef4444",
            color: "white",
            boxShadow: "0 4px 6px -1px rgba(239, 68, 68, 0.2)",
        }
    };

    const hoverColors = {
        primary: accentHover,
        secondary: isDark ? "#0f172a" : "#e2e8f0",
        outline: isDark ? "rgba(255, 255, 255, 0.05)" : "#f8fafc",
        ghost: isDark ? "rgba(255, 255, 255, 0.05)" : "#f1f5f9",
        danger: "#dc2626",
    };

    const currentVariant = variants[variant] || variants.primary;

    return (
        <button
            onClick={onClick}
            style={{
                ...baseStyles,
                ...currentVariant
            }}
            className={className}
            onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = hoverColors[variant] || hoverColors.primary;
            }}
            onMouseOut={(e) => {
                const reset = variants[variant] || variants.primary;
                e.currentTarget.style.backgroundColor = reset.backgroundColor;
            }}
            onMouseDown={(e) => {
                e.currentTarget.style.transform = "scale(0.97)";
            }}
            onMouseUp={(e) => {
                e.currentTarget.style.transform = "scale(1)";
            }}
            {...props}
        >
            {children}
        </button>
    );
};

export { Button };
