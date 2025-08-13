// /packages/blogs-react/src/provider.tsx
"use client";
import { jsx as _jsx } from "react/jsx-runtime";
import { DITBlogsClient } from "@dishistech/blogs-sdk";
import { createContext, useContext, useMemo, useEffect } from "react";
import { SWRConfig } from "swr";
import { lightTheme, darkTheme } from "./theme";
const DITBlogsContext = createContext(null);
// RENAMED for clarity
export function useDITBlogsContext() {
    const context = useContext(DITBlogsContext);
    if (!context)
        throw new Error("useDITBlogsContext must be used within a DITBlogsProvider");
    return context; // Returns the whole { client, Link } object
}
export function DITBlogsProvider({ children, apiKey, theme = "light", linkComponent = 'a' }) {
    const client = useMemo(() => new DITBlogsClient(apiKey), [apiKey]);
    // Apply theme via CSS variables
    useEffect(() => {
        const root = document.documentElement;
        const selectedTheme = theme === "light" ? lightTheme :
            theme === "dark" ? darkTheme :
                theme;
        root.style.setProperty('--background', selectedTheme.colors.background);
        root.style.setProperty('--foreground', selectedTheme.colors.foreground);
        root.style.setProperty('--card', selectedTheme.colors.card);
        root.style.setProperty('--card-foreground', selectedTheme.colors.cardForeground);
        root.style.setProperty('--primary', selectedTheme.colors.primary);
        root.style.setProperty('--primary-foreground', selectedTheme.colors.primaryForeground);
        root.style.setProperty('--muted', selectedTheme.colors.muted);
        root.style.setProperty('--muted-foreground', selectedTheme.colors.mutedForeground);
        // Set color scheme for browser UI like scrollbars
        root.style.colorScheme = theme === 'dark' ? 'dark' : 'light';
    }, [theme]);
    const value = { client, Link: linkComponent };
    return (_jsx(DITBlogsContext.Provider, { value: value, children: _jsx(SWRConfig, { children: children }) }));
}
