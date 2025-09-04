// Time parsing utilities for handling Rust backend timestamp formats

const RUST_TIMESTAMP_REGEX =
  /^(\d{4})-(\d{2})-(\d{2})\s(\d{2}):(\d{2}):(\d{2})\.(\d{1,6})\s([+-])(\d{2}):(\d{2}):(\d{2})$/;

/**
 * Parses a Rust timestamp string and returns a JavaScript Date object
 * @param timeStr - Rust timestamp string in format "YYYY-MM-DD HH:mm:ss.ffffff +HH:mm:ss"
 * @returns Date object
 * @throws Error if the format is invalid
 */
export function parseRustTimestamp(timeStr: string): Date {
  const match = timeStr.match(RUST_TIMESTAMP_REGEX);
  if (!match) {
    throw new Error(`Invalid Rust timestamp format: ${timeStr}`);
  }

  const [
    ,
    year,
    month,
    day,
    hour,
    minute,
    second,
    microseconds,
    tzSign,
    tzHour,
    tzMinute,
  ] = match;

  // Convert microseconds to milliseconds (pad or truncate to 3 digits)
  const milliseconds = microseconds.padEnd(3, "0").substring(0, 3);

  // Construct ISO string
  const isoString = `${year}-${month}-${day}T${hour}:${minute}:${second}.${milliseconds}${tzSign}${tzHour}:${tzMinute}`;

  const date = new Date(isoString);

  if (isNaN(date.getTime())) {
    throw new Error(`Failed to parse Rust timestamp: ${timeStr}`);
  }

  return date;
}

/**
 * Parses a Rust timestamp and returns a formatted locale string
 * @param timeStr - Rust timestamp string
 * @returns Formatted locale string
 */
export function formatRustTimestamp(timeStr: string): string {
  try {
    return parseRustTimestamp(timeStr).toLocaleString();
  } catch (error) {
    // Fallback to direct parsing if Rust format fails
    try {
      return new Date(timeStr).toLocaleString();
    } catch (fallbackError) {
      console.warn(`Failed to parse timestamp: ${timeStr}`, error);
      return timeStr; // Return original string if all parsing fails
    }
  }
}

/**
 * Calculates and formats time ago from a Rust timestamp
 * @param timeStr - Rust timestamp string
 * @returns Human-readable time ago string (e.g., "2h ago", "Just now")
 */
export function formatRustTimeAgo(timeStr: string): string {
  try {
    const date = parseRustTimestamp(timeStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  } catch (error) {
    // Fallback to direct parsing if Rust format fails
    try {
      const date = new Date(timeStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${diffDays}d ago`;
    } catch (fallbackError) {
      console.warn(`Failed to parse timestamp: ${timeStr}`, error);
      return "Unknown";
    }
  }
}

