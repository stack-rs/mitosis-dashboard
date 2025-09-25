import React, { useState } from "react";
import { authUtils } from "../../utils/auth";
import { handleApiError, handleNetworkError } from "../../utils/errorUtils";

interface DeleteAttachmentProps {
  token: string;
  coordinatorAddr: string;
  username: string;
}

export default function DeleteAttachment({
  token,
  coordinatorAddr,
  username,
}: DeleteAttachmentProps) {
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

    const confirmMessage = `Are you sure you want to delete the attachment "${attachmentKey}" from group "${groupName}"?`;
    if (!confirm(confirmMessage)) {
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/attachments/delete", {
        method: "DELETE",
        headers: authUtils.getAuthHeaders(token),
        body: JSON.stringify({
          token,
          coordinator_addr: coordinatorAddr,
          group_name: effectiveGroupName,
          key: attachmentKey,
        }),
      });

      if (response.ok) {
        setMessage(
          `Successfully deleted attachment "${attachmentKey}" from group "${effectiveGroupName}"`,
        );
        setGroupName("");
        setAttachmentKey("");
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
            Delete an Attachment
          </h1>
          <p className="text-gray-600 mb-8">
            Permanently delete an attachment from a specific group. This action
            cannot be undone.
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

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Warning:</strong> Deleting an attachment is permanent
                  and cannot be undone. Make sure you have downloaded any
                  important files before proceeding.
                </p>
              </div>
            </div>
          </div>

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
                  The group containing the attachment to delete
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
                  The unique key of the attachment to delete
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading || !attachmentKey.trim()}
                className="px-6 py-3 bg-red-500 text-white font-medium rounded-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {loading ? "Deleting..." : "🗑️ Delete Attachment"}
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
              <li>• Use "List Attachments" to find the exact attachment key</li>
              <li>
                • You can only delete attachments from groups you have access to
              </li>
              <li>
                • Consider downloading important attachments before deletion
              </li>
              <li>
                • Deletion requires confirmation to prevent accidental removal
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
