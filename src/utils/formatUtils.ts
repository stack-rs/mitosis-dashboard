/**
 * Format bytes to human readable format with proper decimal precision
 * Uses decimal (1000-based) formatting: 4653 B -> 4.653 KB
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";

  const k = 1000;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  // For bytes, show as integer
  if (i === 0) {
    return `${bytes} B`;
  }

  // For larger units, show up to 6 decimal places and remove trailing zeros
  // This ensures we don't lose precision for cases like 4653 B -> 4.653 KB
  const value = bytes / Math.pow(k, i);
  const formatted = value.toFixed(6).replace(/\.?0+$/, "");

  return `${formatted} ${sizes[i]}`;
}
