// dashboard.jsx — City Watch portal dashboard (statuses full-width below top row)
// Plain React + TailwindCSS. No mock data. No external map libs.

import { useEffect, useMemo, useRef, useState } from "react";

/** @typedef {Object} Report
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {"Submitted"|"In Review"|"In Progress"|"Resolved"|"Archived"|"Duplicate"} status
 * @property {"Normal"|"High"} priority
 * @property {string} category
 * @property {{lat:number, lng:number, address?:string}} location
 * @property {{id:string, name:string, avatarUrl?:string}} reporter
 * @property {number} confirmations
 * @property {number} pointsAwarded
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {string[]} mediaUrls
 */

const LIFECYCLE = ["Submitted", "In Review", "In Progress", "Resolved", "Archived"];

const cx = (...c) => c.filter(Boolean).join(" ");

const formatDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString();
};

const timeSince = (iso) => {
  if (!iso) return "";
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "";
  const s = Math.max(1, Math.floor((Date.now() - t) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
};

function statusColor(s) {
  switch (s) {
    case "Submitted":   return "bg-blue-400/10 text-blue-200 ring-blue-400/40";
    case "In Review":   return "bg-amber-400/10 text-amber-200 ring-amber-400/40";
    case "In Progress": return "bg-indigo-400/10 text-indigo-200 ring-indigo-400/40";
    case "Resolved":    return "bg-emerald-400/10 text-emerald-200 ring-emerald-400/40";
    case "Archived":    return "bg-zinc-400/10 text-zinc-200 ring-zinc-400/40";
    case "Duplicate":   return "bg-fuchsia-400/10 text-fuchsia-200 ring-fuchsia-400/40";
    default:            return "bg-slate-400/10 text-slate-200 ring-slate-400/40";
  }
}


/* ---------------- Data ---------------- */
async function fetchReports() {
  try {
    const res = await fetch("/api/reports", { cache: "no-store", headers: { Accept: "application/json" } });
    if (!res.ok) return [];
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("application/json")) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}
function useReportStream(onEvent) {
  const ref = useRef(null);
  useEffect(() => {
    let es;
    try { es = new EventSource("/api/reports/stream"); } catch { return; }
    ref.current = es;
    es.onmessage = (e) => {
      try { const payload = JSON.parse(e.data); if (payload?.type) onEvent(payload); }
      catch {}
    };
    es.onerror = () => { try { es.close(); } catch {} };
    return () => { try { es.close(); } catch {} };
  }, [onEvent]);
}

/* ---------------- Map Preview (SVG, no deps) ---------------- */
function MapPreview({ reports, onOpen }) {
  const pts = reports.filter(r => r.location && Number.isFinite(r.location.lat) && Number.isFinite(r.location.lng));

  const bounds = useMemo(() => {
    if (!pts.length) return null;
    let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity;
    for (const r of pts) {
      const { lat, lng } = r.location;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
    }
    const padLat = (maxLat - minLat || 0.01) * 0.2;
    const padLng = (maxLng - minLng || 0.01) * 0.2;
    return { minLat: minLat - padLat, maxLat: maxLat + padLat, minLng: minLng - padLng, maxLng: maxLng + padLng };
  }, [reports]);

  function project(lat, lng, w, h) {
    if (!bounds) return { x: w / 2, y: h / 2 };
    const x = (lng - bounds.minLng) / (bounds.maxLng - bounds.minLng || 1);
    const y = (lat - bounds.minLat) / (bounds.maxLat - bounds.minLat || 1);
    return { x: x * w, y: h - y * h };
  }

  return (
    <div className="rounded-2xl ring-1 ring-white/10 bg-white/5 shadow-[0_4px_24px_rgba(0,0,0,0.08)] p-4 backdrop-blur min-h-[260px]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-white/90">Map Preview</h3>
        <button onClick={onOpen} className="text-xs px-3 py-1.5 rounded-lg bg-white/10 text-white/90 hover:bg-white/20 ring-1 ring-white/15">
          Open Map
        </button>
      </div>
      <div className="relative">
        <svg viewBox="0 0 600 320" className="w-full rounded-xl ring-1 ring-white/10 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
          {Array.from({ length: 11 }).map((_, i) => (
            <line key={`v${i}`} x1={(i + 1) * 50} y1={0} x2={(i + 1) * 50} y2={320} stroke="currentColor" opacity="0.06" strokeWidth="1" />
          ))}
          {Array.from({ length: 5 }).map((_, i) => (
            <line key={`h${i}`} x1={0} y1={(i + 1) * 53.3} x2={600} y2={(i + 1) * 53.3} stroke="currentColor" opacity="0.06" strokeWidth="1" />
          ))}
          {pts.slice(0, 100).map((r) => {
            const { x, y } = project(r.location.lat, r.location.lng, 600, 320);
            return (
              <g key={r.id} transform={`translate(${x},${y})`}>
                <circle r="7" fill="#38bdf8" opacity="0.15" />
                <circle r="3.5" fill="#38bdf8" />
              </g>
            );
          })}
        </svg>
        <div className="absolute bottom-2 left-2 text-[11px] bg-white/80 dark:bg-slate-900/60 text-slate-700 dark:text-slate-200 backdrop-blur px-2 py-0.5 rounded">
          {pts.length} pin{pts.length === 1 ? "" : "s"}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Status Row (full-width) ---------------- */
function StatusRow({ reports }) {
  const byStatus = useMemo(() => {
    const m = new Map();
    for (const r of reports) m.set(r.status, (m.get(r.status) || 0) + 1);
    return m;
  }, [reports]);
  const total = reports.length || 1;
  const statuses = ["Submitted", "In Review", "In Progress", "Resolved", "Archived", "Duplicate"];

  return (
    <div className="rounded-2xl ring-1 ring-white/10 bg-white/5 shadow-[0_4px_24px_rgba(0,0,0,0.08)] p-4 backdrop-blur">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-white/90">Statuses</h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        {statuses.map((s) => (
          <div
            key={s}
            className={cx(
              "rounded-xl p-4 ring-1 border border-white/10 bg-white/60 dark:bg-white/10 backdrop-blur",
              statusColor(s)
            )}
          >
            <div className="text-[11px] uppercase tracking-wide opacity-80">{s}</div>
            <div className="text-2xl font-semibold leading-6">{byStatus.get(s) || 0}</div>
            <div className="text-[10px] opacity-70 mt-0.5">
              {Math.round(((byStatus.get(s) || 0) / total) * 100)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------- Profile + Leaderboard (bigger) -------- */
function ProfileLeaderboard({ user, leaderboard, onOpenProfile, onOpenLeaderboard }) {
  const initials = (user?.name || "")
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="rounded-2xl ring-1 ring-white/10 bg-white/5 shadow-[0_4px_24px_rgba(0,0,0,0.08)] p-4 backdrop-blur h-full">
      <div className="grid grid-rows-[auto_1fr] gap-4 h-full">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-white/90">Your Profile & Leaderboard</h3>
          <div className="flex gap-2">
            <button
              onClick={onOpenProfile}
              className="text-xs px-3 py-1.5 rounded-lg bg-white/10 text-white/90 hover:bg-white/20 ring-1 ring-white/15"
            >
              Open Profile
            </button>
            <button
              onClick={onOpenLeaderboard}
              className="text-xs px-3 py-1.5 rounded-lg bg-white/10 text-white/90 hover:bg-white/20 ring-1 ring-white/15"
            >
              Open Leaderboard
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="col-span-1 flex items-center gap-3">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} className="h-12 w-12 rounded-full object-cover ring-1 ring-white/15" />
            ) : (
              <div className="h-12 w-12 rounded-full bg-white/20 ring-1 ring-white/15 flex items-center justify-center font-semibold text-white/90">
                {initials || "U"}
              </div>
            )}
            <div>
              <div className="font-semibold leading-tight text-white/90">{user?.name || "User"}</div>
              <div className="text-sm text-white/70">Points: {user?.points ?? 0} • Reports: {user?.reports ?? 0}</div>
            </div>
          </div>

          <div className="col-span-2">
            <ul className="divide-y divide-white/10 rounded-xl ring-1 ring-white/10 bg-white/5">
              {leaderboard.slice(0, 7).map((p, i) => (
                <li key={p.id || i} className="py-2 px-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-center text-xs font-semibold text-white/60">{i + 1}</span>
                    <span className="font-medium text-white/90">{p.name}</span>
                  </div>
                  <div className="text-sm text-white/70">{p.points} pts</div>
                </li>
              ))}
              {!leaderboard.length && (
                <li className="py-6 px-3 text-sm text-white/70 text-center">No leaderboard data yet.</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Filters & Rows ---------------- */
function Filters({ query, setQuery, status, setStatus, priority, setPriority }) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
      <div className="flex-1">
        <label className="block text-sm font-medium mb-1 text-white/80">Search</label>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Title, description, address, reporter…"
          className="w-full rounded-xl border border-white/15 bg-white/5 text-white placeholder-white/50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1 text-white/80">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-xl border border-white/15 bg-white/5 text-white px-3 py-2"
        >
          <option value="">All</option>
          {LIFECYCLE.concat(["Duplicate"]).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1 text-white/80">Priority</label>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="rounded-xl border border-white/15 bg-white/5 text-white px-3 py-2"
        >
          <option value="">All</option>
          <option value="High">High</option>
          <option value="Normal">Normal</option>
        </select>
      </div>
    </div>
  );
}
function ReportRow({ r }) {
  return (
    <div className="p-3 rounded-xl ring-1 ring-white/10 bg-white/5 backdrop-blur flex items-center justify-between hover:bg-white/10 transition">
      <div className="min-w-0 pr-3">
        <div className="font-medium truncate text-white/90">{r.title || r.category || r.id}</div>
        <div className="text-xs text-white/60 truncate">
          {r.location?.address || `${r.location?.lat ?? "—"}, ${r.location?.lng ?? "—"}`}
        </div>
      </div>
      <span className={cx("px-2.5 py-1 rounded-full text-[11px] ring-1", statusColor(r.status))}>{r.status}</span>
    </div>
  );
}

/* ---------------- Main ---------------- */
export default function Home({ reports: reportsFromProps, user: userFromProps, leaderboard: leaderboardFromProps }) {
  const [reports, setReports] = useState(Array.isArray(reportsFromProps) ? reportsFromProps : []);
  const [loading, setLoading] = useState(!Array.isArray(reportsFromProps));
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");

  const user = userFromProps || { name: "User", points: 0, reports: reports.length };
  const leaderboard = leaderboardFromProps || [];

  useEffect(() => {
    if (Array.isArray(reportsFromProps)) return;
    let active = true;
    setLoading(true);
    fetchReports().then((data) => {
      if (active) {
        setReports(data);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [reportsFromProps]);

  useReportStream((evt) => {
    setReports((prev) => {
      if (evt.type === "created" && evt.report) return [evt.report, ...prev];
      if (evt.type === "updated" && evt.report) return prev.map((r) => (r.id === evt.report.id ? evt.report : r));
      if (evt.type === "deleted" && evt.report?.id) return prev.filter((r) => r.id !== evt.report.id);
      return prev;
    });
  });

  const filtered = useMemo(() => {
    return reports.filter((r) => {
      if (status && r.status !== status) return false;
      if (priority && r.priority !== priority) return false;
      if (query) {
        const q = query.toLowerCase();
        const hay = [r.title, r.description, r.category, r.location?.address, r.reporter?.name]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [reports, query, status, priority]);

  // Wire these to your router later
  const goMap = () => console.log("TODO: link /map");
  const goProfile = () => console.log("TODO: link /profile");
  const goLeaderboard = () => console.log("TODO: link /leaderboard");

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">City Watch — Dashboard</h1>
        <p className="text-white/70 mt-1">A quick preview of reports, map, and your profile.</p>
      </header>

      {/* Top row: Map (1) + BIG Profile/Leaderboard (2) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-1">
          <MapPreview reports={filtered} onOpen={goMap} />
        </div>
        <div className="lg:col-span-2">
          <ProfileLeaderboard
            user={{ ...user, reports: reports.length }}
            leaderboard={leaderboard}
            onOpenProfile={goProfile}
            onOpenLeaderboard={goLeaderboard}
          />
        </div>
      </div>

      {/* Full-width statuses row BELOW the top row */}
      <div className="mb-6">
        <StatusRow reports={filtered} />
      </div>

      {/* Search & filters */}
      <section className="mb-4">
        <Filters
          query={query}
          setQuery={setQuery}
          status={status}
          setStatus={setStatus}
          priority={priority}
          setPriority={setPriority}
        />
      </section>

      {/* Compact list of reports */}
      {loading ? (
        <div className="py-16 text-center text-white/70">Loading reports…</div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-white/60">No reports to display.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.slice(0, 8).map((r) => (
            <ReportRow key={r.id} r={r} />
          ))}
        </div>
      )}

      <footer className="mt-10 text-[11px] text-white/60">
        Statuses lifecycle: Submitted → In Review → In Progress → Resolved → Archived.
      </footer>
    </div>
  );
}
