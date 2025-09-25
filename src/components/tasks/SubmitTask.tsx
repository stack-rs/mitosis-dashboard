import React, { useState, useEffect, useRef } from "react";
import { authUtils } from "../../utils/auth";
import { handleApiError, handleNetworkError } from "../../utils/errorUtils";
import { parseResourceLines } from "../../utils/resourceUtils";
import { TaskExecState } from "../../types/schemas";
import type { TaskSpec, RemoteResourceDownload } from "../../types/schemas";

interface SubmitTaskProps {
  token: string;
  coordinatorAddr: string;
  username: string;
}

export default function SubmitTask({
  token,
  coordinatorAddr,
  username,
}: SubmitTaskProps) {
  const [groupName, setGroupName] = useState("");
  const [tags, setTags] = useState("");
  const [labels, setLabels] = useState("");
  const [timeout, setTimeout] = useState("10min");
  const [priority, setPriority] = useState(0);
  const [args, setArgs] = useState("");
  const [envs, setEnvs] = useState("");
  const [resources, setResources] = useState("");
  const [watchTaskUuid, setWatchTaskUuid] = useState("");
  const [watchState, setWatchState] = useState<TaskExecState>(
    TaskExecState.EXEC_FINISHED,
  );
  const [terminalOutput, setTerminalOutput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Groups dropdown state
  const [userGroups, setUserGroups] = useState<{ [groupName: string]: string }>(
    {},
  );
  const [showGroupsDropdown, setShowGroupsDropdown] = useState(false);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Timeout dropdown state
  const [showTimeoutDropdown, setShowTimeoutDropdown] = useState(false);
  const timeoutRef = useRef<HTMLDivElement>(null);

  // Common timeout options
  const timeoutOptions = [
    "30s",
    "1min",
    "2min",
    "5min",
    "10min",
    "15min",
    "30min",
    "1h",
    "2h",
    "6h",
    "12h",
    "24h",
    "48h",
    "1week",
  ];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowGroupsDropdown(false);
      }
      if (
        timeoutRef.current &&
        !timeoutRef.current.contains(event.target as Node)
      ) {
        setShowTimeoutDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Load user groups function
  const loadUserGroups = async () => {
    setGroupsLoading(true);
    try {
      const response = await fetch(
        `/api/users/groups?token=${encodeURIComponent(token)}&coordinator_addr=${encodeURIComponent(coordinatorAddr)}`,
        {
          method: "GET",
        },
      );

      if (response.ok) {
        const data = await response.json();
        setUserGroups(data.groups || {});
      }
    } catch (_error) {
      // Silent failure for groups loading
    } finally {
      setGroupsLoading(false);
    }
  };

  const handleGroupSelect = (selectedGroupName: string) => {
    setGroupName(selectedGroupName);
    setShowGroupsDropdown(false);
  };

  const handleTimeoutSelect = (selectedTimeout: string) => {
    setTimeout(selectedTimeout);
    setShowTimeoutDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const argsArray = args
        .split("\n")
        .map((arg) => arg.trim())
        .filter((arg) => arg.length > 0);

      if (argsArray.length === 0) {
        setMessage("At least one command argument is required");
        setLoading(false);
        return;
      }

      const envsObject: { [key: string]: string } = {};
      if (envs.trim()) {
        const envLines = envs.split("\n").filter((line) => line.includes("="));
        for (const line of envLines) {
          const [key, ...valueParts] = line.split("=");
          if (key && valueParts.length > 0) {
            envsObject[key.trim()] = valueParts.join("=").trim();
          }
        }
      }

      const tagsArray = tags
        ? tags
            .split(",")
            .map((t) => t.trim())
            .filter((t) => t)
        : [];
      const labelsArray = labels
        ? labels
            .split(",")
            .map((l) => l.trim())
            .filter((l) => l)
        : [];

      const resourcesArray: RemoteResourceDownload[] =
        parseResourceLines(resources);

      let watchField: [string, TaskExecState] | null = null;
      if (watchTaskUuid.trim()) {
        watchField = [watchTaskUuid.trim(), watchState];
      }

      const taskSpec: TaskSpec = {
        args: argsArray,
        envs: envsObject,
        resources: resourcesArray,
        terminal_output: terminalOutput,
        watch: watchField,
      };

      // Use username as fallback when group_name is empty
      const effectiveGroupName = groupName.trim() || username;

      const response = await fetch("/api/tasks/submit", {
        method: "POST",
        headers: authUtils.getAuthHeaders(token),
        body: JSON.stringify({
          token,
          coordinator_addr: coordinatorAddr,
          group_name: effectiveGroupName,
          tags: tagsArray,
          labels: labelsArray,
          timeout,
          priority,
          task_spec: taskSpec,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(
          `Task submitted successfully! Task ID: ${data.task_id}, UUID: ${data.uuid}`,
        );
        setTags("");
        setLabels("");
        setTimeout("10min");
        setPriority(0);
        setArgs("");
        setEnvs("");
        setResources("");
        setWatchTaskUuid("");
        setWatchState(TaskExecState.EXEC_FINISHED);
        setTerminalOutput(false);
      } else {
        const errorMessage = await handleApiError(response);
        setMessage(errorMessage);
      }
    } catch (err) {
      setMessage(handleNetworkError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleClearForm = () => {
    setTags("");
    setLabels("");
    setTimeout("10min");
    setPriority(0);
    setArgs("");
    setEnvs("");
    setResources("");
    setWatchTaskUuid("");
    setWatchState(TaskExecState.EXEC_FINISHED);
    setTerminalOutput(false);
    setMessage("");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Submit a Task
          </h1>
          <p className="text-gray-600 mb-8">
            Submit a new task for execution. Configure the task specification,
            environment, and dependencies.
          </p>

          {message && (
            <div
              className={`mb-6 p-3 rounded ${
                message.includes("successfully")
                  ? "bg-green-100 border border-green-400 text-green-700"
                  : "bg-red-100 border border-red-400 text-red-700"
              }`}
            >
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div className="relative" ref={dropdownRef}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Group Name
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder={`${username}`}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (Object.keys(userGroups).length === 0) {
                        loadUserGroups();
                      }
                      setShowGroupsDropdown(!showGroupsDropdown);
                    }}
                    className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="Select from your groups"
                  >
                    {groupsLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                    ) : (
                      "👥"
                    )}
                  </button>
                </div>

                {/* Groups Dropdown */}
                {showGroupsDropdown && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {Object.keys(userGroups).length > 0 ? (
                      Object.entries(userGroups).map(([groupName, role]) => (
                        <button
                          key={groupName}
                          type="button"
                          onClick={() => handleGroupSelect(groupName)}
                          className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-gray-50"
                        >
                          <span className="font-medium">{groupName}</span>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            {role}
                          </span>
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-gray-500 text-sm">
                        {groupsLoading
                          ? "Loading groups..."
                          : "No groups found"}
                      </div>
                    )}
                  </div>
                )}
                <div className="text-xs text-gray-500 mt-1">
                  defaults to username: {username}
                </div>
              </div>

              <div className="relative" ref={timeoutRef}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timeout
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={timeout}
                    onChange={(e) => setTimeout(e.target.value)}
                    placeholder="e.g., 10min, 1h, 30s"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowTimeoutDropdown(!showTimeoutDropdown)}
                    className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="Select common timeout values"
                  >
                    ⏱️
                  </button>
                </div>

                {/* Timeout Dropdown */}
                {showTimeoutDropdown && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-1 p-2">
                      {timeoutOptions.map((timeoutOption) => (
                        <button
                          key={timeoutOption}
                          type="button"
                          onClick={() => handleTimeoutSelect(timeoutOption)}
                          className="px-3 py-2 text-left hover:bg-gray-50 rounded text-sm font-medium"
                        >
                          {timeoutOption}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div className="text-xs text-gray-500 mt-1">
                  Examples: 30s, 5min, 1h, 2h, 24h, 1week
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <input
                  type="number"
                  value={priority}
                  onChange={(e) => setPriority(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="-100"
                  max="100"
                />
                <div className="text-xs text-gray-500 mt-1">
                  Higher values = higher priority
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ml-training, python, gpu"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Labels (comma-separated)
                </label>
                <input
                  type="text"
                  value={labels}
                  onChange={(e) => setLabels(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="experiment-1, test, production"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Command Arguments (one per line) *
              </label>
              <textarea
                value={args}
                onChange={(e) => setArgs(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                placeholder="python&#10;train.py&#10;--epochs&#10;100&#10;--lr&#10;0.001"
                required
              />
              <div className="text-xs text-gray-500 mt-1">
                Each line becomes a separate argument. Example: "python",
                "script.py", "--flag", "value"
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Environment Variables (KEY=VALUE, one per line)
              </label>
              <textarea
                value={envs}
                onChange={(e) => setEnvs(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                placeholder="CUDA_VISIBLE_DEVICES=0&#10;PYTHONPATH=/app/src&#10;DEBUG=true"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resources (one per line)
              </label>
              <textarea
                value={resources}
                onChange={(e) => setResources(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                placeholder="artifacts=uuid-12345:result:/app/data/model.pth&#10;attachments=my-file-key:/app/config/config.json"
              />
              <div className="text-xs text-gray-500 mt-1">
                <strong>New format:</strong>
                <br />•{" "}
                <code>
                  artifacts={"{uuid}"}:{"{content_type}"}:{"{local_path}"}
                </code>
                <br />•{" "}
                <code>
                  attachments={"{key}"}:{"{local_path}"}
                </code>
                <br />
                Download remote resources before task execution
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-700 mb-3">
                Watch Configuration
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Watch Task UUID (optional)
                  </label>
                  <input
                    type="text"
                    value={watchTaskUuid}
                    onChange={(e) => setWatchTaskUuid(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    placeholder="uuid-of-task-to-watch"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Watch State
                  </label>
                  <select
                    value={watchState}
                    onChange={(e) =>
                      setWatchState(e.target.value as TaskExecState)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={!watchTaskUuid.trim()}
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
                    <option value={TaskExecState.UPLOAD_RESULT_FINISHED}>
                      Upload Result Finished
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={terminalOutput}
                  onChange={(e) => setTerminalOutput(e.target.checked)}
                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">
                  Enable Terminal Output
                </span>
              </label>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {loading ? "Submitting..." : "Submit Task"}
              </button>

              <button
                type="button"
                onClick={handleClearForm}
                className="px-6 py-3 bg-gray-500 text-white font-medium rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Clear Form
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
