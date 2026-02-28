import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

// ─── Supabase ────────────────────────────────────────────────
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      storageKey: "glaze-auth",
      storage: window.localStorage,
    },
  }
);

// ─── Helpers ─────────────────────────────────────────────────
const fmt = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n ?? 0);

const monthKey = (d) => {
  const dt = new Date(d);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
};

const thisMonth = () => monthKey(new Date());

// ─── Glass style helpers ──────────────────────────────────────
const glass = {
  base: "backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl",
  card: "backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-5",
  input:
    "w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-violet-400/60 focus:bg-white/10 transition-all",
  btn: "px-6 py-3 rounded-xl font-semibold transition-all duration-200 active:scale-95",
};

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
    setLoading(true);
    setError("");
    const fn =
      mode === "login"
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
        {/* Logo */}
        <div className="text-center space-y-1">
          <div className="text-4xl font-black tracking-tighter text-white">
            glaze<span className="text-violet-400">.</span>
          </div>
          <p className="text-white/40 text-sm">your promo empire, tracked</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <input
            className={glass.input}
            type="email"
            placeholder="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className={glass.input}
            type="password"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-rose-400 text-sm">{error}</p>}
          <button
            type="submit"
            className={`${glass.btn} w-full bg-violet-500/80 hover:bg-violet-500 text-white`}
            disabled={loading}
          >
            {loading ? "…" : mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <p className="text-center text-white/40 text-sm">
          {mode === "login" ? "New here? " : "Already have an account? "}
          <button
            className="text-violet-400 hover:text-violet-300 transition-colors"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
          >
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
  const [form, setForm] = useState({
    client_name: "",
    platform: "",
    amount: "",
    due_date: "",
    notes: "",
    priority: false,
  });
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onAdd({ ...form, amount: parseFloat(form.amount) });
    setLoading(false);
    onClose();
  };

  return (
    <Overlay onClose={onClose}>
      <div className={`${glass.card} w-full max-w-md space-y-5`}>
        <h2 className="text-xl font-bold text-white">New Promo</h2>
        <form onSubmit={submit} className="space-y-3">
          <input className={glass.input} placeholder="Client name" value={form.client_name} onChange={(e) => set("client_name", e.target.value)} required />
          <input className={glass.input} placeholder="Platform (IG, TikTok…)" value={form.platform} onChange={(e) => set("platform", e.target.value)} />
          <input className={glass.input} type="number" placeholder="Amount ($)" value={form.amount} onChange={(e) => set("amount", e.target.value)} required min="0" step="0.01" />
          <input className={glass.input} placeholder="Due date (YYYY-MM-DD)" value={form.due_date} onChange={(e) => set("due_date", e.target.value)} pattern="\d{4}-\d{2}-\d{2}" />
          <textarea className={`${glass.input} resize-none`} rows={2} placeholder="Notes…" value={form.notes} onChange={(e) => set("notes", e.target.value)} />
          <label className="flex items-center gap-3 text-white/70 cursor-pointer">
            <div
              onClick={() => set("priority", !form.priority)}
              className={`w-10 h-6 rounded-full transition-colors ${form.priority ? "bg-violet-500" : "bg-white/15"} relative`}
            >
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
    e.preventDefault();
    setLoading(true);
    let screenshot_url = null;
    if (file) {
      const path = `${promo.user_id}/${Date.now()}-${file.name}`;
      const { data } = await supabase.storage.from("screenshots").upload(path, file);
      if (data) {
        const { data: pub } = supabase.storage.from("screenshots").getPublicUrl(path);
        screenshot_url = pub.publicUrl;
      }
    }
    await onComplete(promo.id, { work_link: link, screenshot_url });
    setLoading(false);
    onClose();
  };

  return (
    <Overlay onClose={onClose}>
      <div className={`${glass.card} w-full max-w-md space-y-5`}>
        <h2 className="text-xl font-bold text-white">Mark Complete</h2>
        <p className="text-white/50 text-sm">{promo.client_name} · {fmt(promo.amount)}</p>
        <form onSubmit={submit} className="space-y-4">
          <input className={glass.input} placeholder="Link to your work" value={link} onChange={(e) => setLink(e.target.value)} />
          <div>
            <label className="block text-white/50 text-sm mb-2">Payment screenshot</label>
            <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} className="text-white/60 text-sm" />
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

// ─── Overlay wrapper ──────────────────────────────────────────
function Overlay({ onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative w-full flex justify-center" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// HOME TAB
// ═══════════════════════════════════════════════════════════════
function HomeTab({ promos, goal, onUpdateGoal, onAdd, onComplete, onTogglePriority, onDelete }) {
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(goal);
  const [showAdd, setShowAdd] = useState(false);
  const [completingPromo, setCompletingPromo] = useState(null);
  const [swipedId, setSwipedId] = useState(null);
  const touchStart = useRef(null);

  const activePromos = promos
    .filter((p) => !p.completed)
    .sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority;
      return new Date(a.due_date || "9999") - new Date(b.due_date || "9999");
    });

  const monthEarned = promos
    .filter((p) => p.completed && monthKey(p.completed_at) === thisMonth())
    .reduce((s, p) => s + p.amount, 0);

  const pct = Math.min(100, Math.round((monthEarned / (goal || 1)) * 100));

  const saveGoal = () => {
    onUpdateGoal(parseFloat(goalInput) || 0);
    setEditingGoal(false);
  };

  const handleTouchStart = (e, id) => {
    touchStart.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e, promo) => {
    if (!touchStart.current) return;
    const dx = touchStart.current - e.changedTouches[0].clientX;
    if (dx > 60) setCompletingPromo(promo);
    touchStart.current = null;
  };

  return (
    <div className="space-y-5 pb-24">
      {/* Goal progress bar */}
      <div className={`${glass.card} space-y-3`}>
        <div className="flex items-center justify-between text-sm text-white/60">
          <span>{pct}% this month</span>
          {editingGoal ? (
            <form onSubmit={(e) => { e.preventDefault(); saveGoal(); }} className="flex gap-2">
              <input
                className="bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-white w-28 text-right text-sm focus:outline-none focus:border-violet-400"
                type="number"
                value={goalInput}
                autoFocus
                onChange={(e) => setGoalInput(e.target.value)}
                onBlur={saveGoal}
                min="0"
              />
            </form>
          ) : (
            <button className="text-white/80 hover:text-violet-300 transition-colors font-semibold" onClick={() => setEditingGoal(true)}>
              Goal: {fmt(goal)}
            </button>
          )}
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-white/40 text-xs">{fmt(monthEarned)} earned · {fmt(Math.max(0, goal - monthEarned))} to go</p>
      </div>

      {/* Promo list */}
      <div className="space-y-3">
        {activePromos.length === 0 && (
          <div className="text-center text-white/30 py-12 text-sm">no active promos — add one below</div>
        )}
        {activePromos.map((p) => (
          <div
            key={p.id}
            className={`${glass.base} p-4 flex items-center gap-4 relative overflow-hidden select-none cursor-pointer transition-transform`}
            onTouchStart={(e) => handleTouchStart(e, p.id)}
            onTouchEnd={(e) => handleTouchEnd(e, p)}
            onMouseEnter={() => setSwipedId(null)}
          >
            {p.priority && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-violet-400 to-fuchsia-500 rounded-l-2xl" />
            )}
            <div className="flex-1 min-w-0 ml-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white truncate">{p.client_name}</span>
                {p.platform && <span className="text-[11px] text-white/40 bg-white/10 px-2 py-0.5 rounded-full">{p.platform}</span>}
              </div>
              {p.due_date && (
                <p className="text-xs text-white/40 mt-0.5">Due {new Date(p.due_date).toLocaleDateString()}</p>
              )}
            </div>
            <span className="text-emerald-400 font-bold text-lg">{fmt(p.amount)}</span>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onTogglePriority(p.id, !p.priority)}
                className={`text-lg transition-all ${p.priority ? "opacity-100" : "opacity-25 hover:opacity-60"}`}
                title="Toggle priority"
              >⚡</button>
              <button
                onClick={() => setCompletingPromo(p)}
                className="text-xs bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-400 px-3 py-1.5 rounded-lg transition-all"
              >Done</button>
              <button
                onClick={() => onDelete(p.id)}
                className="text-white/20 hover:text-rose-400 transition-colors text-lg leading-none"
              >×</button>
            </div>
          </div>
        ))}
      </div>

      {/* Add button */}
      <button
        onClick={() => setShowAdd(true)}
        className="w-full py-4 rounded-2xl border-2 border-dashed border-white/15 hover:border-violet-400/40 hover:bg-white/5 text-white/40 hover:text-violet-300 transition-all text-sm font-medium"
      >
        + Add Promo
      </button>

      {showAdd && <AddPromoModal onClose={() => setShowAdd(false)} onAdd={onAdd} />}
      {completingPromo && (
        <CompletionModal
          promo={completingPromo}
          onClose={() => setCompletingPromo(null)}
          onComplete={onComplete}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// STATS TAB
// ═══════════════════════════════════════════════════════════════
function StatsTab({ promos, goal }) {
  const completed = promos.filter((p) => p.completed);
  const active = promos.filter((p) => !p.completed);

  const totalEarned = completed.reduce((s, p) => s + p.amount, 0);
  const monthEarned = completed
    .filter((p) => monthKey(p.completed_at) === thisMonth())
    .reduce((s, p) => s + p.amount, 0);
  const pct = Math.min(100, Math.round((monthEarned / (goal || 1)) * 100));

  const pendingTotal = active.reduce((s, p) => s + p.amount, 0);
  const projection = monthEarned + pendingTotal;

  const avgPayment = completed.length ? totalEarned / completed.length : 0;

  // Best client
  const clientMap = {};
  completed.forEach((p) => {
    clientMap[p.client_name] = (clientMap[p.client_name] || 0) + p.amount;
  });
  const bestClient = Object.entries(clientMap).sort((a, b) => b[1] - a[1])[0];

  // Monthly breakdown (last 12)
  const monthlyMap = {};
  completed.forEach((p) => {
    const k = monthKey(p.completed_at);
    monthlyMap[k] = (monthlyMap[k] || 0) + p.amount;
  });
  const months = Object.entries(monthlyMap)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .slice(0, 12);
  const maxMonth = Math.max(...months.map((m) => m[1]), 1);
  const bestMonth = months.sort((a, b) => b[1] - a[1])[0];

  const sortedMonths = [...months].sort((a, b) => a[0].localeCompare(b[0]));

  const fmtMonth = (k) => {
    const [y, m] = k.split("-");
    return new Date(y, m - 1).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Lifetime */}
      <div className={`${glass.card} text-center`}>
        <p className="text-white/40 text-xs uppercase tracking-widest mb-1">Lifetime Earnings</p>
        <p className="text-5xl font-black text-white">{fmt(totalEarned)}</p>
        <p className="text-white/30 text-sm mt-1">across {completed.length} promos</p>
      </div>

      {/* Monthly goal */}
      <div className={`${glass.card} space-y-3`}>
        <div className="flex justify-between text-sm text-white/60">
          <span>This month</span>
          <span>Goal: {fmt(goal)}</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
        </div>
        <div className="flex justify-between text-xs text-white/40">
          <span>{fmt(monthEarned)} earned</span>
          <span>{pct}%</span>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className={`${glass.card}`}>
          <p className="text-white/40 text-xs mb-1">Avg / promo</p>
          <p className="text-2xl font-bold text-white">{fmt(avgPayment)}</p>
        </div>
        <div className={`${glass.card}`}>
          <p className="text-white/40 text-xs mb-1">Projection</p>
          <p className="text-2xl font-bold text-emerald-400">{fmt(projection)}</p>
          <p className="text-[10px] text-white/30">if all active pay</p>
        </div>
        {bestClient && (
          <div className={`${glass.card}`}>
            <p className="text-white/40 text-xs mb-1">Best Client</p>
            <p className="text-white font-bold truncate">{bestClient[0]}</p>
            <p className="text-violet-400 text-sm">{fmt(bestClient[1])}</p>
          </div>
        )}
        {bestMonth && (
          <div className={`${glass.card}`}>
            <p className="text-white/40 text-xs mb-1">Best Month</p>
            <p className="text-white font-bold">{fmtMonth(bestMonth[0])}</p>
            <p className="text-fuchsia-400 text-sm">{fmt(bestMonth[1])}</p>
          </div>
        )}
      </div>

      {/* Monthly chart */}
      {sortedMonths.length > 0 && (
        <div className={`${glass.card} space-y-3`}>
          <p className="text-white/60 text-sm font-semibold">Monthly Breakdown</p>
          <div className="space-y-2">
            {sortedMonths.map(([k, v]) => (
              <div key={k} className="flex items-center gap-3">
                <span className="text-xs text-white/40 w-14 shrink-0">{fmtMonth(k)}</span>
                <div className="flex-1 bg-white/5 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-400 rounded-full transition-all duration-500"
                    style={{ width: `${(v / maxMonth) * 100}%` }}
                  />
                </div>
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
function HistoryTab({ promos }) {
  const completed = promos
    .filter((p) => p.completed)
    .sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at));

  return (
    <div className="space-y-3 pb-24">
      {completed.length === 0 && (
        <div className="text-center text-white/30 py-16 text-sm">no completed promos yet</div>
      )}
      {completed.map((p) => (
        <div key={p.id} className={`${glass.card} space-y-3`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="font-semibold text-white">{p.client_name}</p>
              {p.platform && <p className="text-xs text-white/40">{p.platform}</p>}
            </div>
            <span className="text-emerald-400 font-bold">{fmt(p.amount)}</span>
          </div>
          {p.completed_at && (
            <p className="text-xs text-white/30">
              Completed {new Date(p.completed_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>
          )}
          <div className="flex gap-3">
            {p.work_link && (
              <a href={p.work_link} target="_blank" rel="noreferrer"
                className="text-xs text-violet-400 hover:text-violet-300 underline underline-offset-2 transition-colors">
                View Work →
              </a>
            )}
            {p.screenshot_url && (
              <a href={p.screenshot_url} target="_blank" rel="noreferrer"
                className="text-xs text-fuchsia-400 hover:text-fuchsia-300 underline underline-offset-2 transition-colors">
                Payment Proof →
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Nav helpers ─────────────────────────────────────────────
function NavBtn({ id, icon, label, active, onClick }) {
  return (
    <button
      onClick={() => onClick(id)}
      className={`flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
        active === id ? "bg-violet-500/80 text-white" : "text-white/40 hover:text-white/70"
      }`}
    >
      <span className="text-base">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function AddQuickBtn({ onAdd }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white text-2xl font-light flex items-center justify-center shadow-lg shadow-violet-500/30 hover:scale-105 active:scale-95 transition-transform mx-1"
      >
        +
      </button>
      {open && <AddPromoModal onClose={() => setOpen(false)} onAdd={async (f) => { await onAdd(f); setOpen(false); }} />}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
// PROFILE TAB
// ═══════════════════════════════════════════════════════════════
function ProfileTab({ user, onSignOut }) {
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [displayName, setDisplayName] = useState(user.user_metadata?.display_name || "");
  const [avatar, setAvatar] = useState(user.user_metadata?.avatar_url || null);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const showMsg = (m) => { setMsg(m); setTimeout(() => setMsg(""), 3000); };

  const updateName = async () => {
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ data: { display_name: displayName } });
    setLoading(false);
    showMsg(error ? error.message : "Name updated ✓");
  };

  const updateEmail = async () => {
    if (!newEmail) return;
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ email: newEmail });
    setLoading(false);
    showMsg(error ? error.message : "Confirmation sent to new email ✓");
    setNewEmail("");
  };

  const updatePassword = async () => {
    if (!newPassword) return;
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);
    showMsg(error ? error.message : "Password updated ✓");
    setNewPassword("");
  };

  const uploadAvatar = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    const path = `avatars/${user.id}`;
    const { error: uploadErr } = await supabase.storage.from("screenshots").upload(path, file, { upsert: true });
    if (uploadErr) { showMsg(uploadErr.message); setLoading(false); return; }
    const { data: pub } = supabase.storage.from("screenshots").getPublicUrl(path);
    await supabase.auth.updateUser({ data: { avatar_url: pub.publicUrl } });
    setAvatar(pub.publicUrl + "?t=" + Date.now());
    setLoading(false);
    showMsg("Avatar updated ✓");
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Avatar + name */}
      <div className={`${glass.card} flex items-center gap-4`}>
        <label className="cursor-pointer relative group">
          <div className="w-16 h-16 rounded-2xl bg-white/10 overflow-hidden flex items-center justify-center text-2xl">
            {avatar ? <img src={avatar} alt="avatar" className="w-full h-full object-cover" /> : "👤"}
          </div>
          <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs text-white">edit</div>
          <input type="file" accept="image/*" className="hidden" onChange={uploadAvatar} />
        </label>
        <div className="flex-1">
          <p className="text-white/40 text-xs mb-1">Display name</p>
          <div className="flex gap-2">
            <input
              className={`${glass.input} py-2 text-sm`}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
            />
            <button onClick={updateName} className="px-3 py-2 bg-violet-500/60 hover:bg-violet-500 rounded-xl text-white text-sm transition-all">✓</button>
          </div>
        </div>
      </div>

      {/* Current email */}
      <div className={glass.card}>
        <p className="text-white/40 text-xs mb-1">Current email</p>
        <p className="text-white/70 text-sm">{user.email}</p>
      </div>

      {/* Change email */}
      <div className={`${glass.card} space-y-3`}>
        <p className="text-white/60 text-sm font-semibold">Change Email</p>
        <input className={glass.input} type="email" placeholder="New email address" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
        <button onClick={updateEmail} disabled={loading || !newEmail} className={`${glass.btn} w-full bg-white/5 hover:bg-white/10 text-white text-sm`}>Update Email</button>
      </div>

      {/* Change password */}
      <div className={`${glass.card} space-y-3`}>
        <p className="text-white/60 text-sm font-semibold">Change Password</p>
        <input className={glass.input} type="password" placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        <button onClick={updatePassword} disabled={loading || !newPassword} className={`${glass.btn} w-full bg-white/5 hover:bg-white/10 text-white text-sm`}>Update Password</button>
      </div>

      {/* Feedback message */}
      {msg && <div className="text-center text-sm text-violet-300">{msg}</div>}

      {/* Sign out */}
      <button
        onClick={onSignOut}
        className={`${glass.btn} w-full bg-rose-500/20 hover:bg-rose-500/40 text-rose-400 text-sm`}
      >
        Sign Out
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════
export default function App() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("home");
  const [promos, setPromos] = useState([]);
  const [goal, setGoal] = useState(1000);
  const [loading, setLoading] = useState(true);

  // Auth listener
  useEffect(() => {
    // Check existing session first
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user ?? null;
      setUser(u);
      setLoading(false);
    });
    // Then listen for changes
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Load user data
  useEffect(() => {
    if (!user) return;
    loadPromos();
    loadSettings();
  }, [user]);

  const loadPromos = async () => {
    const { data } = await supabase
      .from("promos")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (data) setPromos(data);
  };

  const loadSettings = async () => {
    const { data } = await supabase
      .from("user_settings")
      .select("monthly_goal")
      .eq("user_id", user.id)
      .single();
    if (data) setGoal(data.monthly_goal);
  };

  const addPromo = async (form) => {
    const payload = {
      client_name: form.client_name,
      platform: form.platform || null,
      amount: parseFloat(form.amount) || 0,
      due_date: form.due_date || null,
      notes: form.notes || null,
      priority: form.priority || false,
      user_id: user.id,
      completed: false,
    };
    const { data, error } = await supabase
      .from("promos")
      .insert([payload])
      .select()
      .single();
    if (error) {
      console.error("Save error:", error);
      alert("Error saving promo: " + error.message);
      return;
    }
    if (data) setPromos((prev) => [data, ...prev]);
  };

  const completePromo = async (id, extra) => {
    const updates = { completed: true, completed_at: new Date().toISOString(), ...extra };
    const { data } = await supabase.from("promos").update(updates).eq("id", id).select().single();
    if (data) setPromos((prev) => prev.map((p) => (p.id === id ? data : p)));
  };

  const togglePriority = async (id, val) => {
    await supabase.from("promos").update({ priority: val }).eq("id", id);
    setPromos((prev) => prev.map((p) => (p.id === id ? { ...p, priority: val } : p)));
  };

  const deletePromo = async (id) => {
    await supabase.from("promos").delete().eq("id", id);
    setPromos((prev) => prev.filter((p) => p.id !== id));
  };

  const updateGoal = async (val) => {
    setGoal(val);
    await supabase.from("user_settings").upsert({ user_id: user.id, monthly_goal: val });
  };

  const signOut = () => supabase.auth.signOut();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white/30 text-sm animate-pulse">loading glaze…</div>
      </div>
    );
  }

  if (!user) return <AuthScreen onAuth={setUser} />;

  return (
    <div className="min-h-screen max-w-lg mx-auto px-4 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black tracking-tighter text-white">
          glaze<span className="text-violet-400">.</span>
        </h1>
        <p className="text-white/30 text-sm">{user.user_metadata?.display_name || user.email}</p>
      </div>

      {/* Tab content */}
      {tab === "home" && (
        <HomeTab
          promos={promos}
          goal={goal}
          onUpdateGoal={updateGoal}
          onAdd={addPromo}
          onComplete={completePromo}
          onTogglePriority={togglePriority}
          onDelete={deletePromo}
        />
      )}
      {tab === "stats" && <StatsTab promos={promos} goal={goal} />}
      {tab === "history" && <HistoryTab promos={promos} />}
      {tab === "profile" && <ProfileTab user={user} onSignOut={signOut} />}

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 flex justify-center pb-4 px-4">
        <div className={`${glass.base} px-2 py-2 flex items-center gap-1 shadow-2xl`}>
          <NavBtn id="home" icon="⚡" label="Queue" active={tab} onClick={setTab} />
          <NavBtn id="stats" icon="📊" label="Stats" active={tab} onClick={setTab} />

          {/* Big + button */}
          <AddQuickBtn onAdd={addPromo} />

          <NavBtn id="history" icon="✓" label="History" active={tab} onClick={setTab} />
          <NavBtn id="profile" icon="👤" label="Profile" active={tab} onClick={setTab} />
        </div>
      </div>
    </div>
  );
}
