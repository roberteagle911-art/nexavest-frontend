import { useState } from "react";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function App() {
  const [symbol, setSymbol] = useState("");
  const [amount, setAmount] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyzeInvestment = async () => {
    if (!symbol || !amount) {
      alert("Please enter both fields");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("https://nexavest-backend.vercel.app/ai_recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol, amount: parseFloat(amount) }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      alert("Error connecting to NexaVest API");
    }
    setLoading(false);
  };

  const getRiskColor = (risk) => {
    if (risk === "Low") return "#00ff99";
    if (risk === "Medium") return "#ffaa00";
    return "#ff4444";
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #050510, #0d1525)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontFamily: "Poppins, sans-serif",
        padding: "20px",
      }}
    >
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        style={{
          fontSize: "2.5rem",
          fontWeight: "600",
          marginBottom: "1rem",
          letterSpacing: "1px",
        }}
      >
        💼 NexaVest
      </motion.h1>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6 }}
        style={{
          background: "rgba(255,255,255,0.06)",
          borderRadius: "20px",
          padding: "2rem",
          width: "90%",
          maxWidth: "420px",
          boxShadow: "0 0 30px rgba(0,255,180,0.1)",
          backdropFilter: "blur(10px)",
          textAlign: "center",
        }}
      >
        <input
          type="text"
          placeholder="Stock Symbol (e.g. RELIANCE.NS)"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: "10px",
            border: "none",
            marginBottom: "1rem",
            textAlign: "center",
            fontSize: "1rem",
            background: "rgba(255,255,255,0.1)",
            color: "#fff",
            outline: "none",
          }}
        />

        <input
          type="number"
          placeholder="Investment Amount (₹)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: "10px",
            border: "none",
            marginBottom: "1.5rem",
            textAlign: "center",
            fontSize: "1rem",
            background: "rgba(255,255,255,0.1)",
            color: "#fff",
            outline: "none",
          }}
        />

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={analyzeInvestment}
          disabled={loading}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: "12px",
            background:
              loading
                ? "linear-gradient(90deg, #666, #333)"
                : "linear-gradient(90deg, #00ffcc, #007bff)",
            color: "#fff",
            fontWeight: "600",
            fontSize: "1rem",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 0 20px rgba(0,255,200,0.3)",
            transition: "0.3s ease",
          }}
        >
          {loading ? "Analyzing..." : "Analyze"}
        </motion.button>

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{
              marginTop: "2rem",
              textAlign: "left",
              background: "rgba(255,255,255,0.05)",
              padding: "1rem",
              borderRadius: "12px",
            }}
          >
            <h3 style={{ marginBottom: "0.8rem", color: "#00ffc8" }}>Analysis Result</h3>
            <p><b>Symbol:</b> {result.symbol}</p>
            <p><b>Volatility:</b> {result.volatility}</p>
            <p><b>Expected Return:</b> {result.expected_return}</p>
            <p><b>Risk:</b> {result.risk_category}</p>
            <p style={{ marginTop: "0.8rem", opacity: 0.9 }}>{result.ai_recommendation}</p>

            {/* Risk Meter */}
            <div style={{ marginTop: "1.5rem" }}>
              <p style={{ marginBottom: "0.5rem" }}>Risk Meter</p>
              <div
                style={{
                  height: "10px",
                  borderRadius: "5px",
                  background: "#333",
                  overflow: "hidden",
                }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width:
                      result.risk_category === "Low"
                        ? "33%"
                        : result.risk_category === "Medium"
                        ? "66%"
                        : "100%",
                    background: getRiskColor(result.risk_category),
                  }}
                  transition={{ duration: 0.8 }}
                  style={{
                    height: "10px",
                  }}
                ></motion.div>
              </div>
            </div>

            {/* Chart */}
            <div style={{ height: "200px", marginTop: "2rem" }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={[
                    { name: "Prev Close", value: result.expected_return * 0.8 },
                    { name: "Current", value: result.expected_return },
                    { name: "Projected", value: result.expected_return * 1.2 },
                  ]}
                >
                  <Line type="monotone" dataKey="value" stroke="#00ffc8" strokeWidth={2} />
                  <XAxis dataKey="name" stroke="#aaa" />
                  <YAxis hide />
                  <Tooltip />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}
      </motion.div>

      <p style={{ opacity: 0.4, fontSize: "0.8rem", marginTop: "2rem" }}>
        © 2025 NexaVest • AI Investment Advisor
      </p>
    </div>
  );
          }
