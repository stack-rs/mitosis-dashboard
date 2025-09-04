import React, { useState } from "react";

interface AttachmentDownloadProps {
  token: string;
  coordinatorAddr: string;
  username: string;
}

export default function AttachmentDownload({
  token,
  coordinatorAddr,
  username,
}: AttachmentDownloadProps) {
  const [groupName, setGroupName] = useState("");
  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();

    const targetGroupName = groupName.trim() || username;

    if (!key.trim()) {
      setError("Please enter an attachment key");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/attachments/download`, {
        method: "POST",
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
        const data = await response.json();

        // Create a temporary link to download the file
        const link = document.createElement("a");
        link.href = data.url;
        link.download = key.trim();
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setSuccess(
          `Successfully initiated download for attachment "${key}" from group "${targetGroupName}"`,
        );
      } else {
        const errorData = await response.json();
        setError(`Download failed: ${errorData.error || "Unknown error"}`);
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
        Download Attachments
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

      <form onSubmit={handleDownload}>
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
              The unique identifier of the attachment to download
            </p>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || !key.trim()}
              className="px-6 py-3 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {loading ? "Downloading..." : "Download Attachment"}
            </button>
          </div>
        </div>
      </form>

      <div className="mt-8 bg-gray-50 p-4 rounded-md">
        <h3 className="text-sm font-semibold text-gray-800 mb-2">
          Download Process
        </h3>
        <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
          <li>Optionally specify a group name (defaults to your username)</li>
          <li>
            Enter the exact key/identifier of the attachment you want to
            download
          </li>
          <li>Click "Download Attachment" to start the download</li>
          <li>Your browser will download the file automatically</li>
        </ol>
        <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-700">
          <strong>Note:</strong> Make sure the group and key are correct. Use
          "Query Attachments" or "List Attachments" to find the exact key if
          needed.
        </div>
      </div>
    </div>
  );
}

