import React, { useState } from "react";
import { ArtifactContentType } from "../types/schemas";

interface FileUploaderProps {
  token: string;
  coordinatorAddr: string;
  type: "artifact" | "attachment";
  uuid?: string;
  groupName?: string;
  onUploadComplete?: (result: any) => void;
}

export default function FileUploader({
  token,
  coordinatorAddr,
  type,
  uuid,
  groupName,
  onUploadComplete,
}: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [contentType, setContentType] = useState<ArtifactContentType>(
    ArtifactContentType.RESULT,
  );
  const [key, setKey] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const artifactTypes = Object.values(ArtifactContentType);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (type === "attachment" && !key) {
        setKey(selectedFile.name);
      }
      setError("");
      setSuccess("");
      setUploadProgress(0);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file");
      return;
    }

    if (type === "artifact" && !uuid) {
      setError("Task UUID is required for artifact upload");
      return;
    }

    if (type === "attachment" && !groupName) {
      setError("Group name is required for attachment upload");
      return;
    }

    if (type === "attachment" && !key.trim()) {
      setError("Key is required for attachment upload");
      return;
    }

    setUploading(true);
    setError("");
    setSuccess("");
    setUploadProgress(0);

    try {
      // Step 1: Get upload URL
      const endpoint =
        type === "artifact"
          ? "/api/artifacts/upload"
          : "/api/attachments/upload";
      const payload =
        type === "artifact"
          ? {
              token,
              coordinator_addr: coordinatorAddr,
              uuid,
              content_type: contentType,
              content_length: file.size,
            }
          : {
              token,
              coordinator_addr: coordinatorAddr,
              group_name: groupName,
              key: key.trim(),
              content_length: file.size,
            };

      setUploadProgress(10);
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get upload URL");
      }

      setUploadProgress(30);

      // Step 2: Upload file to the provided URL
      const uploadResponse = await fetch(data.url, {
        method: "PUT",
        headers: {
          "Content-Length": file.size.toString(),
        },
        body: file,
      });

      setUploadProgress(90);

      if (uploadResponse.ok) {
        setUploadProgress(100);
        setSuccess(
          `${type === "artifact" ? "Artifact" : "Attachment"} uploaded successfully!`,
        );

        // Reset form
        setFile(null);
        setKey("");
        setUploadProgress(0);

        if (onUploadComplete) {
          onUploadComplete({ url: data.url, ...data });
        }

        // Clear file input
        const fileInput = document.getElementById(
          "file-input",
        ) as HTMLInputElement;
        if (fileInput) {
          fileInput.value = "";
        }
      } else {
        throw new Error(
          `Upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`,
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      if (type === "attachment" && !key) {
        setKey(droppedFile.name);
      }
      setError("");
      setSuccess("");
      setUploadProgress(0);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="text-2xl">{type === "artifact" ? "📁" : "📎"}</div>
        <h3 className="text-xl font-semibold">
          Upload {type === "artifact" ? "Artifact" : "Attachment"}
        </h3>
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

      <div className="space-y-6">
        {/* Context Information */}
        <div className="bg-gray-50 p-4 rounded-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {type === "artifact" && (
              <div>
                <span className="font-medium text-gray-700">Task UUID:</span>
                <div className="font-mono text-gray-600 truncate">
                  {uuid || "Not set"}
                </div>
              </div>
            )}
            {type === "attachment" && (
              <div>
                <span className="font-medium text-gray-700">Group:</span>
                <div className="text-gray-600">{groupName || "Not set"}</div>
              </div>
            )}
            <div>
              <span className="font-medium text-gray-700">Type:</span>
              <div className="text-gray-600 capitalize">{type}</div>
            </div>
          </div>
        </div>

        {/* File Selection Area */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors"
        >
          {!file ? (
            <div>
              <div className="text-4xl mb-4">📤</div>
              <div className="text-lg font-medium text-gray-700 mb-2">
                Drag & drop a file here, or click to select
              </div>
              <input
                type="file"
                id="file-input"
                onChange={handleFileSelect}
                className="hidden"
              />
              <label
                htmlFor="file-input"
                className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 inline-block"
              >
                Choose File
              </label>
              <div className="text-sm text-gray-500 mt-2">
                Maximum file size: 100MB
              </div>
            </div>
          ) : (
            <div className="bg-blue-50 p-4 rounded-md">
              <div className="text-lg font-medium text-blue-900">
                {file.name}
              </div>
              <div className="text-sm text-blue-700">
                {formatBytes(file.size)} • {file.type || "Unknown type"}
              </div>
              <button
                onClick={() => {
                  setFile(null);
                  setKey("");
                  const fileInput = document.getElementById(
                    "file-input",
                  ) as HTMLInputElement;
                  if (fileInput) fileInput.value = "";
                }}
                className="mt-2 text-sm text-red-600 hover:text-red-800"
              >
                Remove file
              </button>
            </div>
          )}
        </div>

        {/* Upload Configuration */}
        {file && (
          <div className="space-y-4">
            {type === "artifact" && (
              <div>
                <label
                  htmlFor="contentType"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Content Type
                </label>
                <select
                  id="contentType"
                  value={contentType}
                  onChange={(e) =>
                    setContentType(e.target.value as ArtifactContentType)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {artifactTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.replace("-", " ").toUpperCase()}
                    </option>
                  ))}
                </select>
                <div className="text-xs text-gray-500 mt-1">
                  Select the type of artifact content
                </div>
              </div>
            )}

            {type === "attachment" && (
              <div>
                <label
                  htmlFor="attachmentKey"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Attachment Key
                </label>
                <input
                  type="text"
                  id="attachmentKey"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="my-attachment.txt"
                />
                <div className="text-xs text-gray-500 mt-1">
                  Unique identifier for this attachment
                </div>
              </div>
            )}
          </div>
        )}

        {/* Upload Progress */}
        {uploading && (
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full bg-blue-500 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {uploading
            ? `Uploading... (${uploadProgress}%)`
            : `Upload ${type === "artifact" ? "Artifact" : "Attachment"}`}
        </button>
      </div>
    </div>
  );
}
