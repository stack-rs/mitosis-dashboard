import React, { useState } from "react";
import type { TaskQueryResp, TaskQueryInfo } from "../types/schemas";
import { formatRustTimestamp } from "../utils/timeUtils";
import TaskSpecDisplay from "./TaskSpecDisplay";

interface TaskQueryByUuidProps {
  token: string;
  coordinatorAddr: string;
  username: string;
}

export default function TaskQueryByUuid({
  token,
  coordinatorAddr,
  username,
}: TaskQueryByUuidProps) {
  const [uuid, setUuid] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [taskData, setTaskData] = useState<TaskQueryResp | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!uuid.trim()) {
      setError("Please enter a task UUID");
      return;
    }

    setLoading(true);
    setError("");
    setTaskData(null);

    try {
      const response = await fetch(
        `/api/tasks/${uuid}?token=${encodeURIComponent(token)}&coordinator_addr=${encodeURIComponent(coordinatorAddr)}`,
        {
          method: "GET",
        },
      );

      const data = await response.json();

      if (response.ok) {
        setTaskData(data);
      } else {
        setError(data.error || "Failed to fetch task");
      }
    } catch (err) {
      setError("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleClearResults = () => {
    setTaskData(null);
    setError("");
    setUuid("");
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Query Task by UUID
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label
              htmlFor="uuid"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Task UUID
            </label>
            <input
              type="text"
              id="uuid"
              value={uuid}
              onChange={(e) => setUuid(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter task UUID (e.g., 123e4567-e89b-12d3-a456-426614174000)"
              disabled={loading}
            />
            <p className="text-sm text-gray-600 mt-1">
              Enter the unique identifier of the task you want to query
            </p>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading || !uuid.trim()}
              className="px-6 py-3 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {loading ? "Querying..." : "Query Task"}
            </button>

            {taskData && (
              <button
                type="button"
                onClick={handleClearResults}
                className="px-6 py-3 bg-gray-500 text-white font-medium rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Clear Results
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Task Details */}
      {taskData && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Task Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">
                Basic Information
              </h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-600">UUID:</span>
                  <span className="ml-2 font-mono">{taskData.info.uuid}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Task ID:</span>
                  <span className="ml-2">{taskData.info.task_id}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Creator:</span>
                  <span className="ml-2">{taskData.info.creator_username}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Group:</span>
                  <span className="ml-2">{taskData.info.group_name}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">State:</span>
                  <span
                    className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                      taskData.info.state === "COMPLETED"
                        ? "bg-green-100 text-green-800"
                        : taskData.info.state === "RUNNING"
                          ? "bg-blue-100 text-blue-800"
                          : taskData.info.state === "FAILED"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {taskData.info.state}
                  </span>
                </div>
                {taskData.info.exit_status !== undefined &&
                  taskData.info.exit_status !== null && (
                    <div>
                      <span className="font-medium text-gray-600">
                        Exit Status:
                      </span>
                      <span className="ml-2">{taskData.info.exit_status}</span>
                    </div>
                  )}
                <div>
                  <span className="font-medium text-gray-600">Priority:</span>
                  <span className="ml-2">{taskData.info.priority}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Timestamps</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Created:</span>
                  <span className="ml-2">
                    {formatRustTimestamp(taskData.info.created_time)}
                  </span>
                </div>
                {taskData.info.started_time && (
                  <div>
                    <span className="font-medium text-gray-600">Started:</span>
                    <span className="ml-2">
                      {formatRustTimestamp(taskData.info.started_time)}
                    </span>
                  </div>
                )}
                {taskData.info.finished_time && (
                  <div>
                    <span className="font-medium text-gray-600">Finished:</span>
                    <span className="ml-2">
                      {formatRustTimestamp(taskData.info.finished_time)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tags and Labels */}
          {taskData.info.tags && taskData.info.tags.length > 0 && (
            <div className="mt-6">
              <h4 className="font-medium text-gray-900 mb-2">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {taskData.info.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {taskData.info.labels && taskData.info.labels.length > 0 && (
            <div className="mt-6">
              <h4 className="font-medium text-gray-900 mb-2">Labels</h4>
              <div className="flex flex-wrap gap-2">
                {taskData.info.labels.map((label, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Worker Information */}
          {taskData.info.assigned_worker_uuid && (
            <div className="mt-6">
              <h4 className="font-medium text-gray-900 mb-2">
                Worker Information
              </h4>
              <div className="text-sm">
                <span className="font-medium text-gray-600">
                  Assigned Worker UUID:
                </span>
                <span className="ml-2 font-mono">
                  {taskData.info.assigned_worker_uuid}
                </span>
              </div>
            </div>
          )}

          {/* Task Specification */}
          {taskData.info.spec && (
            <div className="mt-6">
              <h4 className="font-medium text-gray-900 mb-4">
                Task Specification
              </h4>
              <TaskSpecDisplay spec={taskData.info.spec} compact={false} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

