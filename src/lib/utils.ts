// Simplified utility functions for VirtualFireHouse
export function cn(...classes: (string | undefined | null | boolean)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Convert any date input to a proper Date object with timezone handling
 * Ensures consistent local timezone interpretation
 */
function parseDateWithTimezone(date: Date | string | number): Date {
  const d = new Date(date);
  
  if (isNaN(d.getTime())) {
    throw new Error('Invalid date input');
  }
  
  // If the input is a string without timezone info, treat it as local time
  if (typeof date === 'string' && !date.includes('Z') && !date.includes('+') && !date.includes('-')) {
    return d;
  }
  
  return d;
}

/**
 * Get current local date and time
 */
export function getCurrentLocalDate(): Date {
  return new Date();
}

/**
 * Get current local date string in YYYY-MM-DD format
 */
export function getCurrentLocalDateString(): string {
  return formatDateOnly(getCurrentLocalDate());
}

/**
 * Format date and time in standardized format: yyyy-mm-dd hh:mm:ss
 * Uses local timezone for formatting
 */
export function formatDateTime(date: Date | string | number): string {
  try {
    const d = parseDateWithTimezone(date);
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  } catch (error) {
    return 'Invalid Date';
  }
}

/**
 * Format date only in standardized format: yyyy-mm-dd
 * Uses local timezone for formatting
 */
export function formatDateOnly(date: Date | string | number): string {
  try {
    const d = parseDateWithTimezone(date);
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    return 'Invalid Date';
  }
}

/**
 * Format date in readable format using local timezone
 */
export function formatDate(date: Date | string | number): string {
  try {
    const d = parseDateWithTimezone(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });
  } catch (error) {
    return 'Invalid Date';
  }
}

/**
 * Format time in readable format using local timezone
 */
export function formatTime(date: Date | string | number): string {
  try {
    const d = parseDateWithTimezone(date);
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });
  } catch (error) {
    return 'Invalid Time';
  }
}

/**
 * Format datetime in readable format using local timezone
 */
export function formatDateTimeReadable(date: Date | string | number): string {
  try {
    const d = parseDateWithTimezone(date);
    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });
  } catch (error) {
    return 'Invalid DateTime';
  }
}

/**
 * Get timezone offset in minutes
 */
export function getTimezoneOffset(): number {
  return new Date().getTimezoneOffset();
}

/**
 * Get current timezone name
 */
export function getCurrentTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local Time';
}

/**
 * Calculate days between two dates using local timezone
 */
export function daysBetween(date1: Date | string | number, date2: Date | string | number): number {
  try {
    const d1 = parseDateWithTimezone(date1);
    const d2 = parseDateWithTimezone(date2);
    
    // Set both dates to start of day for accurate day calculation
    const start1 = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate());
    const start2 = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate());
    
    const diffTime = start2.getTime() - start1.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } catch (error) {
    return 0;
  }
}

/**
 * Check if a date is today using local timezone
 */
export function isToday(date: Date | string | number): boolean {
  try {
    const d = parseDateWithTimezone(date);
    const today = getCurrentLocalDate();
    
    return (d.getDate() === today.getDate() &&
            d.getMonth() === today.getMonth() &&
            d.getFullYear() === today.getFullYear());
  } catch (error) {
    return false;
  }
}

/**
 * Get start of day in local timezone
 */
export function getStartOfDay(date: Date | string | number): Date {
  const d = parseDateWithTimezone(date);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/**
 * Get end of day in local timezone
 */
export function getEndOfDay(date: Date | string | number): Date {
  const d = parseDateWithTimezone(date);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

// Formats incident details as multi-line format:
// yyyy-mm-dd
// hh:mm:ss
// 000,000
// - Date/time are already stored in local timezone strings in EDOB entries
// - Time may include fractional seconds; they are trimmed
// - Number is zero-padded to 6 and grouped as 000,000
export function formatIncidentTag(
  date: string | undefined,
  time: string | undefined,
  number: string | number | undefined
): string {
  const safeDate = (date || '').trim();
  const safeTimeRaw = (time || '').trim();
  const safeTime = safeTimeRaw.split('.')[0];

  const num = Number(number || 0);
  const padded = String(num).padStart(6, '0');
  const grouped = `${padded.slice(0, 3)},${padded.slice(3)}`;

  return `${safeDate}<br />${safeTime}<br />${grouped}`;
}

// Build a consistently formatted incident tag from an entry object with fallbacks.
// sequence is an optional display-only number used when incident_number is missing.
export function formatIncidentTagFromEntry(
  entry: {
    incident_date?: string | null;
    incident_time?: string | null;
    incident_number?: number | string | null;
    created_at?: string | null;
  },
  sequence?: number,
  preferSequence?: boolean
): string {
  const createdIso = entry?.created_at ?? undefined;

  const dateStr = (entry?.incident_date && String(entry.incident_date))
    || (createdIso ? formatDateOnly(createdIso) : formatDateOnly(new Date().toISOString()));

  const timeStr = (entry?.incident_time && String(entry.incident_time))
    || (createdIso ? formatDateTime(createdIso).split(' ')[1] : formatDateTime(new Date().toISOString()).split(' ')[1]);

  const numberStr = (
    preferSequence && sequence !== undefined
      ? String(sequence)
      : (entry?.incident_number !== undefined && entry?.incident_number !== null
          ? String(entry.incident_number)
          : sequence !== undefined
            ? String(sequence)
            : '0')
  );

  return formatIncidentTag(dateStr, timeStr, numberStr);
}

/**
 * Produce user-friendly messages for common Supabase/Postgres errors.
 * Optionally accepts a fallback context that will be appended if no specific mapping applies.
 */
export function formatSupabaseError(err: any, fallback?: string): string {
  const code: string | undefined = err?.code || (typeof err?.status === 'number' ? String(err.status) : undefined);
  const message: string = err?.message || '';
  const details: string = err?.details || err?.hint || '';

  // Duplicate key violations
  if (code === '23505' || /duplicate key value/i.test(message)) {
    const match = message.match(/\(([^)]+)\)=\(([^)]+)\)/);
    if (match) {
      const field = match[1].replace(/_/g, ' ');
      const value = match[2];
      return `Duplicate ${field}: "${value}" already exists.`;
    }
    return 'Duplicate entry: a record with the same value already exists.';
  }

  // Not-null violations
  if (code === '23502' || /not-null constraint/i.test(message)) {
    const fieldMatch = message.match(/"([^"]+)"/);
    const field = fieldMatch ? fieldMatch[1].replace(/_/g, ' ') : undefined;
    return field ? `Missing required field: ${field}.` : 'Missing required field.';
  }

  // Invalid date syntax
  if (code === '22007' || /invalid input syntax for type date/i.test(message)) {
    return 'Invalid date: please enter a valid YYYY-MM-DD date.';
  }

  // Value too long
  if (code === '22001' || /value too long/i.test(message)) {
    return 'Value too long: please shorten the input.';
  }

  // Storage-related common errors
  if (/No such file or directory/i.test(message)) {
    return 'File not found. Please reselect the file and try again.';
  }
  if (/bucket/i.test(message) && /not found/i.test(message)) {
    return 'Storage bucket not found. Please contact the administrator.';
  }

  // Fallback
  const base = message || details || 'An unexpected error occurred. Please try again.';
  return fallback ? `${fallback}${message ? ` (${message})` : ''}` : base;
}