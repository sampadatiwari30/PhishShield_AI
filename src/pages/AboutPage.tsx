import {
  Brain,
  Database,
  Link2,
  Mail,
  ScanLine,
  ShieldCheck,
  Layers,
  GitBranch,
} from "lucide-react";
import { navigate } from "../lib/router";

const TECH = [
  { name: "React + TypeScript", desc: "Component-based frontend with type safety" },
  { name: "Tailwind CSS", desc: "Utility-first styling with a custom design system" },
  { name: "Supabase (PostgreSQL)", desc: "Stores every scan with row-level security" },
  { name: "Supabase Edge Functions (Deno)", desc: "Runs the analysis engine server-side" },
];

const DIMENSIONS = [
  {
    icon: Mail,
    title: "Sender analysis",
    points: [
      "Domain reputation vs. known legitimate brand domains",
      "Free public email providers impersonating organizations",
      "Disposable / throwaway email domains",
      "Typosquatted sender domains (paypaI.com vs paypal.com)",
      "Suspicious TLDs and numeric local parts",
    ],
  },
  {
    icon: Link2,
    title: "URL inspection",
    points: [
      "HTTP vs HTTPS protocol check",
      "Raw IP-based URLs instead of domain names",
      "Link shorteners that hide the real destination",
      "Abused top-level domains (.click, .xyz, .zip, etc.)",
      "Typosquatting via Levenshtein distance + homoglyphs",
    ],
  },
  {
    icon: Brain,
    title: "Language & psychology",
    points: [
      "Urgency and threat language (account suspended, 24 hours)",
      "Credential & payment theft (passwords, OTP, CVV, gift cards)",
      "Personal information requests",
      "Money / reward lures (lottery, unclaimed funds)",
      "Authority impersonation and generic greetings",
    ],
  },
  {
    icon: Layers,
    title: "Cross-signal reasoning",
    points: [
      "Brand impersonation + credential request = classic phishing",
      "Look-alike link + urgency = act-before-you-check tactic",
      "Weighted, capped scores per dimension (no single signal dominates)",
      "Confidence derived from how many independent signals agree",
      "Diminishing returns within a keyword category",
    ],
  },
];

export function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-shield-500/20 bg-shield-500/10 px-3 py-1 text-xs font-medium text-shield-300">
          <ShieldCheck className="h-3.5 w-3.5" />
          About the project
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          How PhishShield AI works
        </h1>
        <p className="mt-3 max-w-2xl leading-relaxed text-ink-300">
          PhishShield AI is a structured phishing detection tool. Instead of relying on a single
          black-box model, it combines rule-based security checks with heuristic reasoning across
          four independent dimensions to produce consistent, context-aware, and explainable results.
        </p>
      </div>

      {/* Why structured detection */}
      <div className="glass mb-8 rounded-3xl p-6 sm:p-8">
        <h2 className="mb-3 text-xl font-bold text-white">A note on accuracy</h2>
        <p className="leading-relaxed text-ink-300">
          No AI model can honestly guarantee a fixed accuracy on every email, especially without a
          labeled phishing dataset. PhishShield AI instead uses a structured detection approach:
          AI reasoning combined with rule-based security checks (sender analysis, URL inspection,
          phishing keywords, and social-engineering patterns) to produce consistent, context-aware
          results while minimizing false positives and false negatives. Every score is auditable —
          you can see exactly which signals contributed to it.
        </p>
      </div>

      {/* Detection dimensions */}
      <div className="mb-10">
        <h2 className="mb-5 text-xl font-bold text-white">Detection dimensions</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {DIMENSIONS.map((d) => {
            const Icon = d.icon;
            return (
              <div key={d.title} className="glass rounded-2xl p-5">
                <div className="mb-3 flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-shield-500/15 ring-1 ring-shield-500/30">
                    <Icon className="h-5 w-5 text-shield-400" />
                  </span>
                  <h3 className="font-semibold text-white">{d.title}</h3>
                </div>
                <ul className="space-y-2">
                  {d.points.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-sm text-ink-300">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-shield-400" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {/* Scoring model */}
      <div className="glass mb-10 rounded-3xl p-6 sm:p-8">
        <h2 className="mb-4 text-xl font-bold text-white">The scoring model</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { range: "0 – 30", label: "Safe", color: "text-emerald-300", bar: "bg-emerald-500" },
            { range: "31 – 70", label: "Suspicious", color: "text-amber-300", bar: "bg-amber-500" },
            { range: "71 – 100", label: "High Risk (Phishing)", color: "text-red-300", bar: "bg-red-500" },
          ].map((b) => (
            <div key={b.label} className="rounded-2xl border border-white/5 bg-ink-950/40 p-4">
              <div className={`mb-2 text-sm font-semibold ${b.color}`}>{b.label}</div>
              <div className="mb-2 font-mono text-2xl font-bold text-white">{b.range}</div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className={`h-full ${b.bar}`} />
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm leading-relaxed text-ink-400">
          Scores are capped per dimension so no single signal can dominate, and cross-signal
          amplification rewards combinations that match known phishing patterns. Confidence is
          derived from how many independent signals agree on the verdict.
        </p>
      </div>

      {/* Tech stack */}
      <div className="mb-10">
        <h2 className="mb-5 text-xl font-bold text-white">Tech stack</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {TECH.map((t) => (
            <div key={t.name} className="glass-soft flex items-start gap-3 rounded-xl p-4">
              <Database className="mt-0.5 h-5 w-5 shrink-0 text-shield-400" />
              <div>
                <div className="font-semibold text-white">{t.name}</div>
                <div className="text-sm text-ink-400">{t.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Workflow */}
      <div className="glass mb-10 rounded-3xl p-6 sm:p-8">
        <h2 className="mb-4 text-xl font-bold text-white">Expected workflow</h2>
        <ol className="space-y-3">
          {[
            "User enters sender email and email content",
            "Backend extracts sender information and URLs",
            "AI analyzes the email content across all dimensions",
            "Risk score + classification are generated",
            "Report is stored in PostgreSQL",
            "Detailed phishing analysis is displayed to the user",
          ].map((step, i) => (
            <li key={i} className="flex items-center gap-3 text-sm text-ink-200">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-shield-500/15 font-mono text-xs font-bold text-shield-300 ring-1 ring-shield-500/30">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-shield-500/20 bg-shield-500/5 p-5">
        <div className="flex items-center gap-3">
          <GitBranch className="h-5 w-5 text-shield-400" />
          <p className="text-sm text-ink-200">
            Ready to test an email? Run a scan and see the full breakdown.
          </p>
        </div>
        <button onClick={() => navigate("scanner")} className="btn-primary">
          <ScanLine className="h-4 w-4" />
          Open scanner
        </button>
      </div>
    </div>
  );
}
