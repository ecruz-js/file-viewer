import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Combina clases de Tailwind resolviendo conflictos (patrón shadcn). */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
