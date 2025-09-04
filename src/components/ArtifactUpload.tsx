import React, { useState } from "react";
import { ArtifactContentType } from "../types/schemas";

interface ArtifactUploadProps {
  token: string;
  coordinatorAddr: string;
  username: string;
}

export default function ArtifactUpload({
  token,
  coordinatorAddr,
  username,
}: ArtifactUploadProps) {
  const [taskUuid, setTaskUuid] = useState("");
  const [contentType, setContentType] = useState<ArtifactContentType>(
    ArtifactContentType.RESULT,
  );
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const contentTypes = Object.values(ArtifactContentType);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError("");
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!taskUuid.trim()) {
      setError("Please enter a task UUID");
      return;
    }

    if (!file) {
      setError("Please select a file to upload");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Step 1: Request upload URL
      const uploadUrlResponse = await fetch("/api/artifacts/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          coordinator_addr: coordinatorAddr,
          uuid: taskUuid,
          content_type: contentType,
          content_length: file.size,
        }),
      });

      if (!uploadUrlResponse.ok) {
        const errorData = await uploadUrlResponse.json();
        throw new Error(
          errorData.error ||
            `Failed to get upload URL (Status: ${uploadUrlResponse.status})`,
        );
      }

      const data = await uploadUrlResponse.json();
      const { url } = data;

      if (!url) {
        throw new Error("No upload URL received from server");
      }

      // Step 2: Upload file to the presigned URL
      const uploadResponse = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Length": file.size.toString(),
        },
        body: file,
      });

      if (uploadResponse.ok) {
        setSuccess(
          `Successfully uploaded ${file.name} as ${contentType} artifact to task ${taskUuid}`,
        );
        setFile(null);
        setTaskUuid("");
        // Reset file input
        const fileInput = document.getElementById(
          "fileInput",
        ) as HTMLInputElement;
        if (fileInput) fileInput.value = "";
      } else {
        const errorText = await uploadResponse
          .text()
          .catch(() => "Unknown error");
        throw new Error(
          `Upload failed with status: ${uploadResponse.status}. ${errorText}`,
        );
      }
    } catch (error) {
      setError(
        `Upload failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Upload Artifacts
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

      <form onSubmit={handleUpload}>
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
              placeholder="Enter task UUID to upload artifacts to"
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
              Select the type of artifact you want to upload
            </p>
          </div>

          <div>
            <label
              htmlFor="fileInput"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Select File
            </label>
            <input
              type="file"
              id="fileInput"
              onChange={handleFileSelect}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
            {file && (
              <div className="mt-2 p-3 bg-gray-50 rounded-md">
                <div className="text-sm text-gray-700">
                  <strong>Selected:</strong> {file.name}
                </div>
                <div className="text-xs text-gray-500">
                  Size: {(file.size / 1024 / 1024).toFixed(2)} MB
                </div>
              </div>
            )}
            <p className="text-sm text-gray-600 mt-1">
              Choose the file you want to upload as an artifact
            </p>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || !taskUuid.trim() || !file}
              className="px-6 py-3 bg-green-500 text-white font-medium rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {loading ? "Uploading..." : "Upload Artifact"}
            </button>
          </div>
        </div>
      </form>

      <div className="mt-8 bg-gray-50 p-4 rounded-md">
        <h3 className="text-sm font-semibold text-gray-800 mb-2">
          Upload Process
        </h3>
        <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
          <li>Enter the UUID of the task you want to upload an artifact for</li>
          <li>
            Select the type of artifact (Result, Execution Log, or Standard Log)
          </li>
          <li>Choose the file you want to upload from your computer</li>
          <li>Click "Upload Artifact" to start the complete upload process</li>
        </ol>
        <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-700">
          <strong>Note:</strong> The upload process automatically gets a
          presigned URL and uploads your file directly to the storage backend.
        </div>
      </div>
    </div>
  );
}

