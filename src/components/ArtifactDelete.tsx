import React, { useState } from "react";
import { ArtifactContentType } from "../types/schemas";

interface ArtifactDeleteProps {
  token: string;
  coordinatorAddr: string;
  username: string;
}

export default function ArtifactDelete({
  token,
  coordinatorAddr,
  username,
}: ArtifactDeleteProps) {
  const [taskUuid, setTaskUuid] = useState("");
  const [contentType, setContentType] = useState<ArtifactContentType>(
    ArtifactContentType.RESULT,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const contentTypes = Object.values(ArtifactContentType);

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!taskUuid.trim()) {
      setError("Please enter a task UUID");
      return;
    }

    const confirmMessage = `Are you sure you want to delete the ${contentType} artifact from task ${taskUuid}? This action cannot be undone.`;
    if (!confirm(confirmMessage)) {
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/tasks/${taskUuid}/artifacts/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          coordinator_addr: coordinatorAddr,
          content_type: contentType,
        }),
      });

      if (response.ok) {
        setSuccess(
          `Successfully deleted ${contentType} artifact from task ${taskUuid}`,
        );
        setTaskUuid("");
      } else {
        const errorData = await response.json();
        setError(`Delete failed: ${errorData.error || "Unknown error"}`);
      }
    } catch (error) {
      setError(
        `Network error: ${error instanceof Error ? error.message : String(error)}`,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Delete Artifacts
      </h2>

      <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
        <div className="flex items-center">
          <span className="text-red-500 text-2xl mr-3">⚠️</span>
          <div>
            <h3 className="text-red-800 font-semibold">
              Warning: Irreversible Action
            </h3>
            <p className="text-red-700 text-sm mt-1">
              Deleting an artifact permanently removes it from the system. This
              action cannot be undone.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}

      <form onSubmit={handleDelete}>
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
              placeholder="Enter task UUID to delete artifacts from"
              disabled={loading}
              required
            />
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
              {contentTypes.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-600 mt-1">
              Select the type of artifact you want to delete
            </p>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || !taskUuid.trim()}
              className="px-6 py-3 bg-red-500 text-white font-medium rounded-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {loading ? "Deleting..." : "Delete Artifact"}
            </button>
          </div>
        </div>
      </form>

      <div className="mt-8 bg-gray-50 p-4 rounded-md">
        <h3 className="text-sm font-semibold text-gray-800 mb-2">
          Delete Process
        </h3>
        <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
          <li>
            Enter the UUID of the task that has the artifact you want to delete
          </li>
          <li>Select the type of artifact you want to delete</li>
          <li>Click "Delete Artifact" and confirm the action</li>
          <li>The artifact will be permanently removed from the system</li>
        </ol>
        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
          <strong>Important:</strong> Make sure you have backed up any important
          artifacts before deleting them. This operation cannot be reversed.
        </div>
      </div>
    </div>
  );
}

