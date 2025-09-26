import React, { useState } from "react";
import { authUtils } from "../../utils/auth";
import { ArtifactContentType } from "../../types/schemas";
import { handleApiError, handleNetworkError } from "../../utils/errorUtils";

interface UploadArtifactProps {
  token: string;
  coordinatorAddr: string;
}

export default function UploadArtifact({
  token,
  coordinatorAddr,
}: UploadArtifactProps) {
  const [taskUuid, setTaskUuid] = useState("");
  const [contentType, setContentType] = useState<ArtifactContentType>(
    ArtifactContentType.RESULT,
  );
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadStep, setUploadStep] = useState("");
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setFile(selectedFile || null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!taskUuid.trim()) {
      setMessage("Please enter a task UUID");
      return;
    }

    if (!file) {
      setMessage("Please select a file to upload");
      return;
    }

    setLoading(true);
    setMessage("");
    setUploadStep("Getting upload URL...");

    try {
      const response = await fetch("/api/artifacts/upload", {
        method: "POST",
        headers: authUtils.getAuthHeaders(token),
        body: JSON.stringify({
          token,
          coordinator_addr: coordinatorAddr,
          uuid: taskUuid,
          content_type: contentType,
          content_length: file.size,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        // Now upload the actual file to the presigned URL
        setUploadStep("Uploading file...");
        try {
          const uploadResponse = await fetch(data.url, {
            method: "PUT",
            mode: "cors",
            headers: {
              "Content-Type": "application/octet-stream",
            },
            body: file,
          });

          if (uploadResponse.ok) {
            setMessage(`Artifact uploaded successfully for task ${taskUuid}`);
            setTaskUuid("");
            setFile(null);
            // Reset file input
            const fileInput = document.getElementById(
              "file",
            ) as HTMLInputElement;
            if (fileInput) fileInput.value = "";
          } else {
            throw new Error(
              `Failed to upload file: ${uploadResponse.statusText}`,
            );
          }
        } catch (uploadError) {
          let errorMessage = `Failed to upload file: ${uploadError instanceof Error ? uploadError.message : String(uploadError)}`;

          // Add specific guidance for CORS errors
          if (uploadError instanceof Error &&
              (uploadError.message.includes('CORS') ||
               uploadError.message.includes('Network request failed') ||
               uploadError.message.includes('Failed to fetch'))) {
            errorMessage += '. This may be due to CORS policy restrictions from the storage provider.';
          }

          setMessage(errorMessage);
        }
      } else {
        const errorMessage = await handleApiError(response);
        setMessage(errorMessage);
      }
    } catch (err) {
      setMessage(handleNetworkError(err));
    } finally {
      setLoading(false);
      setUploadStep("");
    }
  };

  const handleClear = () => {
    setTaskUuid("");
    setFile(null);
    setMessage("");
    setUploadStep("");
    const fileInput = document.getElementById("file") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Upload Artifact
          </h1>
          <p className="text-gray-600 mb-8">
            Upload an artifact file for a specific task. Artifacts are task
            result files and outputs.
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
                  Enter the UUID of the task to upload an artifact for
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
                  Select the type of artifact you are uploading
                </p>
              </div>

              <div>
                <label
                  htmlFor="file"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Artifact File
                </label>
                <input
                  type="file"
                  id="file"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
                <p className="text-sm text-gray-600 mt-1">
                  Choose the artifact file to upload
                  {file && (
                    <span className="ml-2 text-blue-600">
                      Selected: {file.name} ({Math.round(file.size / 1024)} KB)
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                type="submit"
                disabled={loading || !taskUuid.trim() || !file}
                className="px-6 py-3 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {loading ? uploadStep || "Uploading..." : "Upload Artifact"}
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
