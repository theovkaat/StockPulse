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
    const { portfolioSummary, plan } = body;

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
        model: "claude-sonnet-4-20250514",
        max_tokens: plan === "elite" ? 1500 : 1000,
        messages: [
          {
            role: "user",
            content: `Je bent een ervaren beleggingsanalist. Analyseer dit portfolio en geef een bondige analyse in het Nederlands. Gebruik emoji's voor leesbaarheid.

Structuur:
1) 📋 Korte samenvatting (2-3 zinnen)
2) ✅ Sterke punten (max 3 bullets)
3) ⚠️ Risico's (max 3 bullets)
4) 💡 Top 2 aanbevelingen

Max ${plan === "elite" ? 400 : 300} woorden. Houd het praktisch en concreet.

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
    const text = data.content?.[0]?.text || "Analyse niet beschikbaar.";

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
