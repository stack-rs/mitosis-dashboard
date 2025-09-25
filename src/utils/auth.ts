// Authentication utilities for localStorage management
export interface UserSession {
  username: string;
  token: string;
  coordinatorAddr: string;
  loginTime: number;
  retain: boolean;
}

const AUTH_STORAGE_KEY = "mitosis_user_session";

export const authUtils = {
  // Save user session to localStorage
  saveSession(session: UserSession): void {
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    } catch (error) {
      console.error("Failed to save session to localStorage:", error);
    }
  },

  // Load user session from localStorage
  loadSession(): UserSession | null {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!stored) return null;

      const session: UserSession = JSON.parse(stored);

      // if (!session.retain) {
      //   this.clearSession();
      //   return null;
      // }

      return session;
    } catch (error) {
      console.error("Failed to load session from localStorage:", error);
      this.clearSession();
      return null;
    }
  },

  // Clear user session from localStorage
  clearSession(): void {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (error) {
      console.error("Failed to clear session from localStorage:", error);
    }
  },

  // Update session (e.g., after token refresh)
  updateSession(updates: Partial<UserSession>): void {
    const current = this.loadSession();
    if (current) {
      this.saveSession({ ...current, ...updates });
    }
  },

  // Check if user is logged in
  isLoggedIn(): boolean {
    return this.loadSession() !== null;
  },

  // Get auth headers for API calls
  getAuthHeaders(token?: string): { [key: string]: string } {
    const session = this.loadSession();
    const authToken = token || session?.token;

    if (!authToken) {
      return {};
    }

    return {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
    };
  },
};
