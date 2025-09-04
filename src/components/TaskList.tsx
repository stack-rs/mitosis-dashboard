import React from "react";
import { type TaskQueryInfo, TaskState } from "../types/schemas";
import { formatRustTimeAgo } from "../utils/timeUtils";
import TaskSpecDisplay from "./TaskSpecDisplay";

interface TaskListProps {
  tasks: TaskQueryInfo[];
  totalCount: number;
  loading?: boolean;
  onTaskClick: (task: TaskQueryInfo) => void;
  onRefresh: () => void;
}

const getStateColor = (state: TaskState): string => {
  switch (state) {
    case TaskState.PENDING:
      return "bg-yellow-100 text-yellow-800 border-yellow-300";
    case TaskState.READY:
      return "bg-blue-100 text-blue-800 border-blue-300";
    case TaskState.RUNNING:
      return "bg-green-100 text-green-800 border-green-300";
    case TaskState.FINISHED:
      return "bg-gray-100 text-gray-800 border-gray-300";
    case TaskState.CANCELLED:
      return "bg-red-100 text-red-800 border-red-300";
    case TaskState.UNKNOWN:
    default:
      return "bg-gray-100 text-gray-600 border-gray-300";
  }
};

const getStateIcon = (state: TaskState): string => {
  switch (state) {
    case TaskState.PENDING:
      return "⏳";
    case TaskState.READY:
      return "🎯";
    case TaskState.RUNNING:
      return "⚡";
    case TaskState.FINISHED:
      return "✅";
    case TaskState.CANCELLED:
      return "❌";
    case TaskState.UNKNOWN:
    default:
      return "❓";
  }
};

export default function TaskList({
  tasks,
  totalCount,
  loading,
  onTaskClick,
  onRefresh,
}: TaskListProps) {
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">Loading tasks...</span>
        </div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md p-8 text-center">
        <div className="text-gray-500 mb-4">
          <div className="text-4xl mb-2">📋</div>
          <div className="text-lg">No tasks found</div>
          <div className="text-sm">Try adjusting your search criteria</div>
        </div>
        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Results Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Found {tasks.length} task{tasks.length !== 1 ? "s" : ""}
            {totalCount !== tasks.length && (
              <span className="text-gray-500"> (of {totalCount} total)</span>
            )}
          </h3>
        </div>
        <button
          onClick={onRefresh}
          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Tasks Grid */}
      <div className="grid gap-4">
        {tasks.map((task) => (
          <div
            key={task.uuid}
            onClick={() => onTaskClick(task)}
            className="bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-all duration-200 border-l-4 border-blue-500 hover:border-l-6"
          >
            {/* Task Header */}
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div className="text-2xl">{getStateIcon(task.state)}</div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">
                    Task #{task.task_id}
                  </h4>
                  <p className="text-sm text-gray-500 font-mono">{task.uuid}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${getStateColor(task.state)}`}
                >
                  {task.state}
                </span>
              </div>
            </div>

            {/* Task Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
              <div>
                <span className="font-medium text-gray-700">Creator:</span>
                <div className="text-gray-600 truncate">
                  {task.creator_username}
                </div>
              </div>
              <div>
                <span className="font-medium text-gray-700">Group:</span>
                <div className="text-gray-600 truncate">{task.group_name}</div>
              </div>
              <div>
                <span className="font-medium text-gray-700">Priority:</span>
                <div className="text-gray-600">
                  {task.priority === 0
                    ? "Normal"
                    : task.priority > 0
                      ? `High (${task.priority})`
                      : `Low (${task.priority})`}
                </div>
              </div>
              <div>
                <span className="font-medium text-gray-700">Timeout:</span>
                <div className="text-gray-600">
                  {Math.floor(task.timeout / 60)}m
                </div>
              </div>
            </div>

            {/* Time Information */}
            <div className="flex justify-between items-center text-sm mb-3">
              <div className="text-gray-600">
                <span className="font-medium">Created:</span>{" "}
                {formatRustTimeAgo(task.created_at)}
              </div>
              <div className="text-gray-600">
                <span className="font-medium">Updated:</span>{" "}
                {formatRustTimeAgo(task.updated_at)}
              </div>
            </div>

            {/* Tags and Labels */}
            {(task.tags.length > 0 || task.labels.length > 0) && (
              <div className="mb-3 space-y-2">
                {task.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    <span className="text-xs font-medium text-gray-700">
                      Tags:
                    </span>
                    {task.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                {task.labels.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    <span className="text-xs font-medium text-gray-700">
                      Labels:
                    </span>
                    {task.labels.map((label, index) => (
                      <span
                        key={index}
                        className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Task Specification */}
            {task.spec && <TaskSpecDisplay spec={task.spec} compact={true} />}

            {/* Click hint */}
            <div className="mt-3 pt-2 border-t border-gray-100">
              <span className="text-xs text-gray-500">
                Click to view details →
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Load More Hint */}
      {totalCount > tasks.length && (
        <div className="mt-6 text-center">
          <div className="text-sm text-gray-500 mb-2">
            Showing {tasks.length} of {totalCount} total tasks
          </div>
          <div className="text-xs text-gray-400">
            Use pagination controls in the query form to load more tasks
          </div>
        </div>
      )}
    </div>
  );
}
