import { DITBlogsClient } from "@dishistech/blogs-sdk";
import { ReactNode, ElementType } from "react";
import { Theme, CustomTheme } from "./theme";
interface DITBlogsContextType {
    client: DITBlogsClient;
    Link: ElementType;
}
export declare function useDITBlogsContext(): DITBlogsContextType;
interface DITBlogsProviderProps {
    children: ReactNode;
    apiKey: string;
    theme?: Theme | CustomTheme;
    /**
     * Provide a Link component from your routing library (e.g., next/link or react-router-dom's Link).
     * Defaults to a standard HTML `<a>` tag.
     */
    linkComponent?: ElementType;
}
export declare function DITBlogsProvider({ children, apiKey, theme, linkComponent }: DITBlogsProviderProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=provider.d.ts.map