import React, { useState, useEffect } from "react";
import { authUtils } from "../utils/auth";
import { GroupWorkerRole } from "../types/schemas";

interface WorkerInfo {
  worker_id: string;
  creator_username: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  state: string;
  last_heartbeat: string;
  assigned_task_id?: string;
}

interface WorkerManagementProps {
  token: string;
  coordinatorAddr: string;
  username: string;
  activeView: string;
}

export default function WorkerManagement({
  token,
  coordinatorAddr,
  username,
  activeView,
}: WorkerManagementProps) {
  const [workers, setWorkers] = useState<WorkerInfo[]>([]);
  const [totalWorkers, setTotalWorkers] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<WorkerInfo | null>(null);
  const [message, setMessage] = useState("");

  // Query filters
  const [groupName, setGroupName] = useState("");
  const [creatorUsername, setCreatorUsername] = useState("");
  const [tags, setTags] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<GroupWorkerRole[]>([]);

  // Tag management
  const [newTags, setNewTags] = useState("");
  const [updatingTags, setUpdatingTags] = useState(false);

  const handleRoleToggle = (role: GroupWorkerRole) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    );
  };

  const queryWorkers = async () => {
    setLoading(true);
    setMessage("");

    try {
      const queryParams: any = {};
      if (groupName) queryParams.group_name = groupName;
      if (creatorUsername) queryParams.creator_username = creatorUsername;
      if (tags)
        queryParams.tags = tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);
      if (selectedRoles.length > 0) queryParams.role = selectedRoles;

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
        const error = await response.json();
        setMessage(error.error || "Failed to query workers");
      }
    } catch (error) {
      setMessage("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  const cancelWorker = async (workerId: string, force: boolean = false) => {
    const confirmMessage = force
      ? `Are you sure you want to FORCE cancel worker ${workerId}? This cannot be undone.`
      : `Are you sure you want to cancel worker ${workerId}?`;

    if (!confirm(confirmMessage)) return;

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`/api/workers/${workerId}/cancel`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          coordinator_addr: coordinatorAddr,
          force,
        }),
      });

      if (response.ok) {
        setMessage(
          `Worker ${workerId} ${force ? "force " : ""}cancelled successfully`,
        );
        queryWorkers(); // Refresh the list
      } else {
        const error = await response.json();
        setMessage(
          `Error cancelling worker: ${error.error || "Unknown error"}`,
        );
      }
    } catch (err) {
      setMessage("Network error occurred while cancelling worker");
    } finally {
      setLoading(false);
    }
  };

  const updateWorkerTags = async (workerId: string) => {
    if (!newTags.trim()) {
      setMessage("Please enter tags to update");
      return;
    }

    setUpdatingTags(true);

    try {
      const tagsArray = newTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const response = await fetch(`/api/workers/${workerId}/tags`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          coordinator_addr: coordinatorAddr,
          tags: tagsArray,
        }),
      });

      if (response.ok) {
        setMessage("Worker tags updated successfully");
        setNewTags("");
        queryWorkers(); // Refresh the list
      } else {
        const error = await response.json();
        setMessage(error.error || "Failed to update worker tags");
      }
    } catch (error) {
      setMessage("Network error occurred");
    } finally {
      setUpdatingTags(false);
    }
  };

  const formatDateTime = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString();
    } catch {
      return dateStr;
    }
  };

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

  const renderQueryView = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Query Workers</h2>

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
        </div>

        <button
          onClick={queryWorkers}
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? "Querying..." : "🔍 Query Workers"}
        </button>
      </div>

      {message && (
        <div
          className={`p-3 rounded ${
            message.includes("Found")
              ? "bg-blue-100 border border-blue-400 text-blue-700"
              : message.includes("success")
                ? "bg-green-100 border border-green-400 text-green-700"
                : "bg-red-100 border border-red-400 text-red-700"
          }`}
        >
          {message}
        </div>
      )}

      {workers.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Workers ({totalWorkers})
          </h3>

          <div className="space-y-4">
            {workers.map((worker) => (
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
                        className={`px-2 py-1 text-xs rounded-full ${getWorkerStateColor(worker.state)}`}
                      >
                        {worker.state}
                      </span>
                    </div>

                    <div className="mt-2 text-sm text-gray-600 space-y-1">
                      <div>
                        <strong>Creator:</strong> {worker.creator_username}
                      </div>
                      <div>
                        <strong>Created:</strong>{" "}
                        {formatDateTime(worker.created_at)}
                      </div>
                      <div>
                        <strong>Last Heartbeat:</strong>{" "}
                        {formatDateTime(worker.last_heartbeat)}
                      </div>
                      {worker.assigned_task_id && (
                        <div>
                          <strong>Assigned Task:</strong>{" "}
                          {worker.assigned_task_id}
                        </div>
                      )}
                      {worker.tags.length > 0 && (
                        <div>
                          <strong>Tags:</strong>{" "}
                          {worker.tags.map((tag) => (
                            <span
                              key={tag}
                              className="ml-1 px-2 py-0.5 bg-gray-100 rounded text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedWorker(worker)}
                      className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                    >
                      Manage
                    </button>
                    <button
                      onClick={() => cancelWorker(worker.worker_id)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => cancelWorker(worker.worker_id, true)}
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                    >
                      Force Cancel
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Worker Management Modal */}
      {selectedWorker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Manage Worker</h3>

            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Worker ID: {selectedWorker.worker_id}
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Update Tags (comma-separated)
              </label>
              <input
                type="text"
                value={newTags}
                onChange={(e) => setNewTags(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="tag1, tag2, tag3"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => updateWorkerTags(selectedWorker.worker_id)}
                disabled={updatingTags}
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50"
              >
                {updatingTags ? "Updating..." : "Update Tags"}
              </button>
              <button
                onClick={() => setSelectedWorker(null)}
                className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderManageView = () => (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Manage Workers
        </h2>

        {/* First show query form to find workers */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Find Workers
          </h3>
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
          </div>

          <button
            onClick={queryWorkers}
            disabled={loading}
            className="bg-blue-500 text-white py-2 px-6 rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? "Searching..." : "Find Workers"}
          </button>
        </div>

        {/* Show workers with management actions */}
        {workers.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Workers ({totalWorkers}) - Management Actions
            </h3>

            {workers.map((worker) => (
              <div
                key={worker.worker_id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-2">
                      Worker: {worker.worker_id}
                    </h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Creator: {worker.creator_username}</p>
                      <p>
                        State:{" "}
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${getWorkerStateColor(worker.state)}`}
                        >
                          {worker.state}
                        </span>
                      </p>
                      <p>Tags: {worker.tags.join(", ") || "None"}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedWorker(worker)}
                      className="bg-green-500 text-white px-3 py-1 text-sm rounded-md hover:bg-green-600"
                    >
                      Manage Tags
                    </button>
                    <button
                      onClick={() => cancelWorker(worker.worker_id, false)}
                      className="bg-yellow-500 text-white px-3 py-1 text-sm rounded-md hover:bg-yellow-600"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => cancelWorker(worker.worker_id, true)}
                      className="bg-red-500 text-white px-3 py-1 text-sm rounded-md hover:bg-red-600"
                      disabled={loading}
                    >
                      Force Cancel
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {message && (
          <div
            className={`mt-4 p-3 rounded ${
              message.includes("error")
                ? "bg-red-100 border border-red-400 text-red-700"
                : message.includes("success")
                  ? "bg-green-100 border border-green-400 text-green-700"
                  : "bg-blue-100 border border-blue-400 text-blue-700"
            }`}
          >
            {message}
          </div>
        )}
      </div>

      {/* Tag management modal */}
      {selectedWorker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Update Worker Tags
            </h3>

            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Worker ID: {selectedWorker.worker_id}
              </p>
              <p className="text-sm text-gray-600">
                Current tags: {selectedWorker.tags.join(", ") || "None"}
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Tags (comma-separated)
              </label>
              <input
                type="text"
                value={newTags}
                onChange={(e) => setNewTags(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="tag1, tag2, tag3"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => updateWorkerTags(selectedWorker.worker_id)}
                disabled={updatingTags}
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50"
              >
                {updatingTags ? "Updating..." : "Update Tags"}
              </button>
              <button
                onClick={() => setSelectedWorker(null)}
                className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderTagsView = () => (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Worker Tags Management
        </h2>

        <p className="text-gray-600 mb-6">
          Use this page to bulk manage worker tags. First, find workers to see
          their current tags, then select individual workers to update their
          tags.
        </p>

        {/* Query section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Find Workers
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
                Filter by Tags
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="tag1, tag2, tag3"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={queryWorkers}
                disabled={loading}
                className="w-full bg-blue-500 text-white py-2 px-6 rounded-md hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? "Searching..." : "Find Workers"}
              </button>
            </div>
          </div>
        </div>

        {/* Workers with tag management focus */}
        {workers.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Workers Found ({totalWorkers}) - Click to Update Tags
            </h3>

            {workers.map((worker) => (
              <div
                key={worker.worker_id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">
                      {worker.worker_id}
                    </h4>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {worker.tags.length > 0 ? (
                        worker.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500 text-sm">No tags</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      Creator: {worker.creator_username}
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedWorker(worker)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                  >
                    Update Tags
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {message && (
          <div
            className={`mt-4 p-3 rounded ${
              message.includes("error")
                ? "bg-red-100 border border-red-400 text-red-700"
                : message.includes("success")
                  ? "bg-green-100 border border-green-400 text-green-700"
                  : "bg-blue-100 border border-blue-400 text-blue-700"
            }`}
          >
            {message}
          </div>
        )}
      </div>

      {/* Tag management modal */}
      {selectedWorker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Update Tags for Worker
            </h3>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Worker:</strong> {selectedWorker.worker_id}
              </p>
              <div className="mb-2">
                <span className="text-sm text-gray-600">
                  <strong>Current tags:</strong>{" "}
                </span>
                {selectedWorker.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedWorker.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-500 text-sm">None</span>
                )}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Tags (comma-separated, will replace current tags)
              </label>
              <input
                type="text"
                value={newTags}
                onChange={(e) => setNewTags(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="tag1, tag2, tag3"
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave empty to remove all tags
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => updateWorkerTags(selectedWorker.worker_id)}
                disabled={updatingTags}
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50"
              >
                {updatingTags ? "Updating..." : "Replace Tags"}
              </button>
              <button
                onClick={() => {
                  setSelectedWorker(null);
                  setNewTags("");
                }}
                className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  switch (activeView) {
    case "workers.query":
      return renderQueryView();
    case "workers.manage":
      return renderManageView();
    case "workers.tags":
      return renderTagsView();
    default:
      return renderQueryView();
  }
}
