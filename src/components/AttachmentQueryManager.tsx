import React, { useState } from "react";
import type { AttachmentMetadata } from "../types/schemas";

interface AttachmentQueryManagerProps {
  token: string;
  coordinatorAddr: string;
  username: string;
}

export default function AttachmentQueryManager({
  token,
  coordinatorAddr,
  username,
}: AttachmentQueryManagerProps) {
  const [groupName, setGroupName] = useState("");
  const [keyPrefix, setKeyPrefix] = useState("");
  const [limit, setLimit] = useState("20");
  const [offset, setOffset] = useState("0");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [attachments, setAttachments] = useState<AttachmentMetadata[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault();

    const targetGroupName = groupName.trim() || username;
    setLoading(true);
    setError("");
    setAttachments([]);

    try {
      const queryPayload: any = {
        token,
        coordinator_addr: coordinatorAddr,
        group_name: targetGroupName,
        limit: parseInt(limit) || 20,
        offset: parseInt(offset) || 0,
      };

      if (keyPrefix.trim()) {
        queryPayload.key_prefix = keyPrefix.trim();
      }

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
        setError(data.error || "Failed to query attachments");
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
          Query Attachments
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleQuery}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
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
            </div>

            <div>
              <label
                htmlFor="keyPrefix"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Key Prefix
              </label>
              <input
                type="text"
                id="keyPrefix"
                value={keyPrefix}
                onChange={(e) => setKeyPrefix(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search by key prefix"
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label
                htmlFor="limit"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Limit
              </label>
              <input
                type="number"
                id="limit"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
                max="100"
                disabled={loading}
              />
            </div>

            <div>
              <label
                htmlFor="offset"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Offset
              </label>
              <input
                type="number"
                id="offset"
                value={offset}
                onChange={(e) => setOffset(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                disabled={loading}
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {loading ? "Searching..." : "Search Attachments"}
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
              Attachments ({totalCount} total)
            </h3>
            <div className="text-sm text-gray-600">
              Showing {attachments.length} results (offset: {offset})
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
                    Content Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
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
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {attachment.content_type || "N/A"}
                      </div>
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
        </div>
      )}
    </div>
  );
}

