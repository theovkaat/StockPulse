export async function onRequestPost(context: any) {
  const apiKey = context.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Not configured" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }

  try {
    const { message, history } = await context.request.json();
    if (!message) return new Response(JSON.stringify({ error: "Missing message" }), { status: 400 });

    const system = `You are the StockPulse Support Assistant — a friendly, helpful AI that answers questions about StockPulse, a portfolio tracking app.

You know everything about StockPulse:

ABOUT STOCKPULSE:
- StockPulse is a portfolio tracker with live stock prices, AI analysis, price alerts and dividend tracking
- Website: stockpulse.fit
- Built for investors worldwide, with focus on European stocks (AEX, Nasdaq, NYSE)

PLANS & PRICING:
- Free: 5 positions, market overview, 3 price alerts
- Pro (€19/month): unlimited positions, live prices, unlimited alerts, AI chat & analysis
- Elite (€49/month): everything in Pro + priority support + API access + weekly report
- Promo codes: users can enter promo codes in Account settings for free upgrades

FEATURES:
- Portfolio tab: add stocks manually or import via CSV (supports Lynx/IBKR, DEGIRO, universal CSV)
- Market tab: live prices for major global stocks
- Alerts tab: set price alerts, get notified when target price is hit (up to 3 on free, unlimited on Pro/Elite)
- Dividends tab: track dividend income, annual/quarterly/monthly breakdown, pre-filled yields for known stocks
- AI Analysis tab: Claude-powered portfolio analysis (Pro/Elite only)
- AI Chat tab: ask anything about your portfolio (Pro/Elite only)
- Account tab: manage plan, apply promo codes, change theme (5 themes available), sign out
- Themes: Dark, Navy, Slate, Light, Forest

TECHNICAL:
- Data is stored securely in the cloud (Supabase) — accessible from any device
- Live prices from Finnhub, updated every 30 seconds
- Payments via Stripe — secure, cancel anytime
- Email: support@stockpulse.fit

COMMON QUESTIONS:
- How to import: Portfolio tab → Import CSV button → upload your broker export
- How to cancel: Go to Account tab → contact support@stockpulse.fit (Stripe Customer Portal coming soon)
- Forgot password: use the login page forgot password link
- Which stocks are supported: any stock with a valid ticker symbol (ASML, NVDA, AAPL etc.)

PERSONALITY:
- Friendly, concise, helpful
- Use emoji sparingly
- If you don't know something, say so and suggest emailing support@stockpulse.fit
- Respond in the same language the user writes in
- Never make up features that don't exist`;

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
        max_tokens: 500,
        system,
        messages,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return new Response(JSON.stringify({ error: err }), { status: response.status, headers: { "Content-Type": "application/json" } });
    }

    const data: any = await response.json();
    const text = data.content?.[0]?.text || "I couldn't generate a response.";
    return new Response(JSON.stringify({ result: text }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
