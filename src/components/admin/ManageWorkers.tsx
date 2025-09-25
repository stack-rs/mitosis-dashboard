import React, { useState } from "react";
import { authUtils } from "../../utils/auth";
import { handleApiError, handleNetworkError } from "../../utils/errorUtils";

interface ManageWorkersProps {
  token: string;
  coordinatorAddr: string;
  username: string;
}

export default function ManageWorkers({
  token,
  coordinatorAddr,
  username,
}: ManageWorkersProps) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Worker cancellation (Real admin API: DELETE admin/workers/{uuid})
  const [cancelWorkerId, setCancelWorkerId] = useState("");
  const [forceCancel, setForceCancel] = useState(false);

  const cancelWorker = async () => {
    if (!cancelWorkerId.trim()) return;

    const confirmMessage = forceCancel
      ? `Are you sure you want to FORCE cancel worker "${cancelWorkerId}"? This will immediately terminate the worker.`
      : `Are you sure you want to cancel worker "${cancelWorkerId}"? This will gracefully stop the worker.`;

    if (!confirm(confirmMessage)) return;

    setLoading(true);
    setMessage("");
    try {
      const url = forceCancel
        ? `/api/admin/workers/${cancelWorkerId.trim()}/cancel?op=force`
        : `/api/admin/workers/${cancelWorkerId.trim()}/cancel`;

      const headers = authUtils.getAuthHeaders(token);
      const requestBody = {
        token,
        coordinator_addr: coordinatorAddr,
      };

      const response = await fetch(url, {
        method: "DELETE",
        headers: headers,
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const action = forceCancel ? "force cancelled" : "cancelled";
        setMessage(`✅ Worker "${cancelWorkerId}" ${action} successfully`);
        setCancelWorkerId("");
        setForceCancel(false);
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
              ⚙️ Admin - Manage Workers
            </h1>
            <p className="text-gray-600">
              Administrative worker cancellation. For worker querying and other
              operations, please use the regular Workers section.
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

          {/* Worker Cancellation */}
          <div className="mb-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-red-800 mb-4">
                🛑 Cancel Worker (Admin)
              </h2>
              <p className="text-sm text-red-700 mb-4">
                ⚠️ Warning: Cancelling a worker will stop its execution. Force
                cancel will immediately terminate the worker. This action
                requires administrative privileges.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Worker ID *
                  </label>
                  <input
                    type="text"
                    value={cancelWorkerId}
                    onChange={(e) => setCancelWorkerId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Enter worker UUID"
                    required
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="forceCancel"
                    checked={forceCancel}
                    onChange={(e) => setForceCancel(e.target.checked)}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="forceCancel"
                    className="ml-2 text-sm text-gray-700"
                  >
                    Force cancel (immediate termination)
                  </label>
                </div>
                <button
                  onClick={cancelWorker}
                  disabled={loading || !cancelWorkerId.trim()}
                  className="w-full bg-red-500 text-white py-3 px-4 rounded-md hover:bg-red-600 disabled:opacity-50 font-medium"
                >
                  {loading
                    ? "Cancelling..."
                    : forceCancel
                      ? "🛑 Force Cancel Worker (Admin)"
                      : "⏸️ Cancel Worker (Admin)"}
                </button>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-800 mb-2">
              ℹ️ Other Worker Operations
            </h3>
            <p className="text-sm text-blue-700">
              For querying worker information, listing workers, or other worker
              operations, please use the <strong>Workers</strong> section in the
              main menu. This admin section is specifically for administrative
              worker cancellation which requires elevated privileges.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
