# StockPulse — Portfolio Pro

A full-featured stock portfolio tracker with live prices, smart alerts, and AI analysis. Built with React + Vite, deployable to Netlify in minutes.

---

## Features

- 📊 **Portfolio tracking** — add positions, track P&L in real time
- 🌐 **Market overview** — live prices for 12 global stocks
- 🔔 **Price alerts** — get notified when targets are hit
- 🤖 **AI analysis** — Claude-powered portfolio analysis (Pro/Elite)
- 💳 **Subscription tiers** — Free / Pro €19 / Elite €49
- 📱 **Responsive** — works on desktop and mobile

---

## Quick Start (local)

```bash
# 1. Install dependencies
npm install

# 2. Copy env file and fill in your keys
cp .env.example .env

# 3. Run locally (with Netlify CLI for functions)
npm install -g netlify-cli
netlify dev
```

Without Netlify CLI, run `npm run dev` — the app works but AI analysis calls won't reach the function locally (use `netlify dev` for that).

---

## Environment Variables

| Variable | Where to get it | Required |
|---|---|---|
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) | For AI analysis |
| `VITE_FINNHUB_API_KEY` | [finnhub.io](https://finnhub.io) (free) | For real stock prices |

> Without `VITE_FINNHUB_API_KEY` the app falls back to simulated price movements.
> Without `ANTHROPIC_API_KEY` the AI analysis tab returns an error.

---

## Deploy to Netlify

### Option A — Netlify CLI (recommended)

```bash
npm install -g netlify-cli
netlify login
netlify init        # connect to your Netlify account
netlify env:set ANTHROPIC_API_KEY sk-ant-...
netlify env:set VITE_FINNHUB_API_KEY your_key
netlify deploy --build --prod
```

### Option B — GitHub + Netlify UI

1. Push this folder to a GitHub repo
2. Go to [app.netlify.com](https://app.netlify.com) → "Add new site" → "Import from Git"
3. Select your repo — build settings are auto-detected from `netlify.toml`
4. Go to **Site settings → Environment variables** and add:
   - `ANTHROPIC_API_KEY`
   - `VITE_FINNHUB_API_KEY`
5. Trigger a deploy

---

## Project Structure

```
stockpulse/
├── src/
│   ├── main.tsx          # React entry point
│   └── App.tsx           # Full application
├── netlify/
│   └── functions/
│       └── ai-analyze.ts # Serverless Claude AI proxy
├── public/
│   └── favicon.svg
├── index.html
├── vite.config.ts
├── tsconfig.json
├── netlify.toml
├── package.json
└── .env.example
```

---

## Adding Real Payments (Stripe)

In `src/App.tsx`, find the `handleUpgrade` function and replace the `alert()` with a Stripe Checkout redirect:

```ts
const handleUpgrade = async (planId: string) => {
  const res = await fetch("/.netlify/functions/create-checkout", {
    method: "POST",
    body: JSON.stringify({ planId, email: user.email }),
  });
  const { url } = await res.json();
  window.location.href = url;
};
```

Then create `netlify/functions/create-checkout.ts` using the Stripe Node SDK.

---

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Hosting**: Netlify (static + serverless functions)
- **Prices**: Finnhub.io REST API (free tier: 60 req/min)
- **AI**: Anthropic Claude (via Netlify function proxy)
- **Storage**: localStorage (no backend needed)
