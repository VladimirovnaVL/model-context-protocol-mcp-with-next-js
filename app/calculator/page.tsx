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
      // Use the single MCP route that handles both MCP protocol and simple HTTP requests
      const response = await fetch("/mcp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolName: "calculate-bmi",
          arguments: {
            weightKg: Number(weightKg),
            heightM: Number(heightM),
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setResult(data.result);
      } else {
        throw new Error(data.error || 'Unknown error');
      }
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
