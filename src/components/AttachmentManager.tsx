import React, { useState } from "react";
import type { AttachmentMetadata } from "../types/schemas";
import { formatRustTimestamp } from "../utils/timeUtils";

interface AttachmentManagerProps {
  token: string;
  coordinatorAddr: string;
  groupName: string;
}

export default function AttachmentManager({
  token,
  coordinatorAddr,
  groupName,
}: AttachmentManagerProps) {
  const [attachmentKey, setAttachmentKey] = useState("");
  const [metadata, setMetadata] = useState<AttachmentMetadata | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGetMetadata = async () => {
    if (!attachmentKey.trim()) {
      setError("Please enter an attachment key");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/attachments/metadata?token=${encodeURIComponent(token)}&coordinator_addr=${encodeURIComponent(coordinatorAddr)}&group_name=${encodeURIComponent(groupName)}&key=${encodeURIComponent(attachmentKey.trim())}`,
      );
      const data = await response.json();

      if (response.ok) {
        setMetadata(data);
      } else {
        setError(data.error || "Failed to get attachment metadata");
        setMetadata(null);
      }
    } catch (err) {
      setError("Network error occurred");
      setMetadata(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!attachmentKey.trim()) {
      setError("Please enter an attachment key");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/attachments/download?token=${encodeURIComponent(token)}&coordinator_addr=${encodeURIComponent(coordinatorAddr)}&group_name=${encodeURIComponent(groupName)}&key=${encodeURIComponent(attachmentKey.trim())}`,
      );
      const data = await response.json();

      if (response.ok) {
        // Open download URL in new tab
        window.open(data.url, "_blank");
      } else {
        setError(data.error || "Failed to get download URL");
      }
    } catch (err) {
      setError("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="text-2xl">📎</div>
        <h3 className="text-xl font-semibold">Attachment Manager</h3>
      </div>

      {/* Group Information */}
      <div className="bg-blue-50 p-4 rounded-md mb-6">
        <div className="text-sm font-medium text-blue-700">Current Group</div>
        <div className="text-lg font-semibold text-blue-900">{groupName}</div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Attachment Key Input */}
      <div className="space-y-4">
        <div>
          <label
            htmlFor="attachmentKey"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Attachment Key
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              id="attachmentKey"
              value={attachmentKey}
              onChange={(e) => setAttachmentKey(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleGetMetadata()}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter attachment key..."
              disabled={loading}
            />
            <button
              onClick={handleGetMetadata}
              disabled={loading || !attachmentKey.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "⏳" : "🔍"}
            </button>
          </div>
        </div>

        {/* Metadata Display */}
        {metadata && (
          <div className="bg-gray-50 p-4 rounded-md">
            <h4 className="font-semibold text-gray-700 mb-3">
              Attachment Information
            </h4>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-600">
                    Key:
                  </span>
                  <div className="font-mono text-gray-900">{attachmentKey}</div>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">
                    Size:
                  </span>
                  <div className="text-gray-900">
                    {formatBytes(metadata.size)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-600">
                    Created:
                  </span>
                  <div className="text-gray-900 text-sm">
                    {formatRustTimestamp(metadata.created_at)}
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">
                    Updated:
                  </span>
                  <div className="text-gray-900 text-sm">
                    {formatRustTimestamp(metadata.updated_at)}
                  </div>
                </div>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-600">
                  Content Type:
                </span>
                <div className="text-gray-900">{metadata.content_type}</div>
              </div>

              {/* Download Button */}
              <div className="pt-2">
                <button
                  onClick={handleDownload}
                  disabled={loading}
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading
                    ? "Getting download URL..."
                    : "📥 Download Attachment"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-gray-50 p-4 rounded-md">
          <h4 className="font-semibold text-gray-700 mb-3">Quick Actions</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <button
              onClick={handleDownload}
              disabled={loading || !attachmentKey.trim()}
              className="px-3 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              📥 Direct Download
            </button>
            <button
              onClick={() => {
                setAttachmentKey("");
                setMetadata(null);
                setError("");
              }}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
            >
              🗑️ Clear
            </button>
          </div>
        </div>

        {/* Usage Instructions */}
        <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
          <h4 className="font-semibold text-yellow-800 mb-2">💡 How to use:</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Enter the attachment key (filename or identifier)</li>
            <li>• Click the search button to view metadata</li>
            <li>• Use the download button to get the file</li>
            <li>• Attachments are organized by group name</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
