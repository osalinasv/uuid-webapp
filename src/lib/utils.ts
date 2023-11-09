import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPageTitle(id: string) {
  let title = 'UUID Tools'
  if (id) title += ` | ${id}`

  return title
}
