import React, { useState } from "react";
import { authUtils } from "../../utils/auth";
import { handleApiError, handleNetworkError } from "../../utils/errorUtils";

interface DownloadAttachmentProps {
  token: string;
  coordinatorAddr: string;
  username: string;
}

export default function DownloadAttachment({
  token,
  coordinatorAddr,
  username,
}: DownloadAttachmentProps) {
  const [groupName, setGroupName] = useState("");
  const [attachmentKey, setAttachmentKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const effectiveGroupName = groupName.trim() || username;

    if (!attachmentKey.trim()) {
      setMessage("Please enter an attachment key");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/attachments/download", {
        method: "POST",
        headers: authUtils.getAuthHeaders(token),
        body: JSON.stringify({
          token,
          coordinator_addr: coordinatorAddr,
          group_name: effectiveGroupName,
          key: attachmentKey,
        }),
      });

      if (response.ok) {
        // The API now directly streams the file, so we get it as a blob
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = attachmentKey;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        window.URL.revokeObjectURL(blobUrl);
        setMessage(
          `Successfully downloaded "${attachmentKey}" from group "${effectiveGroupName}"`,
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
    setGroupName("");
    setAttachmentKey("");
    setMessage("");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Download an Attachment
          </h1>
          <p className="text-gray-600 mb-8">
            Download an attachment file from a specific group. Enter the group
            name and attachment key to download the file.
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
                  The group where the attachment is stored
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
                <p className="text-sm text-gray-600 mt-1">
                  The unique key identifying the attachment
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading || !attachmentKey.trim()}
                className="px-6 py-3 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {loading ? "Downloading..." : "⬇️ Download Attachment"}
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

          {/* Help Section */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900 mb-2">💡 Tips</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>
                • Use the "List Attachments" feature to find available
                attachment keys
              </li>
              <li>
                • The downloaded file will use the original attachment key as
                the filename
              </li>
              <li>
                • Make sure you have the correct group name and attachment key
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
