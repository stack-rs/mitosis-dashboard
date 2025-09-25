/**
 * Centralized error handling utilities for consistent error message display
 */

/**
 * Formats an error from API response into a user-friendly message
 * @param error - The error content from API response (can be string or object)
 * @returns Formatted error message string
 */
export function formatErrorMessage(error: any): string {
  if (!error) {
    return "Error: Unknown error occurred";
  }

  // If error is a string, try to parse it as JSON first
  if (typeof error === "string") {
    try {
      const parsedError = JSON.parse(error);
      // Recursively format the parsed object
      return formatErrorMessage(parsedError);
    } catch {
      // If JSON parsing fails, treat it as a plain string
      return `Error: ${error}`;
    }
  }

  // If error is an object, try to extract meaningful message
  if (typeof error === "object") {
    // Check if it has a 'msg' field
    if (error.msg) {
      return `${error.msg}`;
    }

    // Check if it has an 'error' field
    if (error.error) {
      return formatErrorMessage(error.error);
    }

    // Check if it has a 'message' field (common in JS errors)
    if (error.message) {
      return `Error: ${error.message}`;
    }

    // If no specific field found, stringify the whole object
    try {
      return `Error: ${JSON.stringify(error)}`;
    } catch {
      return `Error: ${String(error)}`;
    }
  }

  // Fallback for any other type
  return `Error: ${String(error)}`;
}

/**
 * Global logout handler - will be set by the Dashboard component
 */
let globalLogoutHandler: (() => void) | null = null;

/**
 * Sets the global logout handler
 * @param handler - Function to call when user needs to be logged out
 */
export function setLogoutHandler(handler: () => void) {
  globalLogoutHandler = handler;
}

/**
 * Handles API response errors and returns formatted error message
 * Automatically logs out user on 401 errors
 * @param response - The fetch response object
 * @returns Promise<string> - Formatted error message
 */
export async function handleApiError(response: Response): Promise<string> {
  // Check for 401 Unauthorized error
  if (response.status === 401) {
    if (globalLogoutHandler) {
      // Trigger logout and redirect to login page
      globalLogoutHandler();
    }
    return formatErrorMessage("Session expired. Please log in again.");
  }

  try {
    const errorData = await response.json();
    return formatErrorMessage(errorData.error || errorData);
  } catch {
    // If JSON parsing fails, try to get text
    try {
      const errorText = await response.text();
      return formatErrorMessage(
        errorText || `HTTP ${response.status}: ${response.statusText}`,
      );
    } catch {
      return formatErrorMessage(
        `HTTP ${response.status}: ${response.statusText}`,
      );
    }
  }
}

/**
 * Handles network/fetch errors and returns formatted error message
 * @param error - The caught error object
 * @returns Formatted error message string
 */
export function handleNetworkError(error: any): string {
  if (error instanceof Error) {
    return formatErrorMessage(error.message);
  }
  return formatErrorMessage(error || "Network error occurred");
}
