import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  { auth: { persistSession: true, storageKey: "glaze-auth", storage: window.localStorage } }
);

const fmt = (n) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n ?? 0);
const monthKey = (d) => { const dt = new Date(d); return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,"0")}`; };
const thisMonth = () => monthKey(new Date());
const PLATFORMS = ["TikTok","Instagram","YouTube"];
const ADMIN_EMAIL = "Sapphire_Admin";

const glass = {
  base: "backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl",
  card: "backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-5",
  input: "w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-violet-400/60 focus:bg-white/10 transition-all",
  btn: "px-6 py-3 rounded-xl font-semibold transition-all duration-200 active:scale-95",
};

// ═══════════════════════════════════════════════════════════════
// CREATOR CAROUSEL
// ═══════════════════════════════════════════════════════════════
function CreatorCarousel({ creators }) {
  if (!creators.length) return null;
  const doubled = [...creators, ...creators];
  return (
    <div className="w-full overflow-hidden py-8">
      <p className="text-center text-white/20 text-xs uppercase tracking-widest mb-6">trusted by creators</p>
      <div className="relative">
        <div className="flex gap-6 animate-scroll" style={{width: `${doubled.length * 180}px`}}>
          {doubled.map((c, i) => (
            <a key={i} href={c.tiktok_url || "#"} target="_blank" rel="noreferrer"
              className="flex flex-col items-center gap-2 w-36 shrink-0 group">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-violet-400/50 transition-colors">
                {c.pfp_url
                  ? <img src={c.pfp_url} alt={c.username} className="w-full h-full object-cover" />
                  : <div className="w-full h-full bg-white/10 flex items-center justify-center text-xl">👤</div>}
              </div>
              <p className="text-white/70 text-xs font-medium">@{c.username}</p>
              <p className="text-white/30 text-[10px]">{c.follower_count} followers</p>
            </a>
          ))}
        </div>
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#080810] to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#080810] to-transparent pointer-events-none" />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// LANDING PAGE
// ═══════════════════════════════════════════════════════════════
function LandingPage({ onEnter, creators }) {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <div className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`, backgroundRepeat:"repeat", backgroundSize:"128px"}} />
      <nav className="flex items-center justify-between px-8 pt-8 relative z-10">
        <span className="text-xl font-black tracking-tighter text-white">glaze<span className="text-violet-400">.</span></span>
        <button onClick={onEnter} className="text-sm text-white/50 hover:text-white transition-colors">Sign in →</button>
      </nav>
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center relative z-10 py-24">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-400/20 bg-violet-500/10 text-violet-300 text-xs font-medium mb-10 tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
          built for video editors
        </div>
        <h1 style={{fontFamily:"'Coolvetica', sans-serif"}} className="text-6xl sm:text-8xl text-white leading-[0.95] mb-6 max-w-2xl">
          your promo<br />
          <span style={{fontFamily:"'Coolvetica', sans-serif"}} className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">empire,</span>
          <br />tracked.
        </h1>
        <p className="text-white/45 text-lg max-w-md leading-relaxed mb-12 font-light">
          You edit the videos, land the placements, collect the bags. Glaze keeps your client queue organized, your payments tracked, and your monthly goals in sight.
        </p>
        <button onClick={onEnter} className="px-8 py-4 bg-white text-black font-bold rounded-2xl hover:bg-white/90 active:scale-95 transition-all text-sm tracking-wide shadow-2xl shadow-white/10">
          Start tracking free
        </button>
        <p className="text-white/20 text-xs mt-4">no credit card needed</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-24 max-w-2xl w-full text-left">
          {[
            { icon:"⚡", title:"Client Queue", body:"Keep every promo deal organized by due date and priority. No more lost DMs or forgotten invoices." },
            { icon:"💸", title:"Earnings Tracker", body:"See your lifetime earnings, monthly goal progress, and which clients are paying the most." },
            { icon:"📁", title:"Payment Proof", body:"Attach your TikTok links and payment screenshots to every completed deal." },
          ].map((f) => (
            <div key={f.title} className="backdrop-blur-xl bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5 space-y-2">
              <span className="text-2xl">{f.icon}</span>
              <p className="text-white font-semibold text-sm">{f.title}</p>
              <p className="text-white/35 text-xs leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
        <CreatorCarousel creators={creators} />
      </main>
      <footer className="text-center pb-10 relative z-10 space-y-1">
        <p className="text-white/20 text-xs">made by creators, for creators</p>
        <p className="text-white/15 text-xs">sincerely, sapphire 🤍</p>
      </footer>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// AUTH SCREEN
// ═══════════════════════════════════════════════════════════════
function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    const fn = mode === "login"
      ? supabase.auth.signInWithPassword({ email, password })
      : supabase.auth.signUp({ email, password });
    const { data, error: err } = await fn;
    setLoading(false);
    if (err) return setError(err.message);
    if (data.user) onAuth(data.user);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className={`${glass.card} w-full max-w-sm space-y-6`}>
        <div className="text-center space-y-1">
          <div className="text-4xl font-black tracking-tighter text-white">glaze<span className="text-violet-400">.</span></div>
          <p className="text-white/40 text-sm">your promo empire, tracked</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <input className={glass.input} type="email" placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input className={glass.input} type="password" placeholder="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {error && <p className="text-rose-400 text-sm">{error}</p>}
          <button type="submit" className={`${glass.btn} w-full bg-violet-500/80 hover:bg-violet-500 text-white`} disabled={loading}>
            {loading ? "…" : mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>
        <p className="text-center text-white/40 text-sm">
          {mode === "login" ? "New here? " : "Already have an account? "}
          <button className="text-violet-400 hover:text-violet-300 transition-colors" onClick={() => setMode(mode === "login" ? "signup" : "login")}>
            {mode === "login" ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ADD PROMO MODAL
// ═══════════════════════════════════════════════════════════════
function AddPromoModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ client_name:"", platform:"TikTok", amount:"", due_date:"", notes:"", priority:false });
  const [loading, setLoading] = useState(false);
  const set = (k,v) => setForm(f => ({...f,[k]:v}));
  const submit = async (e) => {
    e.preventDefault(); setLoading(true);
    await onAdd({...form, amount: parseFloat(form.amount)});
    setLoading(false); onClose();
  };
  return (
    <Overlay onClose={onClose}>
      <div className={`${glass.card} w-full max-w-md space-y-4`} onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-white">New Promo</h2>
        <form onSubmit={submit} className="space-y-3">
          <input className={glass.input} placeholder="Client name" value={form.client_name} onChange={e => set("client_name", e.target.value)} required />
          <select className={`${glass.input} appearance-none cursor-pointer`} value={form.platform} onChange={e => set("platform", e.target.value)}>
            {PLATFORMS.map(p => <option key={p} value={p} className="bg-gray-900 text-white">{p}</option>)}
          </select>
          <input className={glass.input} type="number" placeholder="Amount ($)" value={form.amount} onChange={e => set("amount", e.target.value)} required min="0" step="0.01" />
          <input className={glass.input} placeholder="Due date (YYYY-MM-DD)" value={form.due_date} onChange={e => set("due_date", e.target.value)} />
          <textarea className={`${glass.input} resize-none`} rows={2} placeholder="Notes…" value={form.notes} onChange={e => set("notes", e.target.value)} />
          <label className="flex items-center gap-3 text-white/70 cursor-pointer">
            <div onClick={() => set("priority", !form.priority)} className={`w-10 h-6 rounded-full transition-colors ${form.priority ? "bg-violet-500" : "bg-white/15"} relative`}>
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${form.priority ? "translate-x-5" : "translate-x-1"}`} />
            </div>
            Priority
          </label>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className={`${glass.btn} flex-1 bg-white/5 hover:bg-white/10 text-white`}>Cancel</button>
            <button type="submit" disabled={loading} className={`${glass.btn} flex-1 bg-violet-500/80 hover:bg-violet-500 text-white`}>{loading ? "…" : "Add Promo"}</button>
          </div>
        </form>
      </div>
    </Overlay>
  );
}

// ═══════════════════════════════════════════════════════════════
// COMPLETION MODAL
// ═══════════════════════════════════════════════════════════════
function CompletionModal({ promo, onClose, onComplete }) {
  const [link, setLink] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const submit = async (e) => {
    e.preventDefault(); setLoading(true);
    let screenshot_url = null;
    if (file) {
      const path = `${promo.user_id}/${Date.now()}-${file.name}`;
      const { data } = await supabase.storage.from("screenshots").upload(path, file);
      if (data) { const { data: pub } = supabase.storage.from("screenshots").getPublicUrl(path); screenshot_url = pub.publicUrl; }
    }
    await onComplete(promo.id, { work_link: link, screenshot_url });
    setLoading(false); onClose();
  };
  return (
    <Overlay onClose={onClose}>
      <div className={`${glass.card} w-full max-w-md space-y-5`} onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-white">Mark Complete</h2>
        <p className="text-white/50 text-sm">{promo.client_name} · {fmt(promo.amount)}</p>
        <form onSubmit={submit} className="space-y-4">
          <input className={glass.input} placeholder="Link to your video" value={link} onChange={e => setLink(e.target.value)} />
          <div>
            <label className="block text-white/50 text-sm mb-2">Payment screenshot</label>
            <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} className="text-white/60 text-sm" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className={`${glass.btn} flex-1 bg-white/5 hover:bg-white/10 text-white`}>Cancel</button>
            <button type="submit" disabled={loading} className={`${glass.btn} flex-1 bg-emerald-500/80 hover:bg-emerald-500 text-white`}>{loading ? "…" : "Complete ✓"}</button>
          </div>
        </form>
      </div>
    </Overlay>
  );
}

function Overlay({ onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative w-full flex justify-center" onClick={e => e.stopPropagation()}>{children}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// HOME TAB
// ═══════════════════════════════════════════════════════════════
function HomeTab({ promos, goal, onUpdateGoal, onAdd, onComplete, onTogglePriority, onDelete }) {
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(goal);
  const [completingPromo, setCompletingPromo] = useState(null);
  const activePromos = promos.filter(p => !p.completed).sort((a,b) => {
    if (b.priority !== a.priority) return b.priority - a.priority;
    return new Date(a.due_date||"9999") - new Date(b.due_date||"9999");
  });
  const monthEarned = promos.filter(p => p.completed && monthKey(p.completed_at) === thisMonth()).reduce((s,p) => s+p.amount, 0);
  const pct = Math.min(100, Math.round((monthEarned/(goal||1))*100));
  const saveGoal = () => { onUpdateGoal(parseFloat(goalInput)||0); setEditingGoal(false); };
  return (
    <div className="space-y-5 pb-32">
      <div className={`${glass.card} space-y-3`}>
        <div className="flex items-center justify-between text-sm text-white/60">
          <span>{pct}% this month</span>
          {editingGoal ? (
            <form onSubmit={e => { e.preventDefault(); saveGoal(); }} className="flex gap-2">
              <input className="bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-white w-28 text-right text-sm focus:outline-none" type="number" value={goalInput} autoFocus onChange={e => setGoalInput(e.target.value)} onBlur={saveGoal} min="0" />
            </form>
          ) : (
            <button className="text-white/80 hover:text-violet-300 transition-colors font-semibold" onClick={() => setEditingGoal(true)}>Goal: {fmt(goal)}</button>
          )}
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full transition-all duration-700" style={{width:`${pct}%`}} />
        </div>
        <p className="text-white/40 text-xs">{fmt(monthEarned)} earned · {fmt(Math.max(0,goal-monthEarned))} to go</p>
      </div>
      <div className="space-y-3">
        {activePromos.length === 0 && <div className="text-center text-white/30 py-12 text-sm">no active promos — tap + to add one</div>}
        {activePromos.map(p => (
          <div key={p.id} className={`${glass.base} p-4 flex items-center gap-3 relative overflow-hidden`}>
            {p.priority && <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-violet-400 to-fuchsia-500 rounded-l-2xl" />}
            <div className="flex-1 min-w-0 ml-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-white truncate">{p.client_name}</span>
                {p.platform && <span className="text-[11px] text-white/40 bg-white/10 px-2 py-0.5 rounded-full">{p.platform}</span>}
              </div>
              {p.due_date && <p className="text-xs text-white/40 mt-0.5">Due {new Date(p.due_date).toLocaleDateString()}</p>}
            </div>
            <span className="text-emerald-400 font-bold shrink-0">{fmt(p.amount)}</span>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => onTogglePriority(p.id, !p.priority)} className={`text-base transition-all ${p.priority ? "opacity-100" : "opacity-25 hover:opacity-60"}`}>⚡</button>
              <button onClick={() => setCompletingPromo(p)} className="text-xs bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-400 px-2 py-1.5 rounded-lg transition-all">Done</button>
              <button onClick={() => onDelete(p.id)} className="text-white/20 hover:text-rose-400 transition-colors text-lg leading-none px-1">×</button>
            </div>
          </div>
        ))}
      </div>
      {completingPromo && <CompletionModal promo={completingPromo} onClose={() => setCompletingPromo(null)} onComplete={onComplete} />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// STATS TAB
// ═══════════════════════════════════════════════════════════════
function StatsTab({ promos, goal }) {
  const completed = promos.filter(p => p.completed);
  const active = promos.filter(p => !p.completed);
  const totalEarned = completed.reduce((s,p) => s+p.amount, 0);
  const monthEarned = completed.filter(p => monthKey(p.completed_at) === thisMonth()).reduce((s,p) => s+p.amount, 0);
  const pct = Math.min(100, Math.round((monthEarned/(goal||1))*100));
  const projection = monthEarned + active.reduce((s,p) => s+p.amount, 0);
  const avgPayment = completed.length ? totalEarned/completed.length : 0;
  const clientMap = {};
  completed.forEach(p => { clientMap[p.client_name] = (clientMap[p.client_name]||0)+p.amount; });
  const bestClient = Object.entries(clientMap).sort((a,b) => b[1]-a[1])[0];
  const monthlyMap = {};
  completed.forEach(p => { const k = monthKey(p.completed_at); monthlyMap[k] = (monthlyMap[k]||0)+p.amount; });
  const months = Object.entries(monthlyMap).sort((a,b) => b[0].localeCompare(a[0])).slice(0,12);
  const maxMonth = Math.max(...months.map(m => m[1]), 1);
  const bestMonth = [...months].sort((a,b) => b[1]-a[1])[0];
  const sortedMonths = [...months].sort((a,b) => a[0].localeCompare(b[0]));
  const fmtMonth = k => { const [y,m] = k.split("-"); return new Date(y,m-1).toLocaleDateString("en-US",{month:"short",year:"2-digit"}); };
  return (
    <div className="space-y-4 pb-32">
      <div className={`${glass.card} text-center`}>
        <p className="text-white/40 text-xs uppercase tracking-widest mb-1">Lifetime Earnings</p>
        <p className="text-5xl font-black text-white">{fmt(totalEarned)}</p>
        <p className="text-white/30 text-sm mt-1">across {completed.length} promos</p>
      </div>
      <div className={`${glass.card} space-y-3`}>
        <div className="flex justify-between text-sm text-white/60"><span>This month</span><span>Goal: {fmt(goal)}</span></div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full transition-all duration-700" style={{width:`${pct}%`}} /></div>
        <div className="flex justify-between text-xs text-white/40"><span>{fmt(monthEarned)} earned</span><span>{pct}%</span></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className={glass.card}><p className="text-white/40 text-xs mb-1">Avg / promo</p><p className="text-2xl font-bold text-white">{fmt(avgPayment)}</p></div>
        <div className={glass.card}><p className="text-white/40 text-xs mb-1">Projection</p><p className="text-2xl font-bold text-emerald-400">{fmt(projection)}</p><p className="text-[10px] text-white/30">if all active pay</p></div>
        {bestClient && <div className={glass.card}><p className="text-white/40 text-xs mb-1">Best Client</p><p className="text-white font-bold truncate">{bestClient[0]}</p><p className="text-violet-400 text-sm">{fmt(bestClient[1])}</p></div>}
        {bestMonth && <div className={glass.card}><p className="text-white/40 text-xs mb-1">Best Month</p><p className="text-white font-bold">{fmtMonth(bestMonth[0])}</p><p className="text-fuchsia-400 text-sm">{fmt(bestMonth[1])}</p></div>}
      </div>
      {sortedMonths.length > 0 && (
        <div className={`${glass.card} space-y-3`}>
          <p className="text-white/60 text-sm font-semibold">Monthly Breakdown</p>
          <div className="space-y-2">
            {sortedMonths.map(([k,v]) => (
              <div key={k} className="flex items-center gap-3">
                <span className="text-xs text-white/40 w-14 shrink-0">{fmtMonth(k)}</span>
                <div className="flex-1 bg-white/5 rounded-full h-2 overflow-hidden"><div className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-400 rounded-full" style={{width:`${(v/maxMonth)*100}%`}} /></div>
                <span className="text-xs text-white/70 w-16 text-right">{fmt(v)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// HISTORY TAB
// ═══════════════════════════════════════════════════════════════
function HistoryTab({ promos, onDelete }) {
  const completed = promos.filter(p => p.completed).sort((a,b) => new Date(b.completed_at)-new Date(a.completed_at));
  return (
    <div className="space-y-3 pb-32">
      {completed.length === 0 && <div className="text-center text-white/30 py-16 text-sm">no completed promos yet</div>}
      {completed.map(p => (
        <div key={p.id} className={`${glass.card} space-y-3`}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-semibold text-white truncate">{p.client_name}</p>
              {p.platform && <p className="text-xs text-white/40">{p.platform}</p>}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-emerald-400 font-bold">{fmt(p.amount)}</span>
              <button onClick={() => onDelete(p.id)} className="text-white/20 hover:text-rose-400 transition-colors text-lg leading-none">×</button>
            </div>
          </div>
          {p.completed_at && <p className="text-xs text-white/30">Completed {new Date(p.completed_at).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}</p>}
          <div className="flex gap-3">
            {p.work_link && <a href={p.work_link} target="_blank" rel="noreferrer" className="text-xs text-violet-400 hover:text-violet-300 underline underline-offset-2">View Video →</a>}
            {p.screenshot_url && <a href={p.screenshot_url} target="_blank" rel="noreferrer" className="text-xs text-fuchsia-400 hover:text-fuchsia-300 underline underline-offset-2">Payment Proof →</a>}
          </div>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PROFILE TAB
// ═══════════════════════════════════════════════════════════════
function ProfileTab({ user, onSignOut }) {
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [displayName, setDisplayName] = useState(user.user_metadata?.display_name||"");
  const [avatar, setAvatar] = useState(user.user_metadata?.avatar_url||null);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);

  const showMsg = m => { setMsg(m); setTimeout(() => setMsg(""), 3000); };

  const updateName = async () => {
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ data: { display_name: displayName } });
    setLoading(false); showMsg(error ? error.message : "Name updated ✓");
  };

  const updateEmail = async () => {
    if (!newEmail) return; setLoading(true);
    const { error } = await supabase.auth.updateUser({ email: newEmail });
    setLoading(false); showMsg(error ? error.message : "Confirmation sent ✓"); setNewEmail("");
  };

  const updatePassword = async () => {
    if (!newPassword) return; setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false); showMsg(error ? error.message : "Password updated ✓"); setNewPassword("");
  };

  const uploadAvatar = async (e) => {
    const file = e.target.files[0]; if (!file) return; setLoading(true);
    const path = `avatars/${user.id}`;
    const { error: uploadErr } = await supabase.storage.from("screenshots").upload(path, file, { upsert: true });
    if (uploadErr) { showMsg(uploadErr.message); setLoading(false); return; }
    const { data: pub } = supabase.storage.from("screenshots").getPublicUrl(path);
    await supabase.auth.updateUser({ data: { avatar_url: pub.publicUrl } });
    setAvatar(pub.publicUrl + "?t=" + Date.now()); setLoading(false); showMsg("Avatar updated ✓");
  };

  const submitFeedback = async () => {
    if (!feedbackText.trim()) return;
    const { error } = await supabase.from("feedback").insert([{ user_id: user.id, message: feedbackText.trim() }]);
    if (!error) { setFeedbackText(""); setFeedbackSent(true); setTimeout(() => setFeedbackSent(false), 3000); }
  };

  return (
    <div className="space-y-4 pb-32">
      <div className={`${glass.card} flex items-center gap-4`}>
        <label className="cursor-pointer relative group shrink-0">
          <div className="w-16 h-16 rounded-2xl bg-white/10 overflow-hidden flex items-center justify-center text-2xl">
            {avatar ? <img src={avatar} alt="avatar" className="w-full h-full object-cover" /> : "👤"}
          </div>
          <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs text-white">edit</div>
          <input type="file" accept="image/*" className="hidden" onChange={uploadAvatar} />
        </label>
        <div className="flex-1 min-w-0">
          <p className="text-white/40 text-xs mb-1">Display name</p>
          <div className="flex gap-2">
            <input className={`${glass.input} py-2 text-sm`} value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Your name" />
            <button onClick={updateName} className="px-3 py-2 bg-violet-500/60 hover:bg-violet-500 rounded-xl text-white text-sm transition-all shrink-0">✓</button>
          </div>
        </div>
      </div>
      <div className={glass.card}><p className="text-white/40 text-xs mb-1">Current email</p><p className="text-white/70 text-sm">{user.email}</p></div>
      <div className={`${glass.card} space-y-3`}>
        <p className="text-white/60 text-sm font-semibold">Change Email</p>
        <input className={glass.input} type="email" placeholder="New email address" value={newEmail} onChange={e => setNewEmail(e.target.value)} />
        <button onClick={updateEmail} disabled={loading||!newEmail} className={`${glass.btn} w-full bg-white/5 hover:bg-white/10 text-white text-sm`}>Update Email</button>
      </div>
      <div className={`${glass.card} space-y-3`}>
        <p className="text-white/60 text-sm font-semibold">Change Password</p>
        <input className={glass.input} type="password" placeholder="New password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
        <button onClick={updatePassword} disabled={loading||!newPassword} className={`${glass.btn} w-full bg-white/5 hover:bg-white/10 text-white text-sm`}>Update Password</button>
      </div>

      {/* Feedback */}
      <div className={`${glass.card} space-y-3`}>
        <p className="text-white/60 text-sm font-semibold">💬 Send Feedback</p>
        <textarea className={`${glass.input} resize-none`} rows={3} placeholder="Tell us what you think, what's broken, or what you'd love to see…" value={feedbackText} onChange={e => setFeedbackText(e.target.value)} />
        {feedbackSent
          ? <p className="text-emerald-400 text-sm text-center">Feedback sent! Thanks 🤍</p>
          : <button onClick={submitFeedback} disabled={!feedbackText.trim()} className={`${glass.btn} w-full bg-violet-500/40 hover:bg-violet-500/70 text-white text-sm`}>Send Feedback</button>
        }
      </div>

      {msg && <div className="text-center text-sm text-violet-300">{msg}</div>}
      <button onClick={onSignOut} className={`${glass.btn} w-full bg-rose-500/20 hover:bg-rose-500/40 text-rose-400 text-sm`}>Sign Out</button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ADMIN PANEL
// ═══════════════════════════════════════════════════════════════
function AdminPanel({ onSignOut }) {
  const [tab, setTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [promos, setPromos] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [creators, setCreators] = useState([]);
  const [newCreator, setNewCreator] = useState({ username:"", pfp_url:"", follower_count:"", tiktok_url:"" });
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    const [{ data: promoData }, { data: fbData }, { data: creatorData }] = await Promise.all([
      supabase.from("promos").select("*").eq("completed", true),
      supabase.from("feedback").select("*, created_at").order("created_at", { ascending: false }),
      supabase.from("creators").select("*").order("created_at", { ascending: false }),
    ]);
    if (promoData) {
      setPromos(promoData);
      const userMap = {};
      promoData.forEach(p => {
        if (!userMap[p.user_id]) userMap[p.user_id] = { user_id: p.user_id, total: 0, promos: [] };
        userMap[p.user_id].total += p.amount;
        userMap[p.user_id].promos.push(p);
      });
      setUsers(Object.values(userMap).sort((a,b) => b.total - a.total));
    }
    if (fbData) setFeedback(fbData);
    if (creatorData) setCreators(creatorData);
    setLoading(false);
  };

  const addCreator = async () => {
    if (!newCreator.username) return;
    const { data } = await supabase.from("creators").insert([newCreator]).select().single();
    if (data) { setCreators(prev => [data, ...prev]); setNewCreator({ username:"", pfp_url:"", follower_count:"", tiktok_url:"" }); }
  };

  const deleteCreator = async (id) => {
    await supabase.from("creators").delete().eq("id", id);
    setCreators(prev => prev.filter(c => c.id !== id));
  };

  const tabs = [
    { id:"users", label:"👥 Users" },
    { id:"promos", label:"📋 Promos" },
    { id:"feedback", label:"💬 Feedback" },
    { id:"carousel", label:"🎠 Carousel" },
  ];

  return (
    <div className="min-h-screen max-w-2xl mx-auto px-4 pt-6 pb-32">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tighter text-white">glaze<span className="text-violet-400">.</span> <span className="text-violet-400 text-lg">admin</span></h1>
          <p className="text-white/30 text-xs mt-0.5">sapphire's control panel</p>
        </div>
        <button onClick={onSignOut} className="text-white/30 hover:text-rose-400 text-sm transition-colors">sign out</button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className={`${glass.card} text-center`}><p className="text-white/40 text-xs mb-1">Users</p><p className="text-2xl font-black text-white">{users.length}</p></div>
        <div className={`${glass.card} text-center`}><p className="text-white/40 text-xs mb-1">Total Promos</p><p className="text-2xl font-black text-white">{promos.length}</p></div>
        <div className={`${glass.card} text-center`}><p className="text-white/40 text-xs mb-1">Platform $</p><p className="text-2xl font-black text-violet-400">{fmt(promos.reduce((s,p) => s+p.amount, 0))}</p></div>
      </div>

      {/* Tab nav */}
      <div className={`${glass.base} p-1.5 flex gap-1 mb-6`}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${tab === t.id ? "bg-violet-500/80 text-white" : "text-white/40 hover:text-white/70"}`}>{t.label}</button>
        ))}
      </div>

      {loading && <div className="text-center text-white/30 py-12 animate-pulse">loading…</div>}

      {/* USERS */}
      {!loading && tab === "users" && (
        <div className="space-y-3">
          {users.length === 0 && <div className="text-center text-white/30 py-12 text-sm">no users yet</div>}
          {users.map((u, i) => (
            <div key={u.user_id} className={`${glass.card}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-white/20 text-sm font-mono">#{i+1}</span>
                  <span className="text-white/50 text-xs font-mono truncate max-w-[140px]">{u.user_id.slice(0,12)}…</span>
                </div>
                <span className="text-emerald-400 font-bold">{fmt(u.total)}</span>
              </div>
              <div className="space-y-1">
                {u.promos.slice(0,3).map(p => (
                  <div key={p.id} className="flex justify-between text-xs text-white/40">
                    <span>{p.client_name} · {p.platform}</span>
                    <span>{fmt(p.amount)}</span>
                  </div>
                ))}
                {u.promos.length > 3 && <p className="text-xs text-white/20">+{u.promos.length-3} more promos</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PROMOS */}
      {!loading && tab === "promos" && (
        <div className="space-y-3">
          {promos.length === 0 && <div className="text-center text-white/30 py-12 text-sm">no completed promos yet</div>}
          {[...promos].sort((a,b) => new Date(b.completed_at)-new Date(a.completed_at)).map(p => (
            <div key={p.id} className={`${glass.card} flex items-center justify-between gap-3`}>
              <div className="min-w-0">
                <p className="text-white font-semibold truncate">{p.client_name}</p>
                <p className="text-white/40 text-xs">{p.platform} · {new Date(p.completed_at).toLocaleDateString()}</p>
              </div>
              <span className="text-emerald-400 font-bold shrink-0">{fmt(p.amount)}</span>
            </div>
          ))}
        </div>
      )}

      {/* FEEDBACK */}
      {!loading && tab === "feedback" && (
        <div className="space-y-3">
          {feedback.length === 0 && <div className="text-center text-white/30 py-12 text-sm">no feedback yet</div>}
          {feedback.map(f => (
            <div key={f.id} className={`${glass.card} space-y-2`}>
              <p className="text-white/70 text-sm leading-relaxed">"{f.message}"</p>
              <p className="text-white/25 text-xs">{new Date(f.created_at).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}</p>
            </div>
          ))}
        </div>
      )}

      {/* CAROUSEL */}
      {!loading && tab === "carousel" && (
        <div className="space-y-4">
          <div className={`${glass.card} space-y-3`}>
            <p className="text-white/60 text-sm font-semibold">Add Creator</p>
            <input className={glass.input} placeholder="TikTok username (no @)" value={newCreator.username} onChange={e => setNewCreator(c => ({...c, username: e.target.value}))} />
            <input className={glass.input} placeholder="Profile picture URL" value={newCreator.pfp_url} onChange={e => setNewCreator(c => ({...c, pfp_url: e.target.value}))} />
            <input className={glass.input} placeholder="Follower count (e.g. 102K)" value={newCreator.follower_count} onChange={e => setNewCreator(c => ({...c, follower_count: e.target.value}))} />
            <input className={glass.input} placeholder="TikTok profile URL" value={newCreator.tiktok_url} onChange={e => setNewCreator(c => ({...c, tiktok_url: e.target.value}))} />
            <button onClick={addCreator} className={`${glass.btn} w-full bg-violet-500/80 hover:bg-violet-500 text-white text-sm`}>Add to Carousel</button>
          </div>
          <div className="space-y-3">
            {creators.map(c => (
              <div key={c.id} className={`${glass.card} flex items-center gap-4`}>
                <div className="w-10 h-10 rounded-full overflow-hidden bg-white/10 shrink-0">
                  {c.pfp_url ? <img src={c.pfp_url} alt={c.username} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-sm">👤</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm">@{c.username}</p>
                  <p className="text-white/40 text-xs">{c.follower_count} followers</p>
                </div>
                <button onClick={() => deleteCreator(c.id)} className="text-white/20 hover:text-rose-400 transition-colors text-lg">×</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Nav helpers ─────────────────────────────────────────────
function NavBtn({ id, icon, label, active, onClick }) {
  return (
    <button onClick={() => onClick(id)} className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${active === id ? "bg-violet-500/80 text-white" : "text-white/40 hover:text-white/70"}`}>
      <span className="text-base">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function AddQuickBtn({ onAdd }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white text-2xl font-light flex items-center justify-center shadow-lg shadow-violet-500/30 hover:scale-105 active:scale-95 transition-transform mx-1">+</button>
      {open && <AddPromoModal onClose={() => setOpen(false)} onAdd={async f => { await onAdd(f); setOpen(false); }} />}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════
export default function App() {
  const [user, setUser] = useState(null);
  const [showLanding, setShowLanding] = useState(true);
  const [tab, setTab] = useState("home");
  const [promos, setPromos] = useState([]);
  const [goal, setGoal] = useState(1000);
  const [loading, setLoading] = useState(true);
  const [creators, setCreators] = useState([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    // Load creators for landing page
    supabase.from("creators").select("*").order("created_at", { ascending: true }).then(({ data }) => {
      if (data) setCreators(data);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    loadPromos(); loadSettings();
  }, [user]);

  const loadPromos = async () => {
    const { data } = await supabase.from("promos").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    if (data) setPromos(data);
  };

  const loadSettings = async () => {
    const { data } = await supabase.from("user_settings").select("monthly_goal").eq("user_id", user.id).single();
    if (data) setGoal(data.monthly_goal);
  };

  const addPromo = async (form) => {
    const payload = { client_name: form.client_name, platform: form.platform||null, amount: parseFloat(form.amount)||0, due_date: form.due_date||null, notes: form.notes||null, priority: form.priority||false, user_id: user.id, completed: false };
    const { data, error } = await supabase.from("promos").insert([payload]).select().single();
    if (error) { console.error("Save error:", error); alert("Error: "+error.message); return; }
    if (data) setPromos(prev => [data, ...prev]);
  };

  const completePromo = async (id, extra) => {
    const updates = { completed: true, completed_at: new Date().toISOString(), ...extra };
    const { data } = await supabase.from("promos").update(updates).eq("id", id).select().single();
    if (data) setPromos(prev => prev.map(p => p.id === id ? data : p));
  };

  const togglePriority = async (id, val) => {
    await supabase.from("promos").update({ priority: val }).eq("id", id);
    setPromos(prev => prev.map(p => p.id === id ? {...p, priority: val} : p));
  };

  const deletePromo = async (id) => {
    await supabase.from("promos").delete().eq("id", id);
    setPromos(prev => prev.filter(p => p.id !== id));
  };

  const updateGoal = async (val) => {
    setGoal(val);
    await supabase.from("user_settings").upsert({ user_id: user.id, monthly_goal: val });
  };

  const signOut = () => supabase.auth.signOut();

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-white/30 text-sm animate-pulse">loading glaze…</div></div>;
  if (!user && showLanding) return <LandingPage onEnter={() => setShowLanding(false)} creators={creators} />;
  if (!user) return <AuthScreen onAuth={setUser} />;

  // Admin check
  if (user.email === ADMIN_EMAIL) return <AdminPanel onSignOut={signOut} />;

  return (
    <div className="min-h-screen max-w-lg mx-auto px-4 pt-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black tracking-tighter text-white">glaze<span className="text-violet-400">.</span></h1>
        <p className="text-white/30 text-sm truncate max-w-[60%]">{user.user_metadata?.display_name||user.email}</p>
      </div>
      {tab === "home" && <HomeTab promos={promos} goal={goal} onUpdateGoal={updateGoal} onAdd={addPromo} onComplete={completePromo} onTogglePriority={togglePriority} onDelete={deletePromo} />}
      {tab === "stats" && <StatsTab promos={promos} goal={goal} />}
      {tab === "history" && <HistoryTab promos={promos} onDelete={deletePromo} />}
      {tab === "profile" && <ProfileTab user={user} onSignOut={signOut} />}
      <div className="fixed bottom-0 left-0 right-0 flex justify-center pb-4 px-4">
        <div className={`${glass.base} px-2 py-2 flex items-center gap-1 shadow-2xl`}>
          <NavBtn id="home" icon="⚡" label="Queue" active={tab} onClick={setTab} />
          <NavBtn id="history" icon="✓" label="History" active={tab} onClick={setTab} />
          <AddQuickBtn onAdd={addPromo} />
          <NavBtn id="stats" icon="📊" label="Stats" active={tab} onClick={setTab} />
          <NavBtn id="profile" icon="👤" label="Profile" active={tab} onClick={setTab} />
        </div>
      </div>
    </div>
  );
}
