import React, { useState } from "react";
import { ArtifactContentType } from "../types/schemas";

interface ArtifactManagerProps {
  token: string;
  coordinatorAddr: string;
  username: string;
  activeView: string;
}

export default function ArtifactManager({
  token,
  coordinatorAddr,
  username,
  activeView,
}: ArtifactManagerProps) {
  const [taskUuid, setTaskUuid] = useState("");
  const [contentType, setContentType] = useState<ArtifactContentType>(
    ArtifactContentType.RESULT,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const contentTypes = Object.values(ArtifactContentType);

  const handleDownload = async () => {
    if (!taskUuid.trim()) {
      setError("Please enter a task UUID");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `/api/tasks/${taskUuid}/artifacts/download`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            coordinator_addr: coordinatorAddr,
            content_type: contentType,
          }),
        },
      );

      if (response.ok) {
        const data = await response.json();
        // Create a temporary link to download the file
        const link = document.createElement("a");
        link.href = data.url;
        link.download = `${contentType}.tar.gz`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setSuccess(`Download initiated for ${contentType} artifact`);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to download artifact");
      }
    } catch (err) {
      setError("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!taskUuid.trim()) {
      setError("Please enter a task UUID");
      return;
    }

    if (
      !confirm(
        `Are you sure you want to delete the ${contentType} artifact for task ${taskUuid}?`,
      )
    ) {
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
        setSuccess(`${contentType} artifact deleted successfully`);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to delete artifact");
      }
    } catch (err) {
      setError("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (activeView === "artifacts.download") {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Download Artifacts
        </h2>

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
              placeholder="Enter task UUID to download artifacts from"
              disabled={loading}
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
              Select the type of artifact you want to download
            </p>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleDownload}
              disabled={loading || !taskUuid.trim()}
              className="px-6 py-3 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {loading ? "Downloading..." : "Download Artifact"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (activeView === "artifacts.manage") {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Manage Artifacts
        </h2>

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
              placeholder="Enter task UUID to manage artifacts"
              disabled={loading}
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
          </div>

          <div className="flex gap-4 justify-end">
            <button
              onClick={handleDownload}
              disabled={loading || !taskUuid.trim()}
              className="px-6 py-3 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {loading ? "Downloading..." : "Download"}
            </button>
            <button
              onClick={handleDelete}
              disabled={loading || !taskUuid.trim()}
              className="px-6 py-3 bg-red-500 text-white font-medium rounded-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {loading ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

