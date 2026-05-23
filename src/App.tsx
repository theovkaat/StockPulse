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

  .btn-primary {
    background: ${C.accent}; color: white; border: none; border-radius: 10px;
    padding: 11px 24px; cursor: pointer; font-size: 14px; font-weight: 600;
    transition: all 0.2s; letter-spacing: 0.2px;
  }
  .btn-primary:hover { background: #2563eb; transform: translateY(-1px); box-shadow: 0 4px 20px ${C.accentGlow}; }
  .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
  .btn-ghost {
    background: transparent; color: ${C.mutedLight}; border: 1px solid ${C.border};
    border-radius: 10px; padding: 10px 20px; cursor: pointer; font-size: 14px;
    transition: all 0.2s;
  }
  .btn-ghost:hover { border-color: ${C.borderLight}; color: ${C.text}; background: ${C.card}; }

  .card { background: ${C.card}; border: 1px solid ${C.border}; border-radius: 16px; overflow: hidden; }
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
  .tab-btn:not(.active) { background: transparent; color: ${C.muted}; }
  .tab-btn:not(.active):hover { color: ${C.text}; background: ${C.border}; }
`;

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const FINNHUB_KEY = import.meta.env.VITE_FINNHUB_API_KEY || "";

// Popular tickers shown on market tab and ticker banner
const MARKET_TICKERS = [
  { ticker: "ASML",  name: "ASML Holding",      sector: "Semiconductors", mic: "XAMS" },
  { ticker: "NVDA",  name: "Nvidia",             sector: "AI Chips",       mic: "XNAS" },
  { ticker: "MSFT",  name: "Microsoft",          sector: "Cloud/AI",       mic: "XNAS" },
  { ticker: "GOOGL", name: "Alphabet",           sector: "Cloud/AI",       mic: "XNAS" },
  { ticker: "ASMI",  name: "ASM International",  sector: "Semiconductors", mic: "XAMS" },
  { ticker: "ADYEN", name: "Adyen",              sector: "Fintech",        mic: "XAMS" },
  { ticker: "NOVO",  name: "Novo Nordisk",       sector: "Healthcare",     mic: "XCSE" },
  { ticker: "MU",    name: "Micron Technology",  sector: "Memory",         mic: "XNAS" },
  { ticker: "AMD",   name: "AMD",                sector: "AI Chips",       mic: "XNAS" },
  { ticker: "AAPL",  name: "Apple",              sector: "Tech",           mic: "XNAS" },
  { ticker: "TSLA",  name: "Tesla",              sector: "EV/Energy",      mic: "XNAS" },
  { ticker: "META",  name: "Meta",               sector: "Social/AI",      mic: "XNAS" },
];

const PLANS = [
  { id: "free",  name: "Free",  price: 0,  color: C.muted,  features: ["5 positions", "Market overview", "Basic alerts (3)"] },
  { id: "pro",   name: "Pro",   price: 19, color: C.accent, features: ["Unlimited positions", "Live prices", "Unlimited alerts", "Email notifications", "Portfolio analysis"] },
  { id: "elite", name: "Elite", price: 49, color: C.gold,   features: ["Everything in Pro", "AI market analysis", "Weekly email report", "Priority support", "API access"] },
];

// ─── TYPES ────────────────────────────────────────────────────────────────────
interface PriceData {
  price: number;
  change: number;  // percent
  name: string;
  sector: string;
  prevClose?: number;
}

interface Holding {
  id: string;
  ticker: string;
  name: string;
  shares: number;
  avgBuy: number;
  addedAt: string;
}

interface Alert {
  id: string;
  ticker: string;
  type: "above" | "below";
  target: number;
  triggered: boolean;
  createdAt: string;
}

interface User {
  email: string;
  name: string;
  plan: "free" | "pro" | "elite";
}

// ─── HOOKS ───────────────────────────────────────────────────────────────────
function useStorage<T>(key: string, initial: T): [T, (v: T | ((prev: T) => T)) => void] {
  const [val, setVal] = useState<T>(() => {
    try {
      const s = localStorage.getItem(key);
      return s ? JSON.parse(s) : initial;
    } catch { return initial; }
  });
  const set = useCallback((v: T | ((prev: T) => T)) => {
    setVal(prev => {
      const next = typeof v === "function" ? (v as (p: T) => T)(prev) : v;
      try { localStorage.setItem(key, JSON.stringify(next)); } catch {}
      return next;
    });
  }, [key]);
  return [val, set];
}

// Fetch a single quote from Finnhub
async function fetchQuote(ticker: string): Promise<{ price: number; change: number; prevClose: number } | null> {
  if (!FINNHUB_KEY) return null;
  try {
    const r = await fetch(`https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${FINNHUB_KEY}`);
    if (!r.ok) return null;
    const d = await r.json();
    if (!d.c || d.c === 0) return null;
    return {
      price: d.c,
      change: d.dp ?? 0,
      prevClose: d.pc ?? d.c,
    };
  } catch { return null; }
}

function useLivePrices(tickers: string[], extraTickers: string[]) {
  const allTickers = Array.from(new Set([...tickers, ...extraTickers]));

  // Seed with fallback data so UI is never empty
  const seed: Record<string, PriceData> = {};
  MARKET_TICKERS.forEach(m => {
    seed[m.ticker] = { price: 0, change: 0, name: m.name, sector: m.sector };
  });

  const [prices, setPrices] = useState<Record<string, PriceData>>(seed);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [hasFinnhub, setHasFinnhub] = useState(!!FINNHUB_KEY);

  const refresh = useCallback(async (symbols: string[]) => {
    if (!FINNHUB_KEY) {
      // Simulate small price movements when no key
      setPrices(prev => {
        const next = { ...prev };
        symbols.forEach(k => {
          if (next[k]) {
            const delta = (Math.random() - 0.488) * 1.8;
            next[k] = {
              ...next[k],
              price: Math.max(1, +(next[k].price + delta).toFixed(2)),
              change: +(next[k].change + (Math.random() - 0.5) * 0.05).toFixed(2),
            };
          }
        });
        return next;
      });
      return;
    }

    // Fetch in parallel (Finnhub free = 60 req/min)
    const results = await Promise.all(
      symbols.map(async ticker => {
        const meta = MARKET_TICKERS.find(m => m.ticker === ticker);
        const q = await fetchQuote(ticker);
        return { ticker, meta, q };
      })
    );

    setPrices(prev => {
      const next = { ...prev };
      results.forEach(({ ticker, meta, q }) => {
        if (q) {
          next[ticker] = {
            price: q.price,
            change: q.change,
            prevClose: q.prevClose,
            name: meta?.name ?? ticker,
            sector: meta?.sector ?? "—",
          };
          setHasFinnhub(true);
        } else if (!next[ticker]) {
          next[ticker] = { price: 0, change: 0, name: meta?.name ?? ticker, sector: meta?.sector ?? "—" };
        }
      });
      return next;
    });
    setLastUpdated(new Date().toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" }));
  }, []);

  // Initial load
  useEffect(() => {
    if (allTickers.length > 0) refresh(allTickers);
  }, []);

  // Poll every 30s (Finnhub free tier friendly)
  useEffect(() => {
    if (!FINNHUB_KEY) {
      const id = setInterval(() => refresh(allTickers), 3000);
      return () => clearInterval(id);
    }
    const id = setInterval(() => refresh(allTickers), 30_000);
    return () => clearInterval(id);
  }, [allTickers.join(",")]);

  return { prices, lastUpdated, hasFinnhub, refresh: () => refresh(allTickers) };
}

// ─── SMALL COMPONENTS ─────────────────────────────────────────────────────────
function Badge({ children, color = C.accent }: { children: React.ReactNode; color?: string }) {
  return (
    <span style={{ background: color + "22", color, fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 5, letterSpacing: 0.5 }}>
      {children}
    </span>
  );
}

function Dot({ color, ping }: { color: string; ping?: boolean }) {
  return (
    <span style={{ position: "relative", display: "inline-flex", width: 8, height: 8 }}>
      {ping && <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: color, animation: "ping 1.5s ease infinite" }} />}
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, display: "block" }} />
    </span>
  );
}

function Spinner() {
  return <div style={{ width: 18, height: 18, border: `2px solid ${C.border}`, borderTopColor: C.accent, borderRadius: "50%", animation: "spin 0.8s linear infinite", flexShrink: 0 }} />;
}

function StatCard({ label, value, sub, accent, delay = 0 }: { label: string; value: string; sub?: string; accent?: string; delay?: number }) {
  return (
    <div className={`card anim-fadeUp-${delay}`} style={{ padding: "20px 24px", flex: 1, minWidth: 150 }}>
      <div style={{ fontSize: 11, color: C.muted, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1, fontWeight: 500 }}>{label}</div>
      <div className="mono syne" style={{ fontSize: 26, fontWeight: 700, color: accent || C.white, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: C.muted, marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

// ─── TICKER BANNER ────────────────────────────────────────────────────────────
function TickerBanner({ prices }: { prices: Record<string, PriceData> }) {
  const items = Object.entries(prices).filter(([, d]) => d.price > 0);
  if (items.length === 0) return null;
  const doubled = [...items, ...items];
  return (
    <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, overflow: "hidden", height: 36, display: "flex", alignItems: "center" }}>
      <div style={{ display: "flex", animation: "ticker 40s linear infinite", whiteSpace: "nowrap" }}>
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
function LandingPage({ onLogin, onSignup }: { onLogin: () => void; onSignup: () => void }) {
  return (
    <div style={{ minHeight: "100vh" }}>
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
              {plan.id === "pro" && (
                <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: C.accent, color: "white", fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 100 }}>MOST POPULAR</div>
              )}
              <div style={{ color: plan.color, fontSize: 13, fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>{plan.name}</div>
              <div className="mono" style={{ fontSize: 36, fontWeight: 700, marginBottom: 4 }}>
                {plan.price === 0 ? "Free" : `€${plan.price}`}
                {plan.price > 0 && <span style={{ fontSize: 14, color: C.muted, fontFamily: "Instrument Sans" }}>/mo</span>}
              </div>
              <div style={{ height: 1, background: C.border, margin: "16px 0" }} />
              {plan.features.map((f, j) => (
                <div key={j} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: C.mutedLight, marginBottom: 8 }}>
                  <span style={{ color: plan.color }}>✓</span> {f}
                </div>
              ))}
              <button className={plan.id === "pro" ? "btn-primary" : "btn-ghost"} onClick={onSignup}
                style={{ width: "100%", marginTop: 20, background: plan.id === "elite" ? C.goldDim : undefined, color: plan.id === "elite" ? C.gold : undefined, borderColor: plan.id === "elite" ? C.gold + "44" : undefined }}>
                {plan.price === 0 ? "Get started free" : "Try 14 days free"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── AUTH FORM ────────────────────────────────────────────────────────────────
function AuthForm({ mode, onAuth, onSwitch }: { mode: "login" | "signup"; onAuth: (u: User) => void; onSwitch: () => void }) {
  const [email, setEmail] = useState("");
  const [pass, setPass]   = useState("");
  const [name, setName]   = useState("");
  const [plan, setPlan]   = useState<User["plan"]>("free");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!email || !pass) { setError("Please fill in all fields."); return; }
    if (mode === "signup" && !name) { setError("Please enter your name."); return; }
    setLoading(true); setError("");
    await new Promise(r => setTimeout(r, 700));
    setLoading(false);
    onAuth({ email, name: name || email.split("@")[0], plan });
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div className="card anim-fadeUp" style={{ width: "100%", maxWidth: 420, padding: 36 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>◈</div>
          <span className="syne" style={{ fontSize: 17, fontWeight: 800 }}>StockPulse</span>
        </div>
        <div className="syne" style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>
          {mode === "login" ? "Welcome back" : "Create your account"}
        </div>
        <div style={{ fontSize: 14, color: C.muted, marginBottom: 28 }}>
          {mode === "login" ? "Log in to your StockPulse account" : "Start free, upgrade whenever"}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {mode === "signup" && (
            <input className="input-field" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />
          )}
          <input className="input-field" type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} />
          <input className="input-field" type="password" placeholder="Password" value={pass} onChange={e => setPass(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSubmit()} />

          {mode === "signup" && (
            <div>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 8 }}>Choose a plan:</div>
              <div style={{ display: "flex", gap: 8 }}>
                {PLANS.map(p => (
                  <button key={p.id} onClick={() => setPlan(p.id as User["plan"])}
                    style={{ flex: 1, padding: "8px 4px", borderRadius: 8, border: `1px solid ${plan === p.id ? p.color : C.border}`, background: plan === p.id ? p.color + "22" : "transparent", color: plan === p.id ? p.color : C.muted, cursor: "pointer", fontSize: 12, fontWeight: 600, transition: "all 0.2s" }}>
                    {p.name}<br />
                    <span className="mono" style={{ fontSize: 11 }}>{p.price === 0 ? "Free" : `€${p.price}/mo`}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && <div style={{ fontSize: 13, color: C.red, background: C.redDim, padding: "8px 12px", borderRadius: 8 }}>{error}</div>}

          <button className="btn-primary" onClick={handleSubmit} disabled={loading}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 4 }}>
            {loading ? <><Spinner /> {mode === "login" ? "Logging in..." : "Creating account..."}</> : mode === "login" ? "Log in →" : "Create account →"}
          </button>

          <div style={{ textAlign: "center", fontSize: 13, color: C.muted }}>
            {mode === "login" ? "No account yet? " : "Already have an account? "}
            <span style={{ color: C.accent, cursor: "pointer" }} onClick={onSwitch}>
              {mode === "login" ? "Sign up free" : "Log in"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PORTFOLIO TAB ────────────────────────────────────────────────────────────
function PortfolioTab({ prices, user, onRefresh, lastUpdated }: {
  prices: Record<string, PriceData>;
  user: User;
  onRefresh: () => void;
  lastUpdated: string;
}) {
  const [holdings, setHoldings] = useStorage<Holding[]>(`holdings_${user.email}`, []);
  const [form, setForm] = useState({ ticker: "", shares: "", avgBuy: "" });
  const [search, setSearch] = useState("");
  const [addError, setAddError] = useState("");

  const limit = user.plan === "free" ? 5 : 999;

  const addHolding = () => {
    setAddError("");
    const ticker = form.ticker.trim().toUpperCase();
    if (!ticker || !form.shares || !form.avgBuy) { setAddError("Fill in all fields."); return; }
    if (holdings.length >= limit) { setAddError(`Free plan is limited to ${limit} positions. Upgrade for unlimited.`); return; }
    const shares = parseFloat(form.shares);
    const avgBuy = parseFloat(form.avgBuy);
    if (isNaN(shares) || shares <= 0) { setAddError("Invalid number of shares."); return; }
    if (isNaN(avgBuy) || avgBuy <= 0) { setAddError("Invalid average buy price."); return; }
    const meta = MARKET_TICKERS.find(m => m.ticker === ticker);
    const newH: Holding = { id: Date.now().toString(), ticker, name: meta?.name ?? ticker, shares, avgBuy, addedAt: new Date().toISOString() };
    setHoldings(prev => [...prev, newH]);
    setForm({ ticker: "", shares: "", avgBuy: "" });
  };

  const removeHolding = (id: string) => setHoldings(prev => prev.filter(h => h.id !== id));

  const filtered = holdings.filter(h => h.ticker.includes(search.toUpperCase()) || h.name.toLowerCase().includes(search.toLowerCase()));

  // Portfolio stats
  let totalValue = 0, totalCost = 0;
  holdings.forEach(h => {
    const p = prices[h.ticker]?.price ?? h.avgBuy;
    totalValue += h.shares * p;
    totalCost  += h.shares * h.avgBuy;
  });
  const totalPL = totalValue - totalCost;
  const totalPct = totalCost > 0 ? (totalPL / totalCost) * 100 : 0;

  return (
    <div>
      <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
        <StatCard label="Portfolio Value"  value={`€${totalValue.toLocaleString("nl-NL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} delay={0} />
        <StatCard label="Total Cost"       value={`€${totalCost.toLocaleString("nl-NL",  { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} delay={1} />
        <StatCard label="Total P&L"        value={`${totalPL >= 0 ? "+" : ""}€${totalPL.toLocaleString("nl-NL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          accent={totalPL >= 0 ? C.green : C.red} sub={`${totalPct >= 0 ? "+" : ""}${totalPct.toFixed(2)}%`} delay={2} />
        <StatCard label="Positions"        value={`${holdings.length}/${user.plan === "free" ? limit : "∞"}`} delay={3} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 20 }}>
        {/* Add position */}
        <div>
          <div className="card anim-fadeUp" style={{ marginBottom: 16 }}>
            <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.border}` }}>
              <span className="syne" style={{ fontWeight: 700, fontSize: 14 }}>Add Position</span>
            </div>
            <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
              <input className="input-field" placeholder="Ticker (e.g. ASML, NVDA)" value={form.ticker}
                onChange={e => setForm(p => ({ ...p, ticker: e.target.value.toUpperCase() }))} />
              <input className="input-field" type="number" placeholder="Number of shares" value={form.shares}
                onChange={e => setForm(p => ({ ...p, shares: e.target.value }))} />
              <input className="input-field" type="number" placeholder="Average buy price (€)" value={form.avgBuy}
                onChange={e => setForm(p => ({ ...p, avgBuy: e.target.value }))} />
              {addError && <div style={{ fontSize: 12, color: C.red, background: C.redDim, padding: "8px 10px", borderRadius: 7 }}>{addError}</div>}
              <button className="btn-primary" onClick={addHolding}>+ Add to portfolio</button>
            </div>
          </div>

          {/* Last updated */}
          {lastUpdated && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.muted, padding: "0 4px", marginBottom: 8 }}>
              <Dot color={C.green} ping />
              Prices updated at {lastUpdated}
              <span style={{ marginLeft: "auto", cursor: "pointer", color: C.accent }} onClick={onRefresh}>↻ Refresh</span>
            </div>
          )}
          {!FINNHUB_KEY && (
            <div style={{ fontSize: 11, color: C.gold, background: C.goldDim, padding: "8px 12px", borderRadius: 8, marginBottom: 8 }}>
              ⚠️ Add VITE_FINNHUB_API_KEY for real prices. Using simulated data.
            </div>
          )}
        </div>

        {/* Holdings list */}
        <div className="card anim-fadeUp-1">
          <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 12 }}>
            <span className="syne" style={{ fontWeight: 700, fontSize: 14 }}>Holdings</span>
            <input className="input-field" placeholder="Search..." value={search}
              onChange={e => setSearch(e.target.value)} style={{ maxWidth: 180, padding: "6px 10px", fontSize: 13 }} />
          </div>
          {filtered.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: C.muted, fontSize: 14 }}>
              {holdings.length === 0 ? "Add your first position →" : "No matches found."}
            </div>
          ) : (
            <div>
              {/* Header row */}
              <div className="mono" style={{ display: "grid", gridTemplateColumns: "80px 1fr 100px 100px 100px 80px 36px", padding: "8px 20px", fontSize: 11, color: C.muted, borderBottom: `1px solid ${C.border}` }}>
                <span>TICKER</span><span>NAME</span><span style={{ textAlign: "right" }}>SHARES</span>
                <span style={{ textAlign: "right" }}>BUY</span><span style={{ textAlign: "right" }}>CURRENT</span>
                <span style={{ textAlign: "right" }}>P&L %</span><span />
              </div>
              {filtered.map(h => {
                const cur = prices[h.ticker]?.price ?? h.avgBuy;
                const pl  = ((cur - h.avgBuy) / h.avgBuy) * 100;
                const plAbs = (cur - h.avgBuy) * h.shares;
                return (
                  <div key={h.id} style={{ display: "grid", gridTemplateColumns: "80px 1fr 100px 100px 100px 80px 36px", padding: "14px 20px", borderBottom: `1px solid ${C.border}`, alignItems: "center", transition: "background 0.2s" }}
                    onMouseEnter={e => (e.currentTarget.style.background = C.cardHover)}
                    onMouseLeave={e => (e.currentTarget.style.background = "")}>
                    <span style={{ fontWeight: 700, fontSize: 13 }}>{h.ticker}</span>
                    <div>
                      <div style={{ fontSize: 13 }}>{h.name}</div>
                      <div style={{ fontSize: 11, color: C.muted }}>€{(cur * h.shares).toLocaleString("nl-NL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} total · {plAbs >= 0 ? "+" : ""}€{plAbs.toFixed(2)}</div>
                    </div>
                    <span className="mono" style={{ textAlign: "right", fontSize: 13 }}>{h.shares}</span>
                    <span className="mono" style={{ textAlign: "right", fontSize: 13, color: C.muted }}>€{h.avgBuy.toFixed(2)}</span>
                    <span className="mono" style={{ textAlign: "right", fontSize: 13 }}>{cur > 0 ? `€${cur.toFixed(2)}` : "—"}</span>
                    <span className="mono" style={{ textAlign: "right", fontSize: 13, color: pl >= 0 ? C.green : C.red, fontWeight: 600 }}>
                      {pl >= 0 ? "+" : ""}{pl.toFixed(2)}%
                    </span>
                    <button onClick={() => removeHolding(h.id)}
                      style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 14, padding: 4 }}
                      title="Remove">✕</button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── MARKET TAB ───────────────────────────────────────────────────────────────
function MarketTab({ prices, lastUpdated, onRefresh }: { prices: Record<string, PriceData>; lastUpdated: string; onRefresh: () => void }) {
  const [filter, setFilter] = useState("All");
  const sectors = ["All", ...Array.from(new Set(MARKET_TICKERS.map(m => m.sector)))];
  const filtered = MARKET_TICKERS.filter(m => filter === "All" || m.sector === filter);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {sectors.map(s => (
            <button key={s} className={`tab-btn ${filter === s ? "active" : ""}`} onClick={() => setFilter(s)}>{s}</button>
          ))}
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
          const d = prices[m.ticker];
          const hasPrice = d && d.price > 0;
          return (
            <div key={m.ticker} className={`anim-fadeUp-${Math.min(i, 4)}`} style={{ display: "grid", gridTemplateColumns: "80px 1fr 120px 100px 100px", padding: "16px 20px", borderBottom: `1px solid ${C.border}`, alignItems: "center", transition: "background 0.2s", cursor: "default" }}
              onMouseEnter={e => (e.currentTarget.style.background = C.cardHover)}
              onMouseLeave={e => (e.currentTarget.style.background = "")}>
              <span style={{ fontWeight: 700, fontSize: 13 }}>{m.ticker}</span>
              <span style={{ fontSize: 13 }}>{m.name}</span>
              <span><Badge color={C.accent}>{m.sector}</Badge></span>
              <span className="mono" style={{ textAlign: "right", fontSize: 14, fontWeight: 600 }}>
                {hasPrice ? `€${d.price.toFixed(2)}` : <span style={{ color: C.muted }}>—</span>}
              </span>
              <span className="mono" style={{ textAlign: "right", fontSize: 13, color: !hasPrice ? C.muted : d.change >= 0 ? C.green : C.red, fontWeight: 600 }}>
                {hasPrice ? `${d.change >= 0 ? "▲" : "▼"} ${Math.abs(d.change).toFixed(2)}%` : "—"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── ALERTS TAB ───────────────────────────────────────────────────────────────
function AlertsTab({ prices, user }: { prices: Record<string, PriceData>; user: User }) {
  const [alerts, setAlerts] = useStorage<Alert[]>(`alerts_${user.email}`, []);
  const [form, setForm] = useState({ ticker: "", type: "above" as "above" | "below", target: "" });
  const [log, setLog]   = useStorage<{ id: string; msg: string; price: string; time: string }[]>(`alertlog_${user.email}`, []);
  const [emailSim, setEmailSim] = useState<{ msg: string; price: string; time: string } | null>(null);
  const prevPrices = useRef<Record<string, number>>({});
  const limit = user.plan === "free" ? 3 : 999;

  // Check alerts when prices change
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
          const msg = `${a.ticker} ${a.type === "above" ? "rose above" : "dropped below"} €${a.target}`;
          const time = new Date().toLocaleTimeString("nl-NL");
          const entry = { id: Date.now().toString(), msg, price: cur.toFixed(2), time };
          setLog(l => [entry, ...l.slice(0, 49)]);
          if (user.plan !== "free") setEmailSim(entry);
          return { ...a, triggered: true };
        }
        return a;
      });
      return changed ? next : prev;
    });
    prevPrices.current = Object.fromEntries(Object.entries(prices).map(([k, v]) => [k, v.price]));
  }, [prices]);

  const addAlert = () => {
    const ticker = form.ticker.trim().toUpperCase();
    if (!ticker || !form.target) return;
    if (alerts.length >= limit) { alert(`Free plan: max ${limit} alerts. Upgrade for unlimited.`); return; }
    const newA: Alert = { id: Date.now().toString(), ticker, type: form.type, target: parseFloat(form.target), triggered: false, createdAt: new Date().toISOString() };
    setAlerts(prev => [...prev, newA]);
    setForm({ ticker: "", type: "above", target: "" });
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
      <div>
        <div className="card anim-fadeUp" style={{ marginBottom: 16 }}>
          <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.border}` }}>
            <span className="syne" style={{ fontWeight: 700, fontSize: 14 }}>New Price Alert</span>
            <span style={{ marginLeft: 8, fontSize: 11, color: C.muted }}>{alerts.length}/{user.plan === "free" ? limit : "∞"} used</span>
          </div>
          <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
            <input className="input-field" placeholder="Ticker (e.g. ASML, NVDA)" value={form.ticker}
              onChange={e => setForm(p => ({ ...p, ticker: e.target.value.toUpperCase() }))} />
            <select className="input-field" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value as "above" | "below" }))} style={{ background: C.surface }}>
              <option value="above">Price rises above →</option>
              <option value="below">Price drops below →</option>
            </select>
            <input className="input-field" type="number" placeholder="Target price (€)" value={form.target}
              onChange={e => setForm(p => ({ ...p, target: e.target.value }))} />
            <button className="btn-primary" onClick={addAlert}>🔔 Set alert</button>
          </div>
        </div>

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
                    {cur && cur > 0 ? <span style={{ marginLeft: 8, color: C.mutedLight }}>· now €{cur.toFixed(2)}</span> : null}
                  </div>
                </div>
                <button onClick={() => setAlerts(prev => prev.filter(x => x.id !== a.id))}
                  style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 14 }}>✕</button>
              </div>
            );
          })}
        </div>
      </div>

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
            <div style={{ padding: "10px 20px" }}>
              <button className="btn-ghost" style={{ fontSize: 12, padding: "5px 12px" }} onClick={() => setEmailSim(null)}>Close</button>
            </div>
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
              <div style={{ fontSize: 13 }}>🔔 {l.msg}</div>
              <div className="mono" style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>€{l.price} · {l.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── AI ANALYSE TAB ───────────────────────────────────────────────────────────
function AIAnalyseTab({ user, prices }: { user: User; prices: Record<string, PriceData> }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState<string | null>(null);
  const [holdings] = useStorage<Holding[]>(`holdings_${user.email}`, []);

  const runAnalysis = async () => {
    if (user.plan === "free") {
      alert("AI Analysis is available in Pro and Elite. Upgrade your plan.");
      return;
    }
    setLoading(true); setResult(null);
    try {
      const portfolioSummary = holdings.length === 0
        ? "No positions added yet."
        : holdings.map(h => {
            const p = prices[h.ticker] ?? { price: h.avgBuy, change: 0 };
            const pct = ((p.price - h.avgBuy) / h.avgBuy * 100).toFixed(1);
            return `${h.ticker} (${h.name}): ${h.shares} shares, avg buy €${h.avgBuy}, current €${p.price.toFixed(2)}, P&L: ${pct}%`;
          }).join("\n");

      const resp = await fetch("/.netlify/functions/ai-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ portfolioSummary, plan: user.plan }),
      });
      const data = await resp.json();
      setResult(data.result || data.error || "Could not load analysis.");
    } catch {
      setResult("❌ Could not connect to AI. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 720 }}>
      <div className="card anim-fadeUp" style={{ marginBottom: 16 }}>
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div className="syne" style={{ fontWeight: 700, fontSize: 16 }}>🤖 AI Portfolio Analysis</div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>
              Powered by Claude · {user.plan === "free" ? "Upgrade required" : `${user.plan.charAt(0).toUpperCase() + user.plan.slice(1)} plan`}
            </div>
          </div>
          <button className="btn-primary" onClick={runAnalysis} disabled={loading || user.plan === "free"}
            style={{ display: "flex", alignItems: "center", gap: 8, opacity: user.plan === "free" ? 0.5 : 1 }}>
            {loading ? <><Spinner /> Analyzing...</> : "▶ Analyze now"}
          </button>
        </div>
        <div style={{ padding: "16px 24px" }}>
          {!result && !loading && (
            <div style={{ textAlign: "center", padding: "32px 0", color: C.muted }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>🤖</div>
              <div style={{ fontSize: 14 }}>Click "Analyze now" for an AI analysis of your portfolio.</div>
              {user.plan === "free" && <div style={{ fontSize: 13, color: C.accent, marginTop: 8 }}>Upgrade to Pro or Elite to use AI analysis.</div>}
            </div>
          )}
          {loading && (
            <div style={{ textAlign: "center", padding: "32px 0", color: C.muted }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}><Spinner /></div>
              <div style={{ fontSize: 14 }}>AI is analyzing your portfolio...</div>
            </div>
          )}
          {result && (
            <div style={{ fontSize: 14, lineHeight: 1.85, color: C.text, whiteSpace: "pre-wrap", animation: "fadeUp 0.4s ease" }}>{result}</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── AI CHAT TAB ──────────────────────────────────────────────────────────────
interface ChatMessage { role: "user" | "assistant"; content: string; }

const SUGGESTED_QUESTIONS = [
  "Should I buy more ASML right now?",
  "Is my portfolio too risky?",
  "Which position has the best outlook?",
  "Am I diversified enough?",
  "What would you sell first?",
  "How is my portfolio performing vs the market?",
];

function AIChatTab({ user, prices }: { user: User; prices: Record<string, PriceData> }) {
  const [messages, setMessages] = useStorage<ChatMessage[]>(`chat_${user.email}`, []);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const bottomRef               = useRef<HTMLDivElement>(null);
  const [holdings] = useStorage<Holding[]>(`holdings_${user.email}`, []);

  const portfolioSummary = holdings.length === 0
    ? "No positions added yet."
    : holdings.map(h => {
        const p = prices[h.ticker] ?? { price: h.avgBuy, change: 0 };
        const pct = ((p.price - h.avgBuy) / h.avgBuy * 100).toFixed(1);
        return `${h.ticker} (${h.name}): ${h.shares} shares, avg buy €${h.avgBuy}, current €${p.price.toFixed(2)}, P&L: ${pct}%, today: ${p.change >= 0 ? "+" : ""}${p.change.toFixed(2)}%`;
      }).join("\n");

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

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
      const resp = await fetch("/.netlify/functions/ai-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "chat", message: msg, history: history.slice(0, -1), portfolioSummary }),
      });
      const data = await resp.json();
      const reply = data.result || data.error || "Sorry, I could not respond.";
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Connection error. Please try again." }]);
    }
    setLoading(false);
  };

  const isPro = user.plan !== "free";

  return (
    <div style={{ maxWidth: 760, display: "flex", flexDirection: "column", height: "calc(100vh - 200px)", minHeight: 500 }}>
      <div className="card anim-fadeUp" style={{ marginBottom: 0, borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderBottom: "none" }}>
        <div style={{ padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, animation: "glow 3s ease infinite" }}>{"🤖"}</div>
            <div>
              <div className="syne" style={{ fontWeight: 700, fontSize: 15 }}>StockPulse AI Advisor</div>
              <div style={{ fontSize: 11, color: "#10b981", display: "flex", alignItems: "center", gap: 4 }}>
                <Dot color="#10b981" ping={true} /> Online · Knows your portfolio in real time
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {messages.length > 0 && (
              <button className="btn-ghost" style={{ fontSize: 12, padding: "5px 12px" }} onClick={() => setMessages([])}>Clear chat</button>
            )}
            {!isPro && <Badge color="#f59e0b">PRO REQUIRED</Badge>}
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", background: "#111827", border: "1px solid #1a2744", borderTop: "none", borderBottom: "none", padding: "16px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
        {messages.length === 0 && (
          <div style={{ textAlign: "center", padding: "32px 0" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>{"💬"}</div>
            <div className="syne" style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Ask me anything about your portfolio</div>
            <div style={{ fontSize: 13, color: "#64748b", marginBottom: 24 }}>I know your holdings, current prices and P&L in real time.</div>
            {isPro ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
                {SUGGESTED_QUESTIONS.map((q, i) => (
                  <button key={i} onClick={() => sendMessage(q)}
                    style={{ background: "#3b82f618", border: "1px solid #3b82f644", borderRadius: 20, padding: "7px 14px", fontSize: 12, color: "#3b82f6", cursor: "pointer", transition: "all 0.2s" }}>
                    {q}
                  </button>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: 13, color: "#f59e0b", background: "#f59e0b22", padding: "12px 20px", borderRadius: 10, display: "inline-block" }}>
                Upgrade to Pro or Elite to chat with your AI advisor
              </div>
            )}
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", animation: "fadeUp 0.3s ease" }}>
            {m.role === "assistant" && (
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, marginRight: 10, flexShrink: 0, alignSelf: "flex-end" }}>{"🤖"}</div>
            )}
            <div style={{
              maxWidth: "75%", padding: "12px 16px",
              borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
              background: m.role === "user" ? "#3b82f6" : "#0d1117",
              border: m.role === "assistant" ? "1px solid #1a2744" : "none",
              fontSize: 14, lineHeight: 1.7, whiteSpace: "pre-wrap",
              color: m.role === "user" ? "white" : "#f1f5f9",
            }}>
              {m.content}
            </div>
            {m.role === "user" && (
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#3b82f633", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, marginLeft: 10, flexShrink: 0, alignSelf: "flex-end", color: "#3b82f6", fontWeight: 700 }}>
                {user.name[0].toUpperCase()}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, animation: "fadeIn 0.3s ease" }}>
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>{"🤖"}</div>
            <div style={{ background: "#0d1117", border: "1px solid #1a2744", borderRadius: "18px 18px 18px 4px", padding: "12px 18px", display: "flex", gap: 5, alignItems: "center" }}>
              {[0, 1, 2].map(j => (
                <div key={j} style={{ width: 7, height: 7, borderRadius: "50%", background: "#3b82f6", animation: "pulse 1.2s " + (j * 0.2) + "s ease infinite" }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{ background: "#111827", border: "1px solid #1a2744", borderTop: "none", borderTopLeftRadius: 0, borderTopRightRadius: 0, borderBottomLeftRadius: 16, borderBottomRightRadius: 16, padding: "12px 16px", display: "flex", gap: 10, alignItems: "flex-end" }}>
        <textarea
          className="input-field"
          placeholder={isPro ? "Ask anything about your portfolio... (Enter to send)" : "Upgrade to Pro to chat with AI..."}
          value={input}
          disabled={!isPro}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
          style={{ resize: "none", height: 44, lineHeight: "24px", paddingTop: 10, flex: 1, opacity: isPro ? 1 : 0.5 }}
          rows={1}
        />
        <button className="btn-primary" onClick={() => sendMessage()} disabled={loading || !input.trim() || !isPro}
          style={{ height: 44, width: 44, padding: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
          {loading ? <Spinner /> : "↑"}
        </button>
      </div>
    </div>
  );
}


// ─── SETTINGS TAB ─────────────────────────────────────────────────────────────
function SettingsTab({ user, onUpgrade, onLogout }: { user: User; onUpgrade: (plan: string) => void; onLogout: () => void }) {
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
          <span className="syne" style={{ fontWeight: 700, fontSize: 14 }}>Upgrade Plan</span>
        </div>
        <div style={{ padding: 20, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
          {PLANS.filter(p => p.id !== user.plan).map(plan => (
            <div key={plan.id} className="card" style={{ padding: 16, border: `1px solid ${plan.color}44` }}>
              <div style={{ color: plan.color, fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{plan.name}</div>
              <div className="mono" style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
                {plan.price === 0 ? "Free" : `€${plan.price}/mo`}
              </div>
              {plan.features.slice(0, 3).map((f, i) => (
                <div key={i} style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>✓ {f}</div>
              ))}
              <button className="btn-primary" onClick={() => onUpgrade(plan.id)}
                style={{ width: "100%", marginTop: 12, fontSize: 13, padding: 9, background: plan.id === "elite" ? C.gold : C.accent }}>
                Upgrade →
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="card anim-fadeUp-2" style={{ padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 14, color: C.muted }}>Sign out of your account</div>
        <button className="btn-ghost" onClick={onLogout} style={{ color: C.red, borderColor: C.red + "44" }}>Sign out</button>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useStorage<User | null>("sp_user", null);
  const [page, setPage] = useState<"landing" | "login" | "signup" | "app">("landing");
  const [tab, setTab]   = useState("portfolio");

  // Get holdings tickers for price fetching
  const [holdings] = useStorage<Holding[]>(user ? `holdings_${user.email}` : "__none__", []);
  const holdingTickers = holdings.map(h => h.ticker);

  const { prices, lastUpdated, refresh } = useLivePrices(
    MARKET_TICKERS.map(m => m.ticker),
    holdingTickers
  );

  const handleAuth   = (u: User) => { setUser(u); setPage("app"); };
  const handleLogout = () => { setUser(null); setPage("landing"); };
  const handleUpgrade = (planId: string) => {
    const plan = PLANS.find(p => p.id === planId);
    if (planId !== "free") {
      alert(`💳 Stripe checkout would open here for the ${plan?.name} plan (€${plan?.price}/mo).\n\nIn production: integrate Stripe Checkout for payments.`);
    }
    setUser(prev => prev ? { ...prev, plan: planId as User["plan"] } : prev);
  };

  useEffect(() => { if (user) setPage("app"); }, []);

  const TABS = [
    { id: "portfolio", label: "📊 Portfolio" },
    { id: "markt",     label: "🌐 Market" },
    { id: "alerts",    label: "🔔 Alerts" },
    { id: "ai",        label: "🤖 AI Analysis", pro: true },
    { id: "chat",      label: "💬 AI Chat", pro: true },
    { id: "settings",  label: "⚙️ Account" },
  ];

  if (page === "landing") return <><style>{GLOBAL_STYLE}</style><LandingPage onLogin={() => setPage("login")} onSignup={() => setPage("signup")} /></>;
  if (page === "login")   return <><style>{GLOBAL_STYLE}</style><AuthForm mode="login"  onAuth={handleAuth} onSwitch={() => setPage("signup")} /></>;
  if (page === "signup")  return <><style>{GLOBAL_STYLE}</style><AuthForm mode="signup" onAuth={handleAuth} onSwitch={() => setPage("login")} /></>;

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
            <span style={{ fontSize: 12, color: C.muted }}>{FINNHUB_KEY ? "Live" : "Simulated"}</span>
          </div>
          <Badge color={PLANS.find(p => p.id === user?.plan)?.color || C.muted}>{(user?.plan || "free").toUpperCase()}</Badge>
          <div style={{ fontSize: 13, color: C.mutedLight }}>👤 {user?.name}</div>
        </div>
      </div>

      <TickerBanner prices={prices} />

      {/* Nav */}
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "10px 28px", display: "flex", gap: 4, overflowX: "auto" }}>
        {TABS.map(t => (
          <button key={t.id} className={`tab-btn ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
            {t.label}
            {t.pro && user?.plan === "free" && <span style={{ marginLeft: 4, fontSize: 10, color: C.gold }}>PRO</span>}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: 28, maxWidth: 1300, margin: "0 auto" }}>
        {tab === "portfolio" && <PortfolioTab prices={prices} user={user!} onRefresh={refresh} lastUpdated={lastUpdated} />}
        {tab === "markt"     && <MarketTab    prices={prices} lastUpdated={lastUpdated} onRefresh={refresh} />}
        {tab === "alerts"    && <AlertsTab    prices={prices} user={user!} />}
        {tab === "ai"        && <AIAnalyseTab prices={prices} user={user!} />}
        {tab === "chat"      && <AIChatTab    prices={prices} user={user!} />}
        {tab === "settings"  && <SettingsTab  user={user!} onUpgrade={handleUpgrade} onLogout={handleLogout} />}
      </div>
    </div>
  );
}
