export type Classification = "Safe" | "Suspicious" | "High Risk (Phishing)";

export interface UrlFinding {
  url: string;
  protocol: "http" | "https" | "unknown";
  host: string;
  isIpBased: boolean;
  isShortened: boolean;
  hasSuspiciousTld: boolean;
  looksLikeTyposquat: string | null;
  reasons: string[];
}

export interface AnalysisResult {
  scanId: string | null;
  riskScore: number;
  classification: Classification;
  confidence: number;
  reasons: string[];
  suspiciousKeywords: string[];
  urlsFound: UrlFinding[];
  recommendation: string;
  explanation: string;
}

export interface ScanHistoryRow {
  id: string;
  sender_email: string | null;
  subject: string | null;
  email_body: string | null;
  risk_score: number;
  classification: Classification;
  confidence: number;
  reasons: string[];
  suspicious_keywords: string[];
  urls_found: UrlFinding[];
  recommendation: string;
  explanation: string;
  created_at: string;
}

export interface AnalyzeRequest {
  senderEmail: string;
  subject: string;
  emailBody: string;
}
