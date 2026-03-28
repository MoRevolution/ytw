import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Parse an ISO 8601 duration string (e.g. "PT1H23M45S") into hours.
 */
export function parseISODuration(duration: string): number {
  if (!duration) return 0
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return 0

  const hours = parseInt(match[1] || '0', 10)
  const minutes = parseInt(match[2] || '0', 10)
  const seconds = parseInt(match[3] || '0', 10)

  return hours + (minutes / 60) + (seconds / 3600)
}

/**
 * Get the most recent complete year for analysis.
 * If the current year is incomplete (not December), falls back to previous year.
 */
export function getCurrentAnalysisYear(): number {
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1
  return currentMonth < 12 ? currentYear - 1 : currentYear
}
