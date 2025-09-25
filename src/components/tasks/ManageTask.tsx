import React, { useState } from "react";
import { authUtils } from "../../utils/auth";
import { handleApiError, handleNetworkError } from "../../utils/errorUtils";
import { parseResourceLines } from "../../utils/resourceUtils";
import { TaskExecState } from "../../types/schemas";
import type { TaskSpec } from "../../types/schemas";

interface ManageTaskProps {
  token: string;
  coordinatorAddr: string;
}

export default function ManageTask({
  token,
  coordinatorAddr,
}: ManageTaskProps) {
  const [taskUuid, setTaskUuid] = useState("");
  const [message, setMessage] = useState("");

  // Management operations state
  const [activeOperation, setActiveOperation] = useState<string>("");

  // Change Task Spec state
  const [newTags, setNewTags] = useState("");
  const [newTimeout, setNewTimeout] = useState("");
  const [newPriority, setNewPriority] = useState("");
  const [newArgs, setNewArgs] = useState("");
  const [newEnvs, setNewEnvs] = useState("");
  const [newResources, setNewResources] = useState("");
  const [newWatchTaskUuid, setNewWatchTaskUuid] = useState("");
  const [newWatchState, setNewWatchState] = useState<TaskExecState>(
    TaskExecState.EXEC_FINISHED,
  );
  const [newTerminalOutput, setNewTerminalOutput] = useState(false);
  const [updatingSpec, setUpdatingSpec] = useState(false);

  // Update Labels state
  const [newLabels, setNewLabels] = useState("");
  const [updatingLabels, setUpdatingLabels] = useState(false);

  const resetForm = () => {
    setTaskUuid("");
    setNewTags("");
    setNewTimeout("");
    setNewPriority("");
    setNewArgs("");
    setNewEnvs("");
    setNewResources("");
    setNewWatchTaskUuid("");
    setNewWatchState(TaskExecState.EXEC_FINISHED);
    setNewTerminalOutput(false);
    setNewLabels("");
    setActiveOperation("");
    setMessage("");
  };

  const updateTaskSpec = async () => {
    if (!taskUuid.trim()) {
      setMessage("Please enter a task UUID");
      return;
    }

    setUpdatingSpec(true);

    try {
      const requestData: any = {
        token,
        coordinator_addr: coordinatorAddr,
      };

      // Add optional fields only if they have values
      if (newTags.trim()) {
        requestData.tags = newTags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);
      }

      if (newTimeout.trim()) {
        requestData.timeout = newTimeout.trim();
      }

      if (newPriority.trim()) {
        requestData.priority = parseInt(newPriority) || 0;
      }

      // Build task spec if any spec fields are provided
      const hasSpecChanges =
        newArgs.trim() ||
        newEnvs.trim() ||
        newResources.trim() ||
        newWatchTaskUuid.trim();

      if (hasSpecChanges) {
        const taskSpec: Partial<TaskSpec> = {};

        if (newArgs.trim()) {
          taskSpec.args = newArgs
            .split("\n")
            .map((arg) => arg.trim())
            .filter((arg) => arg.length > 0);
        }

        if (newEnvs.trim()) {
          const envsObject: { [key: string]: string } = {};
          const envLines = newEnvs
            .split("\n")
            .filter((line) => line.includes("="));
          for (const line of envLines) {
            const [key, ...valueParts] = line.split("=");
            if (key && valueParts.length > 0) {
              envsObject[key.trim()] = valueParts.join("=").trim();
            }
          }
          if (Object.keys(envsObject).length > 0) {
            taskSpec.envs = envsObject;
          }
        }

        if (newResources.trim()) {
          const resourcesArray = parseResourceLines(newResources);
          if (resourcesArray.length > 0) {
            taskSpec.resources = resourcesArray;
          }
        }

        if (newWatchTaskUuid.trim()) {
          taskSpec.watch = [newWatchTaskUuid.trim(), newWatchState];
        }

        taskSpec.terminal_output = newTerminalOutput;
        requestData.task_spec = taskSpec;
      }

      const response = await fetch(`/api/tasks/${taskUuid}/change`, {
        method: "PUT",
        headers: authUtils.getAuthHeaders(token),
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        setMessage("Task specification updated successfully");
        setNewTags("");
        setNewTimeout("");
        setNewPriority("");
        setNewArgs("");
        setNewEnvs("");
        setNewResources("");
        setNewWatchTaskUuid("");
        setNewWatchState(TaskExecState.EXEC_FINISHED);
        setNewTerminalOutput(false);
      } else {
        const errorMessage = await handleApiError(response);
        setMessage(errorMessage);
      }
    } catch (error) {
      setMessage(handleNetworkError(error));
    } finally {
      setUpdatingSpec(false);
    }
  };

  const updateTaskLabels = async () => {
    if (!taskUuid.trim()) {
      setMessage("Please enter a task UUID");
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

      const response = await fetch(`/api/tasks/${taskUuid}/labels`, {
        method: "PUT",
        headers: authUtils.getAuthHeaders(token),
        body: JSON.stringify({
          token,
          coordinator_addr: coordinatorAddr,
          labels: labelsArray,
        }),
      });

      if (response.ok) {
        setMessage("Task labels updated successfully");
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Manage a Task
          </h1>
          <p className="text-gray-600 mb-8">
            Update task specification and labels. Enter a task UUID and select
            the operation you want to perform.
          </p>

          {/* Task UUID Input */}
          <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task UUID *
            </label>
            <input
              type="text"
              value={taskUuid}
              onChange={(e) => setTaskUuid(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter task UUID to manage"
            />
          </div>

          {/* Operation Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <button
              onClick={() => setActiveOperation("spec")}
              className={`p-6 rounded-lg border-2 transition-colors text-left ${
                activeOperation === "spec"
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="text-3xl mb-3">⚙️</div>
              <div className="font-medium text-lg mb-2">Change Task Spec</div>
              <div className="text-sm text-gray-600">
                Update task specification including arguments, environment,
                resources, and configuration
              </div>
            </button>

            <button
              onClick={() => setActiveOperation("labels")}
              className={`p-6 rounded-lg border-2 transition-colors text-left ${
                activeOperation === "labels"
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="text-3xl mb-3">🔖</div>
              <div className="font-medium text-lg mb-2">Update Labels</div>
              <div className="text-sm text-gray-600">
                Replace task labels with a new comma-separated list
              </div>
            </button>
          </div>

          {/* Two Column Layout for Operations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Change Task Spec Column */}
            {activeOperation === "spec" && (
              <div className="lg:col-span-2">
                <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Change Task Specification
                  </h3>
                  <p className="text-sm text-gray-600 mb-6">
                    Update any part of the task specification. Leave fields
                    empty to keep existing values.
                  </p>

                  <div className="space-y-6">
                    {/* Basic Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tags (comma-separated)
                        </label>
                        <input
                          type="text"
                          value={newTags}
                          onChange={(e) => setNewTags(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="tag1, tag2, tag3"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Timeout
                        </label>
                        <input
                          type="text"
                          value={newTimeout}
                          onChange={(e) => setNewTimeout(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="10min, 1h, 30s"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Priority
                        </label>
                        <input
                          type="number"
                          value={newPriority}
                          onChange={(e) => setNewPriority(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0"
                          min="-100"
                          max="100"
                        />
                      </div>
                    </div>

                    {/* Command Arguments */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Command Arguments (one per line)
                      </label>
                      <textarea
                        value={newArgs}
                        onChange={(e) => setNewArgs(e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                        placeholder="python&#10;script.py&#10;--flag&#10;value"
                      />
                    </div>

                    {/* Environment Variables */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Environment Variables (KEY=VALUE, one per line)
                      </label>
                      <textarea
                        value={newEnvs}
                        onChange={(e) => setNewEnvs(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                        placeholder="ENV_VAR=value&#10;DEBUG=true"
                      />
                    </div>

                    {/* Resources */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Resources (one per line)
                      </label>
                      <textarea
                        value={newResources}
                        onChange={(e) => setNewResources(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                        placeholder="artifacts={uuid}:{content_type}:{local_path}&#10;attachments={key}:{local_path}"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Format: artifacts={"{uuid}"}:{"{content_type}"}:
                        {"{local_path}"} or attachments={"{key}"}:
                        {"{local_path}"}. Legacy format type:value:path still
                        supported.
                      </p>
                    </div>

                    {/* Watch Configuration */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Watch Task UUID
                        </label>
                        <input
                          type="text"
                          value={newWatchTaskUuid}
                          onChange={(e) => setNewWatchTaskUuid(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                          placeholder="uuid-to-watch"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Watch State
                        </label>
                        <select
                          value={newWatchState}
                          onChange={(e) =>
                            setNewWatchState(e.target.value as TaskExecState)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={!newWatchTaskUuid.trim()}
                        >
                          <option value={TaskExecState.EXEC_FINISHED}>
                            Execution Finished
                          </option>
                          <option value={TaskExecState.EXEC_SPAWNED}>
                            Execution Spawned
                          </option>
                          <option value={TaskExecState.WATCH_FINISHED}>
                            Watch Finished
                          </option>
                          <option value={TaskExecState.TASK_COMMITTED}>
                            Task Committed
                          </option>
                        </select>
                      </div>
                    </div>

                    {/* Terminal Output */}
                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={newTerminalOutput}
                          onChange={(e) =>
                            setNewTerminalOutput(e.target.checked)
                          }
                          className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">
                          Enable Terminal Output
                        </span>
                      </label>
                    </div>

                    <button
                      onClick={updateTaskSpec}
                      disabled={updatingSpec || !taskUuid.trim()}
                      className="w-full bg-yellow-500 text-white py-3 px-4 rounded-md hover:bg-yellow-600 disabled:opacity-50 font-medium"
                    >
                      {updatingSpec
                        ? "Updating..."
                        : "Update Task Specification"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Update Labels Column */}
            {activeOperation === "labels" && (
              <div className="lg:col-span-2">
                <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Update Task Labels
                  </h3>
                  <p className="text-sm text-gray-600 mb-6">
                    Enter comma-separated labels that will replace all existing
                    labels for this task.
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
                      onClick={updateTaskLabels}
                      disabled={updatingLabels || !taskUuid.trim()}
                      className="w-full bg-purple-500 text-white py-3 px-4 rounded-md hover:bg-purple-600 disabled:opacity-50 font-medium"
                    >
                      {updatingLabels ? "Updating..." : "Update Labels"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

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
