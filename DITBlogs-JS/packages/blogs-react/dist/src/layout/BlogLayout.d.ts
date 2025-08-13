import { ElementType, ReactNode } from 'react';
import { CustomTheme, Theme } from '../theme';
interface BlogLayoutProps {
    children: ReactNode;
    apiKey: string;
    theme?: Theme | CustomTheme;
    navLinks?: {
        href: string;
        label: string;
    }[];
    linkComponent?: ElementType;
}
export declare function BlogLayout({ children, apiKey, theme, navLinks, linkComponent }: BlogLayoutProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=BlogLayout.d.ts.map