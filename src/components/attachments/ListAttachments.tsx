import React, { useState } from "react";
import { authUtils } from "../../utils/auth";
import { handleApiError, handleNetworkError } from "../../utils/errorUtils";
import { formatBytes } from "../../utils/formatUtils";
import { formatRustTimestamp } from "../../utils/timeUtils";

interface AttachmentInfo {
  key: string;
  group_name: string;
  size?: number;
  content_type?: string;
  created_at?: string;
  updated_at?: string;
}

interface ListAttachmentsProps {
  token: string;
  coordinatorAddr: string;
  username: string;
}

export default function ListAttachments({
  token,
  coordinatorAddr,
  username,
}: ListAttachmentsProps) {
  const [groupName, setGroupName] = useState("");
  const [key, setKey] = useState("");
  const [limit, setLimit] = useState("");
  const [offset, setOffset] = useState("");
  const [countOnly, setCountOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<AttachmentInfo[]>([]);
  const [totalCount, setTotalCount] = useState<number | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const effectiveGroupName = groupName.trim() || username;

    setLoading(true);
    setMessage("");
    setAttachments([]);
    setTotalCount(null);

    try {
      const baseRequestBody: any = {
        token,
        coordinator_addr: coordinatorAddr,
        group_name: effectiveGroupName,
      };

      // Add optional fields
      if (key.trim()) {
        baseRequestBody.key = key.trim();
      }

      if (countOnly) {
        // Count only query
        const countResponse = await fetch("/api/attachments/query", {
          method: "POST",
          headers: authUtils.getAuthHeaders(token),
          body: JSON.stringify({ ...baseRequestBody, count: true }),
        });

        if (countResponse.ok) {
          const countData = await countResponse.json();
          setAttachments([]);
          setTotalCount(countData.count);
          setMessage(`Found ${countData.count || 0} attachments`);
        } else {
          const errorMessage = await handleApiError(countResponse);
          setMessage(errorMessage);
        }
      } else {
        // Get all attachments (no server-side pagination)
        const isUsingCustomPagination = limit.trim() || offset.trim();

        if (isUsingCustomPagination) {
          // Custom pagination - use user-specified limit/offset
          const requestBody = { ...baseRequestBody, count: false };

          if (limit.trim()) {
            const limitNum = parseInt(limit.trim());
            if (!isNaN(limitNum) && limitNum > 0) {
              requestBody.limit = limitNum;
            }
          }

          if (offset.trim()) {
            const offsetNum = parseInt(offset.trim());
            if (!isNaN(offsetNum) && offsetNum >= 0) {
              requestBody.offset = offsetNum;
            }
          }

          const response = await fetch("/api/attachments/query", {
            method: "POST",
            headers: authUtils.getAuthHeaders(token),
            body: JSON.stringify(requestBody),
          });

          if (response.ok) {
            const data = await response.json();
            setAttachments(data.attachments || []);
            setTotalCount(data.count);
            setMessage(`Found ${data.count || 0} attachments`);
          } else {
            const errorMessage = await handleApiError(response);
            setMessage(errorMessage);
          }
        } else {
          // Get all attachments for client-side pagination
          const requestBody = { ...baseRequestBody, count: false };

          const response = await fetch("/api/attachments/query", {
            method: "POST",
            headers: authUtils.getAuthHeaders(token),
            body: JSON.stringify(requestBody),
          });

          if (response.ok) {
            const data = await response.json();
            const allAttachments = data.attachments || [];
            setAttachments(allAttachments);
            setTotalCount(allAttachments.length);
            setMessage(`Found ${allAttachments.length} attachments`);
          } else {
            const errorMessage = await handleApiError(response);
            setMessage(errorMessage);
          }
        }
      }
    } catch (err) {
      setMessage(handleNetworkError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setGroupName("");
    setKey("");
    setLimit("");
    setOffset("");
    setCountOnly(false);
    setMessage("");
    setAttachments([]);
    setTotalCount(null);
    setCurrentPage(1);
  };

  const handlePrevPage = () => {
    if (limit.trim() || offset.trim()) {
      // Custom pagination
      const currentOffset = parseInt(offset.trim()) || 0;
      const currentLimit = parseInt(limit.trim()) || 10;
      setOffset(Math.max(0, currentOffset - currentLimit).toString());
    } else {
      // Client-side pagination
      const newPage = Math.max(1, currentPage - 1);
      setCurrentPage(newPage);
    }
  };

  const handleNextPage = () => {
    if (limit.trim() || offset.trim()) {
      // Custom pagination
      const currentOffset = parseInt(offset.trim()) || 0;
      const currentLimit = parseInt(limit.trim()) || 10;
      setOffset((currentOffset + currentLimit).toString());
    } else {
      // Client-side pagination
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
    }
  };

  // Client-side pagination calculations
  const isUsingCustomPagination = limit.trim() || offset.trim();
  const totalPages = Math.ceil((totalCount || 0) / itemsPerPage);
  const hasPrevPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;

  // Get the attachments for the current page (client-side slicing)
  const currentPageAttachments = isUsingCustomPagination
    ? attachments
    : attachments.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage,
      );

  // Calculate what we're actually showing on this page
  const startItem = isUsingCustomPagination
    ? 1
    : (currentPage - 1) * itemsPerPage + 1;
  const endItem = isUsingCustomPagination
    ? attachments.length
    : (currentPage - 1) * itemsPerPage + currentPageAttachments.length;
  const actualRange =
    currentPageAttachments.length > 0 ? `${startItem}-${endItem}` : "0";

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            List Attachments
          </h1>
          <p className="text-gray-600 mb-8">
            List all attachments in a specific group. Enter the group name to
            see all available attachments.
          </p>

          {message && (
            <div
              className={`mb-4 p-3 rounded ${
                message.includes("Found")
                  ? "bg-blue-100 border border-blue-400 text-blue-700"
                  : "bg-red-100 border border-red-400 text-red-700"
              }`}
            >
              {message}
              {!countOnly &&
                !isUsingCustomPagination &&
                totalCount &&
                totalCount > 0 && (
                  <div className="text-sm mt-1">
                    Page {currentPage} of {totalPages} (showing items{" "}
                    {actualRange} of {totalCount} results)
                  </div>
                )}
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
                  htmlFor="key"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Key Contains (Optional)
                </label>
                <input
                  type="text"
                  id="key"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Filter by key"
                  disabled={loading}
                />
                <p className="text-sm text-gray-600 mt-1">
                  Filter attachments by key
                </p>
              </div>

              <div>
                <label
                  htmlFor="limit"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Limit (Optional)
                </label>
                <input
                  type="number"
                  id="limit"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Maximum number of results"
                  min="1"
                  disabled={loading}
                />
                <p className="text-sm text-gray-600 mt-1">
                  Maximum number of attachments to return
                </p>
              </div>

              <div>
                <label
                  htmlFor="offset"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Offset (Optional)
                </label>
                <input
                  type="number"
                  id="offset"
                  value={offset}
                  onChange={(e) => setOffset(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Number of results to skip"
                  min="0"
                  disabled={loading}
                />
                <p className="text-sm text-gray-600 mt-1">
                  Number of results to skip for pagination
                </p>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="countOnly"
                  checked={countOnly}
                  onChange={(e) => setCountOnly(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={loading}
                />
                <label
                  htmlFor="countOnly"
                  className="ml-2 text-sm font-medium text-gray-700"
                >
                  Count Only
                </label>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Only return the total count, not the actual attachments
              </p>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                onClick={() => {
                  setCurrentPage(1);
                }}
                disabled={loading}
                className="px-6 py-3 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {loading ? "Loading..." : "📋 List Attachments"}
              </button>

              {!countOnly &&
                (isUsingCustomPagination
                  ? parseInt(offset) > 0
                  : hasPrevPage) && (
                  <button
                    type="button"
                    onClick={handlePrevPage}
                    disabled={loading}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-50"
                  >
                    ← Previous
                  </button>
                )}

              {!countOnly &&
                (isUsingCustomPagination
                  ? limit &&
                    parseInt(limit) > 0 &&
                    attachments.length === parseInt(limit)
                  : hasNextPage) && (
                  <button
                    type="button"
                    onClick={handleNextPage}
                    disabled={loading}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-50"
                  >
                    Next →
                  </button>
                )}

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

        {/* Attachments List */}
        {attachments.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Attachments ({attachments.length}
              {totalCount !== null ? ` of ${totalCount}` : ""})
            </h3>

            <div className="space-y-4">
              {currentPageAttachments.map((attachment, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                          {attachment.key}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <strong>Group:</strong> {groupName.trim() || username}
                        </div>
                        <div>
                          <strong>Size:</strong>{" "}
                          {attachment.size
                            ? formatBytes(attachment.size)
                            : "Unknown"}
                        </div>
                        <div>
                          <strong>Content Type:</strong>{" "}
                          {attachment.content_type || "Unknown"}
                        </div>
                        {attachment.created_at && (
                          <div>
                            <strong>Created:</strong>{" "}
                            {formatRustTimestamp(attachment.created_at)}
                          </div>
                        )}
                        {attachment.updated_at && (
                          <div>
                            <strong>Updated:</strong>{" "}
                            {formatRustTimestamp(attachment.updated_at)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading &&
          (groupName || username) &&
          attachments.length === 0 &&
          message.includes("Found 0") && (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-gray-500 mb-4">
                <div className="text-4xl mb-2">📎</div>
                <div className="text-lg">No attachments found</div>
                <div className="text-sm">
                  No attachments exist in the group "{groupName}"
                </div>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
