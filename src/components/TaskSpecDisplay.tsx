import React from "react";
import type { TaskSpec, TaskExecState } from "../types/schemas";

interface TaskSpecDisplayProps {
  spec: TaskSpec;
  compact?: boolean;
}

export default function TaskSpecDisplay({
  spec,
  compact = false,
}: TaskSpecDisplayProps) {
  if (!spec) {
    return (
      <div className="text-gray-500 text-sm italic">
        No task specification available
      </div>
    );
  }

  if (compact) {
    // Compact view for TaskList
    return (
      <div className="bg-gray-50 p-3 rounded-md space-y-2">
        {/* Command */}
        {spec.args && spec.args.length > 0 && (
          <div>
            <span className="text-xs font-medium text-gray-700">Command:</span>
            <code className="block text-sm text-gray-800 font-mono mt-1 break-all">
              {spec.args.join(" ")}
            </code>
          </div>
        )}

        {/* Show additional info if present */}
        {(spec.envs ||
          spec.resources ||
          spec.terminal_output ||
          spec.watch) && (
          <div className="text-xs text-gray-600">
            {spec.envs && Object.keys(spec.envs).length > 0 && (
              <span className="mr-3">
                📝 {Object.keys(spec.envs).length} env vars
              </span>
            )}
            {spec.resources && spec.resources.length > 0 && (
              <span className="mr-3">📁 {spec.resources.length} resources</span>
            )}
            {spec.terminal_output && (
              <span className="mr-3">💻 terminal output</span>
            )}
            {spec.watch && <span className="mr-3">👁️ watching</span>}
          </div>
        )}
      </div>
    );
  }

  // Full detailed view for TaskQueryByUuid
  return (
    <div className="space-y-4">
      {/* Command (only display the command without detailed arguments breakdown) */}
      {spec.args && spec.args.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">Command</h4>
          <div className="bg-gray-50 p-4 rounded-md">
            <code className="text-sm text-gray-800 font-mono break-all">
              {spec.args.join(" ")}
            </code>
          </div>
        </div>
      )}

      {/* Environment Variables */}
      {spec.envs && Object.keys(spec.envs).length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            Environment Variables
          </h4>
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="space-y-2">
              {Object.entries(spec.envs).map(([key, value]) => (
                <div key={key} className="flex">
                  <span className="font-mono text-sm text-blue-600 min-w-0 flex-shrink-0">
                    {key}=
                  </span>
                  <span className="font-mono text-sm text-gray-800 ml-1 break-all">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Resources */}
      {spec.resources && spec.resources.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            Resources
          </h4>
          <div className="space-y-3">
            {spec.resources.map((resource, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-md">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-700 mb-1">
                      Local Path:{" "}
                      <code className="text-blue-600">
                        {resource.local_path}
                      </code>
                    </div>
                    <div className="text-sm text-gray-600">
                      {resource.remote_file.Artifact ? (
                        <div>
                          <span className="font-medium">Artifact UUID:</span>{" "}
                          <code className="text-purple-600">
                            {resource.remote_file.Artifact.uuid}
                          </code>
                          {resource.remote_file.Artifact.content_type && (
                            <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                              {resource.remote_file.Artifact.content_type}
                            </span>
                          )}
                        </div>
                      ) : resource.remote_file.Attachment ? (
                        <div>
                          <span className="font-medium">Attachment Key:</span>{" "}
                          <code className="text-green-600">
                            {resource.remote_file.Attachment.key}
                          </code>
                        </div>
                      ) : (
                        <div className="text-red-500">
                          Invalid resource format
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Options - Always show this section to display all task options */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-2">Options</h4>
        <div className="bg-gray-50 p-4 rounded-md space-y-3">
          {/* Environment Variables Summary */}
          {spec.envs && Object.keys(spec.envs).length > 0 && (
            <div className="flex items-center">
              <span className="text-2xl mr-3">📝</span>
              <div className="text-sm">
                <div className="font-medium">
                  Environment Variables: {Object.keys(spec.envs).length} set
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {Object.keys(spec.envs).slice(0, 3).join(", ")}
                  {Object.keys(spec.envs).length > 3 &&
                    `, +${Object.keys(spec.envs).length - 3} more`}
                </div>
              </div>
            </div>
          )}

          {/* Resources Summary */}
          {spec.resources && spec.resources.length > 0 && (
            <div className="flex items-center">
              <span className="text-2xl mr-3">📁</span>
              <div className="text-sm">
                <div className="font-medium">
                  Resources: {spec.resources.length} configured
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {spec.resources
                    .slice(0, 2)
                    .map((r) => r.local_path)
                    .join(", ")}
                  {spec.resources.length > 2 &&
                    `, +${spec.resources.length - 2} more`}
                </div>
              </div>
            </div>
          )}

          {/* Terminal Output */}
          <div className="flex items-center">
            <span className="text-2xl mr-3">💻</span>
            <div className="text-sm">
              <div className="font-medium">
                Terminal Output:{" "}
                <span
                  className={
                    spec.terminal_output ? "text-green-600" : "text-gray-500"
                  }
                >
                  {spec.terminal_output ? "✅ Enabled" : "❌ Disabled"}
                </span>
              </div>
            </div>
          </div>

          {/* Watch Configuration */}
          {spec.watch ? (
            <div className="flex items-center">
              <span className="text-2xl mr-3">👁️</span>
              <div className="text-sm">
                <div className="font-medium">
                  Watching Task:{" "}
                  <code className="text-blue-600">{spec.watch[0]}</code>
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  Target State:{" "}
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    {spec.watch[1]}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center">
              <span className="text-2xl mr-3">👁️</span>
              <div className="text-sm">
                <div className="font-medium text-gray-500">
                  Watch: Not configured
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Empty spec message */}
      {(!spec.args || spec.args.length === 0) &&
        (!spec.envs || Object.keys(spec.envs).length === 0) &&
        (!spec.resources || spec.resources.length === 0) &&
        spec.terminal_output === undefined &&
        !spec.watch && (
          <div className="text-gray-500 text-center py-8">
            <div className="text-4xl mb-2">📋</div>
            <div>No task specification details available</div>
          </div>
        )}
    </div>
  );
}

