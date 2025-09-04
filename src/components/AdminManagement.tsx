import React, { useState } from "react";
import { authUtils } from "../utils/auth";

interface AdminManagementProps {
  token: string;
  coordinatorAddr: string;
  username: string;
  activeView: string;
}

export default function AdminManagement({
  token,
  coordinatorAddr,
  username,
  activeView,
}: AdminManagementProps) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // User management
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [targetUsername, setTargetUsername] = useState("");
  const [adminNewPassword, setAdminNewPassword] = useState("");

  // Storage management
  const [groupName, setGroupName] = useState("");
  const [storageQuota, setStorageQuota] = useState("");

  // System management
  const [shutdownSecret, setShutdownSecret] = useState("");

  const hashPassword = (password: string): number[] => {
    // Simple MD5 implementation for demo - in production, use crypto library
    // For now, we'll use a placeholder that converts string to array
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const array = Array.from(data);
    // Pad or truncate to 16 bytes
    while (array.length < 16) array.push(0);
    return array.slice(0, 16);
  };

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newPassword.trim()) return;

    setLoading(true);
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: authUtils.getAuthHeaders(token),
        body: JSON.stringify({
          username: newUsername,
          md5_password: hashPassword(newPassword),
          admin: isAdmin,
        }),
      });

      if (response.ok) {
        setMessage(`User "${newUsername}" created successfully`);
        setNewUsername("");
        setNewPassword("");
        setIsAdmin(false);
      } else {
        const error = await response.json();
        setMessage(error.error || "Failed to create user");
      }
    } catch (error) {
      setMessage("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async () => {
    if (!targetUsername.trim()) return;
    if (
      !confirm(
        `Are you sure you want to delete user "${targetUsername}"? This action cannot be undone.`,
      )
    )
      return;

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${targetUsername}`, {
        method: "DELETE",
        headers: authUtils.getAuthHeaders(token),
      });

      if (response.ok) {
        setMessage(`User "${targetUsername}" deleted successfully`);
        setTargetUsername("");
      } else {
        const error = await response.json();
        setMessage(error.error || "Failed to delete user");
      }
    } catch (error) {
      setMessage("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  const adminChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUsername.trim() || !adminNewPassword.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/users/${targetUsername}/password`,
        {
          method: "POST",
          headers: authUtils.getAuthHeaders(token),
          body: JSON.stringify({
            new_md5_password: hashPassword(adminNewPassword),
          }),
        },
      );

      if (response.ok) {
        setMessage(`Password changed for user "${targetUsername}"`);
        setTargetUsername("");
        setAdminNewPassword("");
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

  const updateStorageQuota = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim() || !storageQuota.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/groups/${groupName}/storage-quota`,
        {
          method: "POST",
          headers: authUtils.getAuthHeaders(token),
          body: JSON.stringify({
            storage_quota: storageQuota,
          }),
        },
      );

      if (response.ok) {
        const data = await response.json();
        setMessage(
          `Storage quota updated for group "${groupName}": ${data.storage_quota} bytes`,
        );
        setGroupName("");
        setStorageQuota("");
      } else {
        const error = await response.json();
        setMessage(error.error || "Failed to update storage quota");
      }
    } catch (error) {
      setMessage("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  const shutdownCoordinator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shutdownSecret.trim()) return;
    if (
      !confirm(
        "Are you sure you want to shutdown the coordinator? This will stop all services.",
      )
    )
      return;

    setLoading(true);
    try {
      const response = await fetch("/api/admin/shutdown", {
        method: "POST",
        headers: authUtils.getAuthHeaders(token),
        body: JSON.stringify({
          secret: shutdownSecret,
        }),
      });

      if (response.ok) {
        setMessage("Shutdown command sent successfully");
        setShutdownSecret("");
      } else {
        const error = await response.json();
        setMessage(error.error || "Failed to shutdown coordinator");
      }
    } catch (error) {
      setMessage("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  const renderUserManagement = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Admin - User Management
        </h2>

        {/* Create User */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Create User</h3>
          <form onSubmit={createUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
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
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={isAdmin}
                  onChange={(e) => setIsAdmin(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Admin User</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? "Creating..." : "➕ Create User"}
            </button>
          </form>
        </div>

        {/* Delete User */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Delete User</h3>
          <div className="flex gap-4">
            <input
              type="text"
              value={targetUsername}
              onChange={(e) => setTargetUsername(e.target.value)}
              placeholder="Username to delete"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={deleteUser}
              disabled={loading || !targetUsername.trim()}
              className="bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600 disabled:opacity-50"
            >
              🗑️ Delete User
            </button>
          </div>
        </div>

        {/* Change User Password */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Change User Password</h3>
          <form onSubmit={adminChangePassword} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={targetUsername}
                  onChange={(e) => setTargetUsername(e.target.value)}
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
                  value={adminNewPassword}
                  onChange={(e) => setAdminNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 disabled:opacity-50"
            >
              {loading ? "Changing..." : "🔑 Change Password"}
            </button>
          </form>
        </div>
      </div>

      {message && (
        <div
          className={`p-3 rounded ${
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

  const renderStorageManagement = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Admin - Storage Management
        </h2>

        <form onSubmit={updateStorageQuota} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Group Name
              </label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                placeholder="Enter group name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Storage Quota
              </label>
              <input
                type="text"
                value={storageQuota}
                onChange={(e) => setStorageQuota(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                placeholder="e.g., 1GB, 500MB, 2TB"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? "Updating..." : "💾 Update Storage Quota"}
          </button>
        </form>

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <h4 className="font-medium text-yellow-800">Storage Quota Format</h4>
          <p className="text-sm text-yellow-700 mt-1">
            Use formats like: "1GB", "500MB", "2TB", "1073741824" (bytes)
          </p>
        </div>
      </div>

      {message && (
        <div
          className={`p-3 rounded ${
            message.includes("success") || message.includes("updated")
              ? "bg-green-100 border border-green-400 text-green-700"
              : "bg-red-100 border border-red-400 text-red-700"
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );

  const renderSystemControl = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Admin - System Control
        </h2>

        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <h3 className="font-medium text-red-800 mb-2">⚠️ Danger Zone</h3>
          <p className="text-sm text-red-700">
            These actions will affect the entire system and cannot be undone.
          </p>
        </div>

        <form onSubmit={shutdownCoordinator} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Shutdown Secret
            </label>
            <input
              type="password"
              value={shutdownSecret}
              onChange={(e) => setShutdownSecret(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              required
              placeholder="Enter shutdown secret"
            />
            <p className="text-xs text-gray-500 mt-1">
              This secret is configured on the coordinator server.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-500 text-white py-3 px-4 rounded-md hover:bg-red-600 disabled:opacity-50 font-semibold"
          >
            {loading ? "Shutting Down..." : "🔄 Shutdown Coordinator"}
          </button>
        </form>

        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-md">
          <h4 className="font-medium text-gray-800">System Information</h4>
          <div className="text-sm text-gray-600 mt-2 space-y-1">
            <div>Coordinator: {coordinatorAddr}</div>
            <div>Admin User: {username}</div>
            <div>Session Active: ✅</div>
          </div>
        </div>
      </div>

      {message && (
        <div
          className={`p-3 rounded ${
            message.includes("success") || message.includes("sent")
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
    case "admin.users":
      return renderUserManagement();
    case "admin.workers":
      return renderUserManagement(); // Could add specific admin worker features
    case "admin.groups":
      return renderUserManagement(); // Could add specific admin group features
    case "admin.storage":
      return renderStorageManagement();
    case "admin.system":
      return renderSystemControl();
    default:
      return renderUserManagement();
  }
}
