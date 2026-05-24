export async function onRequestPost(context: any) {
  const apiKey = context.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "ANTHROPIC_API_KEY not configured" }), {
      status: 500, headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const body = await context.request.json();
    const { mode, portfolioSummary, plan, message, history } = body;

    const today = new Date().toLocaleDateString("en-NL", { year: "numeric", month: "long", day: "numeric" });

    let messages: any[];
    let system: string;
    let maxTokens: number;

    if (mode === "chat") {
      if (!message) return new Response(JSON.stringify({ error: "Missing message" }), { status: 400 });
      system = `You are StockPulse AI — a friendly, sharp investment assistant. You have access to the user's real portfolio.
Personality: warm but professional, concise, use emoji sparingly, ground advice in portfolio data, never guarantee returns.
Respond in the same language the user writes in.
Portfolio context: ${portfolioSummary || "No positions added yet."}
Today: ${today}`;
      messages = [...(history || []), { role: "user", content: message }];
      maxTokens = 600;
    } else {
      if (!portfolioSummary) return new Response(JSON.stringify({ error: "Missing portfolioSummary" }), { status: 400 });
      system = "";
      messages = [{
        role: "user",
        content: `You are an experienced investment analyst. Analyze this portfolio concisely. Use emoji for readability. Respond in English.

Structure:
1) 📋 Brief summary (2-3 sentences)
2) ✅ Strengths (max 3 bullets)
3) ⚠️ Risks (max 3 bullets)
4) 💡 Top 2 recommendations

Max ${plan === "elite" ? 400 : 300} words. Keep it practical.

Portfolio (${today}):
${portfolioSummary}`
      }];
      maxTokens = plan === "elite" ? 1500 : 1000;
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: maxTokens,
        ...(system ? { system } : {}),
        messages,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return new Response(JSON.stringify({ error: err }), { status: response.status, headers: { "Content-Type": "application/json" } });
    }

    const data: any = await response.json();
    const text = data.content?.[0]?.text || "Analysis unavailable.";
    return new Response(JSON.stringify({ result: text }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
