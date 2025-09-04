import React, { useState } from "react";

interface AttachmentDeleteProps {
  token: string;
  coordinatorAddr: string;
  username: string;
}

export default function AttachmentDelete({
  token,
  coordinatorAddr,
  username,
}: AttachmentDeleteProps) {
  const [groupName, setGroupName] = useState("");
  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();

    const targetGroupName = groupName.trim() || username;

    if (!key.trim()) {
      setError("Please enter an attachment key");
      return;
    }

    const confirmMessage = `Are you sure you want to delete the attachment "${key}" from group "${targetGroupName}"? This action cannot be undone.`;
    if (!confirm(confirmMessage)) {
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/attachments/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          coordinator_addr: coordinatorAddr,
          group_name: targetGroupName,
          key: key.trim(),
        }),
      });

      if (response.ok) {
        setSuccess(
          `Successfully deleted attachment "${key}" from group "${targetGroupName}"`,
        );
        setKey("");
        setGroupName("");
      } else {
        const errorData = await response.json();
        setError(`Delete failed: ${errorData.error || "Unknown error"}`);
      }
    } catch (error) {
      setError(
        `Network error: ${error instanceof Error ? error.message : String(error)}`,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Delete Attachments
      </h2>

      <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
        <div className="flex items-center">
          <span className="text-red-500 text-2xl mr-3">⚠️</span>
          <div>
            <h3 className="text-red-800 font-semibold">
              Warning: Irreversible Action
            </h3>
            <p className="text-red-700 text-sm mt-1">
              Deleting an attachment permanently removes it from the system.
              This action cannot be undone.
            </p>
          </div>
        </div>
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

      <form onSubmit={handleDelete}>
        <div className="space-y-6">
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
              disabled={loading}
            />
            <p className="text-sm text-gray-600 mt-1">
              The group containing the attachment. Defaults to your username if
              empty.
            </p>
          </div>

          <div>
            <label
              htmlFor="key"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Attachment Key
            </label>
            <input
              type="text"
              id="key"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="my-file.txt or documents/report.pdf"
              required
              disabled={loading}
            />
            <p className="text-sm text-gray-600 mt-1">
              The unique identifier of the attachment to delete
            </p>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || !key.trim()}
              className="px-6 py-3 bg-red-500 text-white font-medium rounded-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {loading ? "Deleting..." : "Delete Attachment"}
            </button>
          </div>
        </div>
      </form>

      <div className="mt-8 bg-gray-50 p-4 rounded-md">
        <h3 className="text-sm font-semibold text-gray-800 mb-2">
          Delete Process
        </h3>
        <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
          <li>Optionally specify a group name (defaults to your username)</li>
          <li>
            Enter the exact key/identifier of the attachment you want to delete
          </li>
          <li>Click "Delete Attachment" and confirm the action</li>
          <li>The attachment will be permanently removed from the system</li>
        </ol>
        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
          <strong>Important:</strong> Make sure you have backed up any important
          attachments before deleting them. This operation cannot be reversed.
        </div>
      </div>
    </div>
  );
}

