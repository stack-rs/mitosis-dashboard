import React, { useState } from "react";
import { authUtils } from "../../utils/auth";
import { handleApiError, handleNetworkError } from "../../utils/errorUtils";

interface ManageUsersProps {
  token: string;
  coordinatorAddr: string;
  username: string;
}

export default function ManageUsers({
  token,
  coordinatorAddr,
  username,
}: ManageUsersProps) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"create" | "password" | "delete">(
    "create",
  );

  // User creation
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  // User deletion
  const [deleteUsername, setDeleteUsername] = useState("");

  // Password change
  const [targetUsername, setTargetUsername] = useState("");
  const [adminNewPassword, setAdminNewPassword] = useState("");

  const hashPassword = async (password: string): Promise<number[]> => {
    const response = await fetch("/api/auth/hash-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password }),
    });

    if (response.ok) {
      const { md5_password } = await response.json();
      return md5_password;
    }

    throw new Error("Failed to hash password");
  };

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newPassword.trim()) return;

    setLoading(true);
    setMessage("");
    try {
      const md5_password = await hashPassword(newPassword);
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: authUtils.getAuthHeaders(token),
        body: JSON.stringify({
          token,
          coordinator_addr: coordinatorAddr,
          username: newUsername.trim(),
          md5_password,
          admin: isAdmin,
        }),
      });

      if (response.ok) {
        setMessage(`✅ User "${newUsername}" created successfully`);
        setNewUsername("");
        setNewPassword("");
        setIsAdmin(false);
      } else {
        const errorMessage = await handleApiError(response);
        setMessage(`❌ ${errorMessage}`);
      }
    } catch (error) {
      setMessage(`❌ ${handleNetworkError(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async () => {
    if (!deleteUsername.trim()) return;
    if (
      !confirm(
        `Are you sure you want to delete user "${deleteUsername}"? This action cannot be undone.`,
      )
    )
      return;

    setLoading(true);
    setMessage("");
    try {
      const response = await fetch(
        `/api/admin/users/${deleteUsername.trim()}`,
        {
          method: "DELETE",
          headers: authUtils.getAuthHeaders(token),
          body: JSON.stringify({
            token,
            coordinator_addr: coordinatorAddr,
          }),
        },
      );

      if (response.ok) {
        setMessage(`✅ User "${deleteUsername}" deleted successfully`);
        setDeleteUsername("");
      } else {
        const errorMessage = await handleApiError(response);
        setMessage(`❌ ${errorMessage}`);
      }
    } catch (error) {
      setMessage(`❌ ${handleNetworkError(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const adminChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUsername.trim() || !adminNewPassword.trim()) return;

    setLoading(true);
    setMessage("");
    try {
      const new_md5_password = await hashPassword(adminNewPassword);
      const response = await fetch(
        `/api/admin/users/${targetUsername.trim()}/password`,
        {
          method: "POST",
          headers: authUtils.getAuthHeaders(token),
          body: JSON.stringify({
            token,
            coordinator_addr: coordinatorAddr,
            md5_password: new_md5_password,
          }),
        },
      );

      if (response.ok) {
        setMessage(`✅ Password changed for user "${targetUsername}"`);
        setTargetUsername("");
        setAdminNewPassword("");
      } else {
        const errorMessage = await handleApiError(response);
        setMessage(`❌ ${errorMessage}`);
      }
    } catch (error) {
      setMessage(`❌ ${handleNetworkError(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "create":
        return (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-green-800 mb-4">
              ➕ Create New User
            </h2>
            <form onSubmit={createUser} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username *
                  </label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                    placeholder="Enter username"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                    minLength={6}
                    placeholder="Minimum 6 characters"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="adminCheck"
                  checked={isAdmin}
                  onChange={(e) => setIsAdmin(e.target.checked)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="adminCheck"
                  className="ml-2 text-sm text-gray-700"
                >
                  Grant admin privileges
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-500 text-white py-3 px-4 rounded-md hover:bg-green-600 disabled:opacity-50 font-medium"
              >
                {loading ? "Creating User..." : "➕ Create User"}
              </button>
            </form>
          </div>
        );

      case "password":
        return (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-orange-800 mb-4">
              🔑 Change User Password
            </h2>
            <form onSubmit={adminChangePassword} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username *
                  </label>
                  <input
                    type="text"
                    value={targetUsername}
                    onChange={(e) => setTargetUsername(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                    placeholder="Enter username"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password *
                  </label>
                  <input
                    type="password"
                    value={adminNewPassword}
                    onChange={(e) => setAdminNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                    minLength={6}
                    placeholder="Minimum 6 characters"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-500 text-white py-3 px-4 rounded-md hover:bg-orange-600 disabled:opacity-50 font-medium"
              >
                {loading ? "Changing Password..." : "🔑 Change Password"}
              </button>
            </form>
          </div>
        );

      case "delete":
        return (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-800 mb-4">
              🗑️ Delete User
            </h2>
            <p className="text-sm text-red-700 mb-4">
              ⚠️ Warning: This action cannot be undone. The user will be
              permanently removed from the system.
            </p>
            <div className="flex gap-4">
              <input
                type="text"
                value={deleteUsername}
                onChange={(e) => setDeleteUsername(e.target.value)}
                placeholder="Enter username to delete"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <button
                onClick={deleteUser}
                disabled={loading || !deleteUsername.trim()}
                className="bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600 disabled:opacity-50 font-medium"
              >
                🗑️ Delete User
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              🔐 Admin - Manage Users
            </h1>
            <p className="text-gray-600">
              Create, delete, and manage user accounts in the system. Admin
              users have elevated privileges.
            </p>
          </div>

          {/* Current Session Info */}
          <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-800 mb-2">Current Session</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <div>
                Admin User: <span className="font-mono">{username}</span>
              </div>
              <div>
                Coordinator:{" "}
                <span className="font-mono">{coordinatorAddr}</span>
              </div>
              <div>
                Status: <span className="text-green-600">✅ Active</span>
              </div>
            </div>
          </div>

          {/* Message Display */}
          {message && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                message.includes("✅")
                  ? "bg-green-100 border border-green-400 text-green-700"
                  : "bg-red-100 border border-red-400 text-red-700"
              }`}
            >
              {message}
            </div>
          )}

          {/* Tab Navigation */}
          <div className="mb-6 border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab("create")}
                className={`flex-1 py-4 px-1 border-b-2 font-medium text-sm text-center ${
                  activeTab === "create"
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                ➕ Create User
              </button>
              <button
                onClick={() => setActiveTab("password")}
                className={`flex-1 py-4 px-1 border-b-2 font-medium text-sm text-center ${
                  activeTab === "password"
                    ? "border-orange-500 text-orange-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                🔑 Change Password
              </button>
              <button
                onClick={() => setActiveTab("delete")}
                className={`flex-1 py-4 px-1 border-b-2 font-medium text-sm text-center ${
                  activeTab === "delete"
                    ? "border-red-500 text-red-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                🗑️ Delete User
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">{renderTabContent()}</div>
        </div>
      </div>
    </div>
  );
}
