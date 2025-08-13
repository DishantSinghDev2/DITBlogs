// /packages/blogs-react/src/theme.ts

export type Theme = "light" | "dark";

export interface CustomTheme {
  colors: {
    background: string;       // e.g., #FFFFFF
    foreground: string;       // e.g., #0A0A0A
    card: string;             // e.g., #FFFFFF
    cardForeground: string;   // e.g., #0A0A0A
    primary: string;          // e.g., #3b82f6
    primaryForeground: string;// e.g., #FFFFFF
    muted: string;            // e.g., #f1f5f9
    mutedForeground: string;  // e.g., #64748b
  };
  // Add other theme properties like borderRadius, fonts etc.
}

export const lightTheme: CustomTheme = {
  colors: {
    background: "hsl(0 0% 100%)",
    foreground: "hsl(240 10% 3.9%)",
    card: "hsl(0 0% 100%)",
    cardForeground: "hsl(240 10% 3.9%)",
    primary: "hsl(221 83% 53%)",
    primaryForeground: "hsl(60 9% 98%)",
    muted: "hsl(240 5% 96%)",
    mutedForeground: "hsl(240 4% 46%)",
  },
};

export const darkTheme: CustomTheme = {
  colors: {
    background: "hsl(240 10% 3.9%)",
    foreground: "hsl(0 0% 98%)",
    card: "hsl(240 10% 3.9%)",
    cardForeground: "hsl(0 0% 98%)",
    primary: "hsl(217 91% 60%)",
    primaryForeground: "hsl(210 20% 98%)",
    muted: "hsl(240 4% 16%)",
    mutedForeground: "hsl(240 5% 65%)",
  },
};