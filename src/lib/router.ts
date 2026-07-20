import { useEffect, useState } from "react";

// Lightweight hash router — no external dependency needed.
export type Route = "home" | "scanner" | "history" | "about";

function parseHash(): Route {
  const h = window.location.hash.replace(/^#\/?/, "").split("/")[0];
  if (h === "scanner" || h === "history" || h === "about") return h;
  return "home";
}

export function navigate(route: Route): void {
  window.location.hash = `/${route === "home" ? "" : route}`;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(parseHash());
  useEffect(() => {
    const onChange = () => setRoute(parseHash());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return route;
}
