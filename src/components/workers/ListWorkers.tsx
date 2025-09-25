import React, { useState } from "react";
import { authUtils } from "../../utils/auth";
import { GroupWorkerRole } from "../../types/schemas";
import { formatRustTimestamp } from "../../utils/timeUtils";
import { handleApiError, handleNetworkError } from "../../utils/errorUtils";

interface WorkerInfo {
  worker_id: string;
  creator_username: string;
  tags: string[];
  labels: string[];
  created_at: string;
  updated_at: string;
  state: string;
  last_heartbeat: string;
  assigned_task_id?: string | null;
}

interface ListWorkersProps {
  token: string;
  coordinatorAddr: string;
}

export default function ListWorkers({
  token,
  coordinatorAddr,
}: ListWorkersProps) {
  const [workers, setWorkers] = useState<WorkerInfo[]>([]);
  const [totalWorkers, setTotalWorkers] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [countOnly, setCountOnly] = useState(false);

  // Query filters
  const [groupName, setGroupName] = useState("");
  const [creatorUsername, setCreatorUsername] = useState("");
  const [tags, setTags] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<GroupWorkerRole[]>([]);
  const [limit, setLimit] = useState("");
  const [offset, setOffset] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const handleRoleToggle = (role: GroupWorkerRole) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    );
  };

  const queryWorkers = async () => {
    setLoading(true);
    setMessage("");

    try {
      const baseQueryParams: any = {
        token,
        coordinator_addr: coordinatorAddr,
      };

      // Add filters to base query
      if (groupName) baseQueryParams.group_name = groupName;
      if (creatorUsername) baseQueryParams.creator_username = creatorUsername;
      if (tags)
        baseQueryParams.tags = tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);
      if (selectedRoles.length > 0) baseQueryParams.role = selectedRoles;

      if (countOnly) {
        // Count only query
        const countResponse = await fetch("/api/workers/query", {
          method: "POST",
          headers: authUtils.getAuthHeaders(token),
          body: JSON.stringify({ ...baseQueryParams, count: true }),
        });

        if (countResponse.ok) {
          const countData = await countResponse.json();
          setWorkers([]);
          setTotalWorkers(countData.count || 0);
          setMessage(`Total workers count: ${countData.count || 0}`);
        } else {
          const errorMessage = await handleApiError(countResponse);
          setMessage(errorMessage);
        }
      } else {
        // Get all workers (no server-side pagination)
        const isUsingCustomPagination =
          limit.toString().trim() || offset.toString().trim();

        if (isUsingCustomPagination) {
          // Custom pagination - use user-specified limit/offset
          const queryParams = { ...baseQueryParams, count: false };

          if (limit.toString().trim()) {
            const limitNum = parseInt(limit.toString().trim());
            if (!isNaN(limitNum) && limitNum > 0) {
              queryParams.limit = limitNum;
            }
          }

          if (offset.toString().trim()) {
            const offsetNum = parseInt(offset.toString().trim());
            if (!isNaN(offsetNum) && offsetNum >= 0) {
              queryParams.offset = offsetNum;
            }
          }

          const response = await fetch("/api/workers/query", {
            method: "POST",
            headers: authUtils.getAuthHeaders(token),
            body: JSON.stringify(queryParams),
          });

          if (response.ok) {
            const data = await response.json();
            setWorkers(data.workers || []);
            setTotalWorkers(data.count || 0);
            setMessage(`Found ${data.count || 0} workers`);
          } else {
            const errorMessage = await handleApiError(response);
            setMessage(errorMessage);
          }
        } else {
          // Get all workers for client-side pagination
          const queryParams = { ...baseQueryParams, count: false };

          const response = await fetch("/api/workers/query", {
            method: "POST",
            headers: authUtils.getAuthHeaders(token),
            body: JSON.stringify(queryParams),
          });

          if (response.ok) {
            const data = await response.json();
            const allWorkers = data.workers || [];
            setWorkers(allWorkers);
            setTotalWorkers(allWorkers.length);
            setMessage(`Found ${allWorkers.length} workers`);
          } else {
            const errorMessage = await handleApiError(response);
            setMessage(errorMessage);
          }
        }
      }
    } catch (error) {
      setMessage(handleNetworkError(error));
    } finally {
      setLoading(false);
    }
  };

  const handlePrevPage = () => {
    if (limit.toString().trim() || offset.toString().trim()) {
      // Custom pagination
      const currentOffset = parseInt(offset.toString()) || 0;
      const currentLimit = parseInt(limit.toString()) || 10;
      setOffset(Math.max(0, currentOffset - currentLimit).toString());
    } else {
      // Client-side pagination
      const newPage = Math.max(1, currentPage - 1);
      setCurrentPage(newPage);
    }
  };

  const handleNextPage = () => {
    if (limit.toString().trim() || offset.toString().trim()) {
      // Custom pagination
      const currentOffset = parseInt(offset.toString()) || 0;
      const currentLimit = parseInt(limit.toString()) || 10;
      setOffset((currentOffset + currentLimit).toString());
    } else {
      // Client-side pagination
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
    }
  };

  // Client-side pagination calculations
  const isUsingCustomPagination =
    limit.toString().trim() || offset.toString().trim();
  const totalPages = Math.ceil(totalWorkers / itemsPerPage);
  const hasPrevPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;

  // Get the workers for the current page (client-side slicing)
  const currentPageWorkers = isUsingCustomPagination
    ? workers
    : workers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage,
      );

  // Calculate what we're actually showing on this page
  const startItem = isUsingCustomPagination
    ? 1
    : (currentPage - 1) * itemsPerPage + 1;
  const endItem = isUsingCustomPagination
    ? workers.length
    : (currentPage - 1) * itemsPerPage + currentPageWorkers.length;
  const actualRange =
    currentPageWorkers.length > 0 ? `${startItem}-${endItem}` : "0";

  const getWorkerStateColor = (state: string) => {
    switch (state) {
      case "Normal":
        return "bg-green-100 text-green-800";
      case "GracefulShutdown":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            List Workers
          </h1>
          <p className="text-gray-600 mb-8">
            Search and filter workers in the system. Use the count-only option
            to get just the total number without details.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Group Name
              </label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Filter by group name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Creator Username
              </label>
              <input
                type="text"
                value={creatorUsername}
                onChange={(e) => setCreatorUsername(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Filter by creator"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="tag1, tag2, tag3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Roles
              </label>
              <div className="flex gap-4">
                {Object.values(GroupWorkerRole).map((role) => (
                  <label key={role} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedRoles.includes(role)}
                      onChange={() => handleRoleToggle(role)}
                      className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">{role}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Limit (Optional)
              </label>
              <input
                type="number"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Maximum number of results"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Offset (Optional)
              </label>
              <input
                type="number"
                value={offset}
                onChange={(e) => setOffset(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Number of results to skip"
                min="0"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={countOnly}
                onChange={(e) => setCountOnly(e.target.checked)}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">
                Count only (don't return worker details)
              </span>
            </label>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => {
                setCurrentPage(1);
                queryWorkers();
              }}
              disabled={loading}
              className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              {loading
                ? "Searching..."
                : countOnly
                  ? "🔢 Count Workers"
                  : "📋 List Workers"}
            </button>

            {!countOnly &&
              (isUsingCustomPagination
                ? parseInt(offset.toString()) > 0
                : hasPrevPage) && (
                <button
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
                  parseInt(limit.toString()) > 0 &&
                  workers.length === parseInt(limit.toString())
                : hasNextPage) && (
                <button
                  onClick={handleNextPage}
                  disabled={loading}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-50"
                >
                  Next →
                </button>
              )}
          </div>

          {message && (
            <div
              className={`mt-6 p-3 rounded ${
                message.includes("Found") || message.includes("Total")
                  ? "bg-blue-100 border border-blue-400 text-blue-700"
                  : "bg-red-100 border border-red-400 text-red-700"
              }`}
            >
              {message}
              {!countOnly && !isUsingCustomPagination && totalWorkers > 0 && (
                <div className="text-sm mt-1">
                  Page {currentPage} of {totalPages} (showing items{" "}
                  {actualRange} of {totalWorkers} results)
                </div>
              )}
            </div>
          )}

          {!countOnly && workers.length > 0 && (
            <div className="mt-6 bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Workers ({totalWorkers})
              </h3>

              <div className="space-y-4">
                {currentPageWorkers.map((worker) => (
                  <div
                    key={worker.worker_id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h4 className="font-medium text-gray-900">
                            {worker.worker_id}
                          </h4>
                          <span
                            className={`px-2 py-1 text-xs rounded ${getWorkerStateColor(worker.state)}`}
                          >
                            {worker.state}
                          </span>
                        </div>

                        <div className="mt-2 text-sm text-gray-600 grid grid-cols-1 md:grid-cols-2 gap-2">
                          <div>
                            <strong>Creator:</strong> {worker.creator_username}
                          </div>
                          <div>
                            <strong>Created:</strong>{" "}
                            {formatRustTimestamp(worker.created_at)}
                          </div>
                          <div>
                            <strong>Updated:</strong>{" "}
                            {formatRustTimestamp(worker.updated_at)}
                          </div>
                          <div>
                            <strong>Last Heartbeat:</strong>{" "}
                            {formatRustTimestamp(worker.last_heartbeat)}
                          </div>
                          <div className="md:col-span-2">
                            <strong>Assigned Task:</strong>{" "}
                            {worker.assigned_task_id || "None"}
                          </div>
                        </div>

                        {worker.tags && worker.tags.length > 0 && (
                          <div className="mt-2">
                            <strong className="text-sm text-gray-600">
                              Tags:
                            </strong>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {worker.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {worker.labels && worker.labels.length > 0 && (
                          <div className="mt-2">
                            <strong className="text-sm text-gray-600">
                              Labels:
                            </strong>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {worker.labels.map((label) => (
                                <span
                                  key={label}
                                  className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded text-xs"
                                >
                                  {label}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
