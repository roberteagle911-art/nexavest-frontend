const analyzeInvestment = async () => {
  setLoading(true);
  try {
    // Step 1 — Analyze core data
    const res1 = await fetch("https://nexavest-backend.onrender.com/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbol, amount })
    });

    const data1 = await res1.json();

    // Step 2 — Get AI recommendation
    const res2 = await fetch("https://nexavest-backend.onrender.com/ai_recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbol, amount })
    });

    const data2 = await res2.json();

    // Combine both results
    setResult({
      ...data1,
      ai_recommendation: data2.ai_recommendation
    });

  } catch (error) {
    alert("Error connecting to NexaVest API");
  } finally {
    setLoading(false);
  }
};
