import React from "react";
import type { TaskSpec } from "../types/schemas";

interface TaskSpecDisplayProps {
  spec: TaskSpec;
  compact?: boolean;
}

export default function TaskSpecDisplay({
  spec,
  compact = false,
}: TaskSpecDisplayProps) {
  if (compact) {
    return (
      <div className="text-sm text-gray-600">
        <div className="font-mono">{spec.args.join(" ")}</div>
        {Object.keys(spec.envs).length > 0 && (
          <div className="text-xs text-gray-500 mt-1">
            Env vars: {Object.keys(spec.envs).length}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-medium text-gray-900 mb-2">Command</h4>
        <div className="bg-gray-50 p-3 rounded-lg font-mono text-sm">
          {spec.args.join(" ")}
        </div>
      </div>

      {Object.keys(spec.envs).length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-2">
            Environment Variables
          </h4>
          <div className="bg-gray-50 p-3 rounded-lg">
            {Object.entries(spec.envs).map(([key, value]) => (
              <div key={key} className="font-mono text-sm">
                <span className="text-blue-600">{key}</span>=
                <span className="text-gray-700">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {spec.resources && spec.resources.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Resources</h4>
          <div className="space-y-2">
            {spec.resources.map((resource, index) => (
              <div key={index} className="bg-gray-50 p-3 rounded-lg text-sm">
                <div className="font-mono">{resource.source_key}</div>
                <div className="text-gray-600">→ {resource.target_path}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-4 text-sm text-gray-600">
        <div>Terminal Output: {spec.terminal_output ? "Yes" : "No"}</div>
        {spec.watch && (
          <div>
            Watch: {spec.watch[0]} until {spec.watch[1]}
          </div>
        )}
      </div>
    </div>
  );
}
