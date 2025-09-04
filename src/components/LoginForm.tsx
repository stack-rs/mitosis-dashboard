import React, { useState } from "react";

interface LoginFormProps {
  onLogin: (
    token: string,
    username: string,
    coordinatorAddr: string,
    retain: boolean,
  ) => void;
}

export default function LoginForm({ onLogin }: LoginFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [coordinatorAddr, setCoordinatorAddr] = useState(
    "http://localhost:5000",
  );
  const [retain, setRetain] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    console.log("Login attempt:", { username, coordinatorAddr, retain });

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
          retain,
          coordinator_addr: coordinatorAddr,
        }),
      });

      // console.log("API Response status:", response.status);

      const data = await response.json();
      // console.log("API Response data:", data);

      if (response.ok && data.token) {
        // console.log("Login successful, calling onLogin");
        onLogin(data.token, username, coordinatorAddr, retain);
      } else {
        const errorMsg =
          data.error || `Login failed with status ${response.status}`;
        console.error("Login failed:", errorMsg);
        setError(errorMsg);
      }
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Network error occurred";
      console.error("Login error:", err);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">Login to Mitosis</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="coordinator"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Coordinator Address
          </label>
          <input
            type="text"
            id="coordinator"
            value={coordinatorAddr}
            onChange={(e) => setCoordinatorAddr(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="username"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Username
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="mb-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={retain}
              onChange={(e) => setRetain(e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Keep me logged in</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
