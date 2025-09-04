import React, { useState } from "react";

interface TaskLabelsManagerProps {
  token: string;
  coordinatorAddr: string;
  username: string;
}

export default function TaskLabelsManager({
  token,
  coordinatorAddr,
  username,
}: TaskLabelsManagerProps) {
  const [taskUuid, setTaskUuid] = useState("");
  const [labelsInput, setLabelsInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!taskUuid.trim()) {
      setError("Please enter a task UUID");
      return;
    }

    if (!labelsInput.trim()) {
      setError("Please enter at least one label");
      return;
    }

    // Parse comma-separated labels
    const labels = labelsInput
      .split(",")
      .map((label) => label.trim())
      .filter((label) => label.length > 0);

    if (labels.length === 0) {
      setError("Please enter valid labels");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/tasks/${taskUuid}/labels`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          coordinator_addr: coordinatorAddr,
          labels,
        }),
      });

      if (response.ok) {
        setSuccess("Task labels updated successfully!");
        setTaskUuid("");
        setLabelsInput("");
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to update task labels");
      }
    } catch (err) {
      setError("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Manage Task Labels
      </h2>

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
        <div className="mb-6">
          <label
            htmlFor="taskUuid"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Task UUID
          </label>
          <input
            type="text"
            id="taskUuid"
            value={taskUuid}
            onChange={(e) => setTaskUuid(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter task UUID"
            disabled={loading}
          />
        </div>

        <div className="mb-6">
          <label
            htmlFor="labels"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Labels (comma-separated)
          </label>
          <input
            type="text"
            id="labels"
            value={labelsInput}
            onChange={(e) => setLabelsInput(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="ml-training, gpu, experiment-1"
            disabled={loading}
          />
          <p className="text-sm text-gray-600 mt-1">
            Enter labels separated by commas. Each label should be a simple
            string (e.g., "training", "production", "gpu").
          </p>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || !taskUuid.trim() || !labelsInput.trim()}
            className="px-6 py-3 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {loading ? "Updating..." : "Update Task Labels"}
          </button>
        </div>
      </form>
    </div>
  );
}

