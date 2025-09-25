import React, { useState } from "react";
import { handleApiError, handleNetworkError } from "../../utils/errorUtils";

interface MyGroupsProps {
  token: string;
  coordinatorAddr: string;
  username: string;
}

interface UserGroups {
  groups: { [groupName: string]: string };
}

export default function MyGroups({
  token,
  coordinatorAddr,
  username: _username,
}: MyGroupsProps) {
  const [userGroups, setUserGroups] = useState<UserGroups | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const loadUserGroups = async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `/api/users/groups?token=${encodeURIComponent(token)}&coordinator_addr=${encodeURIComponent(coordinatorAddr)}`,
        {
          method: "GET",
        },
      );

      if (response.ok) {
        const data = await response.json();
        setUserGroups(data);
        setMessage(
          `Found ${Object.keys(data.groups || {}).length} group memberships`,
        );
      } else {
        const errorMessage = await handleApiError(response);
        setMessage(errorMessage);
        setUserGroups(null);
      }
    } catch (error) {
      setMessage(handleNetworkError(error));
      setUserGroups(null);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setUserGroups(null);
    setMessage("");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">My Groups</h1>
          <p className="text-gray-600 mb-8">
            View all the groups you're a member of and your role in each group.
            Groups determine your access to resources and tasks.
          </p>

          {message && (
            <div
              className={`mb-4 p-3 rounded ${
                message.includes("Found") || message.includes("Successfully")
                  ? "bg-green-100 border border-green-400 text-green-700"
                  : "bg-red-100 border border-red-400 text-red-700"
              }`}
            >
              {message}
            </div>
          )}

          <div className="flex gap-4 mb-8">
            <button
              onClick={loadUserGroups}
              disabled={loading}
              className="px-6 py-3 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-600 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {loading ? "Loading..." : "🔄 Load My Groups"}
            </button>

            <button
              onClick={handleClear}
              disabled={loading}
              className="px-6 py-3 bg-gray-500 text-white font-medium rounded-md hover:bg-gray-600 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Clear
            </button>
          </div>

          {/* Groups Display */}
          {userGroups && (
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Group Memberships ({Object.keys(userGroups.groups || {}).length}
                )
              </h2>

              {Object.keys(userGroups.groups || {}).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(userGroups.groups || {}).map(
                    ([groupName, role]) => (
                      <div
                        key={groupName}
                        className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <div>
                          <div className="font-medium text-gray-900 text-lg">
                            {groupName}
                          </div>
                          <div className="text-sm text-gray-500">
                            Group Member • Access Level: {role}
                          </div>
                        </div>
                        <div className="text-right">
                          <span
                            className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
                              role === "Admin"
                                ? "bg-red-100 text-red-800 border border-red-200"
                                : role === "Write"
                                  ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                                  : "bg-green-100 text-green-800 border border-green-200"
                            }`}
                          >
                            {role}
                          </span>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-4xl mb-4">👥</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Groups Found
                  </h3>
                  <p className="text-gray-600">
                    You are not currently a member of any groups. Contact your
                    administrator to be added to groups.
                  </p>
                </div>
              )}
            </div>
          )}

          {!userGroups && !loading && (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Ready to Load Groups
              </h3>
              <p className="text-gray-600">
                Click "Load My Groups" to view your group memberships and access
                levels.
              </p>
            </div>
          )}

          {/* Help Section */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900 mb-2">
              💡 About Group Roles
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>
                • <strong>Read:</strong> View group content, tasks, and
                attachments
              </li>
              <li>
                • <strong>Write:</strong> Read access plus ability to create and
                modify content
              </li>
              <li>
                • <strong>Admin:</strong> Full access including user management
                and group settings
              </li>
              <li>
                • Group membership determines which resources you can access
              </li>
              <li>• Contact group administrators to request role changes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
