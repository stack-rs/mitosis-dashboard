/**
 * Normalizes a coordinator URL to only include protocol, host, and port
 * Removes trailing slashes and any path components
 * Examples:
 *   "https://test.com/" -> "https://test.com"
 *   "http://1.1.1.1:3000/test" -> "http://1.1.1.1:3000"
 * @param url - The URL to normalize
 * @returns The normalized URL (protocol + host + port only)
 */
export function normalizeCoordinatorUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.origin;
  } catch (error) {
    // Fallback for invalid URLs - just clean trailing slashes
    return url.replace(/\/+$/, "");
  }
}
