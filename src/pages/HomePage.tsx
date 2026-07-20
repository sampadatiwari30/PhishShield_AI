import {
  ArrowRight,
  Brain,
  Link2,
  ShieldCheck,
  ScanLine,
  History,
  Gauge,
  Lock,
  Sparkles,
} from "lucide-react";
import { navigate } from "../lib/router";

const FEATURES = [
  {
    icon: Brain,
    title: "Context-aware AI reasoning",
    desc: "Combines sender reputation, URL inspection, phishing language, and social-engineering patterns into one explainable score — not a black box.",
  },
  {
    icon: Link2,
    title: "Deep link analysis",
    desc: "Extracts every URL and flags HTTP, IP hosts, link shorteners, suspicious TLDs, and typosquats like paypaI.com vs paypal.com.",
  },
  {
    icon: Gauge,
    title: "Transparent 0–100 risk score",
    desc: "A weighted, explainable scoring model. Every point is tied to a specific signal you can see and audit.",
  },
  {
    icon: Lock,
    title: "Brand impersonation detection",
    desc: "Spots when a sender claims to be PayPal, Apple, or your bank but isn't sending from their real domain.",
  },
  {
    icon: Sparkles,
    title: "Plain-English explanations",
    desc: "Each scan lists exactly why it scored the way it did, plus a concrete recommendation for what to do next.",
  },
  {
    icon: History,
    title: "Scan history saved",
    desc: "Every analysis is stored so you can revisit past reports, compare senders, and track patterns over time.",
  },
];

const STEPS = [
  { n: "01", title: "Paste the email", desc: "Drop in the sender address, subject, and full body." },
  { n: "02", title: "AI analyzes signals", desc: "Sender, links, language, and patterns are scored together." },
  { n: "03", title: "Get a verdict", desc: "Risk score, reasons, suspicious keywords, and a recommendation." },
];

export function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-[-10%] h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-shield-500/15 blur-[120px]" />
          <div className="absolute right-[5%] top-[20%] h-72 w-72 rounded-full bg-ink-500/20 blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-5 inline-flex animate-fade-up items-center gap-2 rounded-full border border-shield-500/30 bg-shield-500/10 px-4 py-1.5 text-sm font-medium text-shield-300">
              <ShieldCheck className="h-4 w-4" />
              AI-powered phishing detection & risk analysis
            </div>
            <h1 className="animate-fade-up text-balance text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-6xl" style={{ animationDelay: "60ms" }}>
              Spot phishing emails
              <br />
              <span className="bg-gradient-to-r from-shield-300 via-shield-400 to-shield-500 bg-clip-text text-transparent">
                before you click
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-balance text-base leading-relaxed text-ink-300 sm:text-lg" style={{ animationDelay: "120ms" }}>
              PhishShield AI inspects the sender, every link, and the language of an email to
              produce an explainable risk score with clear, human-readable reasoning — so you know
              exactly why an email is dangerous.
            </p>
            <div className="mt-8 flex animate-fade-up flex-col items-center justify-center gap-3 sm:flex-row" style={{ animationDelay: "180ms" }}>
              <button onClick={() => navigate("scanner")} className="btn-primary w-full sm:w-auto">
                <ScanLine className="h-4 w-4" />
                Scan an email now
                <ArrowRight className="h-4 w-4" />
              </button>
              <button onClick={() => navigate("about")} className="btn-ghost w-full sm:w-auto">
                How it works
              </button>
            </div>
          </div>

          {/* Stat strip */}
          <div className="mx-auto mt-14 grid max-w-3xl grid-cols-3 gap-3 animate-fade-up" style={{ animationDelay: "240ms" }}>
            {[
              { v: "4", l: "Analysis dimensions" },
              { v: "0–100", l: "Transparent score" },
              { v: "25+", l: "Brands protected" },
            ].map((s) => (
              <div key={s.l} className="glass-soft rounded-2xl px-4 py-5 text-center">
                <div className="font-mono text-2xl font-bold text-shield-400 sm:text-3xl">{s.v}</div>
                <div className="mt-1 text-xs font-medium uppercase tracking-wider text-ink-400">
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Built for accurate, explainable detection
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-ink-300">
            No single signal is enough. PhishShield AI weighs many independent indicators so
            legitimate email stays safe and real phishing gets caught.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="group glass rounded-2xl p-5 transition-all hover:border-shield-500/30 hover:shadow-glow"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-shield-500/20 to-shield-600/10 ring-1 ring-shield-500/30">
                  <Icon className="h-5 w-5 text-shield-400" strokeWidth={2} />
                </div>
                <h3 className="mb-1.5 font-semibold text-white">{f.title}</h3>
                <p className="text-sm leading-relaxed text-ink-400">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="glass overflow-hidden rounded-3xl p-6 sm:p-10">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Three steps to a verdict
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <div key={s.n} className="relative">
                <div className="mb-3 font-mono text-sm font-bold text-shield-400">{s.n}</div>
                <h3 className="mb-1.5 font-semibold text-white">{s.title}</h3>
                <p className="text-sm leading-relaxed text-ink-400">{s.desc}</p>
                {i < STEPS.length - 1 && (
                  <ArrowRight className="absolute -right-3 top-6 hidden h-5 w-5 text-ink-600 md:block" />
                )}
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <button onClick={() => navigate("scanner")} className="btn-primary">
              <ScanLine className="h-4 w-4" />
              Start scanning
            </button>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/5 py-8 text-center text-sm text-ink-500">
        PhishShield AI — structured detection combining AI reasoning with rule-based security checks.
      </footer>
    </div>
  );
}
