import { supabase } from "./supabase";
import type { AnalysisResult, AnalyzeRequest, ScanHistoryRow } from "./types";

function edgeUrl(path: string): string {
  return `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${path}`;
}

function authHeaders(): HeadersInit {
  return {
    Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    "Content-Type": "application/json",
    apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  };
}

export async function analyzeEmail(req: AnalyzeRequest): Promise<AnalysisResult> {
  const response = await fetch(edgeUrl("analyze-email"), {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(req),
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const err = await response.json();
      if (err?.error) message = err.error;
    } catch {
      // ignore JSON parse errors
    }
    throw new Error(message);
  }

  const data = (await response.json()) as AnalysisResult;
  if (typeof data.riskScore !== "number" || !data.classification) {
    throw new Error("Received an unexpected response from the analysis service.");
  }
  return data;
}

export async function fetchScanHistory(): Promise<ScanHistoryRow[]> {
  const { data, error } = await supabase
    .from("scan_history")
    .select(
      "id, sender_email, subject, email_body, risk_score, classification, confidence, reasons, suspicious_keywords, urls_found, recommendation, explanation, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    throw new Error(error.message);
  }
  return (data || []) as ScanHistoryRow[];
}

export async function deleteScan(id: string): Promise<void> {
  const { error } = await supabase.from("scan_history").delete().eq("id", id);
  if (error) {
    throw new Error(error.message);
  }
}
