import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

/**
 * App.jsx
 * - Put your logo at public/logo.png
 * - Ensure package.json includes: framer-motion, recharts, react, react-dom, vite
 */

export default function App() {
  const [symbol, setSymbol] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showAnalyzer, setShowAnalyzer] = useState(false);

  // Try multiple endpoints so frontend works if backend route changed
  const BACKEND_BASE = "https://nexavest-backend.vercel.app";
  const ENDPOINTS = ["/ai_recommend", "/analyze", "/predict"];

  async function tryPostEndpoints(payload) {
    for (const ep of ENDPOINTS) {
      try {
        const res = await fetch(BACKEND_BASE + ep, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) continue;
        const data = await res.json();
        // If response looks valid, return
        if (data && Object.keys(data).length > 0) return data;
      } catch (e) {
        // try next
      }
    }
    // nothing worked
    return null;
  }

  const normalizeResult = (data) => {
    if (!data) return null;
    // map possible keys into our canonical fields
    const volatility =
      data.volatility ??
      data.volatil ??
      data.vol ??
      data.v ??
      data.V ??
      null;

    const expected_return =
      data.expected_return ??
      data.expectedReturn ??
      data.return ??
      data.expected ??
      data.er ??
      null;

    const risk_category =
      data.risk_category ??
      data.riskCategory ??
      data.risk ??
      data.category ??
      null;

    const recommendation =
      data.ai_recommendation ??
      data.recommendation ??
      data.ai_recommend ??
      data.advice ??
      data.comment ??
      data.aiRecommendation ??
      null;

    return {
      volatility:
        typeof volatility === "number"
          ? volatility
          : volatility && !isNaN(Number(volatility))
          ? Number(volatility)
          : null,
      expected_return:
        typeof expected_return === "number"
          ? expected_return
          : expected_return && !isNaN(Number(expected_return))
          ? Number(expected_return)
          : null,
      risk_category: risk_category ?? null,
      recommendation: recommendation ?? null,
      raw: data,
    };
  };

  const analyzeStock = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    if (!symbol || !amount) {
      setError("Please enter both symbol and amount.");
      setLoading(false);
      return;
    }

    try {
      const payload = { symbol: symbol.trim(), amount: Number(amount) };
      const data = await tryPostEndpoints(payload);

      if (data === null) {
        setError("Unable to reach NexaVest API. Please check backend status.");
        // Optionally you can show mock demo data to avoid blank UI:
        // setResult(normalizeResult({ volatility:0.12, expected_return:0.08, risk_category:'Medium', ai_recommendation:'Demo:...' }))
        setLoading(false);
        return;
      }

      const normalized = normalizeResult(data);
      setResult(normalized);
    } catch (err) {
      console.error(err);
      setError("Unexpected error occurred. Check console.");
    } finally {
      setLoading(false);
    }
  };

  const chartData = () => {
    const base = Number(amount) || 0;
    const er = result?.expected_return || 0;
    return [
      { name: "Current", value: base },
      { name: "Projected", value: Math.round(base * (1 + er) * 100) / 100 },
    ];
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 10% 10%, #071023 0%, #03040a 40%, #000000 100%)",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Inter, Poppins, sans-serif",
        padding: 20,
      }}
    >
      <AnimatePresence mode="wait">
        {!showAnalyzer ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.6 }}
            style={{
              width: "100%",
              maxWidth: 900,
              display: "flex",
              gap: 30,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
            }}
          >
            <div style={{ textAlign: "center", marginBottom: 12 }}>
              {/* Logo (use public/logo.png) */}
              <img
                src="/logo.png"
                alt="NexaVest"
                style={{
                  width: 110,
                  height: 110,
                  objectFit: "contain",
                  marginBottom: 8,
                }}
                onError={(e) => {
                  // fallback show text if logo not found
                  e.currentTarget.style.display = "none";
                }}
              />
              <div
                style={{
                  fontSize: 36,
                  fontWeight: 700,
                  color: "#00ffd1",
                  letterSpacing: 0.4,
                }}
              >
                NexaVest
              </div>
            </div>

            <div
              style={{
                width: "92%",
                maxWidth: 680,
                background: "rgba(255,255,255,0.04)",
                borderRadius: 18,
                padding: 28,
                boxShadow: "0 10px 40px rgba(0,0,0,0.6)",
              }}
            >
              <h2 style={{ color: "#c6fff0", marginBottom: 6 }}>
                AI investment analysis for modern investors
              </h2>
              <p style={{ color: "#aebfcf", marginTop: 0 }}>
                Enter a stock symbol and amount to get a risk & return opinion powered by AI.
              </p>

              <div
                style={{
                  marginTop: 18,
                  display: "flex",
                  gap: 12,
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <button
                  onClick={() => setShowAnalyzer(true)}
                  style={{
                    background:
                      "linear-gradient(90deg, rgba(0,255,200,0.14), rgba(0,140,255,0.2))",
                    color: "#eafffa",
                    border: "none",
                    padding: "12px 22px",
                    borderRadius: 999,
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 6px 24px rgba(0,200,180,0.08)",
                  }}
                >
                  Analyze Now
                </button>

                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    // quick sample open analyzer with default symbol
                    setSymbol("RELIANCE.NS");
                    setAmount(1000);
                    setShowAnalyzer(true);
                  }}
                  style={{
                    color: "#98f7ff",
                    textDecoration: "underline",
                    fontWeight: 600,
                    marginLeft: 6,
                  }}
                >
                  Try sample
                </a>
              </div>
            </div>

            <div style={{ color: "#6f7f8f", fontSize: 13, marginTop: 12 }}>
              © {new Date().getFullYear()} NexaVest — AI-backed investment insights
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="analyzer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            style={{
              width: "100%",
              maxWidth: 520,
              background: "rgba(255,255,255,0.03)",
              padding: 20,
              borderRadius: 16,
              boxShadow: "0 8px 30px rgba(0,0,0,0.6)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <img
                  src="/logo.png"
                  alt="logo"
                  style={{ width: 48, height: 48, objectFit: "contain" }}
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
                <div style={{ fontSize: 20, fontWeight: 700, color: "#00ffd1" }}>NexaVest</div>
              </div>

              <button
                onClick={() => setShowAnalyzer(false)}
                style={{
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.06)",
                  color: "#fff",
                  padding: "8px 12px",
                  borderRadius: 10,
                  cursor: "pointer",
                }}
              >
                ← Home
              </button>
            </div>

            <div style={{ marginTop: 18 }}>
              <input
                type="text"
                placeholder="Stock Symbol (e.g. RELIANCE.NS)"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                style={{
                  width: "100%",
                  padding: 12,
                  borderRadius: 8,
                  border: "none",
                  marginBottom: 10,
                  fontWeight: 700,
                  textAlign: "center",
                }}
              />
              <input
                type="number"
                placeholder="Investment Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{
                  width: "100%",
                  padding: 12,
                  borderRadius: 8,
                  border: "none",
                  marginBottom: 12,
                  fontWeight: 700,
                  textAlign: "center",
                }}
              />

              <button
                onClick={analyzeStock}
                disabled={loading}
                style={{
                  width: "100%",
                  padding: 12,
                  borderRadius: 10,
                  border: "none",
                  background: "linear-gradient(90deg,#00ffd1,#007bff)",
                  color: "#011",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                {loading ? "Analyzing..." : "Analyze"}
              </button>

              {error && (
                <p style={{ color: "#ff8a8a", marginTop: 12, fontWeight: 700 }}>{error}</p>
              )}

              {result && (
                <div style={{ marginTop: 18 }}>
                  <div style={{ color: "#9fffe8", fontWeight: 800, marginBottom: 8 }}>Analysis Result</div>
                  <div style={{ color: "#dbefff" }}>
                    <div><strong>Symbol:</strong> {symbol}</div>
                    <div><strong>Volatility:</strong> {result.volatility ?? "N/A"}</div>
                    <div><strong>Expected Return:</strong> {result.expected_return ?? "N/A"}</div>
                    <div><strong>Risk:</strong> {result.risk_category ?? "Unknown"}</div>
                    <div style={{ marginTop: 8 }}><strong>AI Recommendation:</strong> {result.recommendation ?? "No recommendation"}</div>
                  </div>

                  <div style={{ height: 200, marginTop: 16 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData()}>
                        <XAxis dataKey="name" stroke="#9fbfd6" />
                        <YAxis stroke="#9fbfd6" />
                        <Tooltip />
                        <Bar dataKey="value" fill="#00ffd1" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
              }
