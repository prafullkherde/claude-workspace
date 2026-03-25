import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Priority } from '../types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function isOverdue(dateString: string | null | undefined): boolean {
  if (!dateString) return false
  const date = new Date(dateString)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date < today
}

export const priorityColors: Record<Priority, string> = {
  [Priority.URGENT]: 'bg-red-100 text-red-800 border-red-200',
  [Priority.HIGH]: 'bg-orange-100 text-orange-800 border-orange-200',
  [Priority.MEDIUM]: 'bg-blue-100 text-blue-800 border-blue-200',
  [Priority.LOW]: 'bg-gray-100 text-gray-600 border-gray-200',
}

export const priorityDotColors: Record<Priority, string> = {
  [Priority.URGENT]: 'bg-red-500',
  [Priority.HIGH]: 'bg-orange-500',
  [Priority.MEDIUM]: 'bg-blue-500',
  [Priority.LOW]: 'bg-gray-400',
}

export const priorityLabels: Record<Priority, string> = {
  [Priority.URGENT]: 'Urgent',
  [Priority.HIGH]: 'High',
  [Priority.MEDIUM]: 'Medium',
  [Priority.LOW]: 'Low',
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
