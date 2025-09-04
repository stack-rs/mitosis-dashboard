import React, { useState } from "react";
import { TaskState, type TasksQueryResp } from "../types/schemas";

interface TaskQueryFormProps {
  token: string;
  coordinatorAddr: string;
  username: string;
  onTasksFound: (response: TasksQueryResp) => void;
}

export default function TaskQueryForm({
  token,
  coordinatorAddr,
  username,
  onTasksFound,
}: TaskQueryFormProps) {
  const [creatorUsernames, setCreatorUsernames] = useState("");
  const [groupName, setGroupName] = useState("");
  const [tags, setTags] = useState("");
  const [labels, setLabels] = useState("");
  const [states, setStates] = useState<TaskState[]>([]);
  const [exitStatus, setExitStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [limit, setLimit] = useState("10");
  const [offset, setOffset] = useState("0");
  const [count, setCount] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const taskStateOptions = Object.values(TaskState);

  const handleStateChange = (state: TaskState, checked: boolean) => {
    if (checked) {
      setStates((prev) => [...prev, state]);
    } else {
      setStates((prev) => prev.filter((s) => s !== state));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const queryPayload: any = {
        token,
        coordinator_addr: coordinatorAddr,
        count,
      };

      // Add optional filters only if they have values
      if (creatorUsernames.trim()) {
        queryPayload.creator_usernames = creatorUsernames
          .split(",")
          .map((u) => u.trim())
          .filter((u) => u);
      }
      if (groupName.trim()) {
        queryPayload.group_name = groupName.trim();
      }
      if (tags.trim()) {
        queryPayload.tags = tags
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t);
      }
      if (labels.trim()) {
        queryPayload.labels = labels
          .split(",")
          .map((l) => l.trim())
          .filter((l) => l);
      }
      if (states.length > 0) {
        queryPayload.states = states;
      }
      if (exitStatus.trim()) {
        queryPayload.exit_status = exitStatus.trim();
      }
      if (priority.trim()) {
        queryPayload.priority = priority.trim();
      }
      if (limit.trim() && parseInt(limit) > 0) {
        queryPayload.limit = parseInt(limit);
      }
      if (offset.trim() && parseInt(offset) >= 0) {
        queryPayload.offset = parseInt(offset);
      }

      const response = await fetch("/api/tasks/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(queryPayload),
      });

      const data = await response.json();

      if (response.ok) {
        onTasksFound(data);
      } else {
        setError(data.error || "Query failed");
      }
    } catch (err) {
      setError("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFilter = (
    filter:
      | "my-tasks"
      | "running"
      | "non-finished"
      | "finished"
      | "cancelled"
      | "success",
  ) => {
    // Reset form first
    setCreatorUsernames("");
    setGroupName("");
    setStates([]);
    setExitStatus("");
    setTags("");
    setLabels("");
    setPriority("");

    switch (filter) {
      case "my-tasks":
        setCreatorUsernames(username);
        break;
      case "running":
        setStates([TaskState.RUNNING]);
        break;
      case "non-finished":
        setStates([TaskState.PENDING, TaskState.READY, TaskState.RUNNING]);
        break;
      case "finished":
        setStates([TaskState.FINISHED]);
        break;
      case "cancelled":
        setStates([TaskState.CANCELLED]);
        break;
      case "success":
        setStates([TaskState.FINISHED]);
        setExitStatus("0");
        break;
    }
  };

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Query Tasks</h2>

        {/* Quick Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleQuickFilter("my-tasks")}
            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-sm"
          >
            My Tasks
          </button>
          <button
            onClick={() => handleQuickFilter("running")}
            className="px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 text-sm"
          >
            Running
          </button>
          <button
            onClick={() => handleQuickFilter("non-finished")}
            className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200 text-sm"
          >
            Non-Finished
          </button>
          <button
            onClick={() => handleQuickFilter("finished")}
            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
          >
            Finished
          </button>
          <button
            onClick={() => handleQuickFilter("cancelled")}
            className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm"
          >
            Cancelled
          </button>
          <button
            onClick={() => handleQuickFilter("success")}
            className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-md hover:bg-emerald-200 text-sm"
          >
            Success
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Basic Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div>
            <label
              htmlFor="creatorUsernames"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Creator Usernames
            </label>
            <input
              type="text"
              id="creatorUsernames"
              value={creatorUsernames}
              onChange={(e) => setCreatorUsernames(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="user1, user2"
            />
          </div>

          <div>
            <label
              htmlFor="groupName"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Group Name
            </label>
            <input
              type="text"
              id="groupName"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="my-group"
            />
          </div>

          <div>
            <label
              htmlFor="exitStatus"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Exit Status
            </label>
            <input
              type="text"
              id="exitStatus"
              value={exitStatus}
              onChange={(e) => setExitStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0 for success"
            />
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
              placeholder="ml-training, gpu"
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
              placeholder="experiment-1, prod"
            />
          </div>
        </div>

        {/* Task States */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Task States
          </label>
          <div className="flex flex-wrap gap-2">
            {taskStateOptions.map((state) => (
              <label key={state} className="flex items-center">
                <input
                  type="checkbox"
                  checked={states.includes(state)}
                  onChange={(e) => handleStateChange(state, e.target.checked)}
                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">{state}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Pagination and Options */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label
              htmlFor="limit"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Limit
            </label>
            <input
              type="number"
              id="limit"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
              max="100"
            />
          </div>

          <div>
            <label
              htmlFor="offset"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Offset
            </label>
            <input
              type="number"
              id="offset"
              value={offset}
              onChange={(e) => setOffset(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
            />
          </div>

          <div>
            <label
              htmlFor="priority"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Priority
            </label>
            <input
              type="text"
              id="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
            />
          </div>

          <div className="flex items-end">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={count}
                onChange={(e) => setCount(e.target.checked)}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Count Only</span>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-green-500 text-white font-medium rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {loading ? "Searching..." : "Search Tasks"}
          </button>
        </div>
      </form>
    </div>
  );
}
