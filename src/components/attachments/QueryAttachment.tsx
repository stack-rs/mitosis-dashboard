import React, { useState } from "react";
import { handleApiError, handleNetworkError } from "../../utils/errorUtils";
import { formatRustTimestamp } from "../../utils/timeUtils";
import { formatBytes } from "../../utils/formatUtils";

interface AttachmentInfo {
  key?: string;
  content_type?: string;
  size?: number;
  created_at?: string;
  updated_at?: string;
  etag?: string;
  version?: string;
  // Fields added by component for display
  requestedKey?: string;
  requestedGroupName?: string;
}

interface QueryAttachmentProps {
  token: string;
  coordinatorAddr: string;
  username: string;
}

export default function QueryAttachment({
  token,
  coordinatorAddr,
  username,
}: QueryAttachmentProps) {
  const [groupName, setGroupName] = useState("");
  const [attachmentKey, setAttachmentKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [attachmentData, setAttachmentData] = useState<AttachmentInfo | null>(
    null,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const effectiveGroupName = groupName.trim() || username;

    if (!attachmentKey.trim()) {
      setMessage("Please enter an attachment key");
      return;
    }

    setLoading(true);
    setMessage("");
    setAttachmentData(null);

    try {
      const response = await fetch(
        `/api/attachments/metadata?token=${encodeURIComponent(token)}&coordinator_addr=${encodeURIComponent(coordinatorAddr)}&group_name=${encodeURIComponent(effectiveGroupName)}&key=${encodeURIComponent(attachmentKey)}`,
        {
          method: "GET",
        },
      );

      if (response.ok) {
        const data = await response.json();
        // Store both the API response and the request parameters for display
        const enrichedData = {
          ...data,
          requestedKey: attachmentKey,
          requestedGroupName: effectiveGroupName,
        };
        setAttachmentData(enrichedData);
        setMessage("Attachment found");
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
    setGroupName("");
    setAttachmentKey("");
    setMessage("");
    setAttachmentData(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Query an Attachment
          </h1>
          <p className="text-gray-600 mb-8">
            Get detailed information about a specific attachment by entering its
            group name and key.
          </p>

          {message && (
            <div
              className={`mb-4 p-3 rounded ${
                message.includes("found")
                  ? "bg-green-100 border border-green-400 text-green-700"
                  : "bg-red-100 border border-red-400 text-red-700"
              }`}
            >
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
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
                  placeholder={`Enter group name (default: ${username})`}
                  disabled={loading}
                />
                <p className="text-sm text-gray-600 mt-1">
                  Leave empty to use your username as group name
                </p>
              </div>

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
                  value={attachmentKey}
                  onChange={(e) => setAttachmentKey(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter attachment key"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading || !attachmentKey.trim()}
                className="px-6 py-3 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {loading ? "Querying..." : "Query Attachment"}
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

        {/* Attachment Details */}
        {attachmentData && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Attachment Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <strong>Key:</strong> {attachmentData.requestedKey}
              </div>
              <div>
                <strong>Group:</strong> {attachmentData.requestedGroupName}
              </div>
              <div>
                <strong>Size:</strong>{" "}
                {attachmentData.size !== undefined &&
                attachmentData.size !== null
                  ? formatBytes(attachmentData.size)
                  : "Unknown"}
              </div>
              <div>
                <strong>Content Type:</strong>{" "}
                {attachmentData.content_type || "Unknown"}
              </div>
              {attachmentData.created_at && (
                <div>
                  <strong>Created:</strong>{" "}
                  {formatRustTimestamp(attachmentData.created_at)}
                </div>
              )}
              {attachmentData.updated_at && (
                <div>
                  <strong>Updated:</strong>{" "}
                  {formatRustTimestamp(attachmentData.updated_at)}
                </div>
              )}
              {attachmentData.etag && (
                <div>
                  <strong>ETag:</strong> {attachmentData.etag}
                </div>
              )}
              {attachmentData.version && (
                <div>
                  <strong>Version:</strong> {attachmentData.version}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
