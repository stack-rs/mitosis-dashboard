import React, { useState } from "react";
import { authUtils } from "../../utils/auth";
import { GroupWorkerRole } from "../../types/schemas";
import { handleApiError, handleNetworkError } from "../../utils/errorUtils";

interface ManageWorkerProps {
  token: string;
  coordinatorAddr: string;
}

export default function ManageWorker({
  token,
  coordinatorAddr,
}: ManageWorkerProps) {
  const [workerId, setWorkerId] = useState("");
  const [message, setMessage] = useState("");

  // Management operations state
  const [activeOperation, setActiveOperation] = useState<string>("");

  // Tags management
  const [newTags, setNewTags] = useState("");
  const [updatingTags, setUpdatingTags] = useState(false);

  // Labels management
  const [newLabels, setNewLabels] = useState("");
  const [updatingLabels, setUpdatingLabels] = useState(false);

  // Groups management
  const [groupsToAdd, setGroupsToAdd] = useState("");
  const [selectedRole, setSelectedRole] = useState<GroupWorkerRole>(
    GroupWorkerRole.READ,
  );
  const [groupsToRemove, setGroupsToRemove] = useState("");
  const [updatingGroups, setUpdatingGroups] = useState(false);

  const resetForm = () => {
    setWorkerId("");
    setNewTags("");
    setNewLabels("");
    setGroupsToAdd("");
    setGroupsToRemove("");
    setActiveOperation("");
    setMessage("");
  };

  const updateWorkerTags = async () => {
    if (!workerId.trim()) {
      setMessage("Please enter a worker ID");
      return;
    }

    if (!newTags.trim()) {
      setMessage("Please enter tags to update");
      return;
    }

    setUpdatingTags(true);

    try {
      const tagsArray = newTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const response = await fetch(`/api/workers/${workerId}/tags`, {
        method: "PUT",
        headers: authUtils.getAuthHeaders(token),
        body: JSON.stringify({
          token,
          coordinator_addr: coordinatorAddr,
          tags: tagsArray,
        }),
      });

      if (response.ok) {
        setMessage("Worker tags updated successfully");
        setNewTags("");
      } else {
        const errorMessage = await handleApiError(response);
        setMessage(errorMessage);
      }
    } catch (error) {
      setMessage(handleNetworkError(error));
    } finally {
      setUpdatingTags(false);
    }
  };

  const updateWorkerLabels = async () => {
    if (!workerId.trim()) {
      setMessage("Please enter a worker ID");
      return;
    }

    if (!newLabels.trim()) {
      setMessage("Please enter labels to update");
      return;
    }

    setUpdatingLabels(true);

    try {
      const labelsArray = newLabels
        .split(",")
        .map((l) => l.trim())
        .filter(Boolean);

      const response = await fetch(`/api/workers/${workerId}/labels`, {
        method: "PUT",
        headers: authUtils.getAuthHeaders(token),
        body: JSON.stringify({
          token,
          coordinator_addr: coordinatorAddr,
          labels: labelsArray,
        }),
      });

      if (response.ok) {
        setMessage("Worker labels updated successfully");
        setNewLabels("");
      } else {
        const errorMessage = await handleApiError(response);
        setMessage(errorMessage);
      }
    } catch (error) {
      setMessage(handleNetworkError(error));
    } finally {
      setUpdatingLabels(false);
    }
  };

  const updateWorkerGroups = async (operation: "add" | "remove") => {
    if (!workerId.trim()) {
      setMessage("Please enter a worker ID");
      return;
    }

    const groups = operation === "add" ? groupsToAdd : groupsToRemove;

    if (!groups.trim()) {
      setMessage(`Please enter groups to ${operation}`);
      return;
    }

    setUpdatingGroups(true);

    try {
      const groupsArray = groups
        .split(",")
        .map((g) => g.trim())
        .filter(Boolean);

      let requestData;
      if (operation === "add") {
        // For add operation, use relations format: { "groupName": "role" }
        const relations: { [key: string]: string } = {};
        groupsArray.forEach((group) => {
          relations[group] = selectedRole;
        });
        requestData = { relations };
      } else {
        // For remove operation, use groups array
        requestData = { groups: groupsArray };
      }

      const response = await fetch(`/api/workers/${workerId}/groups`, {
        method: operation === "add" ? "PUT" : "DELETE",
        headers: authUtils.getAuthHeaders(token),
        body: JSON.stringify({
          token,
          coordinator_addr: coordinatorAddr,
          ...requestData,
        }),
      });

      if (response.ok) {
        setMessage(
          `Worker groups ${operation === "add" ? "added" : "removed"} successfully`,
        );
        if (operation === "add") {
          setGroupsToAdd("");
        } else {
          setGroupsToRemove("");
        }
      } else {
        const errorMessage = await handleApiError(response);
        setMessage(errorMessage);
      }
    } catch (error) {
      setMessage(handleNetworkError(error));
    } finally {
      setUpdatingGroups(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Manage a Worker
          </h1>
          <p className="text-gray-600 mb-8">
            Update worker tags, labels, and group memberships. Enter a worker ID
            and select the operation you want to perform.
          </p>

          {/* Worker ID Input */}
          <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Worker ID *
            </label>
            <input
              type="text"
              value={workerId}
              onChange={(e) => setWorkerId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter worker ID to manage"
            />
          </div>

          {/* Operation Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <button
              onClick={() => setActiveOperation("tags")}
              className={`p-4 rounded-lg border-2 transition-colors ${
                activeOperation === "tags"
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="text-2xl mb-2">🏷️</div>
              <div className="font-medium">Update Tags</div>
              <div className="text-sm text-gray-600">Replace worker tags</div>
            </button>

            <button
              onClick={() => setActiveOperation("labels")}
              className={`p-4 rounded-lg border-2 transition-colors ${
                activeOperation === "labels"
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="text-2xl mb-2">🔖</div>
              <div className="font-medium">Update Labels</div>
              <div className="text-sm text-gray-600">Replace worker labels</div>
            </button>

            <button
              onClick={() => setActiveOperation("add-groups")}
              className={`p-4 rounded-lg border-2 transition-colors ${
                activeOperation === "add-groups"
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="text-2xl mb-2">➕</div>
              <div className="font-medium">Add to Groups</div>
              <div className="text-sm text-gray-600">Add worker to groups</div>
            </button>

            <button
              onClick={() => setActiveOperation("remove-groups")}
              className={`p-4 rounded-lg border-2 transition-colors ${
                activeOperation === "remove-groups"
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="text-2xl mb-2">➖</div>
              <div className="font-medium">Remove from Groups</div>
              <div className="text-sm text-gray-600">
                Remove worker from groups
              </div>
            </button>
          </div>

          {/* Operation Forms */}
          {activeOperation === "tags" && (
            <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Update Worker Tags
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Enter comma-separated tags that will replace all existing tags
                for this worker.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="tag1, tag2, tag3"
                  />
                </div>

                <button
                  onClick={updateWorkerTags}
                  disabled={updatingTags || !workerId.trim()}
                  className="w-full bg-yellow-500 text-white py-2 px-4 rounded-md hover:bg-yellow-600 disabled:opacity-50"
                >
                  {updatingTags ? "Updating..." : "Update Tags"}
                </button>
              </div>
            </div>
          )}

          {activeOperation === "labels" && (
            <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Update Worker Labels
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Enter comma-separated labels that will replace all existing
                labels for this worker.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Labels (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={newLabels}
                    onChange={(e) => setNewLabels(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="production, backend, high-priority"
                  />
                </div>

                <button
                  onClick={updateWorkerLabels}
                  disabled={updatingLabels || !workerId.trim()}
                  className="w-full bg-purple-500 text-white py-2 px-4 rounded-md hover:bg-purple-600 disabled:opacity-50"
                >
                  {updatingLabels ? "Updating..." : "Update Labels"}
                </button>
              </div>
            </div>
          )}

          {activeOperation === "add-groups" && (
            <div className="bg-green-50 rounded-lg p-6 border border-green-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Add Worker to Groups
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Add the worker to specified groups with a selected role.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Groups (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={groupsToAdd}
                    onChange={(e) => setGroupsToAdd(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="group1, group2, group3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role for Groups
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) =>
                      setSelectedRole(e.target.value as GroupWorkerRole)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.values(GroupWorkerRole).map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => updateWorkerGroups("add")}
                  disabled={updatingGroups || !workerId.trim()}
                  className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 disabled:opacity-50"
                >
                  {updatingGroups ? "Adding..." : "Add to Groups"}
                </button>
              </div>
            </div>
          )}

          {activeOperation === "remove-groups" && (
            <div className="bg-red-50 rounded-lg p-6 border border-red-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Remove Worker from Groups
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Remove the worker from specified groups.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Groups to Remove (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={groupsToRemove}
                    onChange={(e) => setGroupsToRemove(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="group1, group2, group3"
                  />
                </div>

                <button
                  onClick={() => updateWorkerGroups("remove")}
                  disabled={updatingGroups || !workerId.trim()}
                  className="w-full bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 disabled:opacity-50"
                >
                  {updatingGroups ? "Removing..." : "Remove from Groups"}
                </button>
              </div>
            </div>
          )}

          {/* Messages */}
          {message && (
            <div
              className={`mt-6 p-3 rounded ${
                message.includes("success")
                  ? "bg-green-100 border border-green-400 text-green-700"
                  : "bg-red-100 border border-red-400 text-red-700"
              }`}
            >
              {message}
            </div>
          )}

          {/* Reset Button */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={resetForm}
              className="bg-gray-500 text-white py-2 px-6 rounded-md hover:bg-gray-600"
            >
              Reset Form
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
