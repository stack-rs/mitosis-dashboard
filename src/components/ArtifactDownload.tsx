import React, { useState } from "react";
import { ArtifactContentType } from "../types/schemas";

interface ArtifactDownloadProps {
  token: string;
  coordinatorAddr: string;
  username: string;
}

export default function ArtifactDownload({
  token,
  coordinatorAddr,
  username,
}: ArtifactDownloadProps) {
  const [taskUuid, setTaskUuid] = useState("");
  const [contentType, setContentType] = useState<ArtifactContentType>(
    ArtifactContentType.RESULT,
  );
  const [downloading, setDownloading] = useState(false);
  const [message, setMessage] = useState("");

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!taskUuid.trim()) {
      setMessage("Please enter a task UUID");
      return;
    }

    setDownloading(true);
    setMessage("");

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
        link.download = `${taskUuid}-${contentType}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setMessage(
          `Successfully initiated download for ${contentType} artifact from task ${taskUuid}`,
        );
      } else {
        const errorData = await response.json();
        setMessage(`Download failed: ${errorData.error || "Unknown error"}`);
      }
    } catch (error) {
      setMessage(
        `Network error: ${error instanceof Error ? error.message : String(error)}`,
      );
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Download Artifact
      </h2>

      {message && (
        <div
          className={`mb-4 p-3 rounded border ${
            message.includes("Successfully")
              ? "bg-green-100 border-green-400 text-green-700"
              : "bg-red-100 border-red-400 text-red-700"
          }`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleDownload}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label
              htmlFor="taskUuid"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Task UUID *
            </label>
            <input
              type="text"
              id="taskUuid"
              value={taskUuid}
              onChange={(e) => setTaskUuid(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter task UUID"
              required
              disabled={downloading}
            />
            <p className="mt-1 text-xs text-gray-500">
              The UUID of the task to download artifacts from
            </p>
          </div>

          <div>
            <label
              htmlFor="contentType"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Artifact Content Type *
            </label>
            <select
              id="contentType"
              value={contentType}
              onChange={(e) =>
                setContentType(e.target.value as ArtifactContentType)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={downloading}
            >
              <option value={ArtifactContentType.RESULT}>Result</option>
              <option value={ArtifactContentType.EXEC_LOG}>
                Execution Log
              </option>
              <option value={ArtifactContentType.STD_LOG}>Standard Log</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              The type of artifact to download
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={downloading || !taskUuid.trim()}
            className="px-6 py-3 bg-green-500 text-white font-medium rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {downloading ? "Downloading..." : "Download Artifact"}
          </button>
        </div>
      </form>

      <div className="mt-8 bg-gray-50 p-4 rounded-md">
        <h3 className="text-sm font-semibold text-gray-800 mb-2">
          Download Process
        </h3>
        <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
          <li>
            Enter the UUID of the task that has the artifact you want to
            download
          </li>
          <li>Select the type of artifact you want to download</li>
          <li>Click "Download Artifact" to start the download</li>
          <li>Your browser will download the file automatically</li>
        </ol>
        <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-700">
          <strong>Note:</strong> Make sure the task exists and has the requested
          artifact type before downloading.
        </div>
      </div>
    </div>
  );
}

