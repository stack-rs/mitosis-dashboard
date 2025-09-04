import React, { useState, useEffect } from "react";
import {
  type TaskQueryResp,
  ArtifactContentType,
  TaskState,
} from "../types/schemas";
import { formatRustTimestamp } from "../utils/timeUtils";
import TaskSpecDisplay from "./TaskSpecDisplay";

interface TaskDetailProps {
  uuid: string;
  token: string;
  coordinatorAddr: string;
  onClose: () => void;
}

export default function TaskDetail({
  uuid,
  token,
  coordinatorAddr,
  onClose,
}: TaskDetailProps) {
  const [task, setTask] = useState<TaskQueryResp | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const fetchTaskDetail = async () => {
    try {
      setRefreshing(true);
      const response = await fetch(
        `/api/tasks/${uuid}?token=${encodeURIComponent(token)}&coordinator_addr=${encodeURIComponent(coordinatorAddr)}`,
      );
      const data = await response.json();

      if (response.ok) {
        setTask(data);
        setError("");
      } else {
        setError(data.error || "Failed to fetch task details");
      }
    } catch (err) {
      setError("Network error occurred");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTaskDetail();
  }, [uuid, token, coordinatorAddr]);

  const handleArtifactDownload = async (contentType: ArtifactContentType) => {
    try {
      const response = await fetch(
        `/api/artifacts/download?token=${encodeURIComponent(token)}&coordinator_addr=${encodeURIComponent(coordinatorAddr)}&uuid=${encodeURIComponent(uuid)}&content_type=${contentType}`,
      );
      const data = await response.json();

      if (response.ok) {
        // Open download URL in new tab
        window.open(data.url, "_blank");
      } else {
        alert(`Download failed: ${data.error}`);
      }
    } catch (err) {
      alert("Network error occurred during download");
    }
  };

  const getStateColor = (state: TaskState): string => {
    switch (state) {
      case TaskState.PENDING:
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case TaskState.READY:
        return "bg-blue-100 text-blue-800 border-blue-300";
      case TaskState.RUNNING:
        return "bg-green-100 text-green-800 border-green-300";
      case TaskState.FINISHED:
        return "bg-gray-100 text-gray-800 border-gray-300";
      case TaskState.CANCELLED:
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-600 border-gray-300";
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-gray-600">Loading task details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error && !task) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md">
          <div className="text-red-600 mb-4">{error}</div>
          <div className="flex gap-2">
            <button
              onClick={fetchTaskDetail}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Retry
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-screen overflow-hidden">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">Task Details</h2>
            <button
              onClick={fetchTaskDetail}
              disabled={refreshing}
              className="px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50"
              title="Refresh"
            >
              {refreshing ? "⏳" : "🔄"}
            </button>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold w-8 h-8 flex items-center justify-center"
          >
            ×
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(100vh-120px)]">
          {task && (
            <div className="p-6 space-y-6">
              {/* Task Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900">
                    Task #{task.info.task_id}
                  </h3>
                  <p className="text-gray-600 font-mono text-sm">
                    {task.info.uuid}
                  </p>
                </div>
                <span
                  className={`px-3 py-2 rounded-full text-sm font-medium border ${getStateColor(task.info.state)}`}
                >
                  {task.info.state}
                </span>
              </div>

              {/* Task Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="text-sm font-medium text-gray-700">
                    Creator
                  </div>
                  <div className="text-lg font-semibold">
                    {task.info.creator_username}
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="text-sm font-medium text-gray-700">Group</div>
                  <div className="text-lg font-semibold">
                    {task.info.group_name}
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="text-sm font-medium text-gray-700">
                    Priority
                  </div>
                  <div className="text-lg font-semibold">
                    {task.info.priority === 0
                      ? "Normal"
                      : task.info.priority > 0
                        ? `High (${task.info.priority})`
                        : `Low (${task.info.priority})`}
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="text-sm font-medium text-gray-700">
                    Timeout
                  </div>
                  <div className="text-lg font-semibold">
                    {Math.floor(task.info.timeout / 60)}m
                  </div>
                </div>
              </div>

              {/* Time Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-md">
                  <div className="text-sm font-medium text-blue-700">
                    Created At
                  </div>
                  <div className="text-lg font-semibold text-blue-900">
                    {formatRustTimestamp(task.info.created_at)}
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-md">
                  <div className="text-sm font-medium text-green-700">
                    Updated At
                  </div>
                  <div className="text-lg font-semibold text-green-900">
                    {formatRustTimestamp(task.info.updated_at)}
                  </div>
                </div>
              </div>

              {/* Tags and Labels */}
              {(task.info.tags.length > 0 || task.info.labels.length > 0) && (
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="font-semibold text-gray-700 mb-3">
                    Tags & Labels
                  </h4>
                  <div className="space-y-3">
                    {task.info.tags.length > 0 && (
                      <div>
                        <span className="text-sm font-medium text-gray-600 block mb-2">
                          Tags:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {task.info.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {task.info.labels.length > 0 && (
                      <div>
                        <span className="text-sm font-medium text-gray-600 block mb-2">
                          Labels:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {task.info.labels.map((label, index) => (
                            <span
                              key={index}
                              className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                            >
                              {label}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Task Specification */}
              {task.info.spec && (
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="font-semibold text-gray-700 mb-4">
                    Task Specification
                  </h4>
                  <TaskSpecDisplay spec={task.info.spec} compact={false} />
                </div>
              )}

              {/* Task Result */}
              {task.info.result && (
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="font-semibold text-gray-700 mb-3">
                    Task Result
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-600">
                        Exit Status:
                      </span>
                      <div
                        className={`text-lg font-semibold ${task.info.result.exit_status === 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {task.info.result.exit_status === 0
                          ? "✅ Success (0)"
                          : `❌ Failed (${task.info.result.exit_status})`}
                      </div>
                    </div>
                    {task.info.result.msg && (
                      <div>
                        <span className="text-sm font-medium text-gray-600">
                          Message:
                        </span>
                        <div className="text-lg font-semibold text-orange-600">
                          {task.info.result.msg}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Artifacts */}
              {task.artifacts && task.artifacts.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="font-semibold text-gray-700 mb-3">
                    Artifacts ({task.artifacts.length})
                  </h4>
                  <div className="space-y-3">
                    {task.artifacts.map((artifact, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center bg-white p-3 rounded border border-gray-200"
                      >
                        <div>
                          <div className="font-medium text-gray-900">
                            {artifact.content_type
                              .replace("-", " ")
                              .toUpperCase()}
                          </div>
                          <div className="text-sm text-gray-600">
                            {formatBytes(artifact.size)} • Created{" "}
                            {formatRustTimestamp(artifact.created_at)}
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            handleArtifactDownload(artifact.content_type)
                          }
                          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
                        >
                          📥 Download
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No Artifacts Message */}
              {(!task.artifacts || task.artifacts.length === 0) && (
                <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
                  <div className="text-yellow-800">
                    <strong>No artifacts available</strong>
                    <div className="text-sm mt-1">
                      Artifacts will appear here once the task completes and
                      generates output files.
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
