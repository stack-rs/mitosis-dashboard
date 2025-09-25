import React, { useState } from "react";
import { authUtils } from "../../utils/auth";
import { ArtifactContentType } from "../../types/schemas";
import { handleApiError, handleNetworkError } from "../../utils/errorUtils";

interface DeleteArtifactProps {
  token: string;
  coordinatorAddr: string;
}

export default function DeleteArtifact({
  token,
  coordinatorAddr,
}: DeleteArtifactProps) {
  const [taskUuid, setTaskUuid] = useState("");
  const [contentType, setContentType] = useState<ArtifactContentType>(
    ArtifactContentType.RESULT,
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const getContentTypeDisplayName = (type: ArtifactContentType): string => {
    switch (type) {
      case ArtifactContentType.RESULT:
        return "Result";
      case ArtifactContentType.EXEC_LOG:
        return "Execution Log";
      case ArtifactContentType.STD_LOG:
        return "Terminal Output";
      default:
        return type;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!taskUuid.trim()) {
      setMessage("Please enter a task UUID");
      return;
    }

    const confirmMessage = `Are you sure you want to delete the ${getContentTypeDisplayName(contentType)} artifact for task ${taskUuid}?`;
    if (!confirm(confirmMessage)) {
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`/api/tasks/${taskUuid}/artifacts/delete`, {
        method: "DELETE",
        headers: authUtils.getAuthHeaders(token),
        body: JSON.stringify({
          token,
          coordinator_addr: coordinatorAddr,
          content_type: contentType,
        }),
      });

      if (response.ok) {
        setMessage(
          `${getContentTypeDisplayName(contentType)} artifact deleted successfully for task ${taskUuid}`,
        );
        setTaskUuid("");
      } else {
        const errorMessage = await handleApiError(response);
        setMessage(errorMessage);
      }
    } catch (err) {
      setMessage(handleNetworkError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setTaskUuid("");
    setMessage("");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Delete Artifact
          </h1>
          <p className="text-gray-600 mb-8">
            Permanently delete an artifact file from a specific task. This
            action cannot be undone.
          </p>

          {message && (
            <div
              className={`mb-4 p-3 rounded ${
                message.includes("successfully")
                  ? "bg-green-100 border border-green-400 text-green-700"
                  : "bg-red-100 border border-red-400 text-red-700"
              }`}
            >
              {message}
            </div>
          )}

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Warning:</strong> Deleting an artifact is permanent
                  and cannot be undone. Make sure you have downloaded any
                  important files before proceeding.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="taskUuid"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Task UUID
                </label>
                <input
                  type="text"
                  id="taskUuid"
                  value={taskUuid}
                  onChange={(e) => setTaskUuid(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter task UUID (e.g., 123e4567-e89b-12d3-a456-426614174000)"
                  disabled={loading}
                />
                <p className="text-sm text-gray-600 mt-1">
                  Enter the UUID of the task to delete artifacts from
                </p>
              </div>

              <div>
                <label
                  htmlFor="contentType"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Artifact Type
                </label>
                <select
                  id="contentType"
                  value={contentType}
                  onChange={(e) =>
                    setContentType(e.target.value as ArtifactContentType)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                >
                  {Object.values(ArtifactContentType).map((type) => (
                    <option key={type} value={type}>
                      {getContentTypeDisplayName(type)}
                    </option>
                  ))}
                </select>
                <p className="text-sm text-gray-600 mt-1">
                  Select the type of artifact to delete
                </p>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                type="submit"
                disabled={loading || !taskUuid.trim()}
                className="px-6 py-3 bg-red-500 text-white font-medium rounded-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {loading ? "Deleting..." : "Delete Artifact"}
              </button>

              <button
                type="button"
                onClick={handleClear}
                disabled={loading}
                className="px-6 py-3 bg-gray-500 text-white font-medium rounded-md hover:bg-gray-600 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Clear
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
