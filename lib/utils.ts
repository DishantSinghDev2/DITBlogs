import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function generateSlug(text: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove non-word chars except space/hyphen
    .replace(/[\s_-]+/g, "-") // Replace spaces/underscores with single hyphen
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

export function formatDate(date: Date | string | null): string {
  if (!date) return ""

  const d = new Date(date)
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

export function getInitials(name: string): string {
  if (!name) return ""

  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Resolves a Tailwind CSS variable (like '--primary') into its HSL components.
 * This is useful for JavaScript libraries like Chart.js that can't parse CSS variables.
 * @param variableName - The name of the CSS variable (e.g., '--primary').
 * @returns A string in the format "H, S%, L%" or null if the variable is not found.
 */
export function getCssVariableHSL(variableName: string) {
    if (typeof window === 'undefined') return null; // Guard for SSR
    const style = getComputedStyle(document.documentElement);
    const value = style.getPropertyValue(variableName).trim();
    return value || null; // Returns something like "221.2 83.2% 53.3%"
}