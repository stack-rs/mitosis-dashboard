import React, { useState } from "react";
import { authUtils } from "../../utils/auth";
import { handleApiError, handleNetworkError } from "../../utils/errorUtils";

interface CancelWorkerProps {
  token: string;
  coordinatorAddr: string;
}

export default function CancelWorker({
  token,
  coordinatorAddr,
}: CancelWorkerProps) {
  const [workerId, setWorkerId] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [message, setMessage] = useState("");

  const cancelWorker = async (force: boolean = false) => {
    if (!workerId.trim()) {
      setMessage("Please enter a worker ID");
      return;
    }

    const confirmMessage = force
      ? `Are you sure you want to FORCE cancel worker ${workerId}? This cannot be undone and may cause data loss.`
      : `Are you sure you want to cancel worker ${workerId}?`;

    if (!confirm(confirmMessage)) return;

    setCancelling(true);
    setMessage("");

    try {
      const url = `/api/workers/${workerId}/cancel${force ? "?force=true" : ""}`;
      const response = await fetch(url, {
        method: "DELETE",
        headers: authUtils.getAuthHeaders(token),
        body: JSON.stringify({
          token,
          coordinator_addr: coordinatorAddr,
        }),
      });

      if (response.ok) {
        setMessage(
          `Worker ${workerId} ${force ? "force " : ""}cancelled successfully`,
        );
        setWorkerId("");
      } else {
        const errorMessage = await handleApiError(response);
        setMessage(`Error cancelling worker: ${errorMessage}`);
      }
    } catch (err) {
      setMessage(handleNetworkError(err));
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Cancel a Worker
          </h1>
          <p className="text-gray-600 mb-8">
            Cancel worker operations by entering the worker ID. Use regular
            cancel for graceful shutdown, or force cancel for immediate
            termination.
          </p>

          {/* Worker ID Input */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Worker ID *
            </label>
            <input
              type="text"
              value={workerId}
              onChange={(e) => setWorkerId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter worker ID to cancel"
            />
          </div>

          {/* Cancel Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Regular Cancel */}
            <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">🛑</div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Regular Cancel
                </h3>
                <p className="text-sm text-gray-600 mt-2">
                  Graceful shutdown - allows worker to finish current task
                </p>
              </div>
              <button
                onClick={() => cancelWorker(false)}
                disabled={cancelling || !workerId.trim()}
                className="w-full bg-yellow-500 text-white py-3 px-4 rounded-md hover:bg-yellow-600 disabled:opacity-50 font-medium"
              >
                {cancelling ? "Cancelling..." : "Cancel Worker"}
              </button>
            </div>

            {/* Force Cancel */}
            <div className="bg-red-50 rounded-lg p-6 border border-red-200">
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">⚠️</div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Force Cancel
                </h3>
                <p className="text-sm text-gray-600 mt-2">
                  Immediate termination - may cause data loss
                </p>
              </div>
              <button
                onClick={() => cancelWorker(true)}
                disabled={cancelling || !workerId.trim()}
                className="w-full bg-red-500 text-white py-3 px-4 rounded-md hover:bg-red-600 disabled:opacity-50 font-medium"
              >
                {cancelling ? "Force Cancelling..." : "Force Cancel Worker"}
              </button>
            </div>
          </div>

          {/* Important Notes */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mb-6">
            <h4 className="font-medium text-blue-900 mb-2">Important Notes:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>
                • <strong>Regular Cancel:</strong> Worker will finish its
                current task before shutting down
              </li>
              <li>
                • <strong>Force Cancel:</strong> Worker is terminated
                immediately, potentially losing work in progress
              </li>
              <li>• Once cancelled, the worker cannot be restarted remotely</li>
              <li>
                • Make sure you have the correct worker ID before proceeding
              </li>
            </ul>
          </div>

          {/* Messages */}
          {message && (
            <div
              className={`p-3 rounded ${
                message.includes("success")
                  ? "bg-green-100 border border-green-400 text-green-700"
                  : "bg-red-100 border border-red-400 text-red-700"
              }`}
            >
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
