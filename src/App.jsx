import React, { useState } from "react";

function App() {
  const [symbol, setSymbol] = useState("");
  const [amount, setAmount] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const BACKEND_URL =
    "https://nexavest-backend.vercel.app"; // ✅ keep your backend URL here

  const formatINR = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(value);

  const analyzeStock = async () => {
    if (!symbol || !amount) {
      setError("Please enter both stock symbol and amount.");
      return;
    }

    setError("");
    setLoading(true);
    setResult(null);

    // ✅ Auto-add ".NS" for Indian stocks if user didn’t specify an exchange
    let formattedSymbol = symbol.trim().toUpperCase();
    if (!formattedSymbol.includes(".")) {
      formattedSymbol += ".NS";
    }

    try {
      const res = await fetch(`${BACKEND_URL}/ai_recommend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: formattedSymbol,
          amount: parseFloat(amount),
        }),
      });

      if (!res.ok) throw new Error(`Server responded with ${res.status}`);

      const data = await res.json();
      data.symbol = formattedSymbol; // show corrected symbol
      setResult(data);
    } catch (err) {
      setError("Unable to reach NexaVest API. Check backend status.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0b0b0b",
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
        placeholder="Stock Symbol (e.g. RELIANCE)"
        value={symbol}
        onChange={(e) => setSymbol(e.target.value)}
        style={styles.input}
      />

      <input
        type="number"
        placeholder="Investment Amount (₹)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        style={styles.input}
      />

      <button
        onClick={analyzeStock}
        disabled={loading}
        style={styles.button}
      >
        {loading ? "Analyzing..." : "Analyze"}
      </button>

      {error && <p style={{ color: "red", marginTop: 15 }}>{error}</p>}

      {result && (
        <div style={styles.resultBox}>
          <h3 style={{ color: "#00e6e6" }}>Analysis Result</h3>
          <p>
            <strong>Symbol:</strong> {result.symbol}
          </p>
          <p>
            <strong>Volatility:</strong> {result.volatility}
          </p>
          <p>
            <strong>Expected Return:</strong> {(result.expected_return * 100).toFixed(2)} %
          </p>
          <p>
            <strong>Risk:</strong> {result.risk_category}
          </p>
          <p>
            <strong>Investment:</strong> {formatINR(amount)}
          </p>
          <p style={{ marginTop: 10, color: "#ccc" }}>
            {result.ai_recommendation}
          </p>
        </div>
      )}
    </div>
  );
}

const styles = {
  input: {
    padding: "10px",
    width: "260px",
    borderRadius: "5px",
    border: "none",
    marginBottom: "10px",
    textAlign: "center",
  },
  button: {
    padding: "10px 20px",
    backgroundColor: "#00e6e6",
    color: "#000",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold",
    width: "260px",
  },
  resultBox: {
    marginTop: "20px",
    backgroundColor: "#1a1a1a",
    padding: "15px",
    borderRadius: "10px",
    width: "280px",
    textAlign: "left",
  },
};

export default App;
