import React, { useState } from "react";

interface AttachmentUploadProps {
  token: string;
  coordinatorAddr: string;
  username: string;
}

export default function AttachmentUpload({
  token,
  coordinatorAddr,
  username,
}: AttachmentUploadProps) {
  const [groupName, setGroupName] = useState("");
  const [key, setKey] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setMessage("");
      // Auto-suggest key from filename if not set
      if (!key.trim()) {
        setKey(selectedFile.name);
      }
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    const targetGroupName = groupName.trim() || username;

    if (!key.trim()) {
      setMessage("Please enter an attachment key");
      return;
    }

    if (!file) {
      setMessage("Please select a file to upload");
      return;
    }

    setUploading(true);
    setMessage("");

    try {
      // Step 1: Request upload URL
      const uploadUrlResponse = await fetch(`/api/attachments/upload`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          coordinator_addr: coordinatorAddr,
          group_name: targetGroupName,
          key: key.trim(),
          content_length: file.size,
        }),
      });

      if (!uploadUrlResponse.ok) {
        const errorData = await uploadUrlResponse.json();
        throw new Error(errorData.error || "Failed to get upload URL");
      }

      const { url } = await uploadUrlResponse.json();

      // Step 2: Upload file to the provided URL
      const uploadResponse = await fetch(url, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": "application/octet-stream",
        },
      });

      if (uploadResponse.ok) {
        setMessage(
          `Successfully uploaded ${file.name} as attachment "${key}" to group "${targetGroupName}"`,
        );
        setFile(null);
        setKey("");
        setGroupName("");
        // Reset file input
        const fileInput = document.getElementById(
          "fileInput",
        ) as HTMLInputElement;
        if (fileInput) fileInput.value = "";
      } else {
        throw new Error(`Upload failed with status: ${uploadResponse.status}`);
      }
    } catch (error) {
      setMessage(
        `Upload failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Upload Attachment
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

      <form onSubmit={handleUpload}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label
              htmlFor="groupName"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Group Name
            </label>
            <input
              type="text"
              id="groupName"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={`Leave empty to use "${username}"`}
              disabled={uploading}
            />
            <p className="mt-1 text-xs text-gray-500">
              The group to upload the attachment to. Defaults to your username
              if empty.
            </p>
          </div>

          <div>
            <label
              htmlFor="key"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Attachment Key *
            </label>
            <input
              type="text"
              id="key"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="my-file.txt or documents/report.pdf"
              required
              disabled={uploading}
            />
            <p className="mt-1 text-xs text-gray-500">
              A unique identifier for the attachment within the group
            </p>
          </div>
        </div>

        <div className="mb-6">
          <label
            htmlFor="fileInput"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Select File *
          </label>
          <input
            type="file"
            id="fileInput"
            onChange={handleFileSelect}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={uploading}
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
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={uploading || !file || !key.trim()}
            className="px-6 py-3 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {uploading ? "Uploading..." : "Upload Attachment"}
          </button>
        </div>
      </form>

      <div className="mt-8 bg-gray-50 p-4 rounded-md">
        <h3 className="text-sm font-semibold text-gray-800 mb-2">
          Upload Process
        </h3>
        <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
          <li>Optionally specify a group name (defaults to your username)</li>
          <li>Enter a unique key/identifier for the attachment</li>
          <li>Select the file you want to upload from your computer</li>
          <li>Click "Upload Attachment" to start the upload process</li>
        </ol>
        <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-700">
          <strong>Tip:</strong> Use descriptive keys like "project/config.json"
          or "reports/analysis-2024.pdf" to organize your attachments.
        </div>
      </div>
    </div>
  );
}

