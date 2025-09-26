import React, { useState } from "react";
import { ArtifactContentType } from "../../types/schemas";
import { handleApiError, handleNetworkError } from "../../utils/errorUtils";

interface DownloadArtifactProps {
  token: string;
  coordinatorAddr: string;
}

export default function DownloadArtifact({
  token,
  coordinatorAddr,
}: DownloadArtifactProps) {
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

  const getFileName = (type: ArtifactContentType): string => {
    switch (type) {
      case ArtifactContentType.RESULT:
        return "result.tar.gz";
      case ArtifactContentType.EXEC_LOG:
        return "exec-log.tar.gz";
      case ArtifactContentType.STD_LOG:
        return "std-log.tar.gz";
      default:
        return `${type}.tar.gz`;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!taskUuid.trim()) {
      setMessage("Please enter a task UUID");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `/api/artifacts/download?token=${encodeURIComponent(token)}&coordinator_addr=${encodeURIComponent(coordinatorAddr)}&uuid=${encodeURIComponent(taskUuid)}&content_type=${encodeURIComponent(contentType)}`,
        {
          method: "GET",
        },
      );

      if (response.ok) {
        // The API now directly streams the file, so we get it as a blob
        const blob = await response.blob();

        // Create a temporary URL for the blob
        const blobUrl = window.URL.createObjectURL(blob);

        // Create a temporary link to download the file
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = getFileName(contentType);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up the blob URL
        window.URL.revokeObjectURL(blobUrl);

        setMessage(
          `Successfully downloaded ${getFileName(contentType)} from task ${taskUuid}`,
        );
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
            Download Artifact
          </h1>
          <p className="text-gray-600 mb-8">
            Download an artifact file from a specific task. Downloaded files
            will be saved with standard naming conventions.
          </p>

          {message && (
            <div
              className={`mb-4 p-3 rounded ${
                message.includes("Successfully")
                  ? "bg-green-100 border border-green-400 text-green-700"
                  : "bg-red-100 border border-red-400 text-red-700"
              }`}
            >
              {message}
            </div>
          )}

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
                  Enter the UUID of the task to download artifacts from
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
                  Select the type of artifact to download. File will be saved as{" "}
                  <code className="bg-gray-100 px-1 rounded">
                    {getFileName(contentType)}
                  </code>
                </p>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                type="submit"
                disabled={loading || !taskUuid.trim()}
                className="px-6 py-3 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {loading ? "Downloading..." : "Download Artifact"}
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
