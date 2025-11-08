import React, { useState } from "react";

/*
  Self-fixing NexaVest frontend.
  - Paste your exact backend domain into Backend URL and click "Save & Test"
  - Then enter symbol and amount and click Analyze
  - The UI will show detailed network info + raw response for debugging
*/

const DEFAULT_BACKENDS = [
  "https://nexavest-backend-evlu3d27w-roberteagle911-arts-projects.vercel.app",
  "https://nexavest-backend-evlu3d27w-roberteagle911-arts-projects.vercel.app/",
  "https://nexavest-backend.vercel.app",
  "https://nexavest-backend-evlu3d27w-roberteagle911-arts-projects.vercel.app",
];

export default function App() {
  const [backend, setBackend] = useState(DEFAULT_BACKENDS[0]);
  const [savedBackend, setSavedBackend] = useState("");
  const [symbol, setSymbol] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [raw, setRaw] = useState(null);
  const [netinfo, setNetinfo] = useState(null);
  const [error, setError] = useState("");
  const [lastTried, setLastTried] = useState("");

  // Save the backend that user wants to use
  const saveBackend = () => {
    const url = backend.trim();
    if (!url) {
      setError("Provide a backend URL first.");
      return;
    }
    setSavedBackend(url.replace(/\/+$/, "")); // remove trailing slash
    setError("");
    setNetinfo(null);
    setRaw(null);
    setResult(null);
  };

  // Helper to try a single URL and return response or throw detailed error
  async function tryPost(url, bodyObj, timeout = 12000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify(bodyObj),
      });
      clearTimeout(timer);
      return res;
    } catch (err) {
      clearTimeout(timer);
      throw err;
    }
  }

  // Main analyze handler - tries savedBackend (or fallback list)
  const handleAnalyze = async () => {
    setError("");
    setResult(null);
    setRaw(null);
    setNetinfo(null);

    if (!symbol || !amount) {
      setError("Enter a stock symbol and amount.");
      return;
    }

    const body = { symbol: symbol.toUpperCase(), amount: parseFloat(amount) };
    const candidates = savedBackend ? [savedBackend] : DEFAULT_BACKENDS;

    setLoading(true);
    let lastError = null;
    setLastTried("");

    for (let i = 0; i < candidates.length; i++) {
      const base = candidates[i].replace(/\/+$/, "");
      const url = `${base}/ai_recommend`;
      setLastTried(url);

      try {
        // test GET / (health) quickly (optional) to check CORS/availability
        try {
          const health = await fetch(base + "/", { method: "GET" });
          // record health status
          setNetinfo((prev) => ({ ...prev, healthStatus: health.status }));
        } catch (hErr) {
          // health may fail; we'll still try POST
          setNetinfo((prev) => ({ ...prev, healthError: String(hErr) }));
        }

        const response = await tryPost(url, body, 12000);

        // record net info
        setNetinfo((prev) => ({
          ...prev,
          triedUrl: url,
          status: response.status,
          statusText: response.statusText,
          headers: Array.from(response.headers.entries()),
        }));

        // 4xx/5xx handling
        if (!response.ok) {
          const text = await response.text().catch(() => "");
          setRaw({ errorBody: text });
          lastError = new Error(`HTTP ${response.status} ${response.statusText}`);
          continue; // try next candidate
        }

        // parse JSON
        let json;
        try {
          json = await response.json();
        } catch (parseErr) {
          const txt = await response.text().catch(() => "");
          setRaw({ text: txt });
          throw new Error("Invalid JSON response from backend");
        }

        // success
        setResult(json);
        setRaw({ success: json });
        setError("");
        setLoading(false);
        return;
      } catch (err) {
        // network, CORS, timeout, abort...
        lastError = err;
        setNetinfo((prev) => ({ ...prev, lastError: String(err) }));
        // try next candidate
      }
    }

    // if loop finishes, we failed
    setLoading(false);
    setError(
      "All attempts failed. See network info below. Paste exact backend domain (from Vercel) into the Backend URL field and Save & Test."
    );
    if (lastError) {
      setRaw((r) => ({ ...r, finalError: String(lastError) }));
    }
  };

  // Quick button to auto-fill with the backend you gave earlier
  const fillSaved = (v) => {
    setBackend(v);
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>NexaVest AI — Debug & Launch</h1>

        <div style={{ marginBottom: 12, textAlign: "left" }}>
          <label style={styles.label}>Backend URL (paste exact Vercel domain)</label>
          <input
            value={backend}
            onChange={(e) => setBackend(e.target.value)}
            placeholder="https://your-backend.vercel.app"
            style={styles.input}
          />
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button style={styles.ghostBtn} onClick={() => fillSaved(DEFAULT_BACKENDS[0])}>
              Use common Vercel 1
            </button>
            <button style={styles.ghostBtn} onClick={() => fillSaved(DEFAULT_BACKENDS[2])}>
              Use short backend
            </button>
            <button style={styles.btn} onClick={saveBackend}>
              Save & Test
            </button>
          </div>
          {savedBackend && (
            <div style={{ marginTop: 8, color: "#bfefff", fontSize: 13 }}>
              Saved backend: <strong>{savedBackend}</strong>
            </div>
          )}
        </div>

        <div style={{ marginTop: 14 }}>
          <label style={styles.label}>Stock symbol</label>
          <input
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            placeholder="RELIANCE.NS or AAPL"
            style={styles.input}
          />
          <label style={[styles.label, { marginTop: 10 }]}>Amount</label>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="1000"
            style={styles.input}
          />

          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button disabled={loading} onClick={handleAnalyze} style={styles.btn}>
              {loading ? "Analyzing..." : "Analyze"}
            </button>
            <button
              onClick={() => {
                setResult(null);
                setRaw(null);
                setNetinfo(null);
                setError("");
              }}
              style={styles.ghostBtn}
            >
              Clear
            </button>
          </div>

          {error && <div style={styles.errorBox}>{error}</div>}
        </div>

        {/* Result */}
        {result && (
          <div style={styles.result}>
            <h3 style={{ marginTop: 0 }}>Analysis Result</h3>
            <pre style={styles.preRaw}>{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}

        {/* Raw network info for debugging */}
        <div style={{ marginTop: 12 }}>
          <h4 style={{ margin: "8px 0" }}>Network & Debug Info</h4>
          <div style={styles.smallBox}>
            <div>
              <strong>Last tried URL:</strong> {lastTried || "—"}
            </div>
            <div>
              <strong>Net status:</strong> {netinfo?.status ?? "—"} {netinfo?.statusText ?? ""}
            </div>
            {netinfo?.healthStatus && (
              <div>
                <strong>Health endpoint status:</strong> {netinfo.healthStatus}
              </div>
            )}
            {netinfo?.healthError && (
              <div style={{ color: "#ffb3b3" }}>
                <strong>Health error:</strong> {String(netinfo.healthError)}
              </div>
            )}
            {netinfo?.lastError && (
              <div style={{ color: "#ffb3b3" }}>
                <strong>Last error:</strong> {netinfo.lastError}
              </div>
            )}
          </div>

          <h4 style={{ marginTop: 12 }}>Raw response / error</h4>
          <div style={styles.smallBox}>
            <pre style={styles.preRaw}>{raw ? JSON.stringify(raw, null, 2) : "—"}</pre>
          </div>

          <h4 style={{ marginTop: 12 }}>Response headers (if available)</h4>
          <div style={styles.smallBox}>
            <pre style={styles.preRaw}>
              {netinfo?.headers ? JSON.stringify(netinfo.headers, null, 2) : "—"}
            </pre>
          </div>

          <div style={{ marginTop: 12, fontSize: 13, color: "rgba(255,255,255,0.7)" }}>
            Tips:
            <ul>
              <li>
                If you see a CORS error in the browser console, add CORS middleware in your backend:
                <code>app.add_middleware(CORSMiddleware, allow_origins=["*"], ...)</code>
              </li>
              <li>
                If status is 405 or 404, confirm your backend route is <code>/ai_recommend</code> and uses POST.
              </li>
              <li>
                Paste the exact Vercel domain (copy from Vercel → Deployments → Production Domain) into Backend URL.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(180deg,#050816,#001220 40%, #071B2C)",
    padding: 20,
    fontFamily: "Inter, Poppins, sans-serif",
    color: "#e6f7ff",
  },
  card: {
    width: "100%",
    maxWidth: 780,
    background: "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.015))",
    borderRadius: 16,
    padding: 20,
    boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
  },
  title: { textAlign: "left", color: "#33f0d1", margin: "0 0 12px 0" },
  label: { display: "block", fontSize: 13, marginBottom: 6, color: "#aeeff4" },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.06)",
    background: "rgba(0,0,0,0.25)",
    color: "#fff",
    boxSizing: "border-box",
  },
  btn: {
    background: "linear-gradient(90deg,#00d4ff,#00b0ff)",
    border: "none",
    color: "#021018",
    padding: "10px 14px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 700,
  },
  ghostBtn: {
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.06)",
    color: "#bfefff",
    padding: "10px 12px",
    borderRadius: 8,
    cursor: "pointer",
  },
  errorBox: {
    marginTop: 10,
    background: "rgba(255,90,90,0.08)",
    border: "1px solid rgba(255,90,90,0.18)",
    color: "#ffb3b3",
    padding: 10,
    borderRadius: 8,
  },
  result: {
    marginTop: 14,
    padding: 12,
    background: "rgba(0,0,0,0.3)",
    borderRadius: 10,
  },
  preRaw: {
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    color: "#d7fbff",
    fontSize: 13,
    margin: 0,
  },
  smallBox: {
    background: "rgba(0,0,0,0.18)",
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
  },
};
