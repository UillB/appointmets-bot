/**
 * Utility functions for working with dates and timezones
 */

/**
 * Format a UTC date string to local date string (YYYY-MM-DD)
 * Handles timezone conversion properly
 */
export function formatDateToLocal(utcDateString: string): string {
  const date = new Date(utcDateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format a UTC date string to local time string (HH:MM)
 */
export function formatTimeToLocal(utcDateString: string): string {
  const date = new Date(utcDateString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * Get date string without timezone conversion (for comparison)
 * Returns YYYY-MM-DD based on local timezone
 */
export function getLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Compare two dates (ignoring time)
 */
export function isSameDay(date1: Date | string, date2: Date | string): boolean {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

