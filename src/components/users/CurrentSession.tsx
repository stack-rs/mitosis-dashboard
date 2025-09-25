import React, { useState, useEffect } from "react";
import { authUtils } from "../../utils/auth";

interface CurrentSessionProps {
  token: string;
  coordinatorAddr: string;
  username: string;
}

export default function CurrentSession({
  token: _token,
  coordinatorAddr,
  username,
}: CurrentSessionProps) {
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadSessionInfo = () => {
    const savedSession = authUtils.loadSession();
    setSessionInfo(savedSession);
  };

  useEffect(() => {
    loadSessionInfo();
  }, []);

  const handleRefreshSession = () => {
    setRefreshing(true);
    setTimeout(() => {
      loadSessionInfo();
      setRefreshing(false);
      window.location.reload();
    }, 1000);
  };

  const handleLogout = () => {
    if (
      confirm(
        "Are you sure you want to logout? You will need to login again to continue.",
      )
    ) {
      authUtils.clearSession();
      window.location.reload();
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getSessionDuration = (loginTime: number) => {
    const now = Date.now();
    const duration = now - loginTime;
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Current Session
          </h1>
          <p className="text-gray-600 mb-8">
            View your current session details, connection status, and manage
            your authentication state.
          </p>

          {/* Session Status */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-green-900 mb-2">
                  ✅ Session Active
                </h2>
                <p className="text-green-700">
                  You are successfully connected to the Mitosis coordinator
                </p>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* Session Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md">
                  <span className="font-mono text-gray-900">{username}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Coordinator Address
                </label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md">
                  <span className="font-mono text-sm text-gray-900">
                    {coordinatorAddr}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {sessionInfo?.loginTime && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Login Time
                    </label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md">
                      <span className="text-gray-900">
                        {formatTimestamp(sessionInfo.loginTime)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Session Duration
                    </label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md">
                      <span className="text-gray-900">
                        {getSessionDuration(sessionInfo.loginTime)}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Session Actions */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Session Management
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={handleRefreshSession}
                disabled={refreshing}
                className="flex items-center justify-center px-4 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 transition-colors"
              >
                {refreshing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Refreshing...
                  </>
                ) : (
                  <>🔄 Refresh Session</>
                )}
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center justify-center px-4 py-3 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              >
                🚪 Logout
              </button>
            </div>
          </div>

          {/* Help Section */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900 mb-2">
              💡 Session Info
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Sessions remain active until explicitly logged out</li>
              <li>• Refresh if you experience connection issues</li>
              <li>• Your authentication token is securely stored locally</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
