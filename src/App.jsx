import React, { useState } from "react";

const API_BASE = "https://nexavest-backend.vercel.app"; // ✅ Make sure this matches your backend URL

function App() {
  const [symbol, setSymbol] = useState("");
  const [amount, setAmount] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    if (!symbol || !amount) {
      setError("Please enter stock symbol and amount.");
      return;
    }
    setError("");
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(`${API_BASE}/ai_recommend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol, amount: parseFloat(amount) }),
      });

      if (!response.ok) {
        throw new Error("Backend not reachable or returned error.");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setError("Unable to reach NexaVest API. Please check backend status.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        fontFamily: "Poppins, sans-serif",
        background: "radial-gradient(circle at top, #000814, #000)",
        color: "#ccc",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          backgroundColor: "#111",
          padding: "2rem",
          borderRadius: "16px",
          width: "90%",
          maxWidth: "400px",
          textAlign: "center",
          boxShadow: "0 0 25px rgba(0, 255, 150, 0.2)",
        }}
      >
        <h1
          style={{
            color: "#00FFC6",
            fontWeight: "bold",
            fontSize: "2rem",
            marginBottom: "1rem",
          }}
        >
          NexaVest
        </h1>

        <input
          placeholder="Enter Stock Symbol (e.g. RELIANCE.NS)"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "8px",
            marginBottom: "10px",
            border: "none",
            background: "#e0e0e0",
            color: "#000",
            textAlign: "center",
            fontWeight: "bold",
          }}
        />

        <input
          type="number"
          placeholder="Enter Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "8px",
            marginBottom: "10px",
            border: "none",
            background: "#e0e0e0",
            color: "#000",
            textAlign: "center",
            fontWeight: "bold",
          }}
        />

        <button
          onClick={handleAnalyze}
          style={{
            width: "100%",
            background: "linear-gradient(90deg, #00FFC6, #0077FF)",
            color: "#000",
            fontWeight: "bold",
            padding: "10px",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            marginBottom: "10px",
          }}
        >
          {loading ? "Analyzing..." : "Analyze"}
        </button>

        {error && <p style={{ color: "#ff6b6b" }}>{error}</p>}

        {result && (
          <div style={{ textAlign: "left", marginTop: "15px" }}>
            <p>
              <strong>Volatility:</strong> {result.volatility}
            </p>
            <p>
              <strong>Expected Return:</strong> {result.expected_return}
            </p>
            <p>
              <strong>Risk Category:</strong> {result.risk_category}
            </p>
            <p>
              <strong>AI Recommendation:</strong> {result.ai_recommendation}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
