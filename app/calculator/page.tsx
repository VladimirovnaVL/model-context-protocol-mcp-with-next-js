"use client";

import { useState } from "react";

export default function CalculatorPage() {
  const [weightKg, setWeightKg] = useState("");
  const [heightM, setHeightM] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      // MCP-style request for your BMI tool
      const response = await fetch("/api/http", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    type: "invokeTool",
    name: "calculate-bmi",
    arguments: {
      weightKg: Number(weightKg),
      heightM: Number(heightM),
    },
  }),
});

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();

      // MCP tools return { content: [ { type, text } ] }
      const textResult = data?.content?.[0]?.text || "No result";
      setResult(textResult);
    } catch (err: any) {
      setResult(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>BMI Calculator</h1>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <input
          type="number"
          step="0.1"
          placeholder="Weight (kg)"
          value={weightKg}
          onChange={(e) => setWeightKg(e.target.value)}
          required
        />
        <input
          type="number"
          step="0.01"
          placeholder="Height (m)"
          value={heightM}
          onChange={(e) => setHeightM(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Calculating..." : "Calculate BMI"}
        </button>
      </form>

      {result && (
        <div style={{ marginTop: "20px", fontWeight: "bold" }}>
          {result}
        </div>
      )}
    </div>
  );
}
