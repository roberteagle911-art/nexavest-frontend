import React, { useState } from "react";

function App() {
  const [symbol, setSymbol] = useState("");
  const [amount, setAmount] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const BACKEND_URL = "https://nexavest-backend.vercel.app/api";

  const analyzeStock = async () => {
    if (!symbol || !amount) {
      setError("Please enter both stock symbol and amount.");
      return;
    }

    setError("");
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(`${BACKEND_URL}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol, amount: parseFloat(amount) }),
      });

      if (!response.ok) {
        const msg = await response.text();
        throw new Error(`Backend error ${response.status}: ${msg}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error("❌ API Error:", err);
      setError("Unable to reach NexaVest API. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at top, #00111a, #000)",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Poppins, sans-serif",
        padding: "20px",
      }}
    >
      <h1 style={{ color: "#00e6e6", marginBottom: "20px" }}>NexaVest AI</h1>

      <input
        type="text"
        placeholder="Stock Symbol (e.g. RELIANCE.NS)"
        value={symbol}
        onChange={(e) => setSymbol(e.target.value)}
        style={{
          padding: "10px",
          width: "260px",
          borderRadius: "5px",
          border: "none",
          marginBottom: "10px",
          textAlign: "center",
        }}
      />

      <input
        type="number"
        placeholder="Investment Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        style={{
          padding: "10px",
          width: "260px",
          borderRadius: "5px",
          border: "none",
          marginBottom: "15px",
          textAlign: "center",
        }}
      />

      <button
        onClick={analyzeStock}
        disabled={loading}
        style={{
          padding: "10px 20px",
          backgroundColor: "#00e6e6",
          color: "#000",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          fontWeight: "bold",
          width: "260px",
        }}
      >
        {loading ? "Analyzing..." : "Analyze"}
      </button>

      {error && (
        <p style={{ color: "red", marginTop: "15px", fontWeight: "bold" }}>
          {error}
        </p>
      )}

      {result && (
        <div
          style={{
            marginTop: "20px",
            backgroundColor: "#0d1a1a",
            padding: "15px",
            borderRadius: "10px",
            width: "280px",
            textAlign: "left",
            boxShadow: "0 0 10px rgba(0, 230, 230, 0.2)",
          }}
        >
          <h3 style={{ color: "#00e6e6" }}>📊 Analysis Result</h3>
          <p><strong>Symbol:</strong> {result.symbol}</p>
          <p><strong>Volatility:</strong> {result.volatility}</p>
          <p><strong>Expected Return:</strong> {result.expected_return}</p>
          <p><strong>Risk:</strong> {result.risk_category}</p>
          <p style={{ marginTop: "10px", color: "#ccc" }}>
            {result.ai_recommendation}
          </p>
        </div>
      )}
    </div>
  );
}

export default App;
