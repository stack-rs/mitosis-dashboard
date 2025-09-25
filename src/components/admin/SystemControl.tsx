import React, { useState } from "react";
import { authUtils } from "../../utils/auth";
import { handleApiError, handleNetworkError } from "../../utils/errorUtils";

interface SystemControlProps {
  token: string;
  coordinatorAddr: string;
  username: string;
}

export default function SystemControl({
  token,
  coordinatorAddr,
  username,
}: SystemControlProps) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // System shutdown
  const [shutdownSecret, setShutdownSecret] = useState("");

  const shutdownCoordinator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shutdownSecret.trim()) return;
    if (
      !confirm(
        "⚠️ CRITICAL WARNING ⚠️\n\nAre you absolutely sure you want to shutdown the coordinator?\n\nThis will:\n• Stop all running tasks\n• Disconnect all workers\n• Make the system unavailable\n• Require manual restart\n\nThis action cannot be undone!",
      )
    )
      return;

    // Double confirmation for such a critical action
    if (
      !confirm(
        "FINAL CONFIRMATION\n\nType 'YES' in the next dialog to proceed with coordinator shutdown.",
      )
    )
      return;

    const confirmation = prompt(
      "Type 'YES' (in capital letters) to confirm coordinator shutdown:",
    );
    if (confirmation !== "YES") {
      setMessage("❌ Shutdown cancelled - confirmation not received");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/shutdown", {
        method: "POST",
        headers: authUtils.getAuthHeaders(token),
        body: JSON.stringify({
          token,
          coordinator_addr: coordinatorAddr,
          secret: shutdownSecret.trim(),
        }),
      });

      if (response.ok) {
        setMessage(
          "✅ Shutdown command sent successfully. The coordinator is shutting down...",
        );
        setShutdownSecret("");
        // Note: The connection will likely be lost after this point
      } else {
        const errorMessage = await handleApiError(response);
        setMessage(`❌ ${errorMessage}`);
      }
    } catch (error) {
      setMessage(`❌ ${handleNetworkError(error)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              🎛️ Admin - System Control
            </h1>
            <p className="text-gray-600">
              Critical system administration and coordinator shutdown.
            </p>
          </div>

          {/* Current Session Info */}
          <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-800 mb-2">Current Session</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <div>
                Admin User: <span className="font-mono">{username}</span>
              </div>
              <div>
                Coordinator:{" "}
                <span className="font-mono">{coordinatorAddr}</span>
              </div>
              <div>
                Status: <span className="text-green-600">✅ Active</span>
              </div>
            </div>
          </div>

          {/* Message Display */}
          {message && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                message.includes("✅")
                  ? "bg-green-100 border border-green-400 text-green-700"
                  : "bg-red-100 border border-red-400 text-red-700"
              }`}
            >
              {message}
            </div>
          )}

          {/* System Shutdown */}
          <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-800 mb-4">
              ⚠️ DANGER ZONE - System Shutdown
            </h2>
            <div className="bg-red-100 border border-red-300 rounded-md p-4 mb-4">
              <h3 className="font-bold text-red-800 mb-2">
                🚨 CRITICAL WARNING 🚨
              </h3>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• This will immediately shutdown the coordinator</li>
                <li>• All running tasks will be terminated</li>
                <li>• All workers will be disconnected</li>
                <li>• The system will become completely unavailable</li>
                <li>• Manual restart of the coordinator will be required</li>
                <li>• This action CANNOT be undone</li>
              </ul>
            </div>

            <form onSubmit={shutdownCoordinator} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shutdown Secret *
                </label>
                <input
                  type="password"
                  value={shutdownSecret}
                  onChange={(e) => setShutdownSecret(e.target.value)}
                  className="w-full px-3 py-2 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-red-50"
                  required
                  placeholder="Enter the coordinator shutdown secret"
                />
                <p className="text-xs text-red-600 mt-1">
                  This secret is configured on the coordinator server for
                  security.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 text-white py-4 px-4 rounded-md hover:bg-red-700 disabled:opacity-50 font-bold text-lg border-2 border-red-700"
              >
                {loading
                  ? "🔄 Shutting Down System..."
                  : "🛑 SHUTDOWN COORDINATOR"}
              </button>
            </form>

            <div className="mt-4 text-xs text-red-600">
              <p>
                <strong>Security Note:</strong> Multiple confirmations will be
                required before shutdown proceeds.
              </p>
            </div>
          </div>

          {/* Footer Warning */}
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-medium text-yellow-800 mb-2">
              ⚠️ Admin Responsibility Notice
            </h3>
            <p className="text-sm text-yellow-700">
              You are operating with full administrative privileges. All actions
              performed here can affect the entire system and all users. Please
              use these controls responsibly and ensure you understand the
              consequences of each action.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
