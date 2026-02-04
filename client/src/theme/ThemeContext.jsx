import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    // Modes: 'light', 'dark', 'night'
    const [theme, setTheme] = useState(localStorage.getItem('antigravity-theme') || 'dark');

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('theme-light', 'theme-dark', 'theme-night');
        root.classList.add(`theme-${theme}`);
        localStorage.setItem('antigravity-theme', theme);

        // Apply background color to body for seamless transitions
        if (theme === 'light') {
            root.style.backgroundColor = '#f8fafc';
            root.style.color = '#0f172a';
        } else if (theme === 'dark') {
            root.style.backgroundColor = '#0f172a';
            root.style.color = '#f1f5f9';
        } else {
            root.style.backgroundColor = '#020617'; // Deep night
            root.style.color = '#e2e8f0';
        }
    }, [theme]);

    const toggleTheme = () => {
        const order = ['light', 'dark', 'night'];
        const nextIndex = (order.indexOf(theme) + 1) % order.length;
        setTheme(order[nextIndex]);
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme must be used within a ThemeProvider');
    return context;
};
