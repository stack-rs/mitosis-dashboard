import React, { useState } from "react";
import { authUtils } from "../../utils/auth";
import { handleApiError, handleNetworkError } from "../../utils/errorUtils";

interface CreateGroupProps {
  token: string;
  coordinatorAddr: string;
}

export default function CreateGroup({
  token,
  coordinatorAddr,
}: CreateGroupProps) {
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!groupName.trim()) {
      setMessage("Please enter a group name");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/groups/create", {
        method: "POST",
        headers: authUtils.getAuthHeaders(token),
        body: JSON.stringify({
          token,
          coordinator_addr: coordinatorAddr,
          group_name: groupName.trim(),
        }),
      });

      if (response.ok) {
        await response.json();
        setMessage(`Successfully created group "${groupName}"`);
        setGroupName("");
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

  const handleClear = () => {
    setGroupName("");
    setMessage("");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Create a Group
          </h1>
          <p className="text-gray-600 mb-8">
            Create a new group for collaborative work. You will be assigned as
            the group admin with full management permissions.
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
                placeholder="Enter unique group name"
                disabled={loading}
                required
              />
              <p className="text-sm text-gray-600 mt-1">
                Choose a unique name for your group. This will be used to
                identify the group across the system.
              </p>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading || !groupName.trim()}
                className="px-6 py-3 bg-green-500 text-white font-medium rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {loading ? "Creating..." : "➕ Create Group"}
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

          {/* Help Section */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900 mb-2">💡 Tips</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Group names must be unique across the entire system</li>
              <li>
                • As the creator, you will have admin privileges for this group
              </li>
              <li>
                • You can manage group members and their roles after creation
              </li>
              <li>
                • Groups are used for organizing tasks, attachments, and access
                control
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
