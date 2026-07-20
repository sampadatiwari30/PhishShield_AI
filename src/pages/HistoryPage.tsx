import { useEffect, useState } from "react";
import {
  CalendarClock,
  ChevronRight,
  History,
  Inbox,
  Loader2,
  Mail,
  Trash2,
  X,
  AlertCircle,
} from "lucide-react";
import { deleteScan, fetchScanHistory } from "../lib/api";
import type { ScanHistoryRow } from "../lib/types";
import { RiskBadge } from "../components/RiskBadge";
import { AnalysisPanel } from "../components/AnalysisPanel";
import type { AnalysisResult } from "../lib/types";

export function HistoryPage() {
  const [rows, setRows] = useState<ScanHistoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<ScanHistoryRow | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchScanHistory();
      setRows(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load scan history.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await deleteScan(id);
      setRows((r) => r.filter((row) => row.id !== id));
      if (selected?.id === id) setSelected(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete scan.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-shield-500/20 bg-shield-500/10 px-3 py-1 text-xs font-medium text-shield-300">
          <History />
          Scan History
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Past analyses</h1>
        <p className="mt-2 max-w-2xl text-ink-300">
          Every scan is stored in the database. Review past reports, compare senders, and spot
          recurring threats.
        </p>
      </div>

      {loading && (
        <div className="glass grid place-items-center rounded-2xl p-16">
          <Loader2 className="h-6 w-6 animate-spin text-shield-400" />
          <p className="mt-3 text-sm text-ink-400">Loading scan history...</p>
        </div>
      )}

      {!loading && error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && rows.length === 0 && (
        <div className="glass grid place-items-center rounded-2xl p-16 text-center">
          <Inbox className="mb-3 h-10 w-10 text-ink-500" />
          <h3 className="font-semibold text-white">No scans yet</h3>
          <p className="mt-1 text-sm text-ink-400">
            Analyze your first email to see it appear here.
          </p>
        </div>
      )}

      {!loading && !error && rows.length > 0 && (
        <div className="glass overflow-hidden rounded-2xl">
          <ul className="divide-y divide-white/5">
            {rows.map((row) => (
              <li
                key={row.id}
                className="group flex cursor-pointer items-center gap-4 p-4 transition-colors hover:bg-white/5 sm:p-5"
                onClick={() => setSelected(row)}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <RiskBadge classification={row.classification} size="sm" />
                    <span className="font-mono text-xs text-ink-400">
                      {row.risk_score}/100
                    </span>
                    <span className="chip bg-white/5 text-ink-400">
                      <CalendarClock className="h-3 w-3" />
                      {formatDate(row.created_at)}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-sm">
                    <Mail className="h-3.5 w-3.5 shrink-0 text-ink-500" />
                    <span className="truncate font-mono text-ink-200">
                      {row.sender_email || "—"}
                    </span>
                  </div>
                  <div className="mt-0.5 truncate text-sm text-ink-400">
                    {row.subject || <span className="italic">(no subject)</span>}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(row.id);
                  }}
                  disabled={deletingId === row.id}
                  className="grid h-9 w-9 place-items-center rounded-lg text-ink-500 transition-colors hover:bg-red-500/15 hover:text-red-300 disabled:opacity-50"
                  aria-label="Delete scan"
                  title="Delete scan"
                >
                  {deletingId === row.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
                <ChevronRight className="h-5 w-5 shrink-0 text-ink-600 transition-transform group-hover:translate-x-0.5 group-hover:text-ink-400" />
              </li>
            ))}
          </ul>
        </div>
      )}

      {selected && <DetailModal row={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function DetailModal({ row, onClose }: { row: ScanHistoryRow; onClose: () => void }) {
  const result: AnalysisResult = {
    scanId: row.id,
    riskScore: row.risk_score,
    classification: row.classification,
    confidence: row.confidence,
    reasons: row.reasons || [],
    suspiciousKeywords: row.suspicious_keywords || [],
    urlsFound: row.urls_found || [],
    recommendation: row.recommendation,
    explanation: row.explanation,
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink-950/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="animate-scale-in my-8 w-full max-w-3xl rounded-3xl border border-white/10 bg-ink-900 p-6 shadow-2xl sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <div>
            <div className="text-xs font-medium uppercase tracking-wider text-ink-400">
              Scan report
            </div>
            <div className="text-sm text-ink-300">{formatDate(row.created_at)}</div>
          </div>
          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-lg text-ink-400 hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-5 grid gap-3 rounded-2xl border border-white/5 bg-ink-950/40 p-4 text-sm">
          <div>
            <span className="font-semibold text-ink-400">From: </span>
            <span className="font-mono text-ink-100">{row.sender_email || "—"}</span>
          </div>
          <div>
            <span className="font-semibold text-ink-400">Subject: </span>
            <span className="text-ink-100">{row.subject || "(no subject)"}</span>
          </div>
        </div>

        <AnalysisPanel result={result} />
      </div>
    </div>
  );
}
