import React, { useState, useRef, useEffect, createContext, useContext } from 'react';
import { MoreHorizontal } from 'lucide-react';

const DropdownContext = createContext(null);

const menuStyles = {
    trigger: {
        padding: '0.5rem',
        backgroundColor: 'transparent',
        border: 'none',
        cursor: 'pointer',
        borderRadius: '0.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        position: 'absolute',
        minWidth: '160px',
        backgroundColor: '#ffffff',
        borderRadius: '0.375rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
        border: '1px solid #e5e7eb',
        padding: '0.25rem',
        zIndex: 50,
    },
    item: {
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        padding: '0.5rem 0.75rem',
        fontSize: '0.875rem',
        cursor: 'pointer',
        borderRadius: '0.25rem',
        backgroundColor: 'transparent',
        border: 'none',
        textAlign: 'left',
        transition: 'background-color 0.2s',
    },
};

export function DropdownMenu({ children }) {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (ref.current && !ref.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <DropdownContext.Provider value={{ isOpen, setIsOpen }}>
            <div ref={ref} style={{ position: 'relative' }}>
                {children}
            </div>
        </DropdownContext.Provider>
    );
}

export function DropdownMenuTrigger({ children, asChild, onClick, ...props }) {
    const { isOpen, setIsOpen } = useContext(DropdownContext);

    const handleClick = (e) => {
        e.stopPropagation();
        if (onClick) onClick(e);
        setIsOpen(!isOpen);
    };

    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children, {
            onClick: handleClick,
            ...props,
        });
    }

    return (
        <button style={menuStyles.trigger} onClick={handleClick} {...props}>
            {children}
        </button>
    );
}

export function DropdownMenuContent({ children, align = 'end', className = '', ...props }) {
    const { isOpen } = useContext(DropdownContext);

    if (!isOpen) return null;

    const alignStyles = {
        end: { right: 0 },
        start: { left: 0 },
        center: { left: '50%', transform: 'translateX(-50%)' },
    };

    return (
        <div
            style={{ ...menuStyles.content, ...alignStyles[align], top: '100%', marginTop: '0.25rem' }}
            className={className}
            {...props}
        >
            {children}
        </div>
    );
}

export function DropdownMenuItem({ children, onClick, className = '', style = {}, ...props }) {
    const { setIsOpen } = useContext(DropdownContext);

    const handleClick = (e) => {
        e.stopPropagation();
        if (onClick) onClick(e);
        setIsOpen(false);
    };

    return (
        <div
            style={{ ...menuStyles.item, ...style }}
            onClick={handleClick}
            onMouseEnter={(e) => { e.target.style.backgroundColor = '#f3f4f6'; }}
            onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent'; }}
            className={className}
            {...props}
        >
            {children}
        </div>
    );
}

export function DropdownMenuSeparator() {
    return <div style={{ height: '1px', backgroundColor: '#e5e7eb', margin: '0.25rem 0' }} />;
}
