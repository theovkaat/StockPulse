import type { Handler } from "@netlify/functions";

const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: "ANTHROPIC_API_KEY not configured" }) };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const { mode, portfolioSummary, plan, message, history } = body;

    // ── CHAT MODE ──────────────────────────────────────────────────────────────
    if (mode === "chat") {
      if (!message) return { statusCode: 400, body: JSON.stringify({ error: "Missing message" }) };

      const systemPrompt = `You are StockPulse AI — a friendly, sharp investment assistant embedded in a portfolio tracker app. You have access to the user's real portfolio data.

Your personality:
- Warm but professional, like a smart friend who happens to be a financial expert
- Concise — never ramble. Get to the point.
- Use emoji sparingly but effectively
- Always ground advice in the user's actual portfolio data when relevant
- Never make guarantees about returns. Always note this is not official financial advice.
- Respond in the same language the user writes in

Portfolio context:
${portfolioSummary || "No positions added yet."}

Today's date: ${new Date().toLocaleDateString("nl-NL", { year: "numeric", month: "long", day: "numeric" })}`;

      const messages = [
        ...(history || []),
        { role: "user", content: message }
      ];

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 600,
          system: systemPrompt,
          messages,
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        return { statusCode: response.status, body: JSON.stringify({ error: err }) };
      }

      const data = await response.json();
      const text = data.content?.[0]?.text || "I couldn't generate a response.";
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ result: text }),
      };
    }

    // ── ANALYSIS MODE ──────────────────────────────────────────────────────────
    if (!portfolioSummary) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing portfolioSummary" }) };
    }

    const today = new Date().toLocaleDateString("nl-NL", { year: "numeric", month: "long" });

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: plan === "elite" ? 1500 : 1000,
        messages: [
          {
            role: "user",
            content: `You are an experienced investment analyst. Analyze this portfolio and give a concise analysis. Use emoji for readability. Respond in the same language as the portfolio data — if ticker names are international, respond in English.

Structure:
1) 📋 Brief summary (2-3 sentences)
2) ✅ Strengths (max 3 bullets)
3) ⚠️ Risks (max 3 bullets)
4) 💡 Top 2 recommendations

Max ${plan === "elite" ? 400 : 300} words. Keep it practical and concrete.

Portfolio (${today}):
${portfolioSummary}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return { statusCode: response.status, body: JSON.stringify({ error: err }) };
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || "Analysis unavailable.";

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ result: text }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error", detail: String(err) }),
    };
  }
};

export { handler };
