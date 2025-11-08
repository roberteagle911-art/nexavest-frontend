import React, { useState } from "react";

function App() {
  const [symbol, setSymbol] = useState("");
  const [amount, setAmount] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyzeInvestment = async () => {
    setLoading(true);
    try {
      const res1 = await fetch("https://nexavest-backend.vercel.app/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol, amount }),
      });
      const data1 = await res1.json();

      const res2 = await fetch("https://nexavest-backend.vercel.app/ai_recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol, amount }),
      });
      const data2 = await res2.json();

      setResult({
        ...data1,
        ai_recommendation: data2.ai_recommendation,
      });
    } catch (error) {
      alert("Error connecting to NexaVest API");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        background: "black",
        color: "white",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      <h1>NexaVest</h1>
      <input
        placeholder="Stock Symbol (e.g. AAPL)"
        value={symbol}
        onChange={(e) => setSymbol(e.target.value)}
        style={{ marginBottom: "10px", padding: "8px" }}
      />
      <input
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        style={{ marginBottom: "10px", padding: "8px" }}
      />
      <button onClick={analyzeInvestment} style={{ padding: "10px 20px" }}>
        {loading ? "Analyzing..." : "Analyze"}
      </button>

      {result && (
        <div style={{ marginTop: "20px" }}>
          <p>Volatility: {result.volatility}</p>
          <p>Expected Return: {result.expected_return}</p>
          <p>Risk Category: {result.risk_category}</p>
          <p>AI Recommendation: {result.ai_recommendation}</p>
        </div>
      )}
    </div>
  );
}

export default App;
