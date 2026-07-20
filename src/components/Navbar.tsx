import { ShieldCheck, Home, ScanLine, History, Info } from "lucide-react";
import { navigate, useRoute, type Route } from "../lib/router";

const NAV_ITEMS: { route: Route; label: string; icon: typeof Home }[] = [
  { route: "home", label: "Home", icon: Home },
  { route: "scanner", label: "Scanner", icon: ScanLine },
  { route: "history", label: "History", icon: History },
  { route: "about", label: "About", icon: Info },
];

export function Navbar() {
  const current = useRoute();

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink-950/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
        <button
          onClick={() => navigate("home")}
          className="group flex items-center gap-2.5"
          aria-label="PhishShield AI home"
        >
          <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-shield-400 to-shield-600 shadow-glow">
            <ShieldCheck className="h-5 w-5 text-ink-950" strokeWidth={2.5} />
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-base font-bold tracking-tight text-white">
              PhishShield<span className="text-shield-400"> AI</span>
            </span>
            <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink-400">
              Phishing Detection
            </span>
          </span>
        </button>

        <nav className="flex items-center gap-1 rounded-full border border-white/10 bg-ink-900/60 p-1">
          {NAV_ITEMS.map(({ route, label, icon: Icon }) => {
            const active = current === route;
            return (
              <button
                key={route}
                onClick={() => navigate(route)}
                className={`relative flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-all sm:px-4 ${
                  active
                    ? "bg-shield-500 text-ink-950 shadow-glow"
                    : "text-ink-300 hover:bg-white/5 hover:text-white"
                }`}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
