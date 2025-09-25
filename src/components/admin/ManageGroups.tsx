import React, { useState } from "react";
import { authUtils } from "../../utils/auth";
import { handleApiError, handleNetworkError } from "../../utils/errorUtils";
import { formatBytes } from "../../utils/formatUtils";

interface ManageGroupsProps {
  token: string;
  coordinatorAddr: string;
  username: string;
}

export default function ManageGroups({
  token,
  coordinatorAddr,
  username,
}: ManageGroupsProps) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"quota" | "attachments">("quota");

  // Storage quota management (Real admin API: POST admin/groups/{group_name}/storage-quota)
  const [quotaGroupName, setQuotaGroupName] = useState("");
  const [storageQuota, setStorageQuota] = useState("");

  // Admin attachment deletion
  const [deleteAttachmentGroup, setDeleteAttachmentGroup] = useState("");
  const [deleteAttachmentKey, setDeleteAttachmentKey] = useState("");

  const updateStorageQuota = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quotaGroupName.trim() || !storageQuota.trim()) return;

    setLoading(true);
    setMessage("");
    try {
      const response = await fetch(
        `/api/admin/groups/${quotaGroupName.trim()}/storage-quota`,
        {
          method: "POST",
          headers: authUtils.getAuthHeaders(token),
          body: JSON.stringify({
            token,
            coordinator_addr: coordinatorAddr,
            storage_quota: storageQuota.trim(),
          }),
        },
      );

      if (response.ok) {
        const data = await response.json();
        setMessage(
          `✅ Storage quota updated for group "${quotaGroupName}": ${formatBytes(data.storage_quota)}`,
        );
        setQuotaGroupName("");
        setStorageQuota("");
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

  const deleteAttachmentAdmin = async () => {
    if (!deleteAttachmentGroup.trim() || !deleteAttachmentKey.trim()) return;
    if (
      !confirm(
        `Are you sure you want to delete attachment "${deleteAttachmentKey}" from group "${deleteAttachmentGroup}"? This action cannot be undone.`,
      )
    )
      return;

    setLoading(true);
    setMessage("");
    try {
      const response = await fetch(
        `/api/admin/groups/${deleteAttachmentGroup.trim()}/attachments/${deleteAttachmentKey.trim()}`,
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
        setMessage(
          `✅ Attachment "${deleteAttachmentKey}" deleted from group "${deleteAttachmentGroup}"`,
        );
        setDeleteAttachmentGroup("");
        setDeleteAttachmentKey("");
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
      case "quota":
        return (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-purple-800 mb-4">
              💾 Manage Group Storage Quota (Admin)
            </h2>
            <p className="text-sm text-purple-700 mb-4">
              ⚡ Administrative privilege required to update storage quotas for
              any group.
            </p>
            <form onSubmit={updateStorageQuota} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Group Name *
                  </label>
                  <input
                    type="text"
                    value={quotaGroupName}
                    onChange={(e) => setQuotaGroupName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                    placeholder="Enter group name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Storage Quota *
                  </label>
                  <input
                    type="text"
                    value={storageQuota}
                    onChange={(e) => setStorageQuota(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                    placeholder="e.g., 1GB, 500MB, 2TB"
                  />
                </div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <p className="text-sm text-yellow-700">
                  <strong>Format examples:</strong> "1GB", "500MB", "2TB",
                  "1073741824" (bytes)
                </p>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-500 text-white py-3 px-4 rounded-md hover:bg-purple-600 disabled:opacity-50 font-medium"
              >
                {loading
                  ? "Updating Quota..."
                  : "💾 Update Storage Quota (Admin)"}
              </button>
            </form>
          </div>
        );

      case "attachments":
        return (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-orange-800 mb-4">
              📎 Admin Attachment Management
            </h2>
            <p className="text-sm text-orange-700 mb-4">
              ⚠️ Administrative deletion of attachments bypasses normal
              permissions checks.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Group Name *
                </label>
                <input
                  type="text"
                  value={deleteAttachmentGroup}
                  onChange={(e) => setDeleteAttachmentGroup(e.target.value)}
                  placeholder="Enter group name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attachment Key *
                </label>
                <input
                  type="text"
                  value={deleteAttachmentKey}
                  onChange={(e) => setDeleteAttachmentKey(e.target.value)}
                  placeholder="Enter attachment key"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
            </div>
            <button
              onClick={deleteAttachmentAdmin}
              disabled={
                loading ||
                !deleteAttachmentGroup.trim() ||
                !deleteAttachmentKey.trim()
              }
              className="w-full bg-orange-500 text-white py-3 px-4 rounded-md hover:bg-orange-600 disabled:opacity-50 font-medium"
            >
              {loading
                ? "Deleting Attachment..."
                : "🗑️ Delete Attachment (Admin)"}
            </button>
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
              👥 Admin - Manage Groups
            </h1>
            <p className="text-gray-600">
              Manage group storage quotas and attachments with administrative
              privileges. Other group operations are available in the regular
              Groups section.
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
                onClick={() => setActiveTab("quota")}
                className={`flex-1 py-4 px-1 border-b-2 font-medium text-sm text-center ${
                  activeTab === "quota"
                    ? "border-purple-500 text-purple-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                💾 Storage Quota
              </button>
              <button
                onClick={() => setActiveTab("attachments")}
                className={`flex-1 py-4 px-1 border-b-2 font-medium text-sm text-center ${
                  activeTab === "attachments"
                    ? "border-orange-500 text-orange-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                📎 Attachments
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">{renderTabContent()}</div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-800 mb-2">
              ℹ️ Other Group Operations
            </h3>
            <p className="text-sm text-blue-700">
              For regular group operations like creating groups, managing user
              roles, or querying group information, please use the{" "}
              <strong>Groups</strong> section in the main menu. This admin
              section is specifically for storage quota management which
              requires administrative privileges.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
