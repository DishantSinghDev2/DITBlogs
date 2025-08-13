// /packages/blogs-react/src/provider.tsx
"use client";

import { DITBlogsClient } from "@dishistech/blogs-sdk";
import { createContext, useContext, ReactNode, useMemo, useEffect } from "react";
import { SWRConfig } from "swr";
import { Theme, CustomTheme, lightTheme, darkTheme } from "./theme";

interface DITBlogsContextType {
  client: DITBlogsClient;
}

const DITBlogsContext = createContext<DITBlogsContextType | null>(null);

export function useDITBlogs() {
  const context = useContext(DITBlogsContext);
  if (!context) throw new Error("useDITBlogs must be used within a DITBlogsProvider");
  return context.client;
}

interface DITBlogsProviderProps {
  children: ReactNode;
  apiKey: string;
  theme?: Theme | CustomTheme;
}

export function DITBlogsProvider({ children, apiKey, theme = "light" }: DITBlogsProviderProps) {
  const client = useMemo(() => new DITBlogsClient(apiKey), [apiKey]);

  // Apply theme via CSS variables
  useEffect(() => {
    const root = document.documentElement;
    const selectedTheme =
      theme === "light" ? lightTheme :
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


  return (
    <DITBlogsContext.Provider value={{ client }}>
      <SWRConfig>{children}</SWRConfig>
    </DITBlogsContext.Provider>
  );
}