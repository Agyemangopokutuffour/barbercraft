import React, { useState } from "react";

export default function AgentApp() {
  const [task, setTask] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  const handleExecute = async (e) => {
    e.preventDefault();
    if (!task.trim()) return;

    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch(
        "https://barbercraft-agent.onrender.com/agent/execute",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ task, context: {} }),
        },
      );
      const data = await res.json();
      setResponse(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "700px",
        margin: "40px auto",
        fontFamily: "sans-serif",
      }}
    >
      <h2>BarberCraft Agentic Scheduler</h2>
      <form onSubmit={handleExecute}>
        <textarea
          rows={3}
          style={{ width: "100%", padding: "10px" }}
          placeholder="e.g., Find me an available slot with Sarah for a haircut tomorrow and schedule it."
          value={task}
          onChange={(e) => setTask(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading}
          style={{ marginTop: "10px", padding: "8px 16px" }}
        >
          {loading ? "Agent Reasoning..." : "Run Agent Task"}
        </button>
      </form>

      {response && (
        <div style={{ marginTop: "20px" }}>
          <h3>Execution Plan & Steps</h3>
          <ul>
            {response.steps_taken?.map((step, idx) => (
              <li key={idx}>
                <strong>Step {idx + 1}:</strong> {JSON.stringify(step)}
              </li>
            ))}
          </ul>
          <h3>Final Result</h3>
          <p>{response.final_result}</p>
        </div>
      )}
    </div>
  );
}
