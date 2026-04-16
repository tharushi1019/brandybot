import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

const getSystemTheme = () =>
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

export const ThemeProvider = ({ children }) => {
    // theme can be 'dark' | 'light' | 'system'
    const [theme, setThemeState] = useState(() => {
        return localStorage.getItem('brandybot-theme') || 'system';
    });

    // resolvedTheme is what is actually applied to the DOM
    const resolvedTheme = theme === 'system' ? getSystemTheme() : theme;

    useEffect(() => {
        const root = document.documentElement;

        const apply = (resolved) => {
            root.setAttribute('data-theme', resolved);
        };

        if (theme === 'system') {
            apply(getSystemTheme());
            // Listen for OS-level changes
            const mq = window.matchMedia('(prefers-color-scheme: dark)');
            const handler = (e) => apply(e.matches ? 'dark' : 'light');
            mq.addEventListener('change', handler);
            return () => mq.removeEventListener('change', handler);
        } else {
            apply(theme);
        }
    }, [theme]);

    const setTheme = (newTheme) => {
        setThemeState(newTheme);
        localStorage.setItem('brandybot-theme', newTheme);
    };

    // Kept for backward compat — toggles between dark and light only
    const toggleTheme = () => {
        setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isDark: resolvedTheme === 'dark', resolvedTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
    return ctx;
};
