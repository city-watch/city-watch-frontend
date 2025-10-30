// dashboard.jsx — City Watch status dashboard (no mock data)
// Plain React + Tailwind. No TypeScript. No mock records. No runtime errors.

import { useEffect, useMemo, useRef, useState } from "react";

// ---- Types (JSDoc for editor hints only) -----------------------------------
/**
 * @typedef {Object} Report
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {"Submitted"|"In Review"|"In Progress"|"Resolved"|"Archived"|"Duplicate"} status
 * @property {"Normal"|"High"} priority
 * @property {string} category
 * @property {{lat:number, lng:number, address?:string}} location
 * @property {{id:string, name:string}} reporter
 * @property {number} confirmations
 * @property {number} pointsAwarded
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {string[]} mediaUrls
 */

// ---- Constants & utils -----------------------------------------------------
const LIFECYCLE = ["Submitted", "In Review", "In Progress", "Resolved", "Archived"];

function cx() {
  return Array.from(arguments).filter(Boolean).join(" ");
}

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString();
}

function timeSince(iso) {
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
}

function statusColor(status) {
  switch (status) {
    case "Submitted":
      return "bg-blue-100 text-blue-800 ring-blue-300";
    case "In Review":
      return "bg-amber-100 text-amber-800 ring-amber-300";
    case "In Progress":
      return "bg-indigo-100 text-indigo-800 ring-indigo-300";
    case "Resolved":
      return "bg-emerald-100 text-emerald-800 ring-emerald-300";
    case "Archived":
      return "bg-zinc-100 text-zinc-800 ring-zinc-300";
    case "Duplicate":
      return "bg-fuchsia-100 text-fuchsia-800 ring-fuchsia-300";
    default:
      return "bg-slate-100 text-slate-800 ring-slate-300";
  }
}

function getProgressIndex(status) {
  const i = LIFECYCLE.indexOf(status);
  return i >= 0 ? i : 0;
}

// ---- Data: fetch + optional SSE -------------------------------------------
async function fetchReports() {
  try {
    const res = await fetch("/api/reports", {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return [];
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("application/json")) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data;
  } catch (_) {
    return [];
  }
}

function useReportStream(onEvent) {
  const ref = useRef(null);
  useEffect(() => {
    let es;
    try {
      es = new EventSource("/api/reports/stream");
    } catch (_) {
      return;
    }
    ref.current = es;
    es.onmessage = (e) => {
      try {
        const payload = JSON.parse(e.data);
        if (payload && payload.type) onEvent(payload);
      } catch (_) {
        // ignore bad events
      }
    };
    es.onerror = () => {
      try { es.close(); } catch (_) {}
    };
    return () => {
      try { es.close(); } catch (_) {}
    };
  }, [onEvent]);
}

// ---- Small components ------------------------------------------------------
function Summary({ reports }) {
  const byStatus = useMemo(() => {
    const m = new Map();
    for (const r of reports) m.set(r.status, (m.get(r.status) || 0) + 1);
    return m;
  }, [reports]);

  const total = reports.length || 1; // avoid divide-by-zero
  const statuses = ["Submitted", "In Review", "In Progress", "Resolved", "Archived", "Duplicate"];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
      {statuses.map((s) => (
        <div key={s} className={cx("rounded-2xl p-4 ring-1 shadow-sm", statusColor(s))}>
          <div className="text-sm opacity-80">{s}</div>
          <div className="text-3xl font-semibold">{byStatus.get(s) || 0}</div>
          <div className="text-xs opacity-70 mt-1">{Math.round(((byStatus.get(s) || 0) / total) * 100)}%</div>
        </div>
      ))}
    </div>
  );
}

function StatusTimeline({ current }) {
  const idx = getProgressIndex(current);
  return (
    <ol className="flex items-center gap-2">
      {LIFECYCLE.map((label, i) => {
        const active = i <= idx;
        return (
          <li key={label} className="flex items-center">
            <span className={cx("h-2.5 w-2.5 rounded-full", active ? "bg-emerald-500" : "bg-slate-300")} />
            <span className={cx("ml-2 text-xs", active ? "text-emerald-700" : "text-slate-500")}>{label}</span>
            {i < LIFECYCLE.length - 1 ? <span className="mx-2 h-px w-8 bg-slate-200" /> : null}
          </li>
        );
      })}
    </ol>
  );
}

function Info({ label, value, title }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200">
      <div className="text-[11px] uppercase tracking-wide text-slate-500">{label}</div>
      <div className="text-sm font-medium" title={title}>{value !== undefined && value !== null && value !== "" ? String(value) : "—"}</div>
    </div>
  );
}

function ReportCard({ report }) {
  return (
    <div className="rounded-2xl ring-1 ring-slate-200 bg-white shadow-sm p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold leading-tight">{report.title || report.category}</h3>
          <p className="text-sm text-slate-600 mt-1 line-clamp-2">{report.description}</p>
        </div>
        <span className={cx("px-2.5 py-1 rounded-full text-xs ring-1", statusColor(report.status))}>{report.status}</span>
      </div>

      <StatusTimeline current={report.status} />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Info label="Priority" value={report.priority} />
        <Info label="Category" value={report.category} />
        <Info label="Reporter" value={report.reporter && report.reporter.name} />
        <Info label="Confirmations" value={report.confirmations} />
        <Info label="Points" value={report.pointsAwarded} />
        <Info label="Updated" value={timeSince(report.updatedAt)} title={formatDate(report.updatedAt)} />
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
        <span className="inline-flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z"/></svg>
          {report.location && report.location.address
            ? report.location.address
            : `${report.location && report.location.lat != null ? report.location.lat.toFixed(5) : "—"}, ${report.location && report.location.lng != null ? report.location.lng.toFixed(5) : "—"}`}
        </span>
        <span className="inline-flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M7 4h10v2H7V4Zm0 7h10v2H7v-2Zm0 7h10v2H7v-2Z"/></svg>
          Created {formatDate(report.createdAt)}
        </span>
        {Array.isArray(report.mediaUrls) && report.mediaUrls.length > 0 ? (
          <span className="inline-flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M4 5h16v14H4z M8 9l2.5 3 1.5-2 4 5H6z"/></svg>
            {report.mediaUrls.length} attachment{report.mediaUrls.length > 1 ? "s" : ""}
          </span>
        ) : null}
      </div>

      {Array.isArray(report.mediaUrls) && report.mediaUrls.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {report.mediaUrls.slice(0, 4).map((url) => (
            <img key={url} src={url} alt="evidence" className="rounded-xl object-cover aspect-video ring-1 ring-slate-200" />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function Filters({ query, setQuery, status, setStatus, priority, setPriority }) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
      <div className="flex-1">
        <label className="block text-sm font-medium mb-1">Search</label>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Title, description, address, reporter…"
          className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Status</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border border-slate-300 px-3 py-2">
          <option value="">All</option>
          {LIFECYCLE.concat(["Duplicate"]).map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Priority</label>
        <select value={priority} onChange={(e) => setPriority(e.target.value)} className="rounded-xl border border-slate-300 px-3 py-2">
          <option value="">All</option>
          <option value="High">High</option>
          <option value="Normal">Normal</option>
        </select>
      </div>
    </div>
  );
}

// ---- Main component --------------------------------------------------------
export default function Home({ reports: reportsFromProps }) {
  const [reports, setReports] = useState(Array.isArray(reportsFromProps) ? reportsFromProps : []);
  const [loading, setLoading] = useState(!Array.isArray(reportsFromProps));

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");

  // Initial fetch when no props
  useEffect(() => {
    if (Array.isArray(reportsFromProps) && reportsFromProps.length > 0) return;
    let active = true;
    setLoading(true);
    fetchReports().then((data) => {
      if (!active) return;
      setReports(data);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [reportsFromProps]);

  // Live updates via SSE, if available
  useReportStream((evt) => {
    setReports((prev) => {
      if (evt.type === "created" && evt.report) return [evt.report, ...prev];
      if (evt.type === "updated" && evt.report) return prev.map((r) => (r.id === evt.report.id ? evt.report : r));
      if (evt.type === "deleted" && evt.report && evt.report.id) return prev.filter((r) => r.id !== evt.report.id);
      return prev;
    });
  });

  // Filtering client-side
  const filtered = useMemo(() => {
    return reports.filter((r) => {
      if (status && r.status !== status) return false;
      if (priority && r.priority !== priority) return false;
      if (query) {
        const q = query.toLowerCase();
        const hay = [r.title, r.description, r.category, r.location && r.location.address, r.reporter && r.reporter.name]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [reports, query, status, priority]);

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">City Watch — My Reports</h1>
        <p className="text-slate-600 mt-1">Track the status of issues you submitted and their latest updates.</p>
      </header>

      <section className="mb-6">
        <Summary reports={reports} />
      </section>

      <section className="mb-4">
        <Filters query={query} setQuery={setQuery} status={status} setStatus={setStatus} priority={priority} setPriority={setPriority} />
      </section>

      {loading ? (
        <div className="py-24 text-center text-slate-500">Loading reports…</div>
      ) : filtered.length === 0 ? (
        <div className="py-24 text-center text-slate-500">No reports to display.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((r) => (
            <ReportCard key={r.id} report={r} />
          ))}
        </div>
      )}

      <footer className="mt-10 text-xs text-slate-500">
        <p>Statuses follow the lifecycle: Submitted → In Review → In Progress → Resolved → Archived.</p>
      </footer>
    </div>
  );
}
