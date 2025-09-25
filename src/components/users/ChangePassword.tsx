import React, { useState } from "react";
import { authUtils } from "../../utils/auth";
import { handleApiError, handleNetworkError } from "../../utils/errorUtils";
import { md5 } from "../../utils/hashUtils";

interface ChangePasswordProps {
  token: string;
  coordinatorAddr: string;
  username: string;
}

export default function ChangePassword({
  token,
  coordinatorAddr,
  username,
}: ChangePasswordProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

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
      const oldMd5Password = md5(currentPassword);
      const newMd5Password = md5(newPassword);

      const response = await fetch(`/api/users/${username}/password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          coordinator_addr: coordinatorAddr,
          old_md5_password: oldMd5Password,
          new_md5_password: newMd5Password,
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
        const errorMessage = await handleApiError(response);
        setMessage(errorMessage);
      }
    } catch (error) {
      setMessage(handleNetworkError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setMessage("");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Change Password
          </h1>
          <p className="text-gray-600 mb-8">
            Update your account password. Make sure to use a strong password
            that you haven't used before.
          </p>

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

          <form onSubmit={handlePasswordChange} className="space-y-6">
            <div>
              <label
                htmlFor="currentPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Current Password
              </label>
              <input
                type="password"
                id="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your current password"
                disabled={loading}
                required
              />
            </div>

            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your new password"
                disabled={loading}
                required
                minLength={6}
              />
              <p className="text-sm text-gray-600 mt-1">
                Password must be at least 6 characters long
              </p>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Confirm your new password"
                disabled={loading}
                required
                minLength={6}
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={
                  loading ||
                  !currentPassword ||
                  !newPassword ||
                  !confirmPassword
                }
                className="px-6 py-3 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {loading ? "Changing Password..." : "🔑 Change Password"}
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
            <h3 className="text-sm font-medium text-blue-900 mb-2">
              🔒 Security Tips
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Use a strong password with at least 8-12 characters</li>
              <li>
                • Include a mix of uppercase, lowercase, numbers, and symbols
              </li>
              <li>• Don't reuse passwords from other accounts</li>
              <li>• Consider using a password manager</li>
              <li>
                • Your session will remain active after changing the password
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
