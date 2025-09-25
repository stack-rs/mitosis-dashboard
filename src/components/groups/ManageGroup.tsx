import React, { useState } from "react";
import { authUtils } from "../../utils/auth";
import { handleApiError, handleNetworkError } from "../../utils/errorUtils";

interface ManageGroupProps {
  token: string;
  coordinatorAddr: string;
}

interface GroupMember {
  username: string;
  role: string;
}

export default function ManageGroup({
  token,
  coordinatorAddr,
}: ManageGroupProps) {
  const [groupName, setGroupName] = useState("");
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Add/Update User
  const [newUsername, setNewUsername] = useState("");
  const [newUserRole, setNewUserRole] = useState("Read");
  const [updating, setUpdating] = useState(false);

  // Remove User
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [removing, setRemoving] = useState(false);

  const loadGroupMembers = async () => {
    if (!groupName.trim()) {
      setMessage("Please enter a group name");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `/api/groups/${encodeURIComponent(groupName.trim())}?token=${encodeURIComponent(token)}&coordinator_addr=${encodeURIComponent(coordinatorAddr)}`,
        {
          method: "GET",
        },
      );

      if (response.ok) {
        const data = await response.json();
        const membersList = Object.entries(data.users_in_group || {}).map(
          ([username, role]) => ({ username, role: role as string }),
        );
        setMembers(membersList);
        setMessage(
          `Loaded ${membersList.length} members from group "${groupName}"`,
        );
        setSelectedUsers(new Set());
      } else {
        const errorMessage = await handleApiError(response);
        setMessage(errorMessage);
        setMembers([]);
      }
    } catch (err) {
      setMessage(handleNetworkError(err));
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!groupName.trim() || !newUsername.trim()) {
      setMessage("Please enter both group name and username");
      return;
    }

    setUpdating(true);

    try {
      const response = await fetch(
        `/api/groups/${encodeURIComponent(groupName.trim())}/users`,
        {
          method: "PUT",
          headers: authUtils.getAuthHeaders(token),
          body: JSON.stringify({
            token,
            coordinator_addr: coordinatorAddr,
            relations: { [newUsername.trim()]: newUserRole },
          }),
        },
      );

      if (response.ok) {
        setMessage(
          `Successfully updated user "${newUsername}" with role "${newUserRole}"`,
        );
        setNewUsername("");
        setNewUserRole("Read");
        loadGroupMembers(); // Refresh the member list
      } else {
        const errorMessage = await handleApiError(response);
        setMessage(errorMessage);
      }
    } catch (err) {
      setMessage(handleNetworkError(err));
    } finally {
      setUpdating(false);
    }
  };

  const handleRemoveUsers = async () => {
    if (selectedUsers.size === 0) {
      setMessage("Please select users to remove");
      return;
    }

    const usersList = Array.from(selectedUsers);
    const confirmMessage = `Are you sure you want to remove ${usersList.length} user(s) from group "${groupName}"?\n\nUsers: ${usersList.join(", ")}`;

    if (!confirm(confirmMessage)) {
      return;
    }

    setRemoving(true);

    try {
      const response = await fetch(
        `/api/groups/${encodeURIComponent(groupName.trim())}/users`,
        {
          method: "DELETE",
          headers: authUtils.getAuthHeaders(token),
          body: JSON.stringify({
            token,
            coordinator_addr: coordinatorAddr,
            users: usersList,
          }),
        },
      );

      if (response.ok) {
        setMessage(
          `Successfully removed ${usersList.length} user(s) from group`,
        );
        setSelectedUsers(new Set());
        loadGroupMembers(); // Refresh the member list
      } else {
        const errorMessage = await handleApiError(response);
        setMessage(errorMessage);
      }
    } catch (err) {
      setMessage(handleNetworkError(err));
    } finally {
      setRemoving(false);
    }
  };

  const handleUserSelection = (username: string, checked: boolean) => {
    const newSelection = new Set(selectedUsers);
    if (checked) {
      newSelection.add(username);
    } else {
      newSelection.delete(username);
    }
    setSelectedUsers(newSelection);
  };

  const handleSelectAll = () => {
    if (selectedUsers.size === members.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(members.map((m) => m.username)));
    }
  };

  const handleClear = () => {
    setGroupName("");
    setMembers([]);
    setNewUsername("");
    setNewUserRole("Read");
    setSelectedUsers(new Set());
    setMessage("");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Manage a Group
          </h1>
          <p className="text-gray-600 mb-8">
            Manage group membership by adding new users, updating user roles, or
            removing users from the group.
          </p>

          {message && (
            <div
              className={`mb-4 p-3 rounded ${
                message.includes("Successfully") || message.includes("Loaded")
                  ? "bg-green-100 border border-green-400 text-green-700"
                  : "bg-red-100 border border-red-400 text-red-700"
              }`}
            >
              {message}
            </div>
          )}

          {/* Group Selection */}
          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Select Group
            </h2>
            <div className="flex gap-4">
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter group name"
                disabled={loading}
              />
              <button
                onClick={loadGroupMembers}
                disabled={loading || !groupName.trim()}
                className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? "Loading..." : "🔄 Load Members"}
              </button>
              <button
                onClick={handleClear}
                disabled={loading}
                className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-50"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column: Add/Update Users */}
            <div className="bg-green-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-green-900 mb-4">
                ➕ Add/Update User
              </h2>
              <p className="text-green-700 mb-4 text-sm">
                Add new users to the group or update existing user roles.
              </p>

              <form onSubmit={handleAddOrUpdateUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-green-700 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter username"
                    disabled={updating || !groupName.trim()}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-green-700 mb-2">
                    Role
                  </label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value)}
                    className="w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    disabled={updating || !groupName.trim()}
                  >
                    <option value="Read">Read - View only access</option>
                    <option value="Write">Write - Read and write access</option>
                    <option value="Admin">
                      Admin - Full management access
                    </option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={
                    updating || !groupName.trim() || !newUsername.trim()
                  }
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updating ? "Updating..." : "➕ Add/Update User"}
                </button>
              </form>

              <div className="mt-4 p-3 bg-green-100 rounded text-sm text-green-800">
                <strong>Note:</strong> If the user already exists in the group,
                their role will be updated to the selected role.
              </div>
            </div>

            {/* Right Column: Remove Users */}
            <div className="bg-red-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-red-900 mb-4">
                🗑️ Remove Users
              </h2>
              <p className="text-red-700 mb-4 text-sm">
                Select users to remove from the group. This action cannot be
                undone.
              </p>

              {members.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center text-sm font-medium text-red-700">
                      <input
                        type="checkbox"
                        checked={
                          selectedUsers.size === members.length &&
                          members.length > 0
                        }
                        onChange={handleSelectAll}
                        className="mr-2 rounded border-red-300 text-red-600 focus:ring-red-500"
                      />
                      Select All ({members.length} members)
                    </label>
                    <span className="text-sm text-red-600">
                      {selectedUsers.size} selected
                    </span>
                  </div>

                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {members.map((member) => (
                      <label
                        key={member.username}
                        className="flex items-center justify-between p-3 bg-white border border-red-200 rounded-lg hover:bg-red-50 cursor-pointer"
                      >
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedUsers.has(member.username)}
                            onChange={(e) =>
                              handleUserSelection(
                                member.username,
                                e.target.checked,
                              )
                            }
                            className="mr-3 rounded border-red-300 text-red-600 focus:ring-red-500"
                          />
                          <div>
                            <div className="font-medium text-gray-900">
                              {member.username}
                            </div>
                            <div className="text-sm text-gray-500">
                              Role: {member.role}
                            </div>
                          </div>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs rounded ${
                            member.role === "Admin"
                              ? "bg-red-100 text-red-800 border-red-200"
                              : member.role === "Write"
                                ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                                : "bg-gray-100 text-gray-800 border-gray-200"
                          }`}
                        >
                          {member.role}
                        </span>
                      </label>
                    ))}
                  </div>

                  <button
                    onClick={handleRemoveUsers}
                    disabled={removing || selectedUsers.size === 0}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {removing
                      ? "Removing..."
                      : `🗑️ Remove Selected Users (${selectedUsers.size})`}
                  </button>
                </div>
              ) : (
                <div className="text-center py-8 text-red-600">
                  {groupName.trim()
                    ? "No members found. Load a group to see its members."
                    : "Enter a group name and click 'Load Members' to see group members."}
                </div>
              )}
            </div>
          </div>

          {/* Help Section */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900 mb-2">💡 Tips</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>
                • <strong>Read:</strong> Users can view group content and data
              </li>
              <li>
                • <strong>Write:</strong> Users can read and create/modify group
                content
              </li>
              <li>
                • <strong>Admin:</strong> Users can manage group settings and
                members
              </li>
              <li>
                • You need admin privileges to add or remove group members
              </li>
              <li>
                • Removing users will revoke their access to all group resources
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
