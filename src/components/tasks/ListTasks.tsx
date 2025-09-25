import React, { useState, useEffect, useRef } from "react";
import { authUtils } from "../../utils/auth";
import { handleApiError, handleNetworkError } from "../../utils/errorUtils";
import { TaskState } from "../../types/schemas";
import { formatRustTimestamp } from "../../utils/timeUtils";
import TaskSpecDisplay from "../TaskSpecDisplay";
import type { TaskQueryInfo } from "../../types/schemas";

interface ListTasksProps {
  token: string;
  coordinatorAddr: string;
  username: string;
}

export default function ListTasks({
  token,
  coordinatorAddr,
  username: _username,
}: ListTasksProps) {
  const [tasks, setTasks] = useState<TaskQueryInfo[]>([]);
  const [totalTasks, setTotalTasks] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [countOnly, setCountOnly] = useState(false);

  // Query filters
  const [groupName, setGroupName] = useState("");
  const [creatorUsername, setCreatorUsername] = useState("");
  const [tags, setTags] = useState("");
  const [labels, setLabels] = useState("");
  const [selectedStates, setSelectedStates] = useState<TaskState[]>([]);
  const [exitStatus, setExitStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [limit, setLimit] = useState("");
  const [offset, setOffset] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Groups dropdown state
  const [userGroups, setUserGroups] = useState<{ [groupName: string]: string }>(
    {},
  );
  const [showGroupsDropdown, setShowGroupsDropdown] = useState(false);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleStateToggle = (state: TaskState) => {
    setSelectedStates((prev) =>
      prev.includes(state) ? prev.filter((s) => s !== state) : [...prev, state],
    );
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowGroupsDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Load user groups function
  const loadUserGroups = async () => {
    setGroupsLoading(true);
    try {
      const response = await fetch(
        `/api/users/groups?token=${encodeURIComponent(token)}&coordinator_addr=${encodeURIComponent(coordinatorAddr)}`,
        {
          method: "GET",
        },
      );

      if (response.ok) {
        const data = await response.json();
        setUserGroups(data.groups || {});
      }
    } catch (_error) {
      // Silent failure for groups loading
    } finally {
      setGroupsLoading(false);
    }
  };

  const handleGroupSelect = (selectedGroupName: string) => {
    setGroupName(selectedGroupName);
    setShowGroupsDropdown(false);
  };

  const queryTasks = async () => {
    setLoading(true);
    setMessage("");

    try {
      const baseQueryParams: any = {
        token,
        coordinator_addr: coordinatorAddr,
      };

      // Add filters to base query
      if (groupName) baseQueryParams.group_name = groupName;
      if (creatorUsername)
        baseQueryParams.creator_usernames = [creatorUsername];
      if (tags)
        baseQueryParams.tags = tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);
      if (labels)
        baseQueryParams.labels = labels
          .split(",")
          .map((l) => l.trim())
          .filter(Boolean);
      if (selectedStates.length > 0) baseQueryParams.states = selectedStates;
      if (exitStatus) baseQueryParams.exit_status = exitStatus;
      if (priority) baseQueryParams.priority = priority;

      if (countOnly) {
        // Count only query
        const countResponse = await fetch("/api/tasks/query", {
          method: "POST",
          headers: authUtils.getAuthHeaders(token),
          body: JSON.stringify({ ...baseQueryParams, count: true }),
        });

        if (countResponse.ok) {
          const countData = await countResponse.json();
          setTasks([]);
          setTotalTasks(countData.count || 0);
          setMessage(`Total tasks count: ${countData.count || 0}`);
        } else {
          const errorMessage = await handleApiError(countResponse);
          setMessage(errorMessage);
        }
      } else {
        // Get all tasks (no server-side pagination)
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

          const response = await fetch("/api/tasks/query", {
            method: "POST",
            headers: authUtils.getAuthHeaders(token),
            body: JSON.stringify(queryParams),
          });

          if (response.ok) {
            const data = await response.json();
            setTasks(data.tasks || []);
            setTotalTasks(data.count || 0);
            setMessage(`Found ${data.count || 0} tasks`);
          } else {
            const errorMessage = await handleApiError(response);
            setMessage(errorMessage);
          }
        } else {
          // Get all tasks for client-side pagination
          const queryParams = { ...baseQueryParams, count: false };

          const response = await fetch("/api/tasks/query", {
            method: "POST",
            headers: authUtils.getAuthHeaders(token),
            body: JSON.stringify(queryParams),
          });

          if (response.ok) {
            const data = await response.json();
            const allTasks = data.tasks || [];
            setTasks(allTasks);
            setTotalTasks(allTasks.length);
            setMessage(`Found ${allTasks.length} tasks`);
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

  const getTaskStateColor = (state: string) => {
    switch (state) {
      case "Finished":
        return "bg-green-100 text-green-800";
      case "Running":
        return "bg-blue-100 text-blue-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Ready":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
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
  const totalPages = Math.ceil(totalTasks / itemsPerPage);
  const hasPrevPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;

  // Get the tasks for the current page (client-side slicing)
  const currentPageTasks = isUsingCustomPagination
    ? tasks
    : tasks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Calculate what we're actually showing on this page
  const startItem = isUsingCustomPagination
    ? 1
    : (currentPage - 1) * itemsPerPage + 1;
  const endItem = isUsingCustomPagination
    ? tasks.length
    : (currentPage - 1) * itemsPerPage + currentPageTasks.length;
  const actualRange =
    currentPageTasks.length > 0 ? `${startItem}-${endItem}` : "0";


  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">List Tasks</h1>
          <p className="text-gray-600 mb-8">
            Search and filter tasks in the system. Use the count-only option to
            get just the total number without details.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="relative" ref={dropdownRef}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Group Name
              </label>
              <div className="flex">
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Filter by group name"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (Object.keys(userGroups).length === 0) {
                      loadUserGroups();
                    }
                    setShowGroupsDropdown(!showGroupsDropdown);
                  }}
                  className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  title="Select from your groups"
                >
                  {groupsLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                  ) : (
                    "👥"
                  )}
                </button>
              </div>

              {/* Groups Dropdown */}
              {showGroupsDropdown && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {Object.keys(userGroups).length > 0 ? (
                    Object.entries(userGroups).map(([groupName, role]) => (
                      <button
                        key={groupName}
                        type="button"
                        onClick={() => handleGroupSelect(groupName)}
                        className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-gray-50"
                      >
                        <span className="font-medium">{groupName}</span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          {role}
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-gray-500 text-sm">
                      {groupsLoading ? "Loading groups..." : "No groups found"}
                    </div>
                  )}
                </div>
              )}
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
                Labels (comma-separated)
              </label>
              <input
                type="text"
                value={labels}
                onChange={(e) => setLabels(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="label1, label2, label3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exit Status
              </label>
              <input
                type="text"
                value={exitStatus}
                onChange={(e) => setExitStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 0 for success"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <input
                type="text"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., high, low, 5"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task States
            </label>
            <div className="flex flex-wrap gap-4">
              {Object.values(TaskState).map((state) => (
                <label key={state} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedStates.includes(state)}
                    onChange={() => handleStateToggle(state)}
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">{state}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Limit
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
                Offset
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

            <div className="flex items-end">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={countOnly}
                  onChange={(e) => setCountOnly(e.target.checked)}
                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Count only</span>
              </label>
            </div>
          </div>

          <div className="flex gap-4 mb-4">
            <button
              onClick={() => {
                setCurrentPage(1);
                queryTasks();
              }}
              disabled={loading}
              className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              {loading
                ? "Searching..."
                : countOnly
                  ? "🔢 Count Tasks"
                  : "📋 List Tasks"}
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
                  tasks.length === parseInt(limit.toString())
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
              {!countOnly && !isUsingCustomPagination && totalTasks > 0 && (
                <div className="text-sm mt-1">
                  Page {currentPage} of {totalPages} (showing items{" "}
                  {actualRange} of {totalTasks} results)
                </div>
              )}
            </div>
          )}

          {!countOnly && tasks.length > 0 && (
            <div className="mt-6 bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Tasks ({totalTasks})
              </h3>

              <div className="space-y-4">
                {currentPageTasks.map((task) => (
                  <div
                    key={task.uuid}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h4 className="font-medium text-gray-900">
                            Task #{task.task_id}
                          </h4>
                          <span
                            className={`px-2 py-1 text-xs rounded ${getTaskStateColor(task.state)}`}
                          >
                            {task.state}
                          </span>
                        </div>

                        <div className="mt-1 text-sm text-gray-500 font-mono">
                          {task.uuid}
                        </div>

                        <div className="mt-2 text-sm text-gray-600 grid grid-cols-1 md:grid-cols-2 gap-2">
                          <div>
                            <strong>Creator:</strong> {task.creator_username}
                          </div>
                          <div>
                            <strong>Group:</strong> {task.group_name}
                          </div>
                          <div>
                            <strong>Priority:</strong> {task.priority}
                          </div>
                          <div>
                            <strong>Created:</strong>{" "}
                            {formatRustTimestamp(task.created_at)}
                          </div>
                          <div>
                            <strong>Updated:</strong>{" "}
                            {formatRustTimestamp(task.updated_at)}
                          </div>
                          {task.result?.exit_status !== undefined && (
                            <div>
                              <strong>Exit Status:</strong>{" "}
                              {task.result.exit_status}
                            </div>
                          )}
                        </div>

                        {task.tags && task.tags.length > 0 && (
                          <div className="mt-2">
                            <strong className="text-sm text-gray-600">
                              Tags:
                            </strong>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {task.tags.map((tag, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {task.labels && task.labels.length > 0 && (
                          <div className="mt-2">
                            <strong className="text-sm text-gray-600">
                              Labels:
                            </strong>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {task.labels.map((label, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded text-xs"
                                >
                                  {label}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {task.spec && (
                          <div className="mt-3">
                            <TaskSpecDisplay spec={task.spec} compact={true} />
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
