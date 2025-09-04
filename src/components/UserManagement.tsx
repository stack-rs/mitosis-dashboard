import React, { useState } from "react";
import { authUtils } from "../utils/auth";

interface UserManagementProps {
  token: string;
  coordinatorAddr: string;
  username: string;
  activeView: string;
}

export default function UserManagement({
  token,
  coordinatorAddr,
  username,
  activeView,
}: UserManagementProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [userGroups, setUserGroups] = useState<any>(null);
  const [loadingGroups, setLoadingGroups] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setMessage("New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setMessage("New password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`/api/users/${username}/password`, {
        method: "POST",
        headers: authUtils.getAuthHeaders(token),
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage("Password changed successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");

        // Update token if new one is provided
        if (data.token) {
          authUtils.updateSession({ token: data.token });
        }
      } else {
        const error = await response.json();
        setMessage(error.error || "Failed to change password");
      }
    } catch (error) {
      setMessage("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  const loadUserGroups = async () => {
    setLoadingGroups(true);
    try {
      const response = await fetch("/api/users/groups", {
        method: "GET",
        headers: authUtils.getAuthHeaders(token),
      });

      if (response.ok) {
        const data = await response.json();
        setUserGroups(data);
      } else {
        console.error("Failed to load user groups");
      }
    } catch (error) {
      console.error("Error loading user groups:", error);
    } finally {
      setLoadingGroups(false);
    }
  };

  const renderProfileView = () => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">User Profile</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Username
          </label>
          <div className="mt-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md">
            {username}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Coordinator Address
          </label>
          <div className="mt-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md font-mono text-sm">
            {coordinatorAddr}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Session Status
          </label>
          <div className="mt-1 px-3 py-2 bg-green-50 border border-green-300 rounded-md text-green-800">
            ✅ Active Session
          </div>
        </div>

        <div className="pt-4 border-t">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Account Actions
          </h3>
          <div className="space-y-2">
            <button
              className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
              onClick={() => window.location.reload()}
            >
              🔄 Refresh Session
            </button>
            <button
              className="w-full bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
              onClick={() => {
                authUtils.clearSession();
                window.location.reload();
              }}
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPasswordChangeView = () => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Change Password</h2>

      {message && (
        <div
          className={`mb-4 p-3 rounded ${
            message.includes("success")
              ? "bg-green-100 border border-green-400 text-green-700"
              : "bg-red-100 border border-red-400 text-red-700"
          }`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handlePasswordChange} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Password
          </label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            New Password
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            minLength={6}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirm New Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            minLength={6}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Changing Password..." : "Change Password"}
        </button>
      </form>
    </div>
  );

  const renderGroupsView = () => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">My Groups</h2>
        <button
          onClick={loadUserGroups}
          disabled={loadingGroups}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
        >
          {loadingGroups ? "Loading..." : "🔄 Refresh"}
        </button>
      </div>

      {userGroups ? (
        <div className="space-y-3">
          {Object.entries(userGroups.groups || {}).map(([groupName, role]) => (
            <div
              key={groupName}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div>
                <div className="font-medium text-gray-900">{groupName}</div>
                <div className="text-sm text-gray-500">Group Member</div>
              </div>
              <div className="text-right">
                <span
                  className={`inline-block px-2 py-1 text-xs rounded-full ${
                    role === "Admin"
                      ? "bg-red-100 text-red-800"
                      : role === "Write"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                  }`}
                >
                  {role}
                </span>
              </div>
            </div>
          ))}

          {Object.keys(userGroups.groups || {}).length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No groups found. You may not be a member of any groups yet.
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          Click "Refresh" to load your group memberships.
        </div>
      )}
    </div>
  );

  switch (activeView) {
    case "users.profile":
      return renderProfileView();
    case "users.password":
      return renderPasswordChangeView();
    case "users.groups":
      return renderGroupsView();
    default:
      return renderProfileView();
  }
}
