// /components/docs/Badge.tsx
import { ReactNode } from "react";

const colors = {
  blue: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  green: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  red: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  yellow: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  gray: "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
};

export function Badge({ children, color }: { children: ReactNode; color: keyof typeof colors }) {
  return (
    <span className={`px-3 py-1 text-sm font-medium rounded-full ${colors[color]}`}>
      {children}
    </span>
  );
}