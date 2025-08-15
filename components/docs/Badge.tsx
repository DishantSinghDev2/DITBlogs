import { ReactNode } from "react";

const colors = {
  blue: "bg-blue-100 text-blue-800 dark:bg-blue-900/70 dark:text-blue-200 border border-blue-300 dark:border-blue-500/50",
  green: "bg-green-100 text-green-800 dark:bg-green-900/70 dark:text-green-200 border border-green-300 dark:border-green-500/50",
  red: "bg-red-100 text-red-800 dark:bg-red-900/70 dark:text-red-200 border border-red-300 dark:border-red-500/50",
  yellow: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/70 dark:text-yellow-200 border border-yellow-300 dark:border-yellow-500/50",
  gray: "bg-gray-200 text-gray-800 dark:bg-gray-700/70 dark:text-gray-200 border border-gray-300 dark:border-gray-500/50",
};

interface BadgeProps {
  children: ReactNode;
  color: keyof typeof colors;
  className?: string;
}

export function Badge({ children, color, className = "" }: BadgeProps) {
  return (
    <span className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full ${colors[color]} ${className}`}>
      {children}
    </span>
  );
}