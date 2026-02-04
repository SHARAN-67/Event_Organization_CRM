import React, { useState, useRef, useEffect, createContext, useContext } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTheme } from '../../theme/ThemeContext';

const SelectContext = createContext(null);

export function Select({ value, onValueChange, children }) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState(value);
    const ref = useRef(null);

    useEffect(() => {
        setSelectedValue(value);
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (ref.current && !ref.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (newValue) => {
        setSelectedValue(newValue);
        onValueChange(newValue);
        setIsOpen(false);
    };

    return (
        <SelectContext.Provider value={{ selectedValue, handleSelect, isOpen, setIsOpen }}>
            <div ref={ref} style={{ position: 'relative' }}>
                {children}
            </div>
        </SelectContext.Provider>
    );
}

export function SelectTrigger({ children, className = '', ...props }) {
    const { isOpen, setIsOpen } = useContext(SelectContext);
    const { theme } = useTheme();
    const isDark = theme === 'dark' || theme === 'night';

    const triggerStyles = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        padding: '0.75rem 1rem',
        borderRadius: '12px',
        border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0'}`,
        fontSize: '0.925rem',
        backgroundColor: isDark ? '#0f172a' : '#f8fafc',
        color: isDark ? '#f1f5f9' : '#0f172a',
        cursor: 'pointer',
        outline: 'none',
        transition: 'all 0.2s',
    };

    return (
        <button
            type="button"
            style={triggerStyles}
            onClick={() => setIsOpen(!isOpen)}
            className={className}
            {...props}
        >
            {children}
            <ChevronDown size={16} style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', color: isDark ? '#94a3b8' : '#64748b' }} />
        </button>
    );
}

export function SelectValue({ placeholder = 'Select...' }) {
    const { selectedValue } = useContext(SelectContext);
    return <span>{selectedValue || placeholder}</span>;
}

export function SelectContent({ children, className = '', ...props }) {
    const { isOpen } = useContext(SelectContext);
    const { theme } = useTheme();
    const isDark = theme === 'dark' || theme === 'night';

    const contentStyles = {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        marginTop: '0.25rem',
        backgroundColor: isDark ? '#1e293b' : '#ffffff',
        borderRadius: '12px',
        border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0'}`,
        boxShadow: isDark ? '0 4px 24px rgba(0, 0, 0, 0.4)' : '0 4px 24px rgba(0, 0, 0, 0.1)',
        zIndex: 50,
        maxHeight: '200px',
        overflow: 'auto',
    };

    if (!isOpen) return null;

    return (
        <div style={contentStyles} className={className} {...props}>
            {children}
        </div>
    );
}

export function SelectItem({ value, children, className = '', ...props }) {
    const { selectedValue, handleSelect } = useContext(SelectContext);
    const { theme } = useTheme();
    const isDark = theme === 'dark' || theme === 'night';
    const isSelected = selectedValue === value;

    const itemStyles = {
        padding: '0.75rem 1rem',
        cursor: 'pointer',
        fontSize: '0.875rem',
        transition: 'background-color 0.2s',
        color: isDark ? '#f1f5f9' : '#0f172a',
        backgroundColor: isSelected ? (isDark ? 'rgba(59, 130, 246, 0.2)' : '#f1f5f9') : 'transparent',
    };

    const hoverBg = isDark ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9';
    const selectedBg = isDark ? 'rgba(59, 130, 246, 0.2)' : '#f1f5f9';

    return (
        <div
            style={itemStyles}
            onClick={() => handleSelect(value)}
            onMouseEnter={(e) => { e.target.style.backgroundColor = hoverBg; }}
            onMouseLeave={(e) => { e.target.style.backgroundColor = isSelected ? selectedBg : 'transparent'; }}
            className={className}
            {...props}
        >
            {children}
        </div>
    );
}
