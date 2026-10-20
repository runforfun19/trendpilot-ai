
"use client";

import { useState } from "react";

export default function Home() {
  const [message, setMessage] = useState("Not connected yet");
  const [loading, setLoading] = useState(false);

  async function testBackend() {
    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/health");

      if (!response.ok) {
        throw new Error("Request failed");
      }

      const data = await response.json();
      setMessage(JSON.stringify(data));
    } catch (error) {
      setMessage("Connection failed. Check your backend.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white
      flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold text-cyan-400">
        TrendPilot AI
      </h1>

      <p className="mt-4 text-slate-300">
        Hackathon Project
      </p>

      <button
        onClick={testBackend}
        disabled={loading}
        className="mt-6 rounded-lg bg-cyan-400 px-6 py-3
          font-bold text-slate-950"
      >
        {loading ? "Connecting..." : "Test Backend"}
      </button>

      <p className="mt-6 break-all">{message}</p>
    </main>
  );
}
