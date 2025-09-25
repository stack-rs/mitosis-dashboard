import React, { useState } from "react";
import { formatRustTimestamp } from "../../utils/timeUtils";
import { handleApiError, handleNetworkError } from "../../utils/errorUtils";

interface WorkerQueryResp {
  info: WorkerInfo;
  groups: { [key: string]: string }; // group_name -> role
  labels?: string[]; // labels might be at top level
}

interface WorkerInfo {
  worker_id: string;
  creator_username: string;
  tags: string[];
  labels?: string[]; // labels might be in info
  created_at: string;
  updated_at: string;
  state: string;
  last_heartbeat: string;
  assigned_task_id?: string | null;
}

interface QueryWorkerProps {
  token: string;
  coordinatorAddr: string;
}

export default function QueryWorker({
  token,
  coordinatorAddr,
}: QueryWorkerProps) {
  const [workerId, setWorkerId] = useState("");
  const [workerData, setWorkerData] = useState<WorkerQueryResp | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!workerId.trim()) {
      setMessage("Please enter a worker ID");
      return;
    }

    setLoading(true);
    setMessage("");
    setWorkerData(null);

    try {
      const response = await fetch(
        `/api/workers/${workerId}?token=${encodeURIComponent(token)}&coordinator_addr=${encodeURIComponent(coordinatorAddr)}`,
        {
          method: "GET",
        },
      );

      const data = await response.json();

      if (response.ok) {
        setWorkerData(data);
        setMessage("Worker found");
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
    setWorkerData(null);
    setMessage("");
    setWorkerId("");
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Query a Worker
          </h1>
          <p className="text-gray-600 mb-8">
            Get detailed information about a specific worker by entering its ID.
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
                htmlFor="workerId"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Worker ID
              </label>
              <input
                type="text"
                id="workerId"
                value={workerId}
                onChange={(e) => setWorkerId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter worker ID (e.g., 507fff07-fdcc-48ca-a2db-585b8c4e1c0f)"
                disabled={loading}
              />
              <p className="text-sm text-gray-600 mt-1">
                Enter the unique identifier of the worker you want to query
              </p>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading || !workerId.trim()}
                className="px-6 py-3 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {loading ? "Querying..." : "Query Worker"}
              </button>

              {workerData && (
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

        {/* Worker Details */}
        {workerData && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="space-y-6">
              {/* Worker Details */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Worker Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <strong>UUID:</strong> {workerData.info.worker_id}
                  </div>
                  <div>
                    <strong>State:</strong>
                    <span
                      className={`ml-2 px-2 py-1 text-xs rounded ${getWorkerStateColor(workerData.info.state)}`}
                    >
                      {workerData.info.state}
                    </span>
                  </div>
                  <div>
                    <strong>Creator:</strong> {workerData.info.creator_username}
                  </div>
                  <div>
                    <strong>Created:</strong>{" "}
                    {formatRustTimestamp(workerData.info.created_at)}
                  </div>
                  <div>
                    <strong>Updated:</strong>{" "}
                    {formatRustTimestamp(workerData.info.updated_at)}
                  </div>
                  <div>
                    <strong>Last Heartbeat:</strong>{" "}
                    {formatRustTimestamp(workerData.info.last_heartbeat)}
                  </div>
                  <div className="md:col-span-2">
                    <strong>Assigned Task:</strong>{" "}
                    {workerData.info.assigned_task_id || "None"}
                  </div>
                  <div className="md:col-span-2">
                    <strong>Tags:</strong>{" "}
                    {workerData.info.tags && workerData.info.tags.length > 0 ? (
                      <span className="ml-2">
                        {workerData.info.tags.map((tag) => (
                          <span
                            key={tag}
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
                    {(workerData.labels && workerData.labels.length > 0) ||
                    (workerData.info.labels &&
                      workerData.info.labels.length > 0) ? (
                      <span className="ml-2">
                        {(
                          workerData.labels ||
                          workerData.info.labels ||
                          []
                        ).map((label) => (
                          <span
                            key={label}
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

              {/* Group Memberships */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Group Memberships
                </h3>
                {workerData.groups &&
                Object.keys(workerData.groups).length > 0 ? (
                  <div className="space-y-2">
                    {Object.entries(workerData.groups).map(
                      ([groupName, role]) => {
                        const getRoleColor = (role: string) => {
                          switch (role.toLowerCase()) {
                            case "read":
                              return "bg-gray-100 text-gray-800 border-gray-200";
                            case "write":
                              return "bg-yellow-100 text-yellow-800 border-yellow-200";
                            case "admin":
                              return "bg-red-100 text-red-800 border-red-200";
                            default:
                              return "bg-gray-100 text-gray-800 border-gray-200";
                          }
                        };

                        return (
                          <div
                            key={groupName}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                          >
                            <span className="font-medium text-gray-900">
                              {groupName}
                            </span>
                            <span
                              className={`px-2 py-1 rounded text-sm border ${getRoleColor(role)}`}
                            >
                              {role}
                            </span>
                          </div>
                        );
                      },
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-gray-600">None</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
