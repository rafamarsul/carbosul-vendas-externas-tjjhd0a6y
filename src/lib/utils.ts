import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getWhatsAppUrl(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (!cleaned) return '#'
  // If it doesn't have country code (assuming Brazil 55 for this CRM context)
  const finalPhone = cleaned.length <= 11 ? `55${cleaned}` : cleaned
  return `https://wa.me/${finalPhone}`
}

// Simple euclidean distance for our 0-100 mock map coordinates
export function calculateMockDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
  return Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lng2 - lng1, 2))
}
