import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "./supabase";
import type { Profile, Holding, Alert } from "./supabase";

// ─── THEME ───────────────────────────────────────────────────────────────────
const THEMES: Record<string, typeof C_DEFAULT> = {
  dark: {
    bg: "#07090f", surface: "#0d1117", card: "#111827", cardHover: "#151f30",
    border: "#1a2744", borderLight: "#243352", accent: "#3b82f6",
    accentGlow: "#3b82f644", accentDim: "#3b82f618", gold: "#f59e0b",
    goldDim: "#f59e0b22", green: "#10b981", greenDim: "#10b98122",
    red: "#ef4444", redDim: "#ef444422", text: "#f1f5f9",
    muted: "#64748b", mutedLight: "#94a3b8", white: "#ffffff",
  },
  navy: {
    bg: "#0a0f1e", surface: "#0f1629", card: "#141d35", cardHover: "#1a2440",
    border: "#1e2d50", borderLight: "#2a3d6a", accent: "#60a5fa",
    accentGlow: "#60a5fa44", accentDim: "#60a5fa18", gold: "#fbbf24",
    goldDim: "#fbbf2422", green: "#34d399", greenDim: "#34d39922",
    red: "#f87171", redDim: "#f8717122", text: "#e2e8f0",
    muted: "#64748b", mutedLight: "#94a3b8", white: "#ffffff",
  },
  slate: {
    bg: "#0f172a", surface: "#1e293b", card: "#243447", cardHover: "#2d3f55",
    border: "#334155", borderLight: "#475569", accent: "#818cf8",
    accentGlow: "#818cf844", accentDim: "#818cf818", gold: "#fbbf24",
    goldDim: "#fbbf2422", green: "#4ade80", greenDim: "#4ade8022",
    red: "#f87171", redDim: "#f8717122", text: "#f1f5f9",
    muted: "#64748b", mutedLight: "#94a3b8", white: "#ffffff",
  },
  light: {
    bg: "#f8fafc", surface: "#ffffff", card: "#f1f5f9", cardHover: "#e2e8f0",
    border: "#cbd5e1", borderLight: "#94a3b8", accent: "#3b82f6",
    accentGlow: "#3b82f644", accentDim: "#3b82f618", gold: "#d97706",
    goldDim: "#d9770622", green: "#059669", greenDim: "#05966922",
    red: "#dc2626", redDim: "#dc262622", text: "#0f172a",
    muted: "#64748b", mutedLight: "#475569", white: "#ffffff",
  },
  forest: {
    bg: "#0a1a0f", surface: "#0f2416", card: "#142d1c", cardHover: "#1a3824",
    border: "#1e4428", borderLight: "#2d6040", accent: "#4ade80",
    accentGlow: "#4ade8044", accentDim: "#4ade8018", gold: "#fbbf24",
    goldDim: "#fbbf2422", green: "#34d399", greenDim: "#34d39922",
    red: "#f87171", redDim: "#f8717122", text: "#f0fdf4",
    muted: "#6b7280", mutedLight: "#9ca3af", white: "#ffffff",
  },
};

const THEME_LABELS: Record<string, { label: string; preview: string }> = {
  dark:   { label: "Dark",   preview: "#07090f" },
  navy:   { label: "Navy",   preview: "#0a0f1e" },
  slate:  { label: "Slate",  preview: "#0f172a" },
  light:  { label: "Light",  preview: "#f8fafc" },
  forest: { label: "Forest", preview: "#0a1a0f" },
};

type ThemeColors = {
  bg: string; surface: string; card: string; cardHover: string;
  border: string; borderLight: string; accent: string;
  accentGlow: string; accentDim: string; gold: string;
  goldDim: string; green: string; greenDim: string;
  red: string; redDim: string; text: string;
  muted: string; mutedLight: string; white: string;
};

const C_DEFAULT: ThemeColors = THEMES.dark;
let C: ThemeColors = THEMES.dark;

const makeGlobalStyle = (C: ThemeColors) => `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&family=Instrument+Sans:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${C.bg}; color: ${C.text}; font-family: 'Instrument Sans', sans-serif; -webkit-font-smoothing: antialiased; }
  ::-webkit-scrollbar { width: 3px; } ::-webkit-scrollbar-track { background: ${C.bg}; } ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 2px; }
  .mono { font-family: 'JetBrains Mono', monospace; } .syne { font-family: 'Syne', sans-serif; }
  input, select, button, textarea { font-family: 'Instrument Sans', sans-serif; }
  input:focus, select:focus, textarea:focus { outline: none; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes ticker { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
  @keyframes glow { 0%,100%{box-shadow:0 0 12px ${C.accentGlow}} 50%{box-shadow:0 0 28px ${C.accent}66} }
  @keyframes ping { 0%{transform:scale(1);opacity:1} 75%,100%{transform:scale(2);opacity:0} }
  .anim-fadeUp   { animation: fadeUp 0.4s ease both; }
  .anim-fadeUp-1 { animation: fadeUp 0.4s 0.05s ease both; }
  .anim-fadeUp-2 { animation: fadeUp 0.4s 0.10s ease both; }
  .anim-fadeUp-3 { animation: fadeUp 0.4s 0.15s ease both; }
  .anim-fadeUp-4 { animation: fadeUp 0.4s 0.20s ease both; }
  .btn-primary { background: ${C.accent}; color: white; border: none; border-radius: 10px; padding: 11px 24px; cursor: pointer; font-size: 14px; font-weight: 600; transition: all 0.2s; }
  .btn-primary:hover { background: #2563eb; transform: translateY(-1px); box-shadow: 0 4px 20px ${C.accentGlow}; }
  .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
  .btn-ghost { background: transparent; color: ${C.mutedLight}; border: 1px solid ${C.border}; border-radius: 10px; padding: 10px 20px; cursor: pointer; font-size: 14px; transition: all 0.2s; }
  .btn-ghost:hover { border-color: ${C.borderLight}; color: ${C.text}; background: ${C.card}; }
  .card { background: ${C.card}; border: 1px solid ${C.border}; border-radius: 16px; overflow: hidden; }
  .card-hover:hover { border-color: ${C.borderLight}; background: ${C.cardHover}; }
  .input-field { background: ${C.surface}; border: 1px solid ${C.border}; border-radius: 10px; padding: 10px 14px; color: ${C.text}; font-size: 14px; width: 100%; transition: border-color 0.2s; }
  .input-field:focus { border-color: ${C.accent}; }
  .input-field::placeholder { color: ${C.muted}; }
  .tab-btn { padding: 8px 18px; border-radius: 9px; border: none; cursor: pointer; font-size: 13px; font-weight: 500; transition: all 0.2s; white-space: nowrap; }
  .tab-btn.active { background: ${C.accent}; color: white; }
  .tab-btn:not(.active) { background: transparent; color: ${C.muted}; }
  .tab-btn:not(.active):hover { color: ${C.text}; background: ${C.border}; }
`;

const FINNHUB_KEY = import.meta.env.VITE_FINNHUB_API_KEY || "";

const MARKET_TICKERS = [
  { ticker: "ASML",  name: "ASML Holding",     sector: "Semiconductors" },
  { ticker: "NVDA",  name: "Nvidia",            sector: "AI Chips" },
  { ticker: "MSFT",  name: "Microsoft",         sector: "Cloud/AI" },
  { ticker: "GOOGL", name: "Alphabet",          sector: "Cloud/AI" },
  { ticker: "ASMI",  name: "ASM International", sector: "Semiconductors" },
  { ticker: "ADYEN", name: "Adyen",             sector: "Fintech" },
  { ticker: "MU",    name: "Micron Technology", sector: "Memory" },
  { ticker: "AMD",   name: "AMD",               sector: "AI Chips" },
  { ticker: "AAPL",  name: "Apple",             sector: "Tech" },
  { ticker: "TSLA",  name: "Tesla",             sector: "EV/Energy" },
  { ticker: "META",  name: "Meta",              sector: "Social/AI" },
];

const PLANS = [
  { id: "free",  name: "Free",  price: 0,  color: C.muted,  features: ["5 positions", "Market overview", "Basic alerts (3)"] },
  { id: "pro",   name: "Pro",   price: 19, color: C.accent, features: ["Unlimited positions", "Live prices", "Unlimited alerts", "AI Chat & Analysis"] },
  { id: "elite", name: "Elite", price: 49, color: C.gold,   features: ["Everything in Pro", "Priority support", "API access", "Weekly report"] },
];

// ─── TYPES ────────────────────────────────────────────────────────────────────
interface PriceData { price: number; change: number; name: string; sector: string; }
interface ChatMessage { role: "user" | "assistant"; content: string; }

// ─── HOOKS ───────────────────────────────────────────────────────────────────
async function fetchQuote(ticker: string): Promise<{ price: number; change: number } | null> {
  if (!FINNHUB_KEY) return null;
  try {
    const r = await fetch(`https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${FINNHUB_KEY}`);
    if (!r.ok) return null;
    const d = await r.json();
    if (!d.c || d.c === 0) return null;
    return { price: d.c, change: d.dp ?? 0 };
  } catch { return null; }
}

function useLivePrices(tickers: string[]) {
  const seed: Record<string, PriceData> = {};
  MARKET_TICKERS.forEach(m => { seed[m.ticker] = { price: 0, change: 0, name: m.name, sector: m.sector }; });
  const [prices, setPrices] = useState<Record<string, PriceData>>(seed);
  const [lastUpdated, setLastUpdated] = useState("");

  const refresh = useCallback(async (symbols: string[]) => {
    if (!FINNHUB_KEY) {
      setPrices(prev => {
        const next = { ...prev };
        symbols.forEach(k => {
          if (next[k]) next[k] = { ...next[k], price: Math.max(1, +(next[k].price + (Math.random() - 0.488) * 1.8).toFixed(2)) };
        });
        return next;
      });
      return;
    }
    const results = await Promise.all(symbols.map(async ticker => {
      const meta = MARKET_TICKERS.find(m => m.ticker === ticker);
      const q = await fetchQuote(ticker);
      return { ticker, meta, q };
    }));
    setPrices(prev => {
      const next = { ...prev };
      results.forEach(({ ticker, meta, q }) => {
        if (q) next[ticker] = { price: q.price, change: q.change, name: meta?.name ?? ticker, sector: meta?.sector ?? "—" };
        else if (!next[ticker]) next[ticker] = { price: 0, change: 0, name: meta?.name ?? ticker, sector: meta?.sector ?? "—" };
      });
      return next;
    });
    setLastUpdated(new Date().toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" }));
  }, []);

  useEffect(() => { if (tickers.length > 0) refresh(tickers); }, []);
  useEffect(() => {
    const id = setInterval(() => refresh(tickers), FINNHUB_KEY ? 30_000 : 3000);
    return () => clearInterval(id);
  }, [tickers.join(",")]);

  return { prices, lastUpdated, refresh: () => refresh(tickers) };
}

// ─── SMALL COMPONENTS ─────────────────────────────────────────────────────────
function Badge({ children, color = C.accent }: { children: React.ReactNode; color?: string }) {
  return <span style={{ background: color + "22", color, fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 5, letterSpacing: 0.5 }}>{children}</span>;
}
function Dot({ color, ping }: { color: string; ping?: boolean }) {
  return <span style={{ position: "relative", display: "inline-flex", width: 8, height: 8 }}>
    {ping && <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: color, animation: "ping 1.5s ease infinite" }} />}
    <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, display: "block" }} />
  </span>;
}
function Spinner() {
  return <div style={{ width: 18, height: 18, border: `2px solid ${C.border}`, borderTopColor: C.accent, borderRadius: "50%", animation: "spin 0.8s linear infinite", flexShrink: 0 }} />;
}
function StatCard({ label, value, sub, accent, delay = 0 }: { label: string; value: string; sub?: string; accent?: string; delay?: number }) {
  return <div className={`card anim-fadeUp-${delay}`} style={{ padding: "20px 24px", flex: 1, minWidth: 150 }}>
    <div style={{ fontSize: 11, color: C.muted, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1, fontWeight: 500 }}>{label}</div>
    <div className="mono syne" style={{ fontSize: 26, fontWeight: 700, color: accent || C.white, lineHeight: 1 }}>{value}</div>
    {sub && <div style={{ fontSize: 12, color: C.muted, marginTop: 6 }}>{sub}</div>}
  </div>;
}

// ─── TICKER BANNER ────────────────────────────────────────────────────────────
function TickerBanner({ prices }: { prices: Record<string, PriceData> }) {
  const items = Object.entries(prices).filter(([, d]) => d.price > 0);
  if (items.length === 0) return null;
  const doubled = [...items, ...items];
  return <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, overflow: "hidden", height: 36, display: "flex", alignItems: "center" }}>
    <div style={{ display: "flex", animation: "ticker 40s linear infinite", whiteSpace: "nowrap" }}>
      {doubled.map(([ticker, d], i) => (
        <span key={i} className="mono" style={{ fontSize: 12, padding: "0 24px", color: d.change >= 0 ? C.green : C.red, display: "inline-flex", alignItems: "center", gap: 6 }}>
          <span style={{ color: C.mutedLight, fontWeight: 500 }}>{ticker}</span>
          €{d.price.toFixed(2)} <span>{d.change >= 0 ? "▲" : "▼"}{Math.abs(d.change).toFixed(2)}%</span>
        </span>
      ))}
    </div>
  </div>;
}

// ─── LANDING PAGE ─────────────────────────────────────────────────────────────
function LandingPage({ onLogin, onSignup }: { onLogin: () => void; onSignup: () => void }) {
  return <div style={{ minHeight: "100vh" }}>
    <div style={{ padding: "80px 40px 60px", textAlign: "center", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 600, height: 600, background: `radial-gradient(circle, ${C.accent}0a 0%, transparent 70%)`, pointerEvents: "none" }} />
      <div className="anim-fadeUp" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: C.accentDim, border: `1px solid ${C.accent}44`, borderRadius: 100, padding: "6px 16px", fontSize: 12, color: C.accent, marginBottom: 28, fontWeight: 500 }}>
        <Dot color={C.green} ping /> Live prices · Worldwide
      </div>
      <h1 className="syne anim-fadeUp-1" style={{ fontSize: "clamp(40px, 6vw, 72px)", fontWeight: 800, lineHeight: 1.05, marginBottom: 20, letterSpacing: -2 }}>
        Invest smarter.<br /><span style={{ color: C.accent }}>Earn more.</span>
      </h1>
      <p className="anim-fadeUp-2" style={{ fontSize: 18, color: C.mutedLight, maxWidth: 520, margin: "0 auto 40px", lineHeight: 1.6 }}>
        Portfolio tracker with live prices, smart alerts and AI analysis. Built for serious investors worldwide.
      </p>
      <div className="anim-fadeUp-3" style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
        <button className="btn-primary" onClick={onSignup} style={{ padding: "14px 32px", fontSize: 15 }}>Start for free →</button>
        <button className="btn-ghost" onClick={onLogin}>Log in</button>
      </div>
      <p className="anim-fadeUp-4" style={{ fontSize: 12, color: C.muted, marginTop: 16 }}>No credit card required · Free plan always available</p>
    </div>
    <div style={{ padding: "0 40px 60px", maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
        {[
          { icon: "📊", title: "Portfolio Tracking", desc: "Track all your positions in one place. Live P&L, returns and breakdown by sector." },
          { icon: "🔔", title: "Smart Alerts", desc: "Set price alerts and get notified instantly when your target price is reached." },
          { icon: "🤖", title: "AI Market Analysis", desc: "AI analysis of your portfolio with opportunities and risks per position." },
          { icon: "🌍", title: "Global Markets", desc: "AEX, Nasdaq, NYSE, LSE — everything on one dashboard. Multiple currencies." },
        ].map((f, i) => (
          <div key={i} className="card card-hover" style={{ padding: 24, transition: "all 0.2s" }}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
            <div className="syne" style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{f.title}</div>
            <div style={{ fontSize: 14, color: C.mutedLight, lineHeight: 1.6 }}>{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
    <div style={{ padding: "0 40px 80px", maxWidth: 900, margin: "0 auto" }}>
      <h2 className="syne" style={{ textAlign: "center", fontSize: 36, fontWeight: 800, marginBottom: 8, letterSpacing: -1 }}>Simple pricing</h2>
      <p style={{ textAlign: "center", color: C.muted, fontSize: 15, marginBottom: 40 }}>Start free, upgrade when you're ready.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
        {PLANS.map(plan => (
          <div key={plan.id} className="card" style={{ padding: "28px 24px", border: `1px solid ${plan.id === "pro" ? C.accent + "66" : C.border}`, position: "relative" }}>
            {plan.id === "pro" && <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: C.accent, color: "white", fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 100 }}>MOST POPULAR</div>}
            <div style={{ color: plan.color, fontSize: 13, fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>{plan.name}</div>
            <div className="mono" style={{ fontSize: 36, fontWeight: 700, marginBottom: 4 }}>
              {plan.price === 0 ? "Free" : `€${plan.price}`}
              {plan.price > 0 && <span style={{ fontSize: 14, color: C.muted, fontFamily: "Instrument Sans" }}>/mo</span>}
            </div>
            <div style={{ height: 1, background: C.border, margin: "16px 0" }} />
            {plan.features.map((f, j) => <div key={j} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: C.mutedLight, marginBottom: 8 }}><span style={{ color: plan.color }}>✓</span> {f}</div>)}
            <button className={plan.id === "pro" ? "btn-primary" : "btn-ghost"} onClick={onSignup}
              style={{ width: "100%", marginTop: 20, background: plan.id === "elite" ? C.goldDim : undefined, color: plan.id === "elite" ? C.gold : undefined, borderColor: plan.id === "elite" ? C.gold + "44" : undefined }}>
              {plan.price === 0 ? "Get started free" : "Try 14 days free"}
            </button>
          </div>
        ))}
      </div>
    </div>
  </div>;
}

// ─── AUTH FORM ────────────────────────────────────────────────────────────────
function AuthForm({ mode, onAuth, onSwitch }: { mode: "login" | "signup"; onAuth: (u: Profile) => void; onSwitch: () => void }) {
  const [email, setEmail] = useState("");
  const [pass, setPass]   = useState("");
  const [name, setName]   = useState("");
  const [plan, setPlan]   = useState<Profile["plan"]>("free");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!email || !pass) { setError("Please fill in all fields."); return; }
    if (mode === "signup" && !name) { setError("Please enter your name."); return; }
    setLoading(true); setError("");
    try {
      if (mode === "signup") {
        const { error: signUpError } = await supabase.auth.signUp({ email, password: pass, options: { data: { name } } });
        if (signUpError) { setError(signUpError.message); setLoading(false); return; }
        // Update profile with name and plan
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from("profiles").update({ name, plan }).eq("id", user.id);
          onAuth({ id: user.id, email, name, plan, created_at: new Date().toISOString() });
        }
      } else {
        const { error: signInError, data } = await supabase.auth.signInWithPassword({ email, password: pass });
        if (signInError) { setError(signInError.message); setLoading(false); return; }
        if (data.user) {
          const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single();
          onAuth(profile || { id: data.user.id, email, name: email.split("@")[0], plan: "free", created_at: new Date().toISOString() });
        }
      }
    } catch { setError("Something went wrong. Please try again."); }
    setLoading(false);
  };

  return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
    <div className="card anim-fadeUp" style={{ width: "100%", maxWidth: 420, padding: 36 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        <div style={{ width: 34, height: 34, borderRadius: 9, background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>◈</div>
        <span className="syne" style={{ fontSize: 17, fontWeight: 800 }}>StockPulse</span>
      </div>
      <div className="syne" style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>{mode === "login" ? "Welcome back" : "Create your account"}</div>
      <div style={{ fontSize: 14, color: C.muted, marginBottom: 28 }}>{mode === "login" ? "Log in to your StockPulse account" : "Start free, upgrade whenever"}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {mode === "signup" && <input className="input-field" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />}
        <input className="input-field" type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} />
        <input className="input-field" type="password" placeholder="Password" value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubmit()} />
        {mode === "signup" && (
          <div>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 8 }}>Choose a plan:</div>
            <div style={{ display: "flex", gap: 8 }}>
              {PLANS.map(p => (
                <button key={p.id} onClick={() => setPlan(p.id as Profile["plan"])}
                  style={{ flex: 1, padding: "8px 4px", borderRadius: 8, border: `1px solid ${plan === p.id ? p.color : C.border}`, background: plan === p.id ? p.color + "22" : "transparent", color: plan === p.id ? p.color : C.muted, cursor: "pointer", fontSize: 12, fontWeight: 600, transition: "all 0.2s" }}>
                  {p.name}<br /><span className="mono" style={{ fontSize: 11 }}>{p.price === 0 ? "Free" : `€${p.price}/mo`}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        {error && <div style={{ fontSize: 13, color: C.red, background: C.redDim, padding: "8px 12px", borderRadius: 8 }}>{error}</div>}
        <button className="btn-primary" onClick={handleSubmit} disabled={loading} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 4 }}>
          {loading ? <><Spinner /> {mode === "login" ? "Logging in..." : "Creating account..."}</> : mode === "login" ? "Log in →" : "Create account →"}
        </button>
        <div style={{ textAlign: "center", fontSize: 13, color: C.muted }}>
          {mode === "login" ? "No account yet? " : "Already have an account? "}
          <span style={{ color: C.accent, cursor: "pointer" }} onClick={onSwitch}>{mode === "login" ? "Sign up free" : "Log in"}</span>
        </div>
      </div>
    </div>
  </div>;
}

// ─── CSV IMPORTER ─────────────────────────────────────────────────────────────
interface ParsedPosition { ticker: string; shares: number; avgBuy: number; name: string; }

function parseCSV(text: string): ParsedPosition[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  // Detect IBKR/Lynx format: "Positions,Header,Symbol,Quantity..."
  const isIBKR = lines.some(l => l.startsWith("Positions,Header") || l.startsWith("Open Positions"));
  if (isIBKR) {
    const headerLine = lines.find(l => l.startsWith("Positions,Header") || l.startsWith("Open Positions,Header"));
    if (!headerLine) return [];
    const headers = headerLine.split(",").map(h => h.trim().toLowerCase());
    const symIdx  = headers.findIndex(h => h === "symbol");
    const qtyIdx  = headers.findIndex(h => h === "quantity" || h === "qty");
    const costIdx = headers.findIndex(h => h.includes("cost price") || h.includes("avg price") || h.includes("average price"));
    if (symIdx < 0 || qtyIdx < 0 || costIdx < 0) return [];
    return lines
      .filter(l => l.startsWith("Positions,Data") || l.startsWith("Open Positions,Data"))
      .map(l => {
        const cols = l.split(",");
        const ticker = cols[symIdx]?.trim().toUpperCase();
        const shares = parseFloat(cols[qtyIdx]?.trim().replace(/[^0-9.-]/g, ""));
        const avgBuy = parseFloat(cols[costIdx]?.trim().replace(/[^0-9.-]/g, ""));
        if (!ticker || isNaN(shares) || shares <= 0 || isNaN(avgBuy) || avgBuy <= 0) return null;
        return { ticker, shares, avgBuy, name: ticker };
      })
      .filter(Boolean) as ParsedPosition[];
  }

  // Detect DEGIRO format: has "Product" and "ISIN" columns
  const headerLine = lines[0];
  const headers = headerLine.split(/[,;]/).map(h => h.trim().replace(/"/g, "").toLowerCase());
  const isDEGIRO = headers.some(h => h.includes("product")) && headers.some(h => h.includes("isin"));

  if (isDEGIRO) {
    const symIdx  = headers.findIndex(h => h.includes("symbol") || h.includes("ticker"));
    const prodIdx = headers.findIndex(h => h.includes("product"));
    const qtyIdx  = headers.findIndex(h => h.includes("aantal") || h.includes("quantity") || h.includes("shares"));
    const costIdx = headers.findIndex(h => h.includes("gemiddelde") || h.includes("avg") || h.includes("koers") || h.includes("price"));
    if (qtyIdx < 0) return [];
    return lines.slice(1)
      .filter(l => l.trim())
      .map(l => {
        const cols = l.split(/[,;]/).map(c => c.trim().replace(/"/g, ""));
        const ticker = symIdx >= 0 ? cols[symIdx]?.toUpperCase() : cols[prodIdx]?.toUpperCase() || "";
        const shares = parseFloat(cols[qtyIdx]?.replace(",", ".") || "0");
        const avgBuy = costIdx >= 0 ? parseFloat(cols[costIdx]?.replace(",", ".") || "0") : 0;
        if (!ticker || isNaN(shares) || shares <= 0) return null;
        return { ticker, shares, avgBuy: isNaN(avgBuy) ? 0 : avgBuy, name: cols[prodIdx] || ticker };
      })
      .filter(Boolean) as ParsedPosition[];
  }

  // Universal format: auto-detect ticker/shares/price columns
  const tickerIdx = headers.findIndex(h => ["ticker", "symbol", "stock", "aandeel", "isin"].some(k => h.includes(k)));
  const sharesIdx = headers.findIndex(h => ["shares", "quantity", "qty", "aantal", "hoeveelheid", "amount"].some(k => h.includes(k)));
  const priceIdx  = headers.findIndex(h => ["price", "avg", "cost", "prijs", "koers", "buy"].some(k => h.includes(k)));

  if (tickerIdx < 0 || sharesIdx < 0) return [];

  return lines.slice(1)
    .filter(l => l.trim())
    .map(l => {
      const cols = l.split(/[,;]/).map(c => c.trim().replace(/"/g, ""));
      const ticker = cols[tickerIdx]?.toUpperCase();
      const shares = parseFloat(cols[sharesIdx]?.replace(",", ".") || "0");
      const avgBuy = priceIdx >= 0 ? parseFloat(cols[priceIdx]?.replace(",", ".") || "0") : 0;
      if (!ticker || isNaN(shares) || shares <= 0) return null;
      return { ticker, shares, avgBuy: isNaN(avgBuy) ? 0 : avgBuy, name: ticker };
    })
    .filter(Boolean) as ParsedPosition[];
}

function CSVImporter({ user, onImported }: { user: Profile; onImported: (holdings: any[]) => void }) {
  const [show, setShow]       = useState(false);
  const [preview, setPreview] = useState<ParsedPosition[]>([]);
  const [error, setError]     = useState("");
  const [importing, setImporting] = useState(false);
  const [imported, setImported]   = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(""); setPreview([]); setImported(false);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const positions = parseCSV(text);
      if (positions.length === 0) {
        setError("Could not parse this CSV. Make sure it has ticker, shares and price columns, or use a Lynx/DEGIRO export.");
      } else {
        setPreview(positions);
      }
    };
    reader.readAsText(file);
  };

  const doImport = async () => {
    setImporting(true);
    const rows = preview.map(p => ({ user_id: user.id, ticker: p.ticker, name: p.name, shares: p.shares, avg_buy: p.avgBuy || 0 }));
    const { data, error: err } = await supabase.from("holdings").insert(rows).select();
    if (err) { setError("Import failed. Please try again."); setImporting(false); return; }
    onImported(data || []);
    setImported(true);
    setPreview([]);
    setImporting(false);
    setTimeout(() => { setShow(false); setImported(false); }, 2000);
  };

  if (!show) return (
    <button onClick={() => setShow(true)} className="btn-ghost" style={{ fontSize: 13, padding: "8px 14px", display: "flex", alignItems: "center", gap: 6 }}>
      📁 Import CSV
    </button>
  );

  return (
    <div style={{ position: "fixed", inset: 0, background: "#00000088", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }}>
      <div className="card anim-fadeUp" style={{ width: "100%", maxWidth: 680, padding: 24, maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div className="syne" style={{ fontWeight: 700, fontSize: 16 }}>📁 Import Portfolio CSV</div>
          <button onClick={() => { setShow(false); setPreview([]); setError(""); }} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 20 }}>✕</button>
        </div>

        {/* Supported formats */}
        <div style={{ background: C.accentDim, border: `1px solid ${C.accent}33`, borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 12, color: C.mutedLight }}>
          ✅ Supported: <strong style={{ color: C.text }}>Lynx/IBKR</strong> Activity Statement · <strong style={{ color: C.text }}>DEGIRO</strong> Portfolio Export · <strong style={{ color: C.text }}>Universal CSV</strong> (ticker, shares, price)
        </div>

        {!preview.length && !imported && (
          <div>
            <div onClick={() => fileRef.current?.click()}
              style={{ border: `2px dashed ${C.border}`, borderRadius: 12, padding: "32px 20px", textAlign: "center", cursor: "pointer", transition: "all 0.2s", marginBottom: 12 }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = C.accent)}
              onMouseLeave={e => (e.currentTarget.style.borderColor = C.border)}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📂</div>
              <div style={{ fontSize: 14, color: C.mutedLight, marginBottom: 4 }}>Click to select your CSV file</div>
              <div style={{ fontSize: 11, color: C.muted }}>or drag and drop here</div>
            </div>
            <input ref={fileRef} type="file" accept=".csv,.txt" style={{ display: "none" }} onChange={handleFile} />
            {error && <div style={{ fontSize: 13, color: C.red, background: C.redDim, padding: "10px 14px", borderRadius: 8 }}>{error}</div>}
          </div>
        )}

        {preview.length > 0 && (
          <div>
            <div style={{ fontSize: 13, color: C.green, marginBottom: 12 }}>✅ Found {preview.length} positions — review before importing:</div>
            <div style={{ maxHeight: 240, overflowY: "auto", border: `1px solid ${C.border}`, borderRadius: 10, marginBottom: 16 }}>
              <div className="mono" style={{ display: "grid", gridTemplateColumns: "1fr 90px 110px", padding: "8px 14px", fontSize: 11, color: C.muted, borderBottom: `1px solid ${C.border}` }}>
                <span>TICKER</span><span style={{ textAlign: "right" }}>SHARES</span><span style={{ textAlign: "right" }}>AVG PRICE</span>
              </div>
              {preview.map((p, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 80px 100px", padding: "10px 14px", borderBottom: `1px solid ${C.border}`, fontSize: 13 }}>
                  <span style={{ fontWeight: 600 }}>{p.ticker}</span>
                  <span className="mono" style={{ textAlign: "right" }}>{p.shares}</span>
                  <span className="mono" style={{ textAlign: "right", color: p.avgBuy > 0 ? C.text : C.muted }}>{p.avgBuy > 0 ? `€${p.avgBuy.toFixed(2)}` : "—"}</span>
                </div>
              ))}
            </div>
            {error && <div style={{ fontSize: 13, color: C.red, background: C.redDim, padding: "10px 14px", borderRadius: 8, marginBottom: 12 }}>{error}</div>}
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn-primary" onClick={doImport} disabled={importing} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                {importing ? <><Spinner /> Importing...</> : `✅ Import ${preview.length} positions`}
              </button>
              <button className="btn-ghost" onClick={() => { setPreview([]); setError(""); if (fileRef.current) fileRef.current.value = ""; }}>Cancel</button>
            </div>
          </div>
        )}

        {imported && (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: C.green }}>Portfolio imported successfully!</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── PORTFOLIO TAB ────────────────────────────────────────────────────────────
function PortfolioTab({ prices, user, onRefresh, lastUpdated }: { prices: Record<string, PriceData>; user: Profile; onRefresh: () => void; lastUpdated: string }) {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [form, setForm] = useState({ ticker: "", shares: "", avgBuy: "" });
  const [search, setSearch] = useState("");
  const [addError, setAddError] = useState("");
  const [loadingData, setLoadingData] = useState(true);
  const [showImporter, setShowImporter] = useState(false);

  useEffect(() => {
    supabase.from("holdings").select("*").eq("user_id", user.id).order("added_at", { ascending: true })
      .then(({ data }) => { setHoldings(data || []); setLoadingData(false); });
  }, [user.id]);

  const limit = user.plan === "free" ? 5 : 999;

  const addHolding = async () => {
    setAddError("");
    const ticker = form.ticker.trim().toUpperCase();
    if (!ticker || !form.shares || !form.avgBuy) { setAddError("Fill in all fields."); return; }
    if (holdings.length >= limit) { setAddError(`Free plan is limited to ${limit} positions. Upgrade for unlimited.`); return; }
    const shares = parseFloat(form.shares);
    const avgBuy = parseFloat(form.avgBuy);
    if (isNaN(shares) || shares <= 0) { setAddError("Invalid number of shares."); return; }
    if (isNaN(avgBuy) || avgBuy <= 0) { setAddError("Invalid average buy price."); return; }
    const meta = MARKET_TICKERS.find(m => m.ticker === ticker);
    const { data, error } = await supabase.from("holdings").insert({ user_id: user.id, ticker, name: meta?.name ?? ticker, shares, avg_buy: avgBuy }).select().single();
    if (error) { setAddError("Could not save. Please try again."); return; }
    setHoldings(prev => [...prev, data]);
    setForm({ ticker: "", shares: "", avgBuy: "" });
  };

  const removeHolding = async (id: string) => {
    await supabase.from("holdings").delete().eq("id", id);
    setHoldings(prev => prev.filter(h => h.id !== id));
  };

  const filtered = holdings.filter(h => h.ticker.includes(search.toUpperCase()) || h.name?.toLowerCase().includes(search.toLowerCase()));
  let totalValue = 0, totalCost = 0;
  holdings.forEach(h => { const p = prices[h.ticker]?.price ?? h.avg_buy; totalValue += h.shares * p; totalCost += h.shares * h.avg_buy; });
  const totalPL = totalValue - totalCost;
  const totalPct = totalCost > 0 ? (totalPL / totalCost) * 100 : 0;

  return <div>
    <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
      <StatCard label="Portfolio Value" value={`€${totalValue.toLocaleString("nl-NL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} delay={0} />
      <StatCard label="Total Cost" value={`€${totalCost.toLocaleString("nl-NL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} delay={1} />
      <StatCard label="Total P&L" value={`${totalPL >= 0 ? "+" : ""}€${totalPL.toLocaleString("nl-NL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} accent={totalPL >= 0 ? C.green : C.red} sub={`${totalPct >= 0 ? "+" : ""}${totalPct.toFixed(2)}%`} delay={2} />
      <StatCard label="Positions" value={`${holdings.length}/${user.plan === "free" ? limit : "∞"}`} delay={3} />
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 20 }}>
      <div>
        <div className="card anim-fadeUp" style={{ marginBottom: 16 }}>
          <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}><span className="syne" style={{ fontWeight: 700, fontSize: 14 }}>Add Position</span><CSVImporter user={user} onImported={(newH) => setHoldings(prev => [...prev, ...newH])} /></div>
          <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
            <input className="input-field" placeholder="Ticker (e.g. ASML, NVDA)" value={form.ticker} onChange={e => setForm(p => ({ ...p, ticker: e.target.value.toUpperCase() }))} />
            <input className="input-field" type="number" placeholder="Number of shares" value={form.shares} onChange={e => setForm(p => ({ ...p, shares: e.target.value }))} />
            <input className="input-field" type="number" placeholder="Average buy price (€)" value={form.avgBuy} onChange={e => setForm(p => ({ ...p, avgBuy: e.target.value }))} />
            {addError && <div style={{ fontSize: 12, color: C.red, background: C.redDim, padding: "8px 10px", borderRadius: 7 }}>{addError}</div>}
            <button className="btn-primary" onClick={addHolding}>+ Add to portfolio</button>
          </div>
        </div>
        {lastUpdated && <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.muted, padding: "0 4px", marginBottom: 8 }}>
          <Dot color={C.green} ping /> Prices updated at {lastUpdated}
          <span style={{ marginLeft: "auto", cursor: "pointer", color: C.accent }} onClick={onRefresh}>↻ Refresh</span>
        </div>}
        {!FINNHUB_KEY && <div style={{ fontSize: 11, color: C.gold, background: C.goldDim, padding: "8px 12px", borderRadius: 8 }}>⚠️ Add VITE_FINNHUB_API_KEY for real prices.</div>}
      </div>
      <div className="card anim-fadeUp-1">
        <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 12 }}>
          <span className="syne" style={{ fontWeight: 700, fontSize: 14 }}>Holdings</span>
          <input className="input-field" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 180, padding: "6px 10px", fontSize: 13 }} />
        </div>
        {loadingData ? <div style={{ padding: 32, textAlign: "center" }}><Spinner /></div> :
          filtered.length === 0 ? <div style={{ padding: 40, textAlign: "center", color: C.muted, fontSize: 14 }}>{holdings.length === 0 ? "Add your first position →" : "No matches found."}</div> :
          <div>
            <div className="mono" style={{ display: "grid", gridTemplateColumns: "80px 1fr 100px 100px 100px 80px 36px", padding: "8px 20px", fontSize: 11, color: C.muted, borderBottom: `1px solid ${C.border}` }}>
              <span>TICKER</span><span>NAME</span><span style={{ textAlign: "right" }}>SHARES</span><span style={{ textAlign: "right" }}>BUY</span><span style={{ textAlign: "right" }}>CURRENT</span><span style={{ textAlign: "right" }}>P&L %</span><span />
            </div>
            {filtered.map(h => {
              const cur = prices[h.ticker]?.price ?? h.avg_buy;
              const pl = ((cur - h.avg_buy) / h.avg_buy) * 100;
              const plAbs = (cur - h.avg_buy) * h.shares;
              return <div key={h.id} style={{ display: "grid", gridTemplateColumns: "80px 1fr 100px 100px 100px 80px 36px", padding: "14px 20px", borderBottom: `1px solid ${C.border}`, alignItems: "center", transition: "background 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.background = C.cardHover)} onMouseLeave={e => (e.currentTarget.style.background = "")}>
                <span style={{ fontWeight: 700, fontSize: 13 }}>{h.ticker}</span>
                <div><div style={{ fontSize: 13 }}>{h.name}</div><div style={{ fontSize: 11, color: C.muted }}>€{(cur * h.shares).toFixed(2)} total · {plAbs >= 0 ? "+" : ""}€{plAbs.toFixed(2)}</div></div>
                <span className="mono" style={{ textAlign: "right", fontSize: 13 }}>{h.shares}</span>
                <span className="mono" style={{ textAlign: "right", fontSize: 13, color: C.muted }}>€{h.avg_buy.toFixed(2)}</span>
                <span className="mono" style={{ textAlign: "right", fontSize: 13 }}>{cur > 0 ? `€${cur.toFixed(2)}` : "—"}</span>
                <span className="mono" style={{ textAlign: "right", fontSize: 13, color: pl >= 0 ? C.green : C.red, fontWeight: 600 }}>{pl >= 0 ? "+" : ""}{pl.toFixed(2)}%</span>
                <button onClick={() => removeHolding(h.id)} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 14, padding: 4 }}>✕</button>
              </div>;
            })}
          </div>
        }
      </div>
    </div>
  </div>;
}

// ─── MARKET TAB ───────────────────────────────────────────────────────────────
function MarketTab({ prices, lastUpdated, onRefresh }: { prices: Record<string, PriceData>; lastUpdated: string; onRefresh: () => void }) {
  const [filter, setFilter] = useState("All");
  const sectors = ["All", ...Array.from(new Set(MARKET_TICKERS.map(m => m.sector)))];
  const filtered = MARKET_TICKERS.filter(m => filter === "All" || m.sector === filter);
  return <div>
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {sectors.map(s => <button key={s} className={`tab-btn ${filter === s ? "active" : ""}`} onClick={() => setFilter(s)}>{s}</button>)}
      </div>
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: C.muted }}>
        {lastUpdated && <><Dot color={C.green} ping /> {lastUpdated}</>}
        <span style={{ cursor: "pointer", color: C.accent, marginLeft: 4 }} onClick={onRefresh}>↻</span>
      </div>
    </div>
    <div className="card anim-fadeUp">
      <div className="mono" style={{ display: "grid", gridTemplateColumns: "80px 1fr 120px 100px 100px", padding: "10px 20px", fontSize: 11, color: C.muted, borderBottom: `1px solid ${C.border}` }}>
        <span>TICKER</span><span>NAME</span><span>SECTOR</span><span style={{ textAlign: "right" }}>PRICE</span><span style={{ textAlign: "right" }}>CHANGE</span>
      </div>
      {filtered.map((m, i) => {
        const d = prices[m.ticker]; const hasPrice = d && d.price > 0;
        return <div key={m.ticker} className={`anim-fadeUp-${Math.min(i, 4)}`} style={{ display: "grid", gridTemplateColumns: "80px 1fr 120px 100px 100px", padding: "16px 20px", borderBottom: `1px solid ${C.border}`, alignItems: "center", transition: "background 0.2s" }}
          onMouseEnter={e => (e.currentTarget.style.background = C.cardHover)} onMouseLeave={e => (e.currentTarget.style.background = "")}>
          <span style={{ fontWeight: 700, fontSize: 13 }}>{m.ticker}</span>
          <span style={{ fontSize: 13 }}>{m.name}</span>
          <span><Badge color={C.accent}>{m.sector}</Badge></span>
          <span className="mono" style={{ textAlign: "right", fontSize: 14, fontWeight: 600 }}>{hasPrice ? `€${d.price.toFixed(2)}` : <span style={{ color: C.muted }}>—</span>}</span>
          <span className="mono" style={{ textAlign: "right", fontSize: 13, color: !hasPrice ? C.muted : d.change >= 0 ? C.green : C.red, fontWeight: 600 }}>
            {hasPrice ? `${d.change >= 0 ? "▲" : "▼"} ${Math.abs(d.change).toFixed(2)}%` : "—"}
          </span>
        </div>;
      })}
    </div>
  </div>;
}

// ─── ALERTS TAB ───────────────────────────────────────────────────────────────
function AlertsTab({ prices, user }: { prices: Record<string, PriceData>; user: Profile }) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [form, setForm] = useState({ ticker: "", type: "above" as "above" | "below", target: "" });
  const [log, setLog] = useState<{ id: string; msg: string; price: string; time: string }[]>([]);
  const limit = user.plan === "free" ? 3 : 999;

  useEffect(() => {
    supabase.from("alerts").select("*").eq("user_id", user.id).order("created_at", { ascending: true })
      .then(({ data }) => setAlerts(data || []));
  }, [user.id]);

  useEffect(() => {
    setAlerts(prev => {
      let changed = false;
      const next = prev.map(a => {
        if (a.triggered) return a;
        const cur = prices[a.ticker]?.price;
        if (!cur) return a;
        const triggered = a.type === "above" ? cur >= a.target : cur <= a.target;
        if (triggered) {
          changed = true;
          supabase.from("alerts").update({ triggered: true }).eq("id", a.id);
          const msg = `${a.ticker} ${a.type === "above" ? "rose above" : "dropped below"} €${a.target}`;
          setLog(l => [{ id: Date.now().toString(), msg, price: cur.toFixed(2), time: new Date().toLocaleTimeString("nl-NL") }, ...l.slice(0, 49)]);
          return { ...a, triggered: true };
        }
        return a;
      });
      return changed ? next : prev;
    });
  }, [prices]);

  const addAlert = async () => {
    const ticker = form.ticker.trim().toUpperCase();
    if (!ticker || !form.target) return;
    if (alerts.length >= limit) { alert(`Free plan: max ${limit} alerts. Upgrade for unlimited.`); return; }
    const { data, error } = await supabase.from("alerts").insert({ user_id: user.id, ticker, type: form.type, target: parseFloat(form.target), triggered: false }).select().single();
    if (error) return;
    setAlerts(prev => [...prev, data]);
    setForm({ ticker: "", type: "above", target: "" });
  };

  return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
    <div>
      <div className="card anim-fadeUp" style={{ marginBottom: 16 }}>
        <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.border}` }}>
          <span className="syne" style={{ fontWeight: 700, fontSize: 14 }}>New Price Alert</span>
          <span style={{ marginLeft: 8, fontSize: 11, color: C.muted }}>{alerts.length}/{user.plan === "free" ? limit : "∞"} used</span>
        </div>
        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
          <input className="input-field" placeholder="Ticker (e.g. ASML, NVDA)" value={form.ticker} onChange={e => setForm(p => ({ ...p, ticker: e.target.value.toUpperCase() }))} />
          <select className="input-field" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value as "above" | "below" }))} style={{ background: C.surface }}>
            <option value="above">Price rises above →</option>
            <option value="below">Price drops below →</option>
          </select>
          <input className="input-field" type="number" placeholder="Target price (€)" value={form.target} onChange={e => setForm(p => ({ ...p, target: e.target.value }))} />
          <button className="btn-primary" onClick={addAlert}>🔔 Set alert</button>
        </div>
      </div>
      <div className="card anim-fadeUp-1">
        <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.border}` }}><span className="syne" style={{ fontWeight: 700, fontSize: 14 }}>Active Alerts</span></div>
        {alerts.length === 0 && <div style={{ padding: 24, textAlign: "center", color: C.muted, fontSize: 13 }}>No alerts set.</div>}
        {alerts.map(a => {
          const cur = prices[a.ticker]?.price;
          return <div key={a.id} style={{ padding: "14px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: a.triggered ? C.goldDim : "transparent" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{a.ticker}</span>
                {a.triggered && <Badge color={C.gold}>TRIGGERED</Badge>}
              </div>
              <div className="mono" style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>
                {a.type === "above" ? "▲ above" : "▼ below"} €{a.target}
                {cur && cur > 0 ? <span style={{ marginLeft: 8, color: C.mutedLight }}>· now €{cur.toFixed(2)}</span> : null}
              </div>
            </div>
            <button onClick={async () => { await supabase.from("alerts").delete().eq("id", a.id); setAlerts(prev => prev.filter(x => x.id !== a.id)); }}
              style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 14 }}>✕</button>
          </div>;
        })}
      </div>
    </div>
    <div className="card anim-fadeUp-1">
      <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.border}` }}><span className="syne" style={{ fontWeight: 700, fontSize: 14 }}>🔔 Notification Log</span></div>
      {log.length === 0 ? <div style={{ padding: 32, textAlign: "center", color: C.muted, fontSize: 13 }}>No alerts triggered yet.<br />Prices are being monitored live.</div> :
        log.map(l => <div key={l.id} style={{ padding: "12px 20px", borderBottom: `1px solid ${C.border}`, animation: "fadeIn 0.3s ease" }}>
          <div style={{ fontSize: 13 }}>🔔 {l.msg}</div>
          <div className="mono" style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>€{l.price} · {l.time}</div>
        </div>)}
    </div>
  </div>;
}

// ─── DIVIDENDS TAB ───────────────────────────────────────────────────────────
// Well-known dividend yields (fallback if user hasn't set one)
const KNOWN_YIELDS: Record<string, number> = {
  ASML: 0.9, NVDA: 0.03, MSFT: 0.7, GOOGL: 0.5, AAPL: 0.5,
  ADYEN: 0.0, ASMI: 0.7, MU: 0.4, AMD: 0.0, TSLA: 0.0, META: 0.4,
  NOVO: 1.8, JNJ: 3.0, KO: 3.1, PG: 2.4, VZ: 6.5, T: 5.8,
  SHELL: 4.2, UNILEVER: 3.8, ABN: 5.1, ING: 7.2, PHIA: 3.9,
};

function DividendsTab({ user, prices }: { user: Profile; prices: Record<string, PriceData> }) {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [editYield, setEditYield] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("holdings").select("*").eq("user_id", user.id).order("added_at")
      .then(({ data }) => { setHoldings(data || []); setLoading(false); });
  }, [user.id]);

  const saveYield = async (id: string) => {
    const val = parseFloat(editYield);
    if (isNaN(val) || val < 0) return;
    await supabase.from("holdings").update({ dividend_yield: val }).eq("id", id);
    setHoldings(prev => prev.map(h => h.id === id ? { ...h, dividend_yield: val } : h));
    setEditing(null);
  };

  // Calculate dividends
  const rows = holdings.map(h => {
    const curPrice = prices[h.ticker]?.price ?? h.avg_buy;
    const yld = h.dividend_yield > 0 ? h.dividend_yield : (KNOWN_YIELDS[h.ticker] || 0);
    const annualPerShare = curPrice * (yld / 100);
    const annualTotal = annualPerShare * h.shares;
    const monthlyTotal = annualTotal / 12;
    const quarterlyTotal = annualTotal / 4;
    return { ...h, yld, annualPerShare, annualTotal, monthlyTotal, quarterlyTotal, curPrice };
  });

  const totalAnnual = rows.reduce((s, r) => s + r.annualTotal, 0);
  const totalMonthly = totalAnnual / 12;
  const topPayer = rows.length > 0 ? rows.reduce((a, b) => a.annualTotal > b.annualTotal ? a : b) : null;

  return <div>
    {/* Summary cards */}
    <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
      <StatCard label="Annual Dividend Income" value={`€${totalAnnual.toLocaleString("nl-NL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} accent={C.green} delay={0} />
      <StatCard label="Monthly Income" value={`€${totalMonthly.toLocaleString("nl-NL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} delay={1} />
      <StatCard label="Quarterly Income" value={`€${(totalAnnual / 4).toLocaleString("nl-NL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} delay={2} />
      {topPayer && <StatCard label="Top Dividend Payer" value={topPayer.ticker} sub={`€${topPayer.annualTotal.toFixed(2)}/year`} accent={C.gold} delay={3} />}
    </div>

    <div className="card anim-fadeUp">
      <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span className="syne" style={{ fontWeight: 700, fontSize: 14 }}>💰 Dividend Overview</span>
        <span style={{ fontSize: 12, color: C.muted }}>Click yield % to edit · Pre-filled with known yields</span>
      </div>

      {loading ? <div style={{ padding: 32, textAlign: "center" }}><Spinner /></div> :
        rows.length === 0 ? <div style={{ padding: 40, textAlign: "center", color: C.muted, fontSize: 14 }}>Add stocks to your portfolio first.</div> :
        <div>
          <div className="mono" style={{ display: "grid", gridTemplateColumns: "80px 1fr 80px 100px 100px 100px", padding: "8px 20px", fontSize: 11, color: C.muted, borderBottom: `1px solid ${C.border}` }}>
            <span>TICKER</span><span>NAME</span><span style={{ textAlign: "right" }}>YIELD</span>
            <span style={{ textAlign: "right" }}>ANNUAL</span><span style={{ textAlign: "right" }}>QUARTERLY</span><span style={{ textAlign: "right" }}>MONTHLY</span>
          </div>
          {rows.map(h => (
            <div key={h.id} style={{ display: "grid", gridTemplateColumns: "80px 1fr 80px 100px 100px 100px", padding: "14px 20px", borderBottom: `1px solid ${C.border}`, alignItems: "center", transition: "background 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.background = C.cardHover)} onMouseLeave={e => (e.currentTarget.style.background = "")}>
              <span style={{ fontWeight: 700, fontSize: 13 }}>{h.ticker}</span>
              <div>
                <div style={{ fontSize: 13 }}>{h.name}</div>
                <div style={{ fontSize: 11, color: C.muted }}>{h.shares} shares · €{h.curPrice.toFixed(2)}/share</div>
              </div>
              <div style={{ textAlign: "right" }}>
                {editing === h.id ? (
                  <div style={{ display: "flex", gap: 4, alignItems: "center", justifyContent: "flex-end" }}>
                    <input className="input-field" type="number" value={editYield} onChange={e => setEditYield(e.target.value)}
                      style={{ width: 55, padding: "3px 6px", fontSize: 12 }} onKeyDown={e => e.key === "Enter" && saveYield(h.id)} autoFocus />
                    <span style={{ fontSize: 11, color: C.muted }}>%</span>
                    <button onClick={() => saveYield(h.id)} style={{ background: C.green, border: "none", borderRadius: 5, padding: "3px 7px", color: "white", cursor: "pointer", fontSize: 11 }}>✓</button>
                  </div>
                ) : (
                  <span onClick={() => { setEditing(h.id); setEditYield(h.yld.toString()); }}
                    style={{ fontSize: 13, color: h.yld > 0 ? C.green : C.muted, cursor: "pointer", fontWeight: 600, textDecoration: "underline dotted" }}
                    title="Click to edit">
                    {h.yld > 0 ? `${h.yld.toFixed(1)}%` : "set %"}
                  </span>
                )}
              </div>
              <span className="mono" style={{ textAlign: "right", fontSize: 13, color: h.annualTotal > 0 ? C.green : C.muted }}>
                {h.annualTotal > 0 ? `€${h.annualTotal.toFixed(2)}` : "—"}
              </span>
              <span className="mono" style={{ textAlign: "right", fontSize: 13, color: C.mutedLight }}>
                {h.quarterlyTotal > 0 ? `€${h.quarterlyTotal.toFixed(2)}` : "—"}
              </span>
              <span className="mono" style={{ textAlign: "right", fontSize: 13, color: C.mutedLight }}>
                {h.monthlyTotal > 0 ? `€${h.monthlyTotal.toFixed(2)}` : "—"}
              </span>
            </div>
          ))}
          {/* Total row */}
          <div style={{ display: "grid", gridTemplateColumns: "80px 1fr 80px 100px 100px 100px", padding: "14px 20px", background: C.accentDim, alignItems: "center" }}>
            <span />
            <span className="syne" style={{ fontWeight: 700, fontSize: 13 }}>Total</span>
            <span />
            <span className="mono" style={{ textAlign: "right", fontSize: 14, fontWeight: 700, color: C.green }}>€{totalAnnual.toFixed(2)}</span>
            <span className="mono" style={{ textAlign: "right", fontSize: 13, fontWeight: 600, color: C.green }}>€{(totalAnnual / 4).toFixed(2)}</span>
            <span className="mono" style={{ textAlign: "right", fontSize: 13, fontWeight: 600, color: C.green }}>€{totalMonthly.toFixed(2)}</span>
          </div>
        </div>
      }
    </div>

    {/* Info box */}
    <div style={{ marginTop: 16, padding: "12px 16px", background: C.goldDim, border: `1px solid ${C.gold}44`, borderRadius: 10, fontSize: 12, color: C.mutedLight }}>
      💡 <strong style={{ color: C.gold }}>Tip:</strong> Yields are pre-filled for well-known stocks. Click the yield % to set your own exact dividend yield. Annual dividend = current price × yield × shares.
    </div>
  </div>;
}

// ─── AI ANALYSE TAB ───────────────────────────────────────────────────────────
function AIAnalyseTab({ user, prices }: { user: Profile; prices: Record<string, PriceData> }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState<string | null>(null);
  const [holdings, setHoldings] = useState<Holding[]>([]);

  useEffect(() => {
    supabase.from("holdings").select("*").eq("user_id", user.id).then(({ data }) => setHoldings(data || []));
  }, [user.id]);

  const buildSummary = () => holdings.length === 0 ? "No positions added yet." :
    holdings.map(h => { const p = prices[h.ticker] ?? { price: h.avg_buy, change: 0 }; const pct = ((p.price - h.avg_buy) / h.avg_buy * 100).toFixed(1); return `${h.ticker} (${h.name}): ${h.shares} shares, avg buy €${h.avg_buy}, current €${p.price.toFixed(2)}, P&L: ${pct}%`; }).join("\n");

  const runAnalysis = async () => {
    if (user.plan === "free") { alert("AI Analysis is available in Pro and Elite. Upgrade your plan."); return; }
    setLoading(true); setResult(null);
    try {
      const resp = await fetch("/ai-analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ portfolioSummary: buildSummary(), plan: user.plan }) });
      const data = await resp.json();
      setResult(data.result || data.error || "Could not load analysis.");
    } catch { setResult("❌ Could not connect to AI. Please try again."); }
    setLoading(false);
  };

  return <div style={{ maxWidth: 720 }}>
    <div className="card anim-fadeUp">
      <div style={{ padding: "20px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div className="syne" style={{ fontWeight: 700, fontSize: 16 }}>🤖 AI Portfolio Analysis</div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>Powered by Claude · {user.plan === "free" ? "Upgrade required" : `${user.plan.charAt(0).toUpperCase() + user.plan.slice(1)} plan`}</div>
        </div>
        <button className="btn-primary" onClick={runAnalysis} disabled={loading || user.plan === "free"} style={{ display: "flex", alignItems: "center", gap: 8, opacity: user.plan === "free" ? 0.5 : 1 }}>
          {loading ? <><Spinner /> Analyzing...</> : "▶ Analyze now"}
        </button>
      </div>
      <div style={{ padding: "16px 24px" }}>
        {!result && !loading && <div style={{ textAlign: "center", padding: "32px 0", color: C.muted }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🤖</div>
          <div style={{ fontSize: 14 }}>Click "Analyze now" for an AI analysis of your portfolio.</div>
          {user.plan === "free" && <div style={{ fontSize: 13, color: C.accent, marginTop: 8 }}>Upgrade to Pro or Elite to use AI analysis.</div>}
        </div>}
        {loading && <div style={{ textAlign: "center", padding: "32px 0", color: C.muted }}><div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}><Spinner /></div><div style={{ fontSize: 14 }}>AI is analyzing your portfolio...</div></div>}
        {result && <div style={{ fontSize: 14, lineHeight: 1.85, color: C.text, whiteSpace: "pre-wrap", animation: "fadeUp 0.4s ease" }}>{result}</div>}
      </div>
    </div>
  </div>;
}

// ─── AI CHAT TAB ──────────────────────────────────────────────────────────────
const SUGGESTED_QUESTIONS = ["Should I buy more ASML right now?", "Is my portfolio too risky?", "Which position has the best outlook?", "Am I diversified enough?", "What would you sell first?", "How is my portfolio performing vs the market?"];

function AIChatTab({ user, prices }: { user: Profile; prices: Record<string, PriceData> }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const bottomRef               = useRef<HTMLDivElement>(null);
  const [holdings, setHoldings] = useState<Holding[]>([]);

  useEffect(() => {
    supabase.from("holdings").select("*").eq("user_id", user.id).then(({ data }) => setHoldings(data || []));
  }, [user.id]);

  const portfolioSummary = holdings.length === 0 ? "No positions added yet." :
    holdings.map(h => { const p = prices[h.ticker] ?? { price: h.avg_buy, change: 0 }; const pct = ((p.price - h.avg_buy) / h.avg_buy * 100).toFixed(1); return `${h.ticker} (${h.name}): ${h.shares} shares, avg buy €${h.avg_buy}, current €${p.price.toFixed(2)}, P&L: ${pct}%, today: ${p.change >= 0 ? "+" : ""}${p.change.toFixed(2)}%`; }).join("\n");

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const sendMessage = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    if (user.plan === "free") { alert("AI Chat is available in Pro and Elite. Upgrade your plan."); return; }
    setInput("");
    const userMsg: ChatMessage = { role: "user", content: msg };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    try {
      const history = [...messages.slice(-10), userMsg].map(m => ({ role: m.role, content: m.content }));
      const resp = await fetch("/ai-analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: "chat", message: msg, history: history.slice(0, -1), portfolioSummary }) });
      const data = await resp.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.result || data.error || "Sorry, I could not respond." }]);
    } catch { setMessages(prev => [...prev, { role: "assistant", content: "❌ Connection error. Please try again." }]); }
    setLoading(false);
  };

  const isPro = user.plan !== "free";

  return <div style={{ maxWidth: 760, display: "flex", flexDirection: "column", height: "calc(100vh - 200px)", minHeight: 500 }}>
    <div className="card anim-fadeUp" style={{ marginBottom: 0, borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderBottom: "none" }}>
      <div style={{ padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, animation: "glow 3s ease infinite" }}>🤖</div>
          <div>
            <div className="syne" style={{ fontWeight: 700, fontSize: 15 }}>StockPulse AI Advisor</div>
            <div style={{ fontSize: 11, color: C.green, display: "flex", alignItems: "center", gap: 4 }}><Dot color={C.green} ping={true} /> Online · Knows your portfolio in real time</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {messages.length > 0 && <button className="btn-ghost" style={{ fontSize: 12, padding: "5px 12px" }} onClick={() => setMessages([])}>Clear chat</button>}
          {!isPro && <Badge color={C.gold}>PRO REQUIRED</Badge>}
        </div>
      </div>
    </div>
    <div style={{ flex: 1, overflowY: "auto", background: C.card, border: `1px solid ${C.border}`, borderTop: "none", borderBottom: "none", padding: "16px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
      {messages.length === 0 && <div style={{ textAlign: "center", padding: "32px 0" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
        <div className="syne" style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Ask me anything about your portfolio</div>
        <div style={{ fontSize: 13, color: C.muted, marginBottom: 24 }}>I know your holdings, current prices and P&L in real time.</div>
        {isPro ? <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
          {SUGGESTED_QUESTIONS.map((q, i) => <button key={i} onClick={() => sendMessage(q)}
            style={{ background: C.accentDim, border: `1px solid ${C.accent}44`, borderRadius: 20, padding: "7px 14px", fontSize: 12, color: C.accent, cursor: "pointer", transition: "all 0.2s" }}>{q}</button>)}
        </div> : <div style={{ fontSize: 13, color: C.gold, background: C.goldDim, padding: "12px 20px", borderRadius: 10, display: "inline-block" }}>Upgrade to Pro or Elite to chat with your AI advisor</div>}
      </div>}
      {messages.map((m, i) => <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", animation: "fadeUp 0.3s ease" }}>
        {m.role === "assistant" && <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, marginRight: 10, flexShrink: 0, alignSelf: "flex-end" }}>🤖</div>}
        <div style={{ maxWidth: "75%", padding: "12px 16px", borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px", background: m.role === "user" ? C.accent : C.surface, border: m.role === "assistant" ? `1px solid ${C.border}` : "none", fontSize: 14, lineHeight: 1.7, whiteSpace: "pre-wrap", color: m.role === "user" ? "white" : C.text }}>{m.content}</div>
        {m.role === "user" && <div style={{ width: 30, height: 30, borderRadius: "50%", background: C.accent + "33", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, marginLeft: 10, flexShrink: 0, alignSelf: "flex-end", color: C.accent, fontWeight: 700 }}>{user.name[0].toUpperCase()}</div>}
      </div>)}
      {loading && <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🤖</div>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "18px 18px 18px 4px", padding: "12px 18px", display: "flex", gap: 5, alignItems: "center" }}>
          {[0, 1, 2].map(j => <div key={j} style={{ width: 7, height: 7, borderRadius: "50%", background: C.accent, animation: `pulse 1.2s ${j * 0.2}s ease infinite` }} />)}
        </div>
      </div>}
      <div ref={bottomRef} />
    </div>
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderTop: "none", borderTopLeftRadius: 0, borderTopRightRadius: 0, borderBottomLeftRadius: 16, borderBottomRightRadius: 16, padding: "12px 16px", display: "flex", gap: 10, alignItems: "flex-end" }}>
      <textarea className="input-field" placeholder={isPro ? "Ask anything about your portfolio... (Enter to send)" : "Upgrade to Pro to chat with AI..."} value={input} disabled={!isPro}
        onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
        style={{ resize: "none", height: 44, lineHeight: "24px", paddingTop: 10, flex: 1, opacity: isPro ? 1 : 0.5 }} rows={1} />
      <button className="btn-primary" onClick={() => sendMessage()} disabled={loading || !input.trim() || !isPro}
        style={{ height: 44, width: 44, padding: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
        {loading ? <Spinner /> : "↑"}
      </button>
    </div>
  </div>;
}

// ─── SUPPORT TAB ─────────────────────────────────────────────────────────────
const FAQ_ITEMS = [
  { q: "How do I import my portfolio from Lynx or DEGIRO?", a: "Go to the Portfolio tab and click 'Import CSV'. Export your portfolio from your broker as CSV and upload it. StockPulse supports Lynx/IBKR, DEGIRO and universal CSV formats." },
  { q: "What is the difference between Free, Pro and Elite?", a: "Free gives you 5 positions and 3 alerts. Pro (€19/mo) gives unlimited positions, live prices, unlimited alerts and AI analysis. Elite (€49/mo) adds priority support and API access." },
  { q: "How do I cancel my subscription?", a: "Email support@stockpulse.fit and we will cancel your subscription immediately. A self-service cancel button is coming soon." },
  { q: "How do I set a price alert?", a: "Go to the Alerts tab, enter a ticker symbol, choose 'above' or 'below' and set your target price. You will be notified when the price is reached." },
  { q: "Which stocks are supported?", a: "Any stock with a valid ticker symbol — ASML, NVDA, AAPL, ADYEN and thousands more. If you know the ticker, StockPulse can track it." },
  { q: "How do I use a promo code?", a: "Go to Account tab and enter your promo code in the 'Promo Code' section. It will upgrade your plan instantly for free." },
  { q: "Is my data safe?", a: "Yes — all data is stored securely in Supabase with row-level security. Only you can access your portfolio data." },
  { q: "How often are prices updated?", a: "Live prices are updated every 30 seconds during market hours via Finnhub." },
];

function SupportTab() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [openFaq, setOpenFaq]   = useState<number | null>(null);
  const bottomRef               = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const sendMessage = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput("");
    const userMsg: ChatMessage = { role: "user", content: msg };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    try {
      const history = [...messages.slice(-6), userMsg].map(m => ({ role: m.role, content: m.content }));
      const resp = await fetch("/support-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, history: history.slice(0, -1) }),
      });
      const data = await resp.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.result || "Sorry, I could not respond. Please email support@stockpulse.fit" }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "❌ Connection error. Please email support@stockpulse.fit" }]);
    }
    setLoading(false);
  };

  const QUICK_QUESTIONS = ["How do I import from DEGIRO?", "How do I cancel my subscription?", "What does Pro include?", "How do price alerts work?"];

  return <div style={{ maxWidth: 860, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "start" }}>
    {/* FAQ */}
    <div>
      <div className="card anim-fadeUp" style={{ marginBottom: 16 }}>
        <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.border}` }}>
          <span className="syne" style={{ fontWeight: 700, fontSize: 14 }}>❓ Frequently Asked Questions</span>
        </div>
        {FAQ_ITEMS.map((item, i) => (
          <div key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
            <div onClick={() => setOpenFaq(openFaq === i ? null : i)}
              style={{ padding: "14px 20px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", transition: "background 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.background = C.cardHover)} onMouseLeave={e => (e.currentTarget.style.background = "")}>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{item.q}</span>
              <span style={{ color: C.accent, fontSize: 16, flexShrink: 0, marginLeft: 8 }}>{openFaq === i ? "−" : "+"}</span>
            </div>
            {openFaq === i && (
              <div style={{ padding: "0 20px 14px", fontSize: 13, color: C.mutedLight, lineHeight: 1.6, animation: "fadeIn 0.2s ease" }}>{item.a}</div>
            )}
          </div>
        ))}
      </div>

      {/* Contact */}
      <div className="card anim-fadeUp-1" style={{ padding: 20 }}>
        <div className="syne" style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>📧 Contact Support</div>
        <div style={{ fontSize: 13, color: C.mutedLight, lineHeight: 1.7 }}>
          Can't find your answer? Email us directly:<br />
          <a href="mailto:support@stockpulse.fit" style={{ color: C.accent, textDecoration: "none", fontWeight: 600 }}>support@stockpulse.fit</a>
        </div>
        <div style={{ marginTop: 12, fontSize: 12, color: C.muted }}>We typically respond within 24 hours.</div>
      </div>
    </div>

    {/* AI Support Chat */}
    <div style={{ display: "flex", flexDirection: "column", height: 600 }}>
      <div className="card anim-fadeUp" style={{ marginBottom: 0, borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderBottom: "none" }}>
        <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: `linear-gradient(135deg, ${C.accent}, #8b5cf6)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🆘</div>
          <div>
            <div className="syne" style={{ fontWeight: 700, fontSize: 14 }}>AI Support Assistant</div>
            <div style={{ fontSize: 11, color: C.green, display: "flex", alignItems: "center", gap: 4 }}><Dot color={C.green} ping={true} /> Online · Knows StockPulse inside out</div>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", background: C.card, border: `1px solid ${C.border}`, borderTop: "none", borderBottom: "none", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
        {messages.length === 0 && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🆘</div>
            <div className="syne" style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>How can I help you?</div>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 16 }}>Ask me anything about StockPulse</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center" }}>
              {QUICK_QUESTIONS.map((q, i) => (
                <button key={i} onClick={() => sendMessage(q)}
                  style={{ background: C.accentDim, border: `1px solid ${C.accent}44`, borderRadius: 16, padding: "5px 12px", fontSize: 11, color: C.accent, cursor: "pointer" }}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            {m.role === "assistant" && <div style={{ width: 26, height: 26, borderRadius: "50%", background: `linear-gradient(135deg, ${C.accent}, #8b5cf6)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, marginRight: 8, flexShrink: 0, alignSelf: "flex-end" }}>🆘</div>}
            <div style={{ maxWidth: "80%", padding: "10px 14px", borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px", background: m.role === "user" ? C.accent : C.surface, border: m.role === "assistant" ? `1px solid ${C.border}` : "none", fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-wrap", color: m.role === "user" ? "white" : C.text }}>{m.content}</div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 26, height: 26, borderRadius: "50%", background: `linear-gradient(135deg, ${C.accent}, #8b5cf6)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>🆘</div>
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "16px 16px 16px 4px", padding: "10px 14px", display: "flex", gap: 4 }}>
              {[0, 1, 2].map(j => <div key={j} style={{ width: 6, height: 6, borderRadius: "50%", background: C.accent, animation: `pulse 1.2s ${j * 0.2}s ease infinite` }} />)}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderTop: "none", borderTopLeftRadius: 0, borderTopRightRadius: 0, borderBottomLeftRadius: 16, borderBottomRightRadius: 16, padding: "10px 14px", display: "flex", gap: 8 }}>
        <input className="input-field" placeholder="Ask a question..." value={input}
          onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") sendMessage(); }}
          style={{ flex: 1, height: 38, padding: "8px 12px" }} />
        <button className="btn-primary" onClick={() => sendMessage()} disabled={loading || !input.trim()}
          style={{ height: 38, width: 38, padding: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
          {loading ? <Spinner /> : "↑"}
        </button>
      </div>
    </div>
  </div>;
}

// ─── SETTINGS TAB ─────────────────────────────────────────────────────────────
function SettingsTab({ user, onUpgrade, onPromoApplied, onLogout, onThemeChange, currentTheme }: { user: Profile; onUpgrade: (plan: string) => void; onPromoApplied: (plan: string) => void; onLogout: () => void; onThemeChange: (t: string) => void; currentTheme: string }) {
  const currentPlan = PLANS.find(p => p.id === user.plan) || PLANS[0];
  const [promoCode, setPromoCode] = useState("");
  const [promoMsg, setPromoMsg]   = useState("");
  const [promoLoading, setPromoLoading] = useState(false);

  // Promo codes — friends & family get free upgrades
  const PROMO_CODES: Record<string, string> = {
    "FRIENDS2024": "pro",
    "FAMILY2024":  "elite",
    "STOCKPULSE":  "pro",
  };

  const applyPromo = async () => {
    const code = promoCode.trim().toUpperCase();
    const plan = PROMO_CODES[code];
    if (!plan) { setPromoMsg("❌ Invalid promo code. Please try again."); return; }
    if (plan === user.plan) { setPromoMsg("✅ You already have this plan!"); return; }
    setPromoLoading(true);
    await supabase.from("profiles").update({ plan }).eq("id", user.id);
    onPromoApplied(plan);
    setPromoMsg(`🎉 Code applied! You are now on the ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan.`);
    setPromoLoading(false);
    setPromoCode("");
  };

  return <div style={{ maxWidth: 680 }}>
    <div className="card anim-fadeUp" style={{ marginBottom: 16 }}>
      <div style={{ padding: "14px 24px", borderBottom: `1px solid ${C.border}` }}><span className="syne" style={{ fontWeight: 700, fontSize: 14 }}>Account</span></div>
      <div style={{ padding: 24, display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 52, height: 52, borderRadius: "50%", background: C.accent + "33", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700, color: C.accent }}>{user.name[0].toUpperCase()}</div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 16 }}>{user.name}</div>
          <div style={{ fontSize: 13, color: C.muted }}>{user.email}</div>
          <div style={{ marginTop: 4 }}><Badge color={currentPlan.color}>{currentPlan.name.toUpperCase()} PLAN</Badge></div>
        </div>
      </div>
    </div>

    {/* Promo code */}
    <div className="card anim-fadeUp-1" style={{ marginBottom: 16 }}>
      <div style={{ padding: "14px 24px", borderBottom: `1px solid ${C.border}` }}><span className="syne" style={{ fontWeight: 700, fontSize: 14 }}>🎁 Promo Code</span></div>
      <div style={{ padding: 20, display: "flex", gap: 10, alignItems: "flex-start", flexDirection: "column" }}>
        <div style={{ display: "flex", gap: 10, width: "100%" }}>
          <input className="input-field" placeholder="Enter promo code..." value={promoCode}
            onChange={e => { setPromoCode(e.target.value); setPromoMsg(""); }}
            onKeyDown={e => e.key === "Enter" && applyPromo()}
            style={{ flex: 1 }} />
          <button className="btn-primary" onClick={applyPromo} disabled={promoLoading || !promoCode.trim()}
            style={{ whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 6 }}>
            {promoLoading ? <Spinner /> : "Apply"}
          </button>
        </div>
        {promoMsg && <div style={{ fontSize: 13, color: promoMsg.startsWith("❌") ? C.red : C.green, background: promoMsg.startsWith("❌") ? C.redDim : C.greenDim, padding: "8px 12px", borderRadius: 8, width: "100%" }}>{promoMsg}</div>}
      </div>
    </div>

    {/* Upgrade plans */}
    <div className="card anim-fadeUp-2" style={{ marginBottom: 16 }}>
      <div style={{ padding: "14px 24px", borderBottom: `1px solid ${C.border}` }}><span className="syne" style={{ fontWeight: 700, fontSize: 14 }}>Upgrade Plan</span></div>
      <div style={{ padding: 20, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
        {PLANS.filter(p => p.id !== user.plan).map(plan => (
          <div key={plan.id} className="card" style={{ padding: 16, border: `1px solid ${plan.color}44` }}>
            <div style={{ color: plan.color, fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{plan.name}</div>
            <div className="mono" style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{plan.price === 0 ? "Free" : `€${plan.price}/mo`}</div>
            {plan.features.slice(0, 3).map((f, i) => <div key={i} style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>✓ {f}</div>)}
            <button className="btn-primary" onClick={() => onUpgrade(plan.id)}
              style={{ width: "100%", marginTop: 12, fontSize: 13, padding: 9, background: plan.id === "elite" ? C.gold : C.accent }}>
              {plan.price === 0 ? "Downgrade" : "Pay with Stripe →"}
            </button>
          </div>
        ))}
      </div>
    </div>

    {/* Theme selector */}
    <div className="card anim-fadeUp-3" style={{ marginBottom: 16 }}>
      <div style={{ padding: "14px 24px", borderBottom: `1px solid ${C.border}` }}><span className="syne" style={{ fontWeight: 700, fontSize: 14 }}>🎨 Theme</span></div>
      <div style={{ padding: 20, display: "flex", gap: 12, flexWrap: "wrap" }}>
        {Object.entries(THEME_LABELS).map(([key, { label, preview }]) => (
          <button key={key} onClick={() => onThemeChange(key)}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 10, border: `2px solid ${currentTheme === key ? C.accent : C.border}`, background: currentTheme === key ? C.accentDim : "transparent", cursor: "pointer", transition: "all 0.2s" }}>
            <span style={{ width: 16, height: 16, borderRadius: "50%", background: preview, border: `2px solid ${C.border}`, display: "inline-block", flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: currentTheme === key ? C.accent : C.mutedLight, fontWeight: currentTheme === key ? 600 : 400 }}>{label}</span>
          </button>
        ))}
      </div>
    </div>

    <div className="card anim-fadeUp-4" style={{ padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div style={{ fontSize: 14, color: C.muted }}>Sign out of your account</div>
      <button className="btn-ghost" onClick={onLogout} style={{ color: C.red, borderColor: C.red + "44" }}>Sign out</button>
    </div>
  </div>;
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState<Profile | null>(null);
  const [currentTheme, setCurrentTheme] = useState<string>(() => localStorage.getItem("sp_theme") || "dark");
  C = THEMES[currentTheme] || THEMES.dark;

  const handleThemeChange = (theme: string) => {
    localStorage.setItem("sp_theme", theme);
    setCurrentTheme(theme);
  };
  const [page, setPage] = useState<"landing" | "login" | "signup" | "app">("landing");
  const [tab, setTab]   = useState("portfolio");
  const [checkingAuth, setCheckingAuth] = useState(true);

  const allTickers = MARKET_TICKERS.map(m => m.ticker);
  const { prices, lastUpdated, refresh } = useLivePrices(allTickers);

  // Check existing session on load
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
        if (profile) {
          // Check if returning from Stripe with upgraded plan
          const params = new URLSearchParams(window.location.search);
          const upgraded = params.get("upgraded");
          if (upgraded && ["pro", "elite"].includes(upgraded)) {
            // Update Supabase immediately (don't wait for webhook)
            await supabase.from("profiles").update({ plan: upgraded }).eq("id", session.user.id);
            setUser({ ...profile, plan: upgraded as Profile["plan"] });
            // Clean up URL
            window.history.replaceState({}, "", "/");
          } else {
            setUser(profile);
          }
          setPage("app");
          setTab("settings");
        }
      }
      setCheckingAuth(false);
    });
    supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      if (event === "SIGNED_OUT") { setUser(null); setPage("landing"); }
    });
  }, []);

  const handleAuth = (u: Profile) => { setUser(u); setPage("app"); };
  const handleLogout = async () => { await supabase.auth.signOut(); setUser(null); setPage("landing"); };
  const handlePromoApplied = (planId: string) => {
    setUser(prev => prev ? { ...prev, plan: planId as Profile["plan"] } : prev);
  };

  const handleUpgrade = async (planId: string) => {
    // If downgrading to free or plan set via promo code, just update state
    if (planId === "free") {
      await supabase.from("profiles").update({ plan: planId }).eq("id", user!.id);
      setUser(prev => prev ? { ...prev, plan: planId as Profile["plan"] } : prev);
      return;
    }
    // Update local state immediately (for promo code upgrades)
    setUser(prev => prev ? { ...prev, plan: planId as Profile["plan"] } : prev);
    // For paid plans — redirect to Stripe
    try {
      const resp = await fetch("/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, email: user!.email, userId: user!.id }),
      });
      const data = await resp.json();
      if (data.url) window.location.href = data.url;
      else alert("Could not start checkout. Please try again.");
    } catch { alert("Could not connect to payment system. Please try again."); }
  };

  const TABS = [
    { id: "portfolio", label: "📊 Portfolio" },
    { id: "markt",     label: "🌐 Market" },
    { id: "alerts",    label: "🔔 Alerts" },
    { id: "dividends", label: "💰 Dividends" },
    { id: "ai",        label: "🤖 AI Analysis", pro: true },
    { id: "chat",      label: "💬 AI Chat", pro: true },
    { id: "support",   label: "🆘 Support" },
    { id: "settings",  label: "⚙️ Account" },
  ];

  if (checkingAuth) return <><style>{makeGlobalStyle(C)}</style><div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}><Spinner /></div></>;
  if (page === "landing") return <><style>{makeGlobalStyle(C)}</style><LandingPage onLogin={() => setPage("login")} onSignup={() => setPage("signup")} /></>;
  if (page === "login")   return <><style>{makeGlobalStyle(C)}</style><AuthForm mode="login"  onAuth={handleAuth} onSwitch={() => setPage("signup")} /></>;
  if (page === "signup")  return <><style>{makeGlobalStyle(C)}</style><AuthForm mode="signup" onAuth={handleAuth} onSwitch={() => setPage("login")} /></>;

  return <div style={{ minHeight: "100vh" }}>
    <style>{makeGlobalStyle(C)}</style>
    <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "14px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 34, height: 34, borderRadius: 9, background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, animation: "glow 3s ease infinite" }}>◈</div>
        <div><div className="syne" style={{ fontSize: 17, fontWeight: 800, letterSpacing: -0.5 }}>StockPulse</div><div style={{ fontSize: 10, color: C.muted, fontFamily: "JetBrains Mono" }}>PORTFOLIO PRO</div></div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}><Dot color={C.green} ping /><span style={{ fontSize: 12, color: C.muted }}>{FINNHUB_KEY ? "Live" : "Simulated"}</span></div>
        <Badge color={PLANS.find(p => p.id === user?.plan)?.color || C.muted}>{(user?.plan || "free").toUpperCase()}</Badge>
        <div style={{ fontSize: 13, color: C.mutedLight }}>👤 {user?.name}</div>
      </div>
    </div>
    <TickerBanner prices={prices} />
    <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "10px 28px", display: "flex", gap: 4, overflowX: "auto" }}>
      {TABS.map(t => <button key={t.id} className={`tab-btn ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
        {t.label}{t.pro && user?.plan === "free" && <span style={{ marginLeft: 4, fontSize: 10, color: C.gold }}>PRO</span>}
      </button>)}
    </div>
    <div style={{ padding: 28, maxWidth: 1300, margin: "0 auto" }}>
      {tab === "portfolio" && <PortfolioTab prices={prices} user={user!} onRefresh={refresh} lastUpdated={lastUpdated} />}
      {tab === "markt"     && <MarketTab    prices={prices} lastUpdated={lastUpdated} onRefresh={refresh} />}
      {tab === "alerts"    && <AlertsTab    prices={prices} user={user!} />}
      {tab === "dividends"  && <DividendsTab  prices={prices} user={user!} />}
      {tab === "ai"        && <AIAnalyseTab prices={prices} user={user!} />}
      {tab === "chat"      && <AIChatTab    prices={prices} user={user!} />}
      {tab === "support"    && <SupportTab />}
      {tab === "settings"  && <SettingsTab  user={user!} onUpgrade={handleUpgrade} onPromoApplied={handlePromoApplied} onLogout={handleLogout} onThemeChange={handleThemeChange} currentTheme={currentTheme} />}
    </div>
  </div>;
}
