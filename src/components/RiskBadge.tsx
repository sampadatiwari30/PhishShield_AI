import { ShieldCheck, ShieldAlert, ShieldX } from "lucide-react";
import type { Classification } from "../lib/types";

const STYLES: Record<
  Classification,
  { bg: string; text: string; ring: string; icon: typeof ShieldCheck; label: string }
> = {
  Safe: {
    bg: "bg-emerald-500/15",
    text: "text-emerald-300",
    ring: "ring-emerald-500/30",
    icon: ShieldCheck,
    label: "Safe",
  },
  Suspicious: {
    bg: "bg-amber-500/15",
    text: "text-amber-300",
    ring: "ring-amber-500/30",
    icon: ShieldAlert,
    label: "Suspicious",
  },
  "High Risk (Phishing)": {
    bg: "bg-red-500/15",
    text: "text-red-300",
    ring: "ring-red-500/30",
    icon: ShieldX,
    label: "High Risk (Phishing)",
  },
};

export function RiskBadge({
  classification,
  size = "md",
}: {
  classification: Classification;
  size?: "sm" | "md" | "lg";
}) {
  const s = STYLES[classification];
  const Icon = s.icon;
  const sizing =
    size === "lg"
      ? "px-4 py-2 text-base"
      : size === "sm"
        ? "px-2.5 py-1 text-xs"
        : "px-3 py-1.5 text-sm";
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full font-semibold ring-1 ${s.bg} ${s.text} ${s.ring} ${sizing}`}
    >
      <Icon className={size === "lg" ? "h-5 w-5" : "h-4 w-4"} strokeWidth={2.5} />
      {s.label}
    </span>
  );
}

export function riskColor(score: number): string {
  if (score >= 71) return "#ef4444";
  if (score >= 31) return "#f59e0b";
  return "#10b981";
}

export function classificationFor(score: number): Classification {
  if (score >= 71) return "High Risk (Phishing)";
  if (score >= 31) return "Suspicious";
  return "Safe";
}
