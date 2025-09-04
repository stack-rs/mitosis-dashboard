import React, { useState, useEffect } from "react";

interface RedisConnectionProps {
  token: string;
  coordinatorAddr: string;
  username: string;
}

interface RedisConnectionInfo {
  host: string;
  port: number;
  password?: string;
  db: number;
}

export default function RedisConnection({
  token,
  coordinatorAddr,
  username,
}: RedisConnectionProps) {
  const [connectionInfo, setConnectionInfo] =
    useState<RedisConnectionInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [testResult, setTestResult] = useState<string | null>(null);

  const fetchConnectionInfo = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/redis/connection`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          coordinator_addr: coordinatorAddr,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setConnectionInfo(data);
      } else {
        setError(data.error || "Failed to fetch Redis connection info");
      }
    } catch (err) {
      setError("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    if (!connectionInfo) return;

    setLoading(true);
    setTestResult(null);
    setError("");

    try {
      const response = await fetch(`/api/redis/test`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          coordinator_addr: coordinatorAddr,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setTestResult("Connection test successful!");
      } else {
        setTestResult(`Connection test failed: ${data.error}`);
      }
    } catch (err) {
      setTestResult("Connection test failed: Network error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnectionInfo();
  }, []);

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Redis Connection
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {testResult && (
        <div
          className={`mb-4 p-3 border rounded ${
            testResult.includes("successful")
              ? "bg-green-100 border-green-400 text-green-700"
              : "bg-red-100 border-red-400 text-red-700"
          }`}
        >
          {testResult}
        </div>
      )}

      {loading && !connectionInfo && (
        <div className="text-center py-8">
          <div className="text-lg text-gray-600">
            Loading Redis connection information...
          </div>
        </div>
      )}

      {connectionInfo && (
        <div className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Connection Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Host
                </label>
                <div className="bg-white px-3 py-2 border border-gray-300 rounded-md">
                  <code className="text-sm font-mono">
                    {connectionInfo.host}
                  </code>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Port
                </label>
                <div className="bg-white px-3 py-2 border border-gray-300 rounded-md">
                  <code className="text-sm font-mono">
                    {connectionInfo.port}
                  </code>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Database
                </label>
                <div className="bg-white px-3 py-2 border border-gray-300 rounded-md">
                  <code className="text-sm font-mono">{connectionInfo.db}</code>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="bg-white px-3 py-2 border border-gray-300 rounded-md">
                  <code className="text-sm font-mono">
                    {connectionInfo.password ? "••••••••" : "Not set"}
                  </code>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Connection String
            </h3>
            <div className="bg-white px-3 py-2 border border-gray-300 rounded-md">
              <code className="text-sm font-mono break-all">
                redis://{connectionInfo.password ? "••••••••@" : ""}
                {connectionInfo.host}:{connectionInfo.port}/{connectionInfo.db}
              </code>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Use this connection string with your Redis client applications.
            </p>
          </div>

          <div className="bg-yellow-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Usage Examples
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-800 mb-2">
                  Python (redis-py)
                </h4>
                <pre className="bg-gray-800 text-green-400 p-3 rounded-md text-sm overflow-x-auto">
                  {`import redis

r = redis.Redis(
    host='${connectionInfo.host}',
    port=${connectionInfo.port},
    db=${connectionInfo.db}${connectionInfo.password ? `,\n    password='your_password'` : ""}
)

# Test connection
r.ping()  # Should return True`}
                </pre>
              </div>

              <div>
                <h4 className="font-medium text-gray-800 mb-2">
                  Node.js (ioredis)
                </h4>
                <pre className="bg-gray-800 text-green-400 p-3 rounded-md text-sm overflow-x-auto">
                  {`const Redis = require('ioredis');

const redis = new Redis({
  host: '${connectionInfo.host}',
  port: ${connectionInfo.port},
  db: ${connectionInfo.db}${connectionInfo.password ? `,\n  password: 'your_password'` : ""}
});

// Test connection
redis.ping().then(result => console.log(result));`}
                </pre>
              </div>

              <div>
                <h4 className="font-medium text-gray-800 mb-2">Redis CLI</h4>
                <pre className="bg-gray-800 text-green-400 p-3 rounded-md text-sm overflow-x-auto">
                  {`redis-cli -h ${connectionInfo.host} -p ${connectionInfo.port} -n ${connectionInfo.db}${connectionInfo.password ? " -a your_password" : ""}`}
                </pre>
              </div>
            </div>
          </div>

          <div className="flex gap-4 justify-end">
            <button
              onClick={fetchConnectionInfo}
              disabled={loading}
              className="px-6 py-3 bg-gray-500 text-white font-medium rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              {loading ? "Refreshing..." : "Refresh Info"}
            </button>
            <button
              onClick={testConnection}
              disabled={loading}
              className="px-6 py-3 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {loading ? "Testing..." : "Test Connection"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

