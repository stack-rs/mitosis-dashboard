import React, { useState } from "react";
import type {
  TaskSpec,
  SubmitTaskResp,
  RemoteResourceDownload,
} from "../types/schemas";
import { TaskExecState } from "../types/schemas";

interface TaskSubmissionFormProps {
  token: string;
  coordinatorAddr: string;
  username: string;
  onTaskSubmitted: (response: SubmitTaskResp) => void;
}

export default function TaskSubmissionForm({
  token,
  coordinatorAddr,
  username,
  onTaskSubmitted,
}: TaskSubmissionFormProps) {
  const [groupName, setGroupName] = useState(username || "");
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
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Parse command arguments
      const argsArray = args
        .split("\n")
        .map((arg) => arg.trim())
        .filter((arg) => arg.length > 0);

      if (argsArray.length === 0) {
        setError("At least one command argument is required");
        setLoading(false);
        return;
      }

      // Parse environment variables
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

      // Parse tags and labels
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

      // Parse resources (format: remote_type:remote_value:local_path per line)
      const resourcesArray: RemoteResourceDownload[] = [];
      if (resources.trim()) {
        const resourceLines = resources
          .split("\n")
          .filter((line) => line.trim());
        for (const line of resourceLines) {
          const parts = line.trim().split(":");
          if (parts.length >= 3) {
            const [type, value, ...localPathParts] = parts;
            const localPath = localPathParts.join(":");

            if (type === "artifact" && value) {
              resourcesArray.push({
                remote_file: {
                  Artifact: {
                    uuid: value,
                    content_type: "result", // Default content type
                  },
                },
                local_path: localPath,
              });
            } else if (type === "attachment" && value) {
              resourcesArray.push({
                remote_file: {
                  Attachment: {
                    key: value,
                  },
                },
                local_path: localPath,
              });
            }
          }
        }
      }

      // Parse watch field
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

      const response = await fetch("/api/tasks/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          coordinator_addr: coordinatorAddr,
          group_name: groupName,
          tags: tagsArray,
          labels: labelsArray,
          timeout,
          priority,
          task_spec: taskSpec,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(
          `Task submitted successfully! Task ID: ${data.task_id}, UUID: ${data.uuid}`,
        );
        onTaskSubmitted(data);

        // Reset form but keep group name
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
        setError(data.error || "Task submission failed");
      }
    } catch (err) {
      setError("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Submit New Task</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Basic Task Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div>
            <label
              htmlFor="groupName"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Group Name *
            </label>
            <input
              type="text"
              id="groupName"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label
              htmlFor="timeout"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Timeout
            </label>
            <select
              id="timeout"
              value={timeout}
              onChange={(e) => setTimeout(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1min">1 minute</option>
              <option value="5min">5 minutes</option>
              <option value="10min">10 minutes</option>
              <option value="30min">30 minutes</option>
              <option value="1h">1 hour</option>
              <option value="2h">2 hours</option>
              <option value="6h">6 hours</option>
              <option value="12h">12 hours</option>
              <option value="24h">24 hours</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="priority"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Priority
            </label>
            <input
              type="number"
              id="priority"
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

        {/* Tags and Labels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label
              htmlFor="tags"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Tags (comma-separated)
            </label>
            <input
              type="text"
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="ml-training, python, gpu"
            />
          </div>

          <div>
            <label
              htmlFor="labels"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Labels (comma-separated)
            </label>
            <input
              type="text"
              id="labels"
              value={labels}
              onChange={(e) => setLabels(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="experiment-1, test, production"
            />
          </div>
        </div>

        {/* Command Arguments */}
        <div className="mb-6">
          <label
            htmlFor="args"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Command Arguments (one per line) *
          </label>
          <textarea
            id="args"
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

        {/* Environment Variables */}
        <div className="mb-6">
          <label
            htmlFor="envs"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Environment Variables (KEY=VALUE, one per line)
          </label>
          <textarea
            id="envs"
            value={envs}
            onChange={(e) => setEnvs(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            placeholder="CUDA_VISIBLE_DEVICES=0&#10;PYTHONPATH=/app/src&#10;DEBUG=true"
          />
          <div className="text-xs text-gray-500 mt-1">
            Set environment variables that will be available to your task
          </div>
        </div>

        {/* Resources */}
        <div className="mb-6">
          <label
            htmlFor="resources"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Resources (type:value:local_path, one per line)
          </label>
          <textarea
            id="resources"
            value={resources}
            onChange={(e) => setResources(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            placeholder="artifact:uuid-12345:/app/data/model.pth&#10;attachment:my-file-key:/app/config/config.json"
          />
          <div className="text-xs text-gray-500 mt-1">
            Download remote resources before task execution. Use
            "artifact:UUID:path" for artifacts or "attachment:key:path" for
            attachments
          </div>
        </div>

        {/* Watch Field */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-700 mb-3">
            Watch Configuration
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="watchTaskUuid"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Watch Task UUID (optional)
              </label>
              <input
                type="text"
                id="watchTaskUuid"
                value={watchTaskUuid}
                onChange={(e) => setWatchTaskUuid(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                placeholder="uuid-of-task-to-watch"
              />
              <div className="text-xs text-gray-500 mt-1">
                Watch another task and wait for it to reach a specific state
              </div>
            </div>

            <div>
              <label
                htmlFor="watchState"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Target Watch State
              </label>
              <select
                id="watchState"
                value={watchState}
                onChange={(e) => setWatchState(e.target.value as TaskExecState)}
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
              <div className="text-xs text-gray-500 mt-1">
                State to wait for in the watched task
              </div>
            </div>
          </div>
        </div>

        {/* Options */}
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
          <div className="text-xs text-gray-500 mt-1">
            Stream stdout/stderr to terminal in real-time
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {loading ? "Submitting Task..." : "Submit Task"}
          </button>
        </div>
      </form>
    </div>
  );
}
