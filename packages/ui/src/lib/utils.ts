import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combine et déduplique les classes Tailwind.
 * Utilise clsx pour la composition conditionnelle et tailwind-merge
 * pour résoudre les conflits (ex. "px-2 px-4" -> "px-4").
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
