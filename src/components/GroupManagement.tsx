import React, { useState } from "react";
import { authUtils } from "../utils/auth";

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

interface GroupManagementProps {
  token: string;
  coordinatorAddr: string;
  username: string;
  activeView: string;
}

export default function GroupManagement({
  token,
  coordinatorAddr,
  username,
  activeView,
}: GroupManagementProps) {
  const [groups, setGroups] = useState<{ [groupName: string]: string }>({});
  const [groupDetails, setGroupDetails] = useState<GroupInfo | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Create group
  const [newGroupName, setNewGroupName] = useState("");
  const [creating, setCreating] = useState(false);

  // Group details
  const [selectedGroupName, setSelectedGroupName] = useState("");
  const [loadingDetails, setLoadingDetails] = useState(false);

  // User role management
  const [userRoles, setUserRoles] = useState<{ [username: string]: string }>(
    {},
  );
  const [newUsername, setNewUsername] = useState("");
  const [newUserRole, setNewUserRole] = useState("Read");

  const formatBytes = (bytes: number): string => {
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    if (bytes === 0) return "0 Bytes";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDateTime = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString();
    } catch {
      return dateStr;
    }
  };

  const loadUserGroups = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/users/groups", {
        method: "GET",
        headers: authUtils.getAuthHeaders(token),
      });

      if (response.ok) {
        const data = await response.json();
        setGroups(data.groups || {});
        setMessage(`Found ${Object.keys(data.groups || {}).length} groups`);
      } else {
        const error = await response.json();
        setMessage(error.error || "Failed to load groups");
      }
    } catch (error) {
      setMessage("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  const createGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    setCreating(true);
    try {
      const response = await fetch("/api/groups", {
        method: "POST",
        headers: authUtils.getAuthHeaders(token),
        body: JSON.stringify({ group_name: newGroupName }),
      });

      if (response.ok) {
        setMessage(`Group "${newGroupName}" created successfully`);
        setNewGroupName("");
        loadUserGroups(); // Refresh the list
      } else {
        const error = await response.json();
        setMessage(error.error || "Failed to create group");
      }
    } catch (error) {
      setMessage("Network error occurred");
    } finally {
      setCreating(false);
    }
  };

  const loadGroupDetails = async (groupName: string) => {
    setLoadingDetails(true);
    try {
      const response = await fetch(`/api/groups/${groupName}`, {
        method: "GET",
        headers: authUtils.getAuthHeaders(token),
      });

      if (response.ok) {
        const data = await response.json();
        setGroupDetails(data);
        setUserRoles(data.users_in_group || {});
      } else {
        const error = await response.json();
        setMessage(error.error || "Failed to load group details");
      }
    } catch (error) {
      setMessage("Network error occurred");
    } finally {
      setLoadingDetails(false);
    }
  };

  const updateUserGroupRole = async (
    groupName: string,
    targetUsername: string,
    role: string,
  ) => {
    try {
      const response = await fetch(`/api/groups/${groupName}/users`, {
        method: "PUT",
        headers: authUtils.getAuthHeaders(token),
        body: JSON.stringify({
          relations: { [targetUsername]: role },
        }),
      });

      if (response.ok) {
        setMessage(`User role updated successfully`);
        loadGroupDetails(groupName); // Refresh details
      } else {
        const error = await response.json();
        setMessage(error.error || "Failed to update user role");
      }
    } catch (error) {
      setMessage("Network error occurred");
    }
  };

  const removeUserFromGroup = async (
    groupName: string,
    targetUsername: string,
  ) => {
    if (!confirm(`Remove user "${targetUsername}" from group "${groupName}"?`))
      return;

    try {
      const response = await fetch(`/api/groups/${groupName}/users`, {
        method: "DELETE",
        headers: authUtils.getAuthHeaders(token),
        body: JSON.stringify({
          users: [targetUsername],
        }),
      });

      if (response.ok) {
        setMessage(`User removed from group successfully`);
        loadGroupDetails(groupName); // Refresh details
      } else {
        const error = await response.json();
        setMessage(error.error || "Failed to remove user from group");
      }
    } catch (error) {
      setMessage("Network error occurred");
    }
  };

  const renderCreateGroupView = () => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Group</h2>

      <form onSubmit={createGroup} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Group Name
          </label>
          <input
            type="text"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter group name"
            required
          />
        </div>

        <button
          type="submit"
          disabled={creating || !newGroupName.trim()}
          className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 disabled:opacity-50"
        >
          {creating ? "Creating..." : "➕ Create Group"}
        </button>
      </form>

      {message && (
        <div
          className={`mt-4 p-3 rounded ${
            message.includes("success")
              ? "bg-green-100 border border-green-400 text-green-700"
              : "bg-red-100 border border-red-400 text-red-700"
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );

  const renderManageGroupsView = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">My Groups</h2>
          <button
            onClick={loadUserGroups}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? "Loading..." : "🔄 Refresh"}
          </button>
        </div>

        {Object.keys(groups).length > 0 ? (
          <div className="space-y-3">
            {Object.entries(groups).map(([groupName, role]) => (
              <div
                key={groupName}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div>
                  <div className="font-medium text-gray-900">{groupName}</div>
                  <div className="text-sm text-gray-500">Your role: {role}</div>
                </div>
                <button
                  onClick={() => {
                    setSelectedGroupName(groupName);
                    loadGroupDetails(groupName);
                  }}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No groups found. Click "Refresh" to load your groups.
          </div>
        )}
      </div>

      {/* Group Details Modal */}
      {groupDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-semibold">
                Group: {groupDetails.group_name}
              </h3>
              <button
                onClick={() => {
                  setGroupDetails(null);
                  setSelectedGroupName("");
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {loadingDetails ? (
              <div className="text-center py-8">Loading group details...</div>
            ) : (
              <div className="space-y-6">
                {/* Group Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Creator
                    </label>
                    <div className="mt-1 text-sm text-gray-900">
                      {groupDetails.creator_username}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      State
                    </label>
                    <div className="mt-1">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          groupDetails.state === "Active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {groupDetails.state}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Task Count
                    </label>
                    <div className="mt-1 text-sm text-gray-900">
                      {groupDetails.task_count}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Worker Count
                    </label>
                    <div className="mt-1 text-sm text-gray-900">
                      {groupDetails.worker_count}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Storage Usage
                    </label>
                    <div className="mt-1 text-sm text-gray-900">
                      {formatBytes(groupDetails.storage_used)} /{" "}
                      {formatBytes(groupDetails.storage_quota)}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Created
                    </label>
                    <div className="mt-1 text-sm text-gray-900">
                      {formatDateTime(groupDetails.created_at)}
                    </div>
                  </div>
                </div>

                {/* User Management */}
                <div>
                  <h4 className="text-lg font-semibold mb-4">Group Members</h4>

                  {/* Add New User */}
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <h5 className="font-medium mb-3">Add User to Group</h5>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        placeholder="Username"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <select
                        value={newUserRole}
                        onChange={(e) => setNewUserRole(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Read">Read</option>
                        <option value="Write">Write</option>
                        <option value="Admin">Admin</option>
                      </select>
                      <button
                        onClick={() => {
                          if (newUsername.trim()) {
                            updateUserGroupRole(
                              selectedGroupName,
                              newUsername,
                              newUserRole,
                            );
                            setNewUsername("");
                          }
                        }}
                        className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                      >
                        Add User
                      </button>
                    </div>
                  </div>

                  {/* Current Members */}
                  <div className="space-y-2">
                    {Object.entries(userRoles).map(
                      ([memberUsername, memberRole]) => (
                        <div
                          key={memberUsername}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div>
                            <div className="font-medium">{memberUsername}</div>
                            <div className="text-sm text-gray-500">
                              Role: {memberRole}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <select
                              value={memberRole}
                              onChange={(e) =>
                                updateUserGroupRole(
                                  selectedGroupName,
                                  memberUsername,
                                  e.target.value,
                                )
                              }
                              className="px-3 py-1 border border-gray-300 rounded text-sm"
                            >
                              <option value="Read">Read</option>
                              <option value="Write">Write</option>
                              <option value="Admin">Admin</option>
                            </select>
                            <button
                              onClick={() =>
                                removeUserFromGroup(
                                  selectedGroupName,
                                  memberUsername,
                                )
                              }
                              className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ),
                    )}

                    {Object.keys(userRoles).length === 0 && (
                      <div className="text-center py-4 text-gray-500">
                        No members found in this group.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {message && (
        <div
          className={`p-3 rounded ${
            message.includes("Found") || message.includes("success")
              ? "bg-green-100 border border-green-400 text-green-700"
              : "bg-red-100 border border-red-400 text-red-700"
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );

  switch (activeView) {
    case "groups.create":
      return renderCreateGroupView();
    case "groups.manage":
      return renderManageGroupsView();
    case "groups.roles":
      return renderManageGroupsView();
    case "groups.storage":
      return renderManageGroupsView();
    default:
      return renderCreateGroupView();
  }
}
