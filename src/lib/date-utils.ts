// utils/format-date.ts

/**
 * Converts an ISO date string to a formatted date string.
 * @param isoString - The ISO date string to format.
 * @param options - Optional formatting options for `toLocaleString`.
 * @param locale - The locale for formatting the date string.
 * @returns Formatted date string.
 */
export function formatDate(
    isoString: string,
    options: Intl.DateTimeFormatOptions = {},
    locale: string = 'en-US'
  ): string {
    const date = new Date(isoString);
  
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    };
  
    return date.toLocaleString(locale, { ...defaultOptions, ...options });
  }
  