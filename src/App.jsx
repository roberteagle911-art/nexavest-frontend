import React, { useState } from "react";

const API_BASE = "https://nexavest-backend-evlu3d27w-roberteagle911-arts-projects.vercel.app";

export default function App() {
  const [symbol, setSymbol] = useState("");
  const [amount, setAmount] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    if (!symbol || !amount) {
      setError("Please enter both stock symbol and amount.");
      return;
    }

    setError("");
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(`${API_BASE}/ai_recommend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          symbol: symbol.toUpperCase(),
          amount: parseFloat(amount),
        }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Unable to reach NexaVest AI API. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(145deg, #020024, #090979, #00d4ff)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <div
        style={{
          background: "rgba(255, 255, 255, 0.1)",
          padding: "2.5rem",
          borderRadius: "20px",
          width: "90%",
          maxWidth: "450px",
          boxShadow: "0 0 20px rgba(0, 0, 0, 0.3)",
          backdropFilter: "blur(10px)",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: "2.2rem",
            fontWeight: "bold",
            marginBottom: "1rem",
            color: "#00d4ff",
          }}
        >
          NexaVest AI
        </h1>
        <p style={{ marginBottom: "1.5rem", opacity: 0.8 }}>
          AI-powered stock analysis for smart investors 🚀
        </p>

        <input
          type="text"
          placeholder="Enter Stock Symbol (e.g., RELIANCE.NS)"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          style={{
            width: "100%",
            padding: "0.8rem",
            marginBottom: "1rem",
            borderRadius: "10px",
            border: "none",
            outline: "none",
            textAlign: "center",
            fontSize: "1rem",
          }}
        />

        <input
          type="number"
          placeholder="Enter Amount (₹)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{
            width: "100%",
            padding: "0.8rem",
            marginBottom: "1rem",
            borderRadius: "10px",
            border: "none",
            outline: "none",
            textAlign: "center",
            fontSize: "1rem",
          }}
        />

        <button
          onClick={handleAnalyze}
          disabled={loading}
          style={{
            width: "100%",
            padding: "0.8rem",
            background: "linear-gradient(to right, #00d4ff, #007bff)",
            color: "#fff",
            fontSize: "1.1rem",
            fontWeight: "bold",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            transition: "0.3s",
          }}
        >
          {loading ? "Analyzing..." : "Analyze"}
        </button>

        {error && (
          <p style={{ marginTop: "1rem", color: "#ff6b6b", fontWeight: "600" }}>
            {error}
          </p>
        )}

        {result && (
          <div
            style={{
              marginTop: "1.5rem",
              background: "rgba(0,0,0,0.3)",
              padding: "1.2rem",
              borderRadius: "12px",
              textAlign: "left",
            }}
          >
            <h3 style={{ color: "#00d4ff", marginBottom: "0.5rem" }}>
              Analysis Result 📊
            </h3>
            <p>
              <strong>Symbol:</strong> {result.symbol}
            </p>
            <p>
              <strong>Volatility:</strong> {result.volatility}
            </p>
            <p>
              <strong>Expected Return:</strong> {result.expected_return}
            </p>
            <p>
              <strong>Risk Category:</strong> {result.risk_category}
            </p>
            <p style={{ marginTop: "0.8rem", color: "#b0eaff" }}>
              {result.ai_recommendation}
            </p>
          </div>
        )}

        <p
          style={{
            marginTop: "1.5rem",
            fontSize: "0.8rem",
            color: "rgba(255,255,255,0.7)",
          }}
        >
          © 2025 NexaVest | Powered by AI Market Intelligence
        </p>
      </div>
    </div>
  );
          }
