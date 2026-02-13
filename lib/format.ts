/**
 * Format utilities for consistent display across the UI.
 * Uses es-PE locale for dates.
 */

const LOCALE = 'es-PE';

/**
 * Format a date for list/detail display (date only).
 * @param value - Date instance or ISO string
 * @returns Formatted date string (e.g. "26/1/2026")
 */
export function formatDate(value: Date | string): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(LOCALE);
}

/**
 * Format a date and time for list/detail display.
 * @param value - Date instance or ISO string
 * @returns Formatted date-time string (e.g. "26/1/2026, 14:30:00")
 */
export function formatDateTime(value: Date | string): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString(LOCALE);
}
