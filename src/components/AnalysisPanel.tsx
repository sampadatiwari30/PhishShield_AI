import {
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  Link2,
  ListChecks,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import type { AnalysisResult } from "../lib/types";
import { RiskBadge } from "./RiskBadge";
import { ScoreGauge } from "./ScoreGauge";

export function AnalysisPanel({ result }: { result: AnalysisResult }) {
  const isPhishing = result.classification === "High Risk (Phishing)";
  const isSuspicious = result.classification === "Suspicious";
  const isSafe = result.classification === "Safe";

  return (
    <div className="animate-fade-up space-y-5">
      {/* Hero verdict */}
      <div
        className={`glass relative overflow-hidden rounded-3xl p-6 sm:p-8 ${
          isPhishing ? "shadow-glow-risk" : isSafe ? "shadow-glow" : ""
        }`}
      >
        <div
          className={`pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full blur-3xl ${
            isPhishing ? "bg-red-500/20" : isSuspicious ? "bg-amber-500/20" : "bg-emerald-500/20"
          }`}
        />
        <div className="relative flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-8">
          <ScoreGauge score={result.riskScore} />
          <div className="flex-1 text-center sm:text-left">
            <div className="mb-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <RiskBadge classification={result.classification} size="lg" />
              <span className="chip bg-white/10 text-ink-200">
                <Sparkles className="h-3.5 w-3.5 text-shield-400" />
                Confidence {result.confidence}%
              </span>
            </div>
            <p className="text-sm leading-relaxed text-ink-300 text-balance">
              {result.explanation}
            </p>
          </div>
        </div>
      </div>

      {/* Reasons */}
      <Section
        icon={ListChecks}
        title="Why this score?"
        accent={isPhishing ? "text-red-300" : isSuspicious ? "text-amber-300" : "text-emerald-300"}
      >
        {result.reasons.length === 0 ? (
          <EmptyRow
            icon={CheckCircle2}
            text="No suspicious indicators were detected across sender, content, and link analysis."
            tone="good"
          />
        ) : (
          <ul className="space-y-2.5">
            {result.reasons.map((r, i) => (
              <li
                key={i}
                className="flex items-start gap-3 rounded-xl border border-white/5 bg-ink-950/40 p-3.5"
              >
                <span
                  className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full ${
                    isPhishing ? "bg-red-500/20 text-red-300" : "bg-amber-500/20 text-amber-300"
                  }`}
                >
                  <AlertTriangle className="h-3 w-3" strokeWidth={3} />
                </span>
                <span className="text-sm leading-relaxed text-ink-200">{r}</span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* Suspicious keywords */}
      {result.suspiciousKeywords.length > 0 && (
        <Section icon={AlertTriangle} title="Suspicious keywords detected" accent="text-amber-300">
          <div className="flex flex-wrap gap-2">
            {result.suspiciousKeywords.map((k, i) => (
              <span
                key={i}
                className="chip border border-amber-500/20 bg-amber-500/10 font-mono text-amber-200"
              >
                {k}
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* URLs */}
      {result.urlsFound.length > 0 && (
        <Section icon={Link2} title={`Links found (${result.urlsFound.length})`} accent="text-shield-400">
          <div className="space-y-3">
            {result.urlsFound.map((u, i) => {
              const clean = u.reasons.length === 0;
              return (
                <div
                  key={i}
                  className={`rounded-xl border p-3.5 ${
                    clean
                      ? "border-emerald-500/20 bg-emerald-500/5"
                      : "border-red-500/20 bg-red-500/5"
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm text-ink-100 break-all">{u.url}</span>
                    <span
                      className={`chip ${
                        u.protocol === "https"
                          ? "bg-emerald-500/15 text-emerald-300"
                          : "bg-red-500/15 text-red-300"
                      }`}
                    >
                      {u.protocol.toUpperCase()}
                    </span>
                    {u.isIpBased && <span className="chip bg-red-500/15 text-red-300">IP host</span>}
                    {u.isShortened && (
                      <span className="chip bg-amber-500/15 text-amber-300">Shortened</span>
                    )}
                    {u.hasSuspiciousTld && (
                      <span className="chip bg-amber-500/15 text-amber-300">Suspicious TLD</span>
                    )}
                    {u.looksLikeTyposquat && (
                      <span className="chip bg-red-500/15 text-red-300">Typosquat</span>
                    )}
                    {clean && (
                      <span className="chip bg-emerald-500/15 text-emerald-300">Looks safe</span>
                    )}
                  </div>
                  {u.reasons.length > 0 && (
                    <ul className="mt-2.5 space-y-1">
                      {u.reasons.map((r, j) => (
                        <li key={j} className="text-xs leading-relaxed text-ink-300">
                          • {r}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {/* Recommendation */}
      <Section
        icon={Lightbulb}
        title="Security recommendation"
        accent="text-shield-400"
      >
        <div className="flex items-start gap-3 rounded-xl border border-shield-500/20 bg-shield-500/5 p-4">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-shield-400" />
          <p className="text-sm leading-relaxed text-ink-200">{result.recommendation}</p>
        </div>
      </Section>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  accent,
  children,
}: {
  icon: typeof ListChecks;
  title: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass rounded-2xl p-5 sm:p-6">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-ink-400">
        <Icon className={`h-4 w-4 ${accent}`} />
        {title}
      </h3>
      {children}
    </div>
  );
}

function EmptyRow({
  icon: Icon,
  text,
  tone,
}: {
  icon: typeof CheckCircle2;
  text: string;
  tone: "good" | "bad";
}) {
  return (
    <div
      className={`flex items-start gap-3 rounded-xl border p-4 ${
        tone === "good"
          ? "border-emerald-500/20 bg-emerald-500/5"
          : "border-red-500/20 bg-red-500/5"
      }`}
    >
      <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${tone === "good" ? "text-emerald-400" : "text-red-400"}`} />
      <p className="text-sm leading-relaxed text-ink-200">{text}</p>
    </div>
  );
}
