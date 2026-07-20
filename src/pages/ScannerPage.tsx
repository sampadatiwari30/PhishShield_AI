import { useState } from "react";
import { Mail, Send, Loader2, RotateCcw, AlertCircle } from "lucide-react";
import { analyzeEmail } from "../lib/api";
import type { AnalysisResult } from "../lib/types";
import { AnalysisPanel } from "../components/AnalysisPanel";

const SAMPLES = [
  {
    label: "Phishing attempt",
    senderEmail: "security@paypaI-verify.click",
    subject: "Urgent: Account suspended within 24h",
    emailBody: `Dear Customer,

We have detected unusual activity on your PayPal account. Your account will be suspended within 24 hours unless you verify your identity immediately.

Please confirm your password and credit card details by signing in at http://paypaI-verify.click/login

Failure to verify your account will result in permanent deactivation.

Thank you,
PayPal Security Team`,
  },
  {
    label: "Safe newsletter",
    senderEmail: "digest@github.com",
    subject: "Your weekly repository digest",
    emailBody: `Hi Alex,

Here is your weekly summary of activity in repositories you watch. You can view the full digest at https://github.com/dashboard.

Reply to this email if you have any feedback for our team.

— The GitHub team`,
  },
  {
    label: "Suspicious prize win",
    senderEmail: "promo@mega-reward.xyz",
    subject: "Congratulations! You've won $5000",
    emailBody: `Dear Valued Customer,

Congratulations you have been selected as one of our lucky winners! You have won a $5000 gift card.

To claim your prize, click here and provide your full name, date of birth, and phone number within 48 hours.

This is a time-sensitive offer. Do the needful and reply with your personal information.

Best regards,
Mega Reward Team`,
  },
];

export function ScannerPage() {
  const [senderEmail, setSenderEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const canSubmit = (senderEmail.trim() || subject.trim() || emailBody.trim()) !== "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await analyzeEmail({
        senderEmail: senderEmail.trim(),
        subject: subject.trim(),
        emailBody: emailBody.trim(),
      });
      setResult(res);
      setTimeout(() => {
        document.getElementById("analysis-result")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function loadSample(s: (typeof SAMPLES)[number]) {
    setSenderEmail(s.senderEmail);
    setSubject(s.subject);
    setEmailBody(s.emailBody);
    setResult(null);
    setError(null);
  }

  function reset() {
    setSenderEmail("");
    setSubject("");
    setEmailBody("");
    setResult(null);
    setError(null);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-8 animate-fade-up">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-shield-500/20 bg-shield-500/10 px-3 py-1 text-xs font-medium text-shield-300">
          <Mail className="h-3.5 w-3.5" />
          Email Scanner
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Analyze an email for phishing
        </h1>
        <p className="mt-2 max-w-2xl text-ink-300">
          Paste the sender's address, subject, and full email body. PhishShield AI inspects the
          sender domain, links, phishing language, and social-engineering patterns, then returns a
          transparent risk score with full reasoning.
        </p>
      </div>

      {/* Sample chips */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium uppercase tracking-wider text-ink-400">
          Try a sample:
        </span>
        {SAMPLES.map((s) => (
          <button
            key={s.label}
            onClick={() => loadSample(s)}
            className="chip border border-white/10 bg-white/5 text-ink-200 transition-colors hover:border-shield-500/40 hover:bg-shield-500/10 hover:text-shield-200"
          >
            {s.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="glass rounded-3xl p-6 sm:p-8">
        <div className="grid gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Sender email address">
              <input
                type="email"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                placeholder="security@example.com"
                className="input-field font-mono text-sm"
                autoComplete="off"
                spellCheck={false}
              />
            </Field>
            <Field label="Subject (optional)">
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Your account requires attention"
                className="input-field"
                autoComplete="off"
              />
            </Field>
          </div>
          <Field label="Email body">
            <textarea
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              placeholder="Paste the full email content here..."
              rows={10}
              className="input-field scrollbar-thin resize-y font-mono text-sm leading-relaxed"
              spellCheck={false}
            />
          </Field>
        </div>

        {error && (
          <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-sm text-red-200">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button type="submit" disabled={!canSubmit || loading} className="btn-primary">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Analyze email
              </>
            )}
          </button>
          {(senderEmail || subject || emailBody) && (
            <button type="button" onClick={reset} className="btn-ghost">
              <RotateCcw className="h-4 w-4" />
              Clear
            </button>
          )}
          {loading && (
            <span className="text-sm text-ink-400">
              Inspecting sender, links, language, and patterns...
            </span>
          )}
        </div>
      </form>

      {result && (
        <div id="analysis-result" className="mt-8 scroll-mt-24">
          <AnalysisPanel result={result} />
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink-400">
        {label}
      </span>
      {children}
    </label>
  );
}
