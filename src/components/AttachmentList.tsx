import React, { useState } from "react";
import type { AttachmentMetadata } from "../types/schemas";

interface AttachmentListProps {
  token: string;
  coordinatorAddr: string;
  username: string;
}

export default function AttachmentList({
  token,
  coordinatorAddr,
  username,
}: AttachmentListProps) {
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [attachments, setAttachments] = useState<AttachmentMetadata[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  const handleList = async (e: React.FormEvent) => {
    e.preventDefault();

    const targetGroupName = groupName.trim() || username;
    setLoading(true);
    setError("");
    setAttachments([]);

    try {
      const queryPayload = {
        token,
        coordinator_addr: coordinatorAddr,
        group_name: targetGroupName,
        limit: 100, // Get a reasonable number of attachments
        offset: 0,
      };

      const response = await fetch(`/api/attachments/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(queryPayload),
      });

      const data = await response.json();

      if (response.ok) {
        setAttachments(data.attachments || []);
        setTotalCount(data.count || 0);
      } else {
        setError(data.error || "Failed to list attachments");
      }
    } catch (err) {
      setError("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (attachment: AttachmentMetadata) => {
    try {
      const response = await fetch(`/api/attachments/download`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          coordinator_addr: coordinatorAddr,
          group_name: groupName.trim() || username,
          key: attachment.key,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Create a temporary link to download the file
        const link = document.createElement("a");
        link.href = data.url;
        link.download = attachment.key;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        const errorData = await response.json();
        setError(`Failed to download ${attachment.key}: ${errorData.error}`);
      }
    } catch (err) {
      setError("Network error occurred during download");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          List Attachments
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleList}>
          <div className="flex items-end gap-4 mb-6">
            <div className="flex-1">
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
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {loading ? "Loading..." : "List Attachments"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Results */}
      {attachments.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              Attachments in "{groupName.trim() || username}" ({totalCount}{" "}
              total)
            </h3>
            <div className="text-sm text-gray-600">
              Showing {attachments.length} attachments
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Key
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Updated
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attachments.map((attachment) => (
                  <tr key={attachment.key} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {attachment.key}
                      </div>
                      {attachment.content_type && (
                        <div className="text-xs text-gray-500 mt-1">
                          Type: {attachment.content_type}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {formatFileSize(attachment.content_length)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {new Date(attachment.created_time).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {attachment.updated_time
                          ? new Date(attachment.updated_time).toLocaleString()
                          : "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleDownload(attachment)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalCount > attachments.length && (
            <div className="mt-4 text-sm text-gray-500 text-center">
              Showing first {attachments.length} of {totalCount} attachments.
              Use "Query Attachments" for advanced filtering and pagination.
            </div>
          )}
        </div>
      )}

      {!loading && attachments.length === 0 && !error && (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-gray-500 mb-4">
            <div className="text-4xl mb-2">📎</div>
            <div className="text-lg">No attachments found</div>
            <div className="text-sm">
              Click "List Attachments" to load attachments from a group
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

