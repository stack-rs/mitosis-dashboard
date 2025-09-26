import React, { useState } from "react";
import { authUtils } from "../../utils/auth";
import { handleApiError, handleNetworkError } from "../../utils/errorUtils";
import { formatRustTimestamp } from "../../utils/timeUtils";
import { formatBytes } from "../../utils/formatUtils";
import type { TaskQueryResp } from "../../types/schemas";

interface QueryTaskProps {
  token: string;
  coordinatorAddr: string;
}

export default function QueryTask({ token, coordinatorAddr }: QueryTaskProps) {
  const [uuid, setUuid] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [taskData, setTaskData] = useState<TaskQueryResp | null>(null);
  const [artifactLoading, setArtifactLoading] = useState<string | null>(null);

  // Utility functions for artifact display and operations
  const getContentTypeDisplayName = (type: string): string => {
    switch (type) {
      case "result":
        return "Result";
      case "exec-log":
        return "Execution Log";
      case "std-log":
        return "Terminal Output";
      default:
        return type;
    }
  };

  const getFileName = (type: string): string => {
    switch (type) {
      case "result":
        return "result.tar.gz";
      case "exec-log":
        return "exec-log.tar.gz";
      case "std-log":
        return "std-log.tar.gz";
      default:
        return `${type}.tar.gz`;
    }
  };

  const handleArtifactDownload = async (
    taskUuid: string,
    contentType: string,
  ) => {
    const loadingKey = `${taskUuid}-${contentType}-download`;
    setArtifactLoading(loadingKey);

    try {
      const response = await fetch(
        `/api/artifacts/download?token=${encodeURIComponent(token)}&coordinator_addr=${encodeURIComponent(coordinatorAddr)}&uuid=${encodeURIComponent(taskUuid)}&content_type=${encodeURIComponent(contentType)}`,
        { method: "GET" },
      );

      if (response.ok) {
        // The API now directly streams the file, so we get it as a blob
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = getFileName(contentType);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        window.URL.revokeObjectURL(blobUrl);
        setMessage(`Successfully downloaded ${getFileName(contentType)}`);
      } else {
        const errorMessage = await handleApiError(response);
        setMessage(errorMessage);
      }
    } catch (err) {
      setMessage(handleNetworkError(err));
    } finally {
      setArtifactLoading(null);
    }
  };

  const handleArtifactDelete = async (
    taskUuid: string,
    contentType: string,
  ) => {
    const displayName = getContentTypeDisplayName(contentType);
    const confirmMessage = `Are you sure you want to delete the ${displayName} artifact for task ${taskUuid}?`;

    if (!confirm(confirmMessage)) {
      return;
    }

    const loadingKey = `${taskUuid}-${contentType}-delete`;
    setArtifactLoading(loadingKey);

    try {
      const response = await fetch(`/api/tasks/${taskUuid}/artifacts/delete`, {
        method: "DELETE",
        headers: authUtils.getAuthHeaders(token),
        body: JSON.stringify({
          token,
          coordinator_addr: coordinatorAddr,
          content_type: contentType,
        }),
      });

      if (response.ok) {
        setMessage(`${displayName} artifact deleted successfully`);
        // Refresh task data to update artifacts list
        if (taskData) {
          const updatedArtifacts =
            taskData.artifacts?.filter(
              (artifact) => artifact.content_type !== contentType,
            ) || [];
          setTaskData({
            ...taskData,
            artifacts: updatedArtifacts,
          });
        }
      } else {
        const errorMessage = await handleApiError(response);
        setMessage(errorMessage);
      }
    } catch (err) {
      setMessage(handleNetworkError(err));
    } finally {
      setArtifactLoading(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!uuid.trim()) {
      setMessage("Please enter a task UUID");
      return;
    }

    setLoading(true);
    setMessage("");
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
        setMessage("Task found");
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

  const handleClearResults = () => {
    setTaskData(null);
    setMessage("");
    setUuid("");
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Query a Task
          </h1>
          <p className="text-gray-600 mb-8">
            Get detailed information about a specific task by entering its UUID.
          </p>

          {message && (
            <div
              className={`mb-4 p-3 rounded ${
                message.includes("found")
                  ? "bg-green-100 border border-green-400 text-green-700"
                  : "bg-red-100 border border-red-400 text-red-700"
              }`}
            >
              {message}
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
            <div className="space-y-6">
              {/* Task Details */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Task Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <strong>UUID:</strong> {taskData.info.uuid}
                  </div>
                  <div>
                    <strong>State:</strong>
                    <span
                      className={`ml-2 px-2 py-1 text-xs rounded ${getTaskStateColor(taskData.info.state)}`}
                    >
                      {taskData.info.state}
                    </span>
                  </div>
                  <div>
                    <strong>Task ID:</strong> {taskData.info.task_id}
                  </div>
                  <div>
                    <strong>Creator:</strong> {taskData.info.creator_username}
                  </div>
                  <div>
                    <strong>Group:</strong> {taskData.info.group_name}
                  </div>
                  <div>
                    <strong>Priority:</strong> {taskData.info.priority}
                  </div>
                  <div>
                    <strong>Timeout:</strong>{" "}
                    {taskData.info.timeout
                      ? `${taskData.info.timeout}s`
                      : "None"}
                  </div>
                  <div>
                    <strong>Created:</strong>{" "}
                    {formatRustTimestamp(taskData.info.created_at)}
                  </div>
                  <div>
                    <strong>Updated:</strong>{" "}
                    {formatRustTimestamp(taskData.info.updated_at)}
                  </div>
                  <div>
                    <strong>Assigned Worker:</strong>{" "}
                    {taskData.info.assigned_worker_uuid || "None"}
                  </div>
                  <div>
                    <strong>Upstream Task:</strong>{" "}
                    {taskData.info.upstream_task_uuid || "None"}
                  </div>
                  <div>
                    <strong>Downstream Task:</strong>{" "}
                    {taskData.info.downstream_task_uuid || "None"}
                  </div>
                  <div>
                    <strong>Terminal Output:</strong>
                    <span
                      className={`ml-2 ${taskData.info.spec?.terminal_output ? "text-green-600" : "text-red-600"}`}
                    >
                      {taskData.info.spec?.terminal_output
                        ? "✅ Enabled"
                        : "❌ Disabled"}
                    </span>
                  </div>
                  <div>
                    <strong>Watch:</strong>{" "}
                    {taskData.info.spec?.watch
                      ? `${taskData.info.spec.watch[0]} (${taskData.info.spec.watch[1]})`
                      : "None"}
                  </div>
                  <div className="md:col-span-2">
                    <strong>Tags:</strong>{" "}
                    {taskData.info.tags && taskData.info.tags.length > 0 ? (
                      <span className="ml-2">
                        {taskData.info.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-block ml-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </span>
                    ) : (
                      "None"
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <strong>Labels:</strong>{" "}
                    {taskData.info.labels && taskData.info.labels.length > 0 ? (
                      <span className="ml-2">
                        {taskData.info.labels.map((label, index) => (
                          <span
                            key={index}
                            className="inline-block ml-1 px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs"
                          >
                            {label}
                          </span>
                        ))}
                      </span>
                    ) : (
                      "None"
                    )}
                  </div>
                </div>
              </div>

              {/* Task Specification */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Task Specification
                </h3>
                {taskData.info.spec ? (
                  <div className="space-y-3">
                    {/* Command */}
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">
                        Command
                      </h4>
                      {taskData.info.spec.args &&
                      taskData.info.spec.args.length > 0 ? (
                        <div className="bg-gray-50 p-4 rounded-md">
                          <code className="text-sm text-gray-800 font-mono break-all">
                            {taskData.info.spec.args.join(" ")}
                          </code>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-600">None</div>
                      )}
                    </div>

                    {/* Environment Variables */}
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">
                        Environment Variables
                      </h4>
                      {taskData.info.spec.envs &&
                      Object.keys(taskData.info.spec.envs).length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(taskData.info.spec.envs).map(
                            ([key, value]) => (
                              <span
                                key={key}
                                className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded text-xs"
                                title={`${key}=${value}`}
                              >
                                {key}={value}
                              </span>
                            ),
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-600">None</div>
                      )}
                    </div>

                    {/* Resources */}
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">
                        Resources
                      </h4>
                      {taskData.info.spec.resources &&
                      taskData.info.spec.resources.length > 0 ? (
                        <div className="space-y-1">
                          {taskData.info.spec.resources.map(
                            (resource, index) => (
                              <div
                                key={index}
                                className="text-sm text-gray-600 bg-gray-50 p-2 rounded-md"
                              >
                                {resource.remote_file.Artifact ? (
                                  <span>
                                    <span className="text-purple-600">
                                      Artifact:
                                    </span>{" "}
                                    <code className="text-purple-600 text-xs">
                                      {resource.remote_file.Artifact.uuid}
                                    </code>
                                    {resource.remote_file.Artifact
                                      .content_type && (
                                      <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                                        {
                                          resource.remote_file.Artifact
                                            .content_type
                                        }
                                      </span>
                                    )}
                                  </span>
                                ) : resource.remote_file.Attachment ? (
                                  <span>
                                    <span className="text-green-600">
                                      Attachment:
                                    </span>{" "}
                                    <code className="text-green-600 text-xs">
                                      {resource.remote_file.Attachment.key}
                                    </code>
                                  </span>
                                ) : (
                                  <span className="text-red-500">
                                    Invalid resource format
                                  </span>
                                )}
                                <span className="mx-2">→</span>
                                <span className="font-medium text-gray-700">
                                  {resource.local_path}
                                </span>
                              </div>
                            ),
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-600">None</div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-600">None</div>
                )}
              </div>

              {/* Task Result */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Task Result
                </h3>
                {taskData.info.result ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <strong>Exit Status:</strong>{" "}
                      {taskData.info.result.exit_status ?? "None"}
                    </div>
                    <div>
                      <strong>Message:</strong>{" "}
                      {taskData.info.result.msg
                        ? JSON.stringify(taskData.info.result.msg)
                        : "None"}
                    </div>
                  </div>
                ) : (
                  <div className="italic text-sm text-gray-600">No Result</div>
                )}
              </div>

              {/* Artifacts */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Artifacts
                </h3>
                {taskData.artifacts && taskData.artifacts.length > 0 ? (
                  <div className="space-y-4">
                    {taskData.artifacts.map((artifact, index) => (
                      <div
                        key={index}
                        className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        {/* Artifact Header */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                              {getContentTypeDisplayName(artifact.content_type)}
                            </span>
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-mono">
                              {getFileName(artifact.content_type)}
                            </span>
                          </div>
                        </div>

                        {/* Artifact Details */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                          <div className="flex items-center">
                            <strong>Size:</strong>
                            <span className="ml-2">
                              {artifact.size
                                ? formatBytes(artifact.size)
                                : "Unknown"}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <span className="mr-2">📅</span>
                            <strong>Created:</strong>
                            <span className="ml-2">
                              {artifact.created_at
                                ? formatRustTimestamp(artifact.created_at)
                                : "Unknown"}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <span className="mr-2">🔄</span>
                            <strong>Updated:</strong>
                            <span className="ml-2">
                              {artifact.updated_at
                                ? formatRustTimestamp(artifact.updated_at)
                                : "Unknown"}
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              handleArtifactDownload(
                                taskData.info.uuid,
                                artifact.content_type,
                              )
                            }
                            disabled={
                              artifactLoading ===
                              `${taskData.info.uuid}-${artifact.content_type}-download`
                            }
                            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                          >
                            {artifactLoading ===
                            `${taskData.info.uuid}-${artifact.content_type}-download` ? (
                              <span className="animate-spin">⏳</span>
                            ) : (
                              <span>⬇️</span>
                            )}
                            Download
                          </button>
                          <button
                            onClick={() =>
                              handleArtifactDelete(
                                taskData.info.uuid,
                                artifact.content_type,
                              )
                            }
                            disabled={
                              artifactLoading ===
                              `${taskData.info.uuid}-${artifact.content_type}-delete`
                            }
                            className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                          >
                            {artifactLoading ===
                            `${taskData.info.uuid}-${artifact.content_type}-delete` ? (
                              <span className="animate-spin">⏳</span>
                            ) : (
                              <span>🗑️</span>
                            )}
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="italic text-sm text-gray-600">
                    No Artifacts
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
