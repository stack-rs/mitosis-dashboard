import React, { useState } from "react";
import { handleApiError, handleNetworkError } from "../../utils/errorUtils";
import { formatBytes } from "../../utils/formatUtils";
import { formatRustTimestamp } from "../../utils/timeUtils";

interface GroupInfo {
  group_name: string;
  creator_username: string;
  created_at: string;
  updated_at: string;
  state: string;
  task_count: number;
  storage_quota: number;
  storage_used: number;
  worker_count: number;
  users_in_group?: { [username: string]: string };
}

interface GetGroupProps {
  token: string;
  coordinatorAddr: string;
}

export default function GetGroup({ token, coordinatorAddr }: GetGroupProps) {
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [groupData, setGroupData] = useState<GroupInfo | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!groupName.trim()) {
      setMessage("Please enter a group name");
      return;
    }

    setLoading(true);
    setMessage("");
    setGroupData(null);

    try {
      const response = await fetch(
        `/api/groups/${encodeURIComponent(groupName.trim())}?token=${encodeURIComponent(token)}&coordinator_addr=${encodeURIComponent(coordinatorAddr)}`,
        {
          method: "GET",
        },
      );

      if (response.ok) {
        const data = await response.json();
        setGroupData(data);
        setMessage(`Successfully retrieved group "${groupName}"`);
      } else {
        const errorMessage = await handleApiError(response);
        setMessage(errorMessage);
        setGroupData(null);
      }
    } catch (err) {
      setMessage(handleNetworkError(err));
      setGroupData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setGroupName("");
    setMessage("");
    setGroupData(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Get a Group</h1>
          <p className="text-gray-600 mb-8">
            Retrieve detailed information about a specific group, including
            members, storage usage, and statistics.
          </p>

          {message && (
            <div
              className={`mb-4 p-3 rounded ${
                message.includes("Successfully")
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
                placeholder="Enter group name to query"
                disabled={loading}
                required
              />
              <p className="text-sm text-gray-600 mt-1">
                Enter the exact name of the group you want to retrieve
                information about.
              </p>
            </div>

            <div className="flex gap-4 mb-8">
              <button
                type="submit"
                disabled={loading || !groupName.trim()}
                className="px-6 py-3 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {loading ? "Querying..." : "🔍 Get Group"}
              </button>

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

          {/* Group Information Display */}
          {groupData && (
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Group Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <strong className="text-gray-700">Group Name:</strong>
                    <div className="mt-1">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm font-medium">
                        {groupData.group_name}
                      </span>
                    </div>
                  </div>

                  <div>
                    <strong className="text-gray-700">Creator:</strong>
                    <div className="mt-1 text-gray-900">
                      {groupData.creator_username}
                    </div>
                  </div>

                  <div>
                    <strong className="text-gray-700">State:</strong>
                    <div className="mt-1">
                      <span
                        className={`px-2 py-1 text-xs rounded ${
                          groupData.state === "Active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {groupData.state}
                      </span>
                    </div>
                  </div>

                  <div>
                    <strong className="text-gray-700">Created:</strong>
                    <div className="mt-1 text-gray-900">
                      {formatRustTimestamp(groupData.created_at)}
                    </div>
                  </div>

                  <div>
                    <strong className="text-gray-700">Updated:</strong>
                    <div className="mt-1 text-gray-900">
                      {formatRustTimestamp(groupData.updated_at)}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <strong className="text-gray-700">Task Count:</strong>
                    <div className="mt-1 text-gray-900">
                      {groupData.task_count}
                    </div>
                  </div>

                  <div>
                    <strong className="text-gray-700">Worker Count:</strong>
                    <div className="mt-1 text-gray-900">
                      {groupData.worker_count}
                    </div>
                  </div>

                  <div>
                    <strong className="text-gray-700">Storage Usage:</strong>
                    <div className="mt-1 text-gray-900">
                      {formatBytes(groupData.storage_used)} /{" "}
                      {formatBytes(groupData.storage_quota)}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${Math.min(
                            (groupData.storage_used / groupData.storage_quota) *
                              100,
                            100,
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Group Members */}
              {groupData.users_in_group &&
                Object.keys(groupData.users_in_group).length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Group Members (
                      {Object.keys(groupData.users_in_group).length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {Object.entries(groupData.users_in_group).map(
                        ([username, role]) => (
                          <div
                            key={username}
                            className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
                          >
                            <div className="font-medium text-gray-900">
                              {username}
                            </div>
                            <span
                              className={`px-2 py-1 text-xs rounded ${
                                role === "Admin"
                                  ? "bg-red-100 text-red-800 border-red-200"
                                  : role === "Write"
                                    ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                    : "bg-gray-100 text-gray-800 border-gray-200"
                              }`}
                            >
                              {role}
                            </span>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}
            </div>
          )}

          {/* Help Section */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900 mb-2">💡 Tips</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• You can only view groups you have access to</li>
              <li>
                • Group information includes storage usage and member roles
              </li>
              <li>
                • Use "Manage a Group" to modify group membership and roles
              </li>
              <li>• Storage quotas can be modified by system administrators</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
