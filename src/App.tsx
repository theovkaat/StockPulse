import { useState, useEffect, useCallback, useRef } from "react";

// ─── THEME ───────────────────────────────────────────────────────────────────
const C = {
  bg: "#07090f",
  surface: "#0d1117",
  card: "#111827",
  cardHover: "#151f30",
  border: "#1a2744",
  borderLight: "#243352",
  accent: "#3b82f6",
  accentGlow: "#3b82f644",
  accentDim: "#3b82f618",
  gold: "#f59e0b",
  goldDim: "#f59e0b22",
  green: "#10b981",
  greenDim: "#10b98122",
  red: "#ef4444",
  redDim: "#ef444422",
  text: "#f1f5f9",
  muted: "#64748b",
  mutedLight: "#94a3b8",
  white: "#ffffff",
};

const GLOBAL_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&family=Instrument+Sans:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { background: ${C.bg}; color: ${C.text}; font-family: 'Instrument Sans', sans-serif; -webkit-font-smoothing: antialiased; }
  ::-webkit-scrollbar { width: 3px; } 
  ::-webkit-scrollbar-track { background: ${C.bg}; } 
  ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 2px; }
  .mono { font-family: 'JetBrains Mono', monospace; }
  .syne { font-family: 'Syne', sans-serif; }
  input, select, button { font-family: 'Instrument Sans', sans-serif; }
  input:focus, select:focus { outline: none; }
  
  @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
  @keyframes ticker { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
  @keyframes glow { 0%,100%{box-shadow:0 0 12px ${C.accentGlow}} 50%{box-shadow:0 0 28px ${C.accent}66} }
  @keyframes ping { 0%{transform:scale(1);opacity:1} 75%,100%{transform:scale(2);opacity:0} }
  
  .anim-fadeUp { animation: fadeUp 0.4s ease both; }
  .anim-fadeUp-1 { animation: fadeUp 0.4s 0.05s ease both; }
  .anim-fadeUp-2 { animation: fadeUp 0.4s 0.1s ease both; }
  .anim-fadeUp-3 { animation: fadeUp 0.4s 0.15s ease both; }
  .anim-fadeUp-4 { animation: fadeUp 0.4s 0.2s ease both; }

  .btn-primary {
    background: ${C.accent}; color: white; border: none; border-radius: 10px;
    padding: 11px 24px; cursor: pointer; font-size: 14px; font-weight: 600;
    transition: all 0.2s; letter-spacing: 0.2px;
  }
  .btn-primary:hover { background: #2563eb; transform: translateY(-1px); box-shadow: 0 4px 20px ${C.accentGlow}; }
  .btn-ghost {
    background: transparent; color: ${C.mutedLight}; border: 1px solid ${C.border};
    border-radius: 10px; padding: 10px 20px; cursor: pointer; font-size: 14px;
    transition: all 0.2s;
  }
  .btn-ghost:hover { border-color: ${C.borderLight}; color: ${C.text}; background: ${C.card}; }
  
  .card {
    background: ${C.card}; border: 1px solid ${C.border}; border-radius: 16px; overflow: hidden;
  }
  .card-hover:hover { border-color: ${C.borderLight}; background: ${C.cardHover}; }
  
  .input-field {
    background: ${C.surface}; border: 1px solid ${C.border}; border-radius: 10px;
    padding: 10px 14px; color: ${C.text}; font-size: 14px; width: 100%;
    transition: border-color 0.2s;
  }
  .input-field:focus { border-color: ${C.accent}; }
  .input-field::placeholder { color: ${C.muted}; }

  .tab-btn {
    padding: 8px 18px; border-radius: 9px; border: none; cursor: pointer;
    font-size: 13px; font-weight: 500; transition: all 0.2s; white-space: nowrap;
  }
  .tab-btn.active { background: ${C.accent}; color: white; }
  .tag-btn:not(.active) { background: transparent; color: ${C.muted}; }
  .tab-btn:not(.active):hover { color: ${C.text}; background: ${C.border}; }
`;

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const MOCK_STOCKS = {
  ASML:  { price: 742.30, change: 2.14,  name: "ASML Holding",      sector: "Semiconductors" },
  NVDA:  { price: 1087.5, change: 3.41,  name: "Nvidia",            sector: "AI Chips" },
  MSFT:  { price: 421.80, change: -0.62, name: "Microsoft",         sector: "Cloud/AI" },
  GOOGL: { price: 178.40, change: 1.23,  name: "Alphabet",          sector: "Cloud/AI" },
  ASMI:  { price: 618.90, change: -1.08, name: "ASM International", sector: "Semiconductors" },
  ADYEN: { price: 1324.0, change: 4.71,  name: "Adyen",             sector: "Fintech" },
  NOVO:  { price: 512.20, change: 0.83,  name: "Novo Nordisk",      sector: "Healthcare" },
  MU:    { price: 134.60, change: 5.24,  name: "Micron Technology", sector: "Memory" },
  AMD:   { price: 246.30, change: 2.67,  name: "AMD",               sector: "AI Chips" },
  ABB:   { price: 48.70,  change: -0.34, name: "ABB",               sector: "Automation" },
};

const PLANS = [
  { id: "free",  name: "Free",    price: 0,  color: C.muted,  features: ["5 positions", "Market overview", "Basic alerts (3)"] },
  { id: "pro",   name: "Pro",     price: 19, color: C.accent, features: ["Unlimited positions", "Live prices", "Unlimited alerts", "Email notifications", "Portfolio analysis"] },
  { id: "elite", name: "Elite",   price: 49, color: C.gold,   features: ["Everything in Pro", "AI market analysis", "Weekly email report", "Priority support", "API access"] },
];

// ─── HOOKS ───────────────────────────────────────────────────────────────────
function useStorage(key, initial) {
  const [val, setVal] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : initial; } catch { return initial; }
  });
  const set = useCallback(v => {
    const next = typeof v === "function" ? v(val) : v;
    setVal(next);
    try { localStorage.setItem(key, JSON.stringify(next)); } catch {}
  }, [key, val]);
  return [val, set];
}

function useLivePrices() {
  const [prices, setPrices] = useState(MOCK_STOCKS);
  useEffect(() => {
    const id = setInterval(() => {
      setPrices(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(k => {
          const delta = (Math.random() - 0.488) * 1.8;
          next[k] = { ...next[k], price: Math.max(1, +(next[k].price + delta).toFixed(2)), change: +(next[k].change + (Math.random() - 0.5) * 0.08).toFixed(2) };
        });
        return next;
      });
    }, 2000);
    return () => clearInterval(id);
  }, []);
  return prices;
}

// ─── SMALL COMPONENTS ─────────────────────────────────────────────────────────
function Badge({ children, color = C.accent }) {
  return <span style={{ background: color + "22", color, fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 5, letterSpacing: 0.5 }}>{children}</span>;
}

function Dot({ color, ping }) {
  return (
    <span style={{ position: "relative", display: "inline-flex", width: 8, height: 8 }}>
      {ping && <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: color, animation: "ping 1.5s ease infinite" }} />}
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, display: "block" }} />
    </span>
  );
}

function Spinner() {
  return <div style={{ width: 18, height: 18, border: `2px solid ${C.border}`, borderTopColor: C.accent, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />;
}

function StatCard({ label, value, sub, accent, delay = 0 }) {
  return (
    <div className={`card anim-fadeUp-${delay}`} style={{ padding: "20px 24px", flex: 1, minWidth: 150 }}>
      <div style={{ fontSize: 11, color: C.muted, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1, fontWeight: 500 }}>{label}</div>
      <div className="mono syne" style={{ fontSize: 26, fontWeight: 700, color: accent || C.white, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: C.muted, marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

// ─── TICKER BANNER ────────────────────────────────────────────────────────────
function TickerBanner({ prices }) {
  const items = Object.entries(prices);
  const doubled = [...items, ...items];
  return (
    <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, overflow: "hidden", height: 36, display: "flex", alignItems: "center" }}>
      <div style={{ display: "flex", animation: "ticker 30s linear infinite", whiteSpace: "nowrap" }}>
        {doubled.map(([ticker, d], i) => (
          <span key={i} className="mono" style={{ fontSize: 12, padding: "0 24px", color: d.change >= 0 ? C.green : C.red, display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span style={{ color: C.mutedLight, fontWeight: 500 }}>{ticker}</span>
            €{d.price.toFixed(2)}
            <span>{d.change >= 0 ? "▲" : "▼"}{Math.abs(d.change).toFixed(2)}%</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── LANDING PAGE ─────────────────────────────────────────────────────────────
const LANDING_COPY = {
  nl: {
    badge: "Live koersen · AEX · Nasdaq · NYSE",
    h1a: "Jouw portfolio.",
    h1b: "Live. Slim. Gratis.",
    sub: "Portfolio tracker met live koersen, dividendtracker, AI-analyse en koersalarmen. Importeer vanuit DEGIRO of Lynx in één klik.",
    badges: ["✅ DEGIRO import", "✅ Lynx import", "✅ AI-analyse", "✅ Dividendtracker"],
    cta: "Gratis starten →",
    login: "Inloggen",
    nocards: "Geen creditcard nodig · Altijd een gratis plan beschikbaar",
    features: [
      { icon: "📊", title: "Portfolio Tracking", desc: "Volg al je posities op één plek. Live P&L, rendement en verdeling per sector." },
      { icon: "💰", title: "Dividendtracker", desc: "Zie automatisch je jaarlijks, kwartaal en maandelijks dividendinkomen per aandeel." },
      { icon: "🔔", title: "Koersalarmen", desc: "Stel alarmen in en word meteen gewaarschuwd als je doelkoers bereikt wordt." },
      { icon: "🤖", title: "AI Portfolio Analyse", desc: "Vraag de AI alles over jouw portfolio — hij kent je exacte posities en live koersen." },
      { icon: "📁", title: "DEGIRO & Lynx Import", desc: "Importeer je hele portfolio in één klik via CSV. Getest en bewezen." },
      { icon: "🌍", title: "Wereldwijde Markten", desc: "AEX, Nasdaq, NYSE en meer — alles op één dashboard. Live koersen." },
    ],
    stats: [
      { value: "100%", label: "Gratis te starten" },
      { value: "30s", label: "Portfolio importeren" },
      { value: "3x", label: "Gratis AI-analyses" },
      { value: "24/7", label: "Live koersen" },
    ],
    pricingTitle: "Eenvoudige prijzen",
    pricingSub: "Start gratis, upgrade wanneer je er klaar voor bent.",
    pricingNote: "Geen creditcard nodig voor het gratis plan · Opzeggen wanneer je wilt",
    planCta: (price: number) => price === 0 ? "Gratis starten" : "Starten met Pro →",
    popular: "MEEST POPULAIR",
    perMonth: "/maand",
    free: "Gratis",
  },
  en: {
    badge: "Live prices · AEX · Nasdaq · NYSE",
    h1a: "Your portfolio.",
    h1b: "Live. Smart. Free.",
    sub: "Portfolio tracker with live prices, dividend tracking, AI analysis and price alerts. Import from DEGIRO or Lynx in one click.",
    badges: ["✅ DEGIRO import", "✅ Lynx import", "✅ AI analysis", "✅ Dividend tracker"],
    cta: "Start for free →",
    login: "Log in",
    nocards: "No credit card required · Free plan always available",
    features: [
      { icon: "📊", title: "Portfolio Tracking", desc: "Track all your positions in one place. Live P&L, returns and breakdown by sector." },
      { icon: "💰", title: "Dividend Tracker", desc: "See your annual, quarterly and monthly dividend income per stock automatically." },
      { icon: "🔔", title: "Price Alerts", desc: "Set alerts and get notified instantly when your target price is reached." },
      { icon: "🤖", title: "AI Portfolio Analysis", desc: "Ask the AI anything about your portfolio — it knows your exact positions and live prices." },
      { icon: "📁", title: "DEGIRO & Lynx Import", desc: "Import your entire portfolio in one click via CSV. Tested and proven." },
      { icon: "🌍", title: "Global Markets", desc: "AEX, Nasdaq, NYSE and more — everything on one dashboard. Live prices." },
    ],
    stats: [
      { value: "100%", label: "Free to start" },
      { value: "30s", label: "Portfolio import" },
      { value: "3x", label: "Free AI analyses" },
      { value: "24/7", label: "Live prices" },
    ],
    pricingTitle: "Simple pricing",
    pricingSub: "Start free, upgrade when you're ready.",
    pricingNote: "No credit card required for the free plan · Cancel anytime",
    planCta: (price: number) => price === 0 ? "Get started free" : "Start with Pro →",
    popular: "MOST POPULAR",
    perMonth: "/mo",
    free: "Free",
  },
};

function LandingPage({ onLogin, onSignup }: { onLogin: () => void; onSignup: () => void }) {
  const lang = navigator.language?.startsWith("nl") ? "nl" : "en";
  const t = LANDING_COPY[lang];

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* HERO */}
      <div style={{ padding: "80px 40px 60px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 600, height: 600, background: `radial-gradient(circle, ${C.accent}0a 0%, transparent 70%)`, pointerEvents: "none" }} />
        <div className="anim-fadeUp" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: C.accentDim, border: `1px solid ${C.accent}44`, borderRadius: 100, padding: "6px 16px", fontSize: 12, color: C.accent, marginBottom: 28, fontWeight: 500 }}>
          <Dot color={C.green} ping /> {t.badge}
        </div>
        <h1 className="syne anim-fadeUp-1" style={{ fontSize: "clamp(36px, 5.5vw, 68px)", fontWeight: 800, lineHeight: 1.05, marginBottom: 20, letterSpacing: -2 }}>
          {t.h1a}<br /><span style={{ color: C.accent }}>{t.h1b}</span>
        </h1>
        <p className="anim-fadeUp-2" style={{ fontSize: 18, color: C.mutedLight, maxWidth: 560, margin: "0 auto 16px", lineHeight: 1.6 }}>
          {t.sub}
        </p>
        <div className="anim-fadeUp-2" style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 32 }}>
          {t.badges.map((b, i) => (
            <span key={i} style={{ fontSize: 12, color: C.green, background: C.greenDim, padding: "4px 12px", borderRadius: 100, fontWeight: 500 }}>{b}</span>
          ))}
        </div>
        <div className="anim-fadeUp-3" style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button className="btn-primary" onClick={onSignup} style={{ padding: "14px 32px", fontSize: 15 }}>{t.cta}</button>
          <button className="btn-ghost" onClick={onLogin}>{t.login}</button>
        </div>
        <p className="anim-fadeUp-4" style={{ fontSize: 12, color: C.muted, marginTop: 16 }}>{t.nocards}</p>
      </div>

      {/* FEATURES */}
      <div style={{ padding: "0 40px 60px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
          {t.features.map((f, i) => (
            <div key={i} className="card card-hover" style={{ padding: 24, transition: "all 0.2s" }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
              <div className="syne" style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{f.title}</div>
              <div style={{ fontSize: 14, color: C.mutedLight, lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* SOCIAL PROOF */}
      <div style={{ padding: "0 40px 60px", maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
        <div style={{ display: "flex", gap: 40, justifyContent: "center", flexWrap: "wrap" }}>
          {t.stats.map((s, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div className="syne mono" style={{ fontSize: 36, fontWeight: 800, color: C.accent }}>{s.value}</div>
              <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* PRICING */}
      <div style={{ padding: "0 40px 80px", maxWidth: 900, margin: "0 auto" }}>
        <h2 className="syne" style={{ textAlign: "center", fontSize: 36, fontWeight: 800, marginBottom: 8, letterSpacing: -1 }}>{t.pricingTitle}</h2>
        <p style={{ textAlign: "center", color: C.muted, fontSize: 15, marginBottom: 40 }}>{t.pricingSub}</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
          {PLANS.map(plan => (
            <div key={plan.id} className="card" style={{ padding: "28px 24px", border: `1px solid ${plan.id === "pro" ? C.accent + "66" : C.border}`, position: "relative" }}>
              {plan.id === "pro" && <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: C.accent, color: "white", fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 100 }}>{t.popular}</div>}
              <div style={{ color: plan.color, fontSize: 13, fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>{plan.name}</div>
              <div className="mono" style={{ fontSize: 36, fontWeight: 700, marginBottom: 4 }}>
                {plan.price === 0 ? t.free : `€${plan.price}`}
                {plan.price > 0 && <span style={{ fontSize: 14, color: C.muted, fontFamily: "Instrument Sans" }}>{t.perMonth}</span>}
              </div>
              <div style={{ height: 1, background: C.border, margin: "16px 0" }} />
              {plan.features.map((f, j) => <div key={j} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: C.mutedLight, marginBottom: 8 }}><span style={{ color: plan.color }}>✓</span> {f}</div>)}
              <button className={plan.id === "pro" ? "btn-primary" : "btn-ghost"} onClick={onSignup}
                style={{ width: "100%", marginTop: 20, background: plan.id === "elite" ? C.goldDim : undefined, color: plan.id === "elite" ? C.gold : undefined, borderColor: plan.id === "elite" ? C.gold + "44" : undefined }}>
                {t.planCta(plan.price)}
              </button>
            </div>
          ))}
        </div>
        <p style={{ textAlign: "center", fontSize: 13, color: C.muted, marginTop: 24 }}>{t.pricingNote}</p>
      </div>
    </div>
  );
}
// ─── AUTH FORMS ───────────────────────────────────────────────────────────────
function AuthForm({ mode, onAuth, onSwitch }) {
  const [email, setEmail] = useState("");
  const [pass, setPass]   = useState("");
  const [name, setName]   = useState("");
  const [plan, setPlan]   = useState("free");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!email || !pass) { setError("Please fill in all fields."); return; }
    setLoading(true); setError("");
    await new Promise(r => setTimeout(r, 800));
    setLoading(false);
    onAuth({ email, name: name || email.split("@")[0], plan });
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div className="card anim-fadeUp" style={{ width: "100%", maxWidth: 420, padding: 36 }}>
        <div className="syne" style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>
          {mode === "login" ? "Welcome back" : "Create your account"}
        </div>
        <div style={{ fontSize: 14, color: C.muted, marginBottom: 28 }}>
          {mode === "login" ? "Log in to your StockPulse account" : "Start free, upgrade whenever you want"}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {mode === "signup" && (
            <input className="input-field" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />
          )}
          <input className="input-field" placeholder="Email address" type="email" value={email} onChange={e => setEmail(e.target.value)} />
          <input className="input-field" placeholder="Password" type="password" value={pass} onChange={e => setPass(e.target.value)} />

          {mode === "signup" && (
            <div>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 8, fontWeight: 500 }}>Choose your plan</div>
              <div style={{ display: "flex", gap: 8 }}>
                {PLANS.map(p => (
                  <button key={p.id} onClick={() => setPlan(p.id)}
                    style={{ flex: 1, padding: "8px 4px", border: `1px solid ${plan === p.id ? p.color : C.border}`, borderRadius: 8, background: plan === p.id ? p.color + "22" : "transparent", color: plan === p.id ? p.color : C.muted, fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}>
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && <div style={{ fontSize: 13, color: C.red, background: C.redDim, padding: "8px 12px", borderRadius: 8 }}>{error}</div>}

          <button className="btn-primary" onClick={handleSubmit} style={{ marginTop: 4, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px" }}>
            {loading ? <Spinner /> : (mode === "login" ? "Log in" : "Create account")}
          </button>
        </div>

        <div style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: C.muted }}>
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <button onClick={onSwitch} style={{ background: "none", border: "none", color: C.accent, cursor: "pointer", fontSize: 13, fontWeight: 500 }}>
            {mode === "login" ? "Sign up" : "Log in"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── PORTFOLIO TAB ────────────────────────────────────────────────────────────
function PortfolioTab({ prices, user }) {
  const [holdings, setHoldings] = useStorage(`holdings_${user.email}`, [
    { ticker: "ASML", shares: 5,  avgBuy: 680 },
    { ticker: "NVDA", shares: 10, avgBuy: 900 },
    { ticker: "MSFT", shares: 20, avgBuy: 380 },
    { ticker: "ASMI", shares: 8,  avgBuy: 550 },
  ]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ ticker: "", shares: "", avgBuy: "" });
  const limit = user.plan === "free" ? 5 : 9999;

  const totalValue = holdings.reduce((s, h) => s + (prices[h.ticker]?.price || h.avgBuy) * h.shares, 0);
  const totalCost  = holdings.reduce((s, h) => s + h.avgBuy * h.shares, 0);
  const totalPnL   = totalValue - totalCost;
  const totalPct   = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0;
  const dayPnL     = holdings.reduce((s, h) => s + (prices[h.ticker]?.price || h.avgBuy) * h.shares * (prices[h.ticker]?.change || 0) / 100, 0);

  const addHolding = () => {
    const t = form.ticker.toUpperCase().trim();
    if (!t || !form.shares || !form.avgBuy) return;
    if (holdings.length >= limit) { alert(`Free plan: max ${limit} positions. Upgrade to Pro for unlimited.`); return; }
    setHoldings(p => [...p, { ticker: t, shares: +form.shares, avgBuy: +form.avgBuy }]);
    setForm({ ticker: "", shares: "", avgBuy: "" }); setShowAdd(false);
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        <StatCard label="Portfolio Value"  value={`€${totalValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}`}    sub="Live prices"               delay={1} />
        <StatCard label="Total P&L"       value={`${totalPnL >= 0 ? "+" : ""}€${Math.abs(totalPnL).toFixed(0)}`}             sub={`${totalPct >= 0 ? "+" : ""}${totalPct.toFixed(2)}% return`} accent={totalPnL >= 0 ? C.green : C.red} delay={2} />
        <StatCard label="Day P&L"          value={`${dayPnL >= 0 ? "+" : ""}€${Math.abs(dayPnL).toFixed(0)}`}                 sub="Today"                    accent={dayPnL >= 0 ? C.green : C.red} delay={3} />
        <StatCard label="Positions"         value={`${holdings.length}/${user.plan === "free" ? limit : "∞"}`}                  sub={user.plan === "free" ? "Free plan" : "Pro plan"}   accent={C.gold} delay={4} />
      </div>

      <div className="card anim-fadeUp">
        <div style={{ padding: "16px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span className="syne" style={{ fontWeight: 700, fontSize: 15 }}>My Positions</span>
          <button className="btn-primary" onClick={() => setShowAdd(!showAdd)} style={{ padding: "7px 16px", fontSize: 13 }}>+ Position</button>
        </div>

        {showAdd && (
          <div style={{ padding: "16px 24px", borderBottom: `1px solid ${C.border}`, background: C.accentDim, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
            {[["Ticker", "ticker", "text"], ["Shares", "shares", "number"], ["Buy price €", "avgBuy", "number"]].map(([label, key, type]) => (
              <div key={key} style={{ flex: 1, minWidth: 130 }}>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 5, fontWeight: 500 }}>{label}</div>
                <input className="input-field" type={type} placeholder={label} value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} />
              </div>
            ))}
            <button className="btn-primary" onClick={addHolding} style={{ padding: "10px 20px", flexShrink: 0 }}>Save</button>
          </div>
        )}

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: C.surface }}>
                {["Stock", "Sector", "Price", "Day%", "Shares", "Value", "P&L", ""].map((h, i) => (
                  <th key={i} style={{ padding: "11px 20px", textAlign: i > 1 ? "right" : "left", fontSize: 11, color: C.muted, fontWeight: 500, textTransform: "uppercase", letterSpacing: 0.8, whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {holdings.map((h, i) => {
                const p   = prices[h.ticker] || { price: h.avgBuy, change: 0, name: h.ticker, sector: "—" };
                const val = p.price * h.shares;
                const pnl = (p.price - h.avgBuy) * h.shares;
                const pct = ((p.price - h.avgBuy) / h.avgBuy) * 100;
                return (
                  <tr key={i} style={{ borderTop: `1px solid ${C.border}`, transition: "background 0.15s", cursor: "default" }}
                    onMouseEnter={e => e.currentTarget.style.background = C.cardHover}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <td style={{ padding: "14px 20px" }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{h.ticker}</div>
                      <div style={{ fontSize: 11, color: C.muted }}>{p.name}</div>
                    </td>
                    <td style={{ padding: "14px 20px" }}><Badge>{p.sector}</Badge></td>
                    <td className="mono" style={{ padding: "14px 20px", textAlign: "right", fontSize: 14 }}>€{p.price.toFixed(2)}</td>
                    <td className="mono" style={{ padding: "14px 20px", textAlign: "right", color: p.change >= 0 ? C.green : C.red, fontSize: 13 }}>
                      {p.change >= 0 ? "▲" : "▼"} {Math.abs(p.change).toFixed(2)}%
                    </td>
                    <td className="mono" style={{ padding: "14px 20px", textAlign: "right", fontSize: 13 }}>{h.shares}</td>
                    <td className="mono" style={{ padding: "14px 20px", textAlign: "right", fontSize: 14 }}>€{val.toLocaleString("nl-NL", { maximumFractionDigits: 0 })}</td>
                    <td className="mono" style={{ padding: "14px 20px", textAlign: "right", color: pnl >= 0 ? C.green : C.red, fontSize: 13 }}>
                      <div>{pnl >= 0 ? "+" : ""}€{Math.abs(pnl).toFixed(0)}</div>
                      <div style={{ fontSize: 11 }}>{pct >= 0 ? "+" : ""}{pct.toFixed(1)}%</div>
                    </td>
                    <td style={{ padding: "14px 12px" }}>
                      <button onClick={() => setHoldings(p => p.filter((_, j) => j !== i))}
                        style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 15, padding: "4px 8px", borderRadius: 6, transition: "all 0.2s" }}
                        onMouseEnter={e => { e.target.color = C.red; e.target.style.color = C.red; }}
                        onMouseLeave={e => { e.target.style.color = C.muted; }}>✕</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── MARKET TAB ───────────────────────────────────────────────────────────────
function MarketTab({ prices }) {
  const sorted = Object.entries(prices).sort((a, b) => b[1].change - a[1].change);
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 12 }}>
        {sorted.map(([ticker, d], i) => (
          <div key={ticker} className="card card-hover" style={{ padding: "20px", transition: "all 0.2s", animationDelay: `${i * 0.03}s`, animation: "fadeUp 0.4s ease both", borderColor: d.change > 2 ? C.green + "44" : d.change < -1 ? C.red + "33" : C.border }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
              <div>
                <div className="syne" style={{ fontWeight: 700, fontSize: 15 }}>{ticker}</div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{d.name}</div>
              </div>
              <div style={{ background: d.change >= 0 ? C.greenDim : C.redDim, color: d.change >= 0 ? C.green : C.red, borderRadius: 7, padding: "4px 8px", fontSize: 12, fontFamily: "JetBrains Mono" }}>
                {d.change >= 0 ? "▲" : "▼"} {Math.abs(d.change).toFixed(2)}%
              </div>
            </div>
            <div className="mono" style={{ fontSize: 24, fontWeight: 700 }}>€{d.price.toFixed(2)}</div>
            <div style={{ marginTop: 12 }}><Badge color={d.change >= 0 ? C.green : C.muted}>{d.sector}</Badge></div>
            <div style={{ marginTop: 12, height: 3, background: C.border, borderRadius: 2 }}>
              <div style={{ height: "100%", width: `${Math.min(100, Math.max(0, 50 + d.change * 8))}%`, background: d.change >= 0 ? C.green : C.red, borderRadius: 2, transition: "width 1.5s ease" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── ALERTS TAB ───────────────────────────────────────────────────────────────
function AlertsTab({ prices, user }) {
  const [alerts, setAlerts]   = useStorage(`alerts_${user.email}`, [
    { id: 1, ticker: "ASML", type: "above", target: 800,  active: true },
    { id: 2, ticker: "NVDA", type: "below", target: 1000, active: true },
    { id: 3, ticker: "MU",   type: "above", target: 130,  active: true },
  ]);
  const [log, setLog]         = useStorage(`alertlog_${user.email}`, []);
  const [form, setForm]       = useState({ ticker: "", type: "above", target: "" });
  const [emailSim, setEmailSim] = useState(null);
  const limit = user.plan === "free" ? 3 : 9999;

  useEffect(() => {
    setAlerts(prev => prev.map(a => {
      if (!a.active) return a;
      const cur = prices[a.ticker]?.price;
      if (!cur) return a;
      const hit = a.type === "above" ? cur >= a.target : cur <= a.target;
      if (hit && !a.triggered) {
        const entry = { id: Date.now(), msg: `${a.ticker} ${a.type === "above" ? "above" : "below"} €${a.target}`, price: cur.toFixed(2), time: new Date().toLocaleTimeString("en-US") };
        setLog(l => [entry, ...l.slice(0, 19)]);
        if (user.plan !== "free") setEmailSim(entry);
        return { ...a, triggered: true };
      }
      return a;
    }));
  }, [prices]);

  const addAlert = () => {
    const t = form.ticker.toUpperCase().trim();
    if (!t || !form.target) return;
    if (alerts.length >= limit) { alert(`Free plan: max ${limit} alerts. Upgrade to Pro for unlimited.`); return; }
    setAlerts(p => [...p, { id: Date.now(), ticker: t, type: form.type, target: +form.target, active: true, triggered: false }]);
    setForm({ ticker: "", type: "above", target: "" });
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
      <div>
        {/* New alert */}
        <div className="card anim-fadeUp" style={{ marginBottom: 16 }}>
          <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.border}` }}>
            <span className="syne" style={{ fontWeight: 700, fontSize: 14 }}>New Price Alert</span>
            <span style={{ marginLeft: 8, fontSize: 11, color: C.muted }}>{alerts.length}/{user.plan === "free" ? limit : "∞"} used</span>
          </div>
          <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
            <input className="input-field" placeholder="Ticker (e.g. ASML, NVDA)" value={form.ticker} onChange={e => setForm(p => ({ ...p, ticker: e.target.value }))} />
            <select className="input-field" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} style={{ background: C.surface }}>
              <option value="above">Price rises above →</option>
              <option value="below">Price drops below →</option>
            </select>
            <input className="input-field" type="number" placeholder="Target price in €" value={form.target} onChange={e => setForm(p => ({ ...p, target: e.target.value }))} />
            <button className="btn-primary" onClick={addAlert}>🔔 Set alert</button>
          </div>
        </div>

        {/* Alert list */}
        <div className="card anim-fadeUp-1">
          <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.border}` }}>
            <span className="syne" style={{ fontWeight: 700, fontSize: 14 }}>Active Alerts</span>
          </div>
          {alerts.length === 0 && <div style={{ padding: 24, textAlign: "center", color: C.muted, fontSize: 13 }}>No alerts set.</div>}
          {alerts.map(a => {
            const cur = prices[a.ticker]?.price;
            return (
              <div key={a.id} style={{ padding: "14px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: a.triggered ? C.goldDim : "transparent", transition: "background 0.3s" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{a.ticker}</span>
                    {a.triggered && <Badge color={C.gold}>TRIGGERED</Badge>}
                  </div>
                  <div className="mono" style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>
                    {a.type === "above" ? "▲ above" : "▼ below"} €{a.target}
                    {cur && <span style={{ marginLeft: 8, color: C.mutedLight }}>· now €{cur.toFixed(2)}</span>}
                  </div>
                </div>
                <button onClick={() => setAlerts(p => p.filter(x => x.id !== a.id))}
                  style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 14 }}>✕</button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Log + email sim */}
      <div>
        {emailSim && (
          <div className="card anim-fadeUp" style={{ marginBottom: 16, border: `1px solid ${C.green}44`, background: C.greenDim }}>
            <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.green}33` }}>
              <span style={{ fontSize: 13, color: C.green, fontWeight: 600 }}>📧 Email notification sent</span>
            </div>
            <div style={{ padding: 16, fontSize: 13, color: C.mutedLight, lineHeight: 1.7 }}>
              <strong style={{ color: C.text }}>To:</strong> {user.email}<br />
              <strong style={{ color: C.text }}>Subject:</strong> 🔔 StockPulse Alert — {emailSim.msg}<br />
              <strong style={{ color: C.text }}>Price:</strong> €{emailSim.price} · {emailSim.time}
            </div>
            <div style={{ padding: "10px 20px" }}><button className="btn-ghost" style={{ fontSize: 12, padding: "5px 12px" }} onClick={() => setEmailSim(null)}>Close</button></div>
          </div>
        )}
        <div className="card anim-fadeUp-1">
          <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.border}` }}>
            <span className="syne" style={{ fontWeight: 700, fontSize: 14 }}>🔔 Notification Log</span>
          </div>
          {log.length === 0 ? (
            <div style={{ padding: 32, textAlign: "center", color: C.muted, fontSize: 13 }}>
              No alerts triggered yet.<br />Prices are being monitored live.
            </div>
          ) : log.map(l => (
            <div key={l.id} style={{ padding: "12px 20px", borderBottom: `1px solid ${C.border}`, animation: "fadeIn 0.3s ease" }}>
              <div style={{ fontSize: 13, color: C.text }}>🔔 {l.msg}</div>
              <div className="mono" style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>€{l.price} · {l.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── AI ANALYSE TAB ───────────────────────────────────────────────────────────
function AIAnalyseTab({ user, prices }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);
  const [holdings] = useStorage(`holdings_${user.email}`, []);

  const runAnalysis = async () => {
    if (user.plan === "free") { alert("AI Analyse is beschikbaar in Pro en Elite. Upgrade je plan."); return; }
    setLoading(true); setResult(null);
    try {
      const portfolioSummary = holdings.map(h => {
        const p = prices[h.ticker] || { price: h.avgBuy, change: 0, name: h.ticker };
        const pct = ((p.price - h.avgBuy) / h.avgBuy * 100).toFixed(1);
        return `${h.ticker} (${p.name}): ${h.shares} aandelen, aankoopprijs €${h.avgBuy}, huidige koers €${p.price.toFixed(2)}, P&L: ${pct}%`;
      }).join("\n");

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `Je bent een ervaren beleggingsanalist. Analyseer dit portfolio en geef een bondige analyse in het Nederlands. Gebruik emoji's voor leesbaarheid. Structuur: 1) Korte samenvatting 2) Sterke punten 3) Risico's 4) Top 2 aanbevelingen. Max 300 woorden. Houd het praktisch en concreet.

Portfolio:
${portfolioSummary || "Geen posities toegevoegd."}

Marktsituatie mei 2026: AI-sector sterk, Europese halfgeleiders onder druk van exportrestricties, energietransitie groeit.`
          }]
        })
      });
      const data = await response.json();
      setResult(data.content?.[0]?.text || "Analyse kon niet worden geladen.");
    } catch {
      setResult("❌ Kon geen verbinding maken met AI. Probeer opnieuw.");
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 720 }}>
      <div className="card anim-fadeUp" style={{ marginBottom: 16 }}>
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div className="syne" style={{ fontWeight: 700, fontSize: 16 }}>🤖 AI Portfolio Analysis</div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>Powered by Claude · {user.plan === "free" ? "Upgrade required" : "Pro/Elite available"}</div>
          </div>
          <button className="btn-primary" onClick={runAnalysis} disabled={loading}
            style={{ display: "flex", alignItems: "center", gap: 8, opacity: user.plan === "free" ? 0.5 : 1 }}>
            {loading ? <><Spinner /> Analyzing...</> : "▶ Analyze now"}
          </button>
        </div>
        <div style={{ padding: "16px 24px" }}>
          {!result && !loading && (
            <div style={{ textAlign: "center", padding: "32px 0", color: C.muted }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>🤖</div>
              <div style={{ fontSize: 14 }}>Click "Analyze now" for an AI analysis of your portfolio.</div>
              {user.plan === "free" && <div style={{ fontSize: 13, color: C.accent, marginTop: 8 }}>Upgrade to Pro to use AI analysis.</div>}
            </div>
          )}
          {loading && (
            <div style={{ textAlign: "center", padding: "32px 0", color: C.muted }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}><Spinner /></div>
              <div style={{ fontSize: 14 }}>AI is analyzing your portfolio...</div>
            </div>
          )}
          {result && (
            <div style={{ fontSize: 14, lineHeight: 1.8, color: C.text, whiteSpace: "pre-wrap", animation: "fadeUp 0.4s ease" }}>{result}</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── SETTINGS TAB ─────────────────────────────────────────────────────────────
function SettingsTab({ user, onUpgrade, onLogout }) {
  const currentPlan = PLANS.find(p => p.id === user.plan) || PLANS[0];
  return (
    <div style={{ maxWidth: 680 }}>
      <div className="card anim-fadeUp" style={{ marginBottom: 16 }}>
        <div style={{ padding: "14px 24px", borderBottom: `1px solid ${C.border}` }}>
          <span className="syne" style={{ fontWeight: 700, fontSize: 14 }}>Account</span>
        </div>
        <div style={{ padding: 24, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 52, height: 52, borderRadius: "50%", background: C.accent + "33", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700, color: C.accent }}>
            {user.name[0].toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 16 }}>{user.name}</div>
            <div style={{ fontSize: 13, color: C.muted }}>{user.email}</div>
            <div style={{ marginTop: 4 }}><Badge color={currentPlan.color}>{currentPlan.name.toUpperCase()} PLAN</Badge></div>
          </div>
        </div>
      </div>

      <div className="card anim-fadeUp-1" style={{ marginBottom: 16 }}>
        <div style={{ padding: "14px 24px", borderBottom: `1px solid ${C.border}` }}>
          <span className="syne" style={{ fontWeight: 700, fontSize: 14 }}>Plan upgraden</span>
        </div>
        <div style={{ padding: 20, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
          {PLANS.filter(p => p.id !== user.plan).map(plan => (
            <div key={plan.id} className="card" style={{ padding: 16, border: `1px solid ${plan.color}44` }}>
              <div style={{ color: plan.color, fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{plan.name}</div>
              <div className="mono" style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
                {plan.price === 0 ? "Gratis" : `€${plan.price}/mnd`}
              </div>
              {plan.features.slice(0, 3).map((f, i) => (
                <div key={i} style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>✓ {f}</div>
              ))}
              <button className="btn-primary" onClick={() => onUpgrade(plan.id)} style={{ width: "100%", marginTop: 12, fontSize: 13, padding: "9px", background: plan.id === "elite" ? C.gold : C.accent }}>
                Upgraden →
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="card anim-fadeUp-2" style={{ padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 14, color: C.muted }}>Uitloggen van je account</div>
        <button className="btn-ghost" onClick={onLogout} style={{ color: C.red, borderColor: C.red + "44" }}>Uitloggen</button>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const prices = useLivePrices();
  const [user, setUser]   = useStorage("sp_user", null);
  const [page, setPage]   = useState("landing"); // landing | login | signup | app
  const [tab, setTab]     = useState("portfolio");

  const handleAuth = (userData) => { setUser(userData); setPage("app"); };
  const handleLogout = () => { setUser(null); setPage("landing"); };
  const handleUpgrade = (planId) => {
    const plan = PLANS.find(p => p.id === planId);
    if (planId !== "free") {
      alert(`💳 Stripe checkout zou hier openen voor het ${plan.name} plan (€${plan.price}/mnd).\n\nIn productie: integreer Stripe Checkout voor betalingen.`);
    }
    setUser(prev => ({ ...prev, plan: planId }));
  };

  useEffect(() => { if (user) setPage("app"); }, []);

  const TABS = [
    { id: "portfolio", label: "📊 Portfolio" },
    { id: "markt",    label: "🌐 Markt" },
    { id: "alerts",   label: "🔔 Alerts" },
    { id: "ai",       label: "🤖 AI Analyse", pro: true },
    { id: "settings", label: "⚙️ Account" },
  ];

  if (page === "landing") return (<><style>{GLOBAL_STYLE}</style><LandingPage onLogin={() => setPage("login")} onSignup={() => setPage("signup")} /></>);
  if (page === "login")   return (<><style>{GLOBAL_STYLE}</style><AuthForm mode="login"  onAuth={handleAuth} onSwitch={() => setPage("signup")} /></>);
  if (page === "signup")  return (<><style>{GLOBAL_STYLE}</style><AuthForm mode="signup" onAuth={handleAuth} onSwitch={() => setPage("login")} /></>);

  return (
    <div style={{ minHeight: "100vh" }}>
      <style>{GLOBAL_STYLE}</style>

      {/* Header */}
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "14px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, animation: "glow 3s ease infinite" }}>◈</div>
          <div>
            <div className="syne" style={{ fontSize: 17, fontWeight: 800, letterSpacing: -0.5 }}>StockPulse</div>
            <div style={{ fontSize: 10, color: C.muted, fontFamily: "JetBrains Mono" }}>PORTFOLIO PRO</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Dot color={C.green} ping />
            <span style={{ fontSize: 12, color: C.muted }}>Live</span>
          </div>
          <Badge color={PLANS.find(p => p.id === user?.plan)?.color || C.muted}>{(user?.plan || "free").toUpperCase()}</Badge>
          <div style={{ fontSize: 13, color: C.mutedLight }}>👤 {user?.name}</div>
        </div>
      </div>

      <TickerBanner prices={prices} />

      {/* Nav */}
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "10px 28px", display: "flex", gap: 4, overflowX: "auto" }}>
        {TABS.map(t => (
          <button key={t.id} className={`tab-btn ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}
            style={{ position: "relative" }}>
            {t.label}
            {t.pro && user?.plan === "free" && <span style={{ marginLeft: 4, fontSize: 10, color: C.gold }}>PRO</span>}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: "28px", maxWidth: 1300, margin: "0 auto" }}>
        {tab === "portfolio" && <PortfolioTab prices={prices} user={user} />}
        {tab === "markt"     && <MarketTab    prices={prices} />}
        {tab === "alerts"    && <AlertsTab    prices={prices} user={user} />}
        {tab === "ai"        && <AIAnalyseTab prices={prices} user={user} />}
        {tab === "settings"  && <SettingsTab  user={user} onUpgrade={handleUpgrade} onLogout={handleLogout} />}
      </div>
    </div>
  );
}
