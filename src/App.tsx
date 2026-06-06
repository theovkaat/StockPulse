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
// ─── AUTH FORM ────────────────────────────────────────────────────────────────
const AUTH_COPY = {
  nl: {
    welcomeBack: "Welkom terug",
    createAccount: "Maak je account aan",
    loginSub: "Log in op je StockPulse account",
    signupSub: "Gratis starten, upgrade wanneer je wilt",
    name: "Jouw naam",
    email: "E-mailadres",
    password: "Wachtwoord",
    choosePlan: "Kies je plan",
    loginBtn: "Inloggen →",
    signupBtn: "Account aanmaken →",
    loggingIn: "Inloggen...",
    creatingAccount: "Account aanmaken...",
    noAccount: "Nog geen account? ",
    hasAccount: "Al een account? ",
    signupFree: "Gratis registreren",
    login: "Inloggen",
    orGoogle: "Of ga verder met",
    fillFields: "Vul alle velden in.",
    enterName: "Vul je naam in.",
  },
  en: {
    welcomeBack: "Welcome back",
    createAccount: "Create your account",
    loginSub: "Log in to your StockPulse account",
    signupSub: "Start free, upgrade whenever you want",
    name: "Your name",
    email: "Email address",
    password: "Password",
    choosePlan: "Choose your plan",
    loginBtn: "Log in →",
    signupBtn: "Create account →",
    loggingIn: "Logging in...",
    creatingAccount: "Creating account...",
    noAccount: "No account yet? ",
    hasAccount: "Already have an account? ",
    signupFree: "Sign up free",
    login: "Log in",
    orGoogle: "Or continue with",
    fillFields: "Please fill in all fields.",
    enterName: "Please enter your name.",
  },
};

function AuthForm({ mode, onAuth, onSwitch, currentTheme, onThemeChange }: {
  mode: "login" | "signup";
  onAuth: (u: Profile) => void;
  onSwitch: () => void;
  currentTheme: string;
  onThemeChange: (t: string) => void;
}) {
  const lang = navigator.language?.startsWith("nl") ? "nl" : "en";
  const t = AUTH_COPY[lang];
  const [email, setEmail] = useState("");
  const [pass, setPass]   = useState("");
  const [name, setName]   = useState("");
  const [plan, setPlan]   = useState<Profile["plan"]>("free");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!email || !pass) { setError(t.fillFields); return; }
    if (mode === "signup" && !name) { setError(t.enterName); return; }
    setLoading(true); setError("");
    try {
      if (mode === "signup") {
        const { error: signUpError } = await supabase.auth.signUp({ email, password: pass, options: { data: { name } } });
        if (signUpError) { setError(signUpError.message); setLoading(false); return; }
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

  const handleGoogle = async () => {
    setGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin }
    });
    if (error) { setError(error.message); setGoogleLoading(false); }
  };

  return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: C.bg }}>
    <div className="card anim-fadeUp" style={{ width: "100%", maxWidth: 440, padding: 36 }}>
      {/* Logo + Theme picker */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>◈</div>
          <span className="syne" style={{ fontSize: 17, fontWeight: 800 }}>StockPulse</span>
        </div>
        {/* Inline theme switcher */}
        <div style={{ display: "flex", gap: 6 }}>
          {Object.entries(THEME_LABELS).map(([key, { preview }]) => (
            <button key={key} onClick={() => onThemeChange(key)}
              title={THEME_LABELS[key].label}
              style={{ width: 20, height: 20, borderRadius: "50%", background: preview, border: `2px solid ${currentTheme === key ? C.accent : C.border}`, cursor: "pointer", padding: 0, transition: "all 0.2s" }} />
          ))}
        </div>
      </div>

      <div className="syne" style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>
        {mode === "login" ? t.welcomeBack : t.createAccount}
      </div>
      <div style={{ fontSize: 14, color: C.muted, marginBottom: 28 }}>
        {mode === "login" ? t.loginSub : t.signupSub}
      </div>

      {/* Google login button */}
      <button onClick={handleGoogle} disabled={googleLoading}
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "11px 20px", borderRadius: 10, border: `1px solid ${C.border}`, background: C.surface, color: C.text, cursor: "pointer", fontSize: 14, fontWeight: 500, marginBottom: 16, transition: "all 0.2s" }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = C.accent}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = C.border}>
        {googleLoading ? <Spinner /> : <>
          <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          {t.orGoogle} Google
        </>}
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <div style={{ flex: 1, height: 1, background: C.border }} />
        <span style={{ fontSize: 12, color: C.muted }}>of</span>
        <div style={{ flex: 1, height: 1, background: C.border }} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {mode === "signup" && <input className="input-field" placeholder={t.name} value={name} onChange={e => setName(e.target.value)} />}
        <input className="input-field" type="email" placeholder={t.email} value={email} onChange={e => setEmail(e.target.value)} />
        <input className="input-field" type="password" placeholder={t.password} value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubmit()} />
        {mode === "signup" && (
          <div>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 8 }}>{t.choosePlan}:</div>
            <div style={{ display: "flex", gap: 8 }}>
              {PLANS.map(p => (
                <button key={p.id} onClick={() => setPlan(p.id as Profile["plan"])}
                  style={{ flex: 1, padding: "8px 4px", borderRadius: 8, border: `1px solid ${plan === p.id ? p.color : C.border}`, background: plan === p.id ? p.color + "22" : "transparent", color: plan === p.id ? p.color : C.muted, cursor: "pointer", fontSize: 12, fontWeight: 600, transition: "all 0.2s" }}>
                  {p.name}<br /><span className="mono" style={{ fontSize: 11 }}>{p.price === 0 ? "Gratis" : `€${p.price}/mo`}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        {error && <div style={{ fontSize: 13, color: C.red, background: C.redDim, padding: "8px 12px", borderRadius: 8 }}>{error}</div>}
        <button className="btn-primary" onClick={handleSubmit} disabled={loading} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 4 }}>
          {loading ? <><Spinner /> {mode === "login" ? t.loggingIn : t.creatingAccount}</> : mode === "login" ? t.loginBtn : t.signupBtn}
        </button>
        <div style={{ textAlign: "center", fontSize: 13, color: C.muted }}>
          {mode === "login" ? t.noAccount : t.hasAccount}
          <span style={{ color: C.accent, cursor: "pointer" }} onClick={onSwitch}>{mode === "login" ? t.signupFree : t.login}</span>
        </div>
      </div>
    </div>
  </div>;
}
