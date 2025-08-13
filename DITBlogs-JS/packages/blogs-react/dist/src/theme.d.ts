export type Theme = "light" | "dark";
export interface CustomTheme {
    colors: {
        background: string;
        foreground: string;
        card: string;
        cardForeground: string;
        primary: string;
        primaryForeground: string;
        muted: string;
        mutedForeground: string;
    };
}
export declare const lightTheme: CustomTheme;
export declare const darkTheme: CustomTheme;
//# sourceMappingURL=theme.d.ts.map