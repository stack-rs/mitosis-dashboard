import React, { useState } from "react";
import { authUtils } from "../../utils/auth";
import { handleApiError, handleNetworkError } from "../../utils/errorUtils";

interface ManageTasksProps {
  token: string;
  coordinatorAddr: string;
  username: string;
}

export default function ManageTasks({
  token,
  coordinatorAddr,
  username,
}: ManageTasksProps) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Artifact deletion (Real admin API: DELETE admin/tasks/{uuid}/artifacts/{content_type})
  const [artifactTaskId, setArtifactTaskId] = useState("");
  const [artifactContentType, setArtifactContentType] = useState("result");

  const deleteArtifact = async () => {
    if (!artifactTaskId.trim()) return;
    if (
      !confirm(
        `Are you sure you want to delete ${artifactContentType} artifact for task "${artifactTaskId}"? This action cannot be undone.`,
      )
    )
      return;

    setLoading(true);
    setMessage("");
    try {
      const response = await fetch(
        `/api/admin/tasks/${artifactTaskId.trim()}/artifacts/${artifactContentType}`,
        {
          method: "DELETE",
          headers: authUtils.getAuthHeaders(token),
          body: JSON.stringify({
            token,
            coordinator_addr: coordinatorAddr,
          }),
        },
      );

      if (response.ok) {
        setMessage(
          `✅ ${artifactContentType} artifact deleted for task "${artifactTaskId}"`,
        );
        setArtifactTaskId("");
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
              📋 Admin - Manage Tasks
            </h1>
            <p className="text-gray-600">
              Administrative task artifact management. Other task operations are
              available in the regular Tasks section.
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

          {/* Artifact Deletion */}
          <div className="mb-8">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-orange-800 mb-4">
                🗑️ Delete Task Artifact (Admin)
              </h2>
              <p className="text-sm text-orange-700 mb-4">
                ⚠️ Warning: Deleting artifacts cannot be undone. This will
                permanently remove the specified artifact with administrative
                privileges.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Task ID *
                  </label>
                  <input
                    type="text"
                    value={artifactTaskId}
                    onChange={(e) => setArtifactTaskId(e.target.value)}
                    placeholder="Enter task UUID"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Artifact Type *
                  </label>
                  <select
                    value={artifactContentType}
                    onChange={(e) => setArtifactContentType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="result">result</option>
                    <option value="exec-log">exec-log</option>
                    <option value="std-log">std-log</option>
                  </select>
                </div>
              </div>
              <button
                onClick={deleteArtifact}
                disabled={loading || !artifactTaskId.trim()}
                className="w-full bg-orange-500 text-white py-3 px-4 rounded-md hover:bg-orange-600 disabled:opacity-50 font-medium"
              >
                {loading
                  ? "Deleting Artifact..."
                  : "🗑️ Delete Artifact (Admin)"}
              </button>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-800 mb-2">
              ℹ️ Other Task Operations
            </h3>
            <p className="text-sm text-blue-700">
              For regular task operations like submitting tasks, querying task
              information, cancelling tasks, or managing task properties, please
              use the <strong>Tasks</strong> section in the main menu. This
              admin section is specifically for artifact deletion which requires
              administrative privileges to bypass normal permissions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
