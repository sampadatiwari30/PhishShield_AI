// Phishing detection engine for PhishShield AI.
//
// Combines rule-based security checks (sender analysis, URL inspection,
// phishing keyword detection, social-engineering patterns, brand
// impersonation, credential-theft language) with a transparent weighted
// scoring model. The output is a structured analysis that the frontend can
// render directly. No external LLM is required — the "reasoning" is
// deterministic and explainable, which is exactly what a security tool
// should be.

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

export interface AnalysisInput {
  senderEmail: string;
  subject: string;
  emailBody: string;
}

export interface AnalysisResult {
  riskScore: number;
  classification: "Safe" | "Suspicious" | "High Risk (Phishing)";
  confidence: number;
  reasons: string[];
  suspiciousKeywords: string[];
  urlsFound: UrlFinding[];
  recommendation: string;
  explanation: string;
}

// ---------------------------------------------------------------------------
// Reference data
// ---------------------------------------------------------------------------

// Well-known brands and the legitimate domains we expect them to use.
// Anything claiming to be from these brands but sent from a different domain
// is a strong impersonation signal.
const LEGIT_BRAND_DOMAINS: Record<string, string[]> = {
  paypal: ["paypal.com", "paypal.me"],
  apple: ["apple.com", "icloud.com"],
  microsoft: ["microsoft.com", "outlook.com", "office.com", "live.com", "msn.com"],
  google: ["google.com", "gmail.com", "googlemail.com"],
  amazon: ["amazon.com", "amazon.co.uk", "amazon.in", "amazon.de", "amazon.ca"],
  "amazon-pay": ["amazonpay.com", "amazon.in"],
  netflix: ["netflix.com"],
  facebook: ["facebook.com", "fb.com"],
  instagram: ["instagram.com"],
  linkedin: ["linkedin.com"],
  twitter: ["twitter.com", "x.com"],
  "bank of america": ["bankofamerica.com"],
  wellsfargo: ["wellsfargo.com"],
  chase: ["chase.com"],
  citibank: ["citi.com"],
  hsbc: ["hsbc.com"],
  barclays: ["barclays.co.uk"],
  dropbox: ["dropbox.com"],
  adobe: ["adobe.com"],
  ebay: ["ebay.com"],
  spotify: ["spotify.com"],
  coinbase: ["coinbase.com"],
  binance: ["binance.com"],
  fedex: ["fedex.com"],
  ups: ["ups.com"],
  dhl: ["dhl.com"],
  irs: ["irs.gov"],
  cra: ["canada.ca", "cra-arc.gc.ca"],
  "hmrc": ["gov.uk"],
};

// Common URL shorteners — frequently abused in phishing to hide destinations.
const URL_SHORTENERS = new Set([
  "bit.ly",
  "tinyurl.com",
  "goo.gl",
  "t.co",
  "ow.ly",
  "is.gd",
  "buff.ly",
  "rebrand.ly",
  "cutt.ly",
  "shorte.st",
  "tiny.cc",
  "lnkd.in",
  "shorturl.at",
  "rb.gy",
  "bl.ink",
  "snip.ly",
]);

// TLDs commonly used by throwaway / abusive domains.
const SUSPICIOUS_TLDS = new Set([
  "zip",
  "xyz",
  "top",
  "click",
  "link",
  "country",
  "stream",
  "gdn",
  "racing",
  "download",
  "loan",
  "win",
  "review",
  "men",
  "work",
  "party",
  "tk",
  "ml",
  "ga",
  "cf",
  "gq",
]);

// Phishing keywords grouped by category. Each match contributes to the score
// AND is surfaced in the suspicious_keywords list so the user sees why.
const KEYWORD_GROUPS: { name: string; weight: number; words: string[] }[] = [
  {
    name: "Urgency / Threat",
    weight: 9,
    words: [
      "urgent",
      "immediately",
      "asap",
      "final warning",
      "last warning",
      "account will be suspended",
      "account will be closed",
      "account has been locked",
      "account has been limited",
      "verify your account",
      "confirm your account",
      "update your account",
      "within 24 hours",
      "within 48 hours",
      "deadline",
      "action required",
      "your account will be",
      "deactivated",
      "terminated",
      "suspended",
      "restricted",
      "avoid suspension",
      "final notice",
      "important notice",
    ],
  },
  {
    name: "Credential / Payment Theft",
    weight: 13,
    words: [
      "password",
      "otp",
      "one time password",
      "verification code",
      "passcode",
      "pin code",
      "login credentials",
      "sign in",
      "log in",
      "confirm your password",
      "reset your password",
      "enter your password",
      "credit card",
      "debit card",
      "cvv",
      "card number",
      "expiry date",
      "bank account number",
      "routing number",
      "social security",
      "ssn",
      "national id",
      "passport number",
      "date of birth",
      "billing address",
      "wire transfer",
      "bitcoin",
      "crypto",
      "gift card",
      "payment verification",
      "update payment",
      "payment method",
      "invoice attached",
      "outstanding balance",
    ],
  },
  {
    name: "Personal Info Request",
    weight: 8,
    words: [
      "personal information",
      "confirm your identity",
      "verify your identity",
      "update your details",
      "update your information",
      "confirm your details",
      "provide your",
      "submit your",
      "complete your profile",
    ],
  },
  {
    name: "Money / Reward Lure",
    weight: 7,
    words: [
      "you have won",
      "you've won",
      "congratulations you",
      "lottery",
      "prize",
      "claim your reward",
      "claim your prize",
      "unclaimed funds",
      "inheritance",
      "beneficiary",
      "sweepstakes",
      "free gift",
      "you have been selected",
      "refund",
      "tax refund",
      "overpayment",
    ],
  },
  {
    name: "Authority Impersonation",
    weight: 6,
    words: [
      "dear customer",
      "dear user",
      "dear valued customer",
      "dear account holder",
      "this is the security team",
      "it department",
      "support team",
      "billing department",
      "customer service team",
      "according to our records",
    ],
  },
  {
    name: "Suspicious Phrasing",
    weight: 4,
    words: [
      "click here",
      "click the link",
      "click below",
      "follow this link",
      "tap here",
      "verify now",
      "confirm now",
      "download the attached",
      "open the attachment",
      "see attached",
      "kindly",
      "do the needful",
      "i await your reply",
    ],
  },
];

// Greetings that suggest a mass-mailed / impersonal phishing template.
const GENERIC_GREETINGS = [
  "dear customer",
  "dear user",
  "dear valued customer",
  "dear account holder",
  "dear member",
  "dear client",
  "dear sir",
  "dear madam",
  "dear sir/madam",
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function lower(s: string): string {
  return (s || "").toLowerCase();
}

function extractDomain(email: string): string | null {
  if (!email) return null;
  const m = email.trim().match(/@([\w.-]+)/);
  return m ? m[1].toLowerCase() : null;
}

// Try to spot the brand a sender is *claiming* to be from, either in the
// local part of the email or in the display name / body subject.
function detectClaimedBrand(text: string): string | null {
  const t = lower(text);
  for (const brand of Object.keys(LEGIT_BRAND_DOMAINS)) {
    if (t.includes(brand.replace("-", " ")) || t.includes(brand)) {
      return brand;
    }
  }
  return null;
}

// Levenshtein distance for typosquatting detection on short brand names.
function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const prev = new Array(n + 1);
  const curr = new Array(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j <= n; j++) prev[j] = curr[j];
  }
  return prev[n];
}

// Look-alike character substitutions commonly used in typosquatting.
const HOMOGLYPHS: Record<string, string> = {
  "0": "o",
  "1": "l",
  "3": "e",
  "4": "a",
  "5": "s",
  "7": "t",
  "@": "a",
  $: "s",
  rn: "m",
};

function normalizeHomoglyphs(s: string): string {
  let out = s;
  for (const [k, v] of Object.entries(HOMOGLYPHS)) {
    out = out.split(k).join(v);
  }
  return out;
}

// ---------------------------------------------------------------------------
// URL analysis
// ---------------------------------------------------------------------------

const URL_REGEX =
  /\b((?:https?:)\/\/[^\s<>"')\]]+|[^\s<>"')\].@]+@[^\s<>"')\]]+\.[a-z]{2,}(?:[^\s<>"')\]]*))|(?:\b(?:[a-z][a-z0-9-]*\.)+[a-z]{2,}(?:\/[^\s<>"')\]]*)?)/gi;

function extractUrls(body: string): string[] {
  if (!body) return [];
  const matches = body.match(URL_REGEX) || [];
  // Normalize and dedupe, strip trailing punctuation.
  const seen = new Set<string>();
  const out: string[] = [];
  for (let raw of matches) {
    raw = raw.replace(/[.,;:!?)\]>]+$/g, "");
    if (!raw) continue;
    if (!/^https?:\/\//i.test(raw) && /^[a-z][a-z0-9-]*\./i.test(raw)) {
      raw = "http://" + raw;
    }
    if (!seen.has(raw.toLowerCase())) {
      seen.add(raw.toLowerCase());
      out.push(raw);
    }
  }
  return out;
}

function analyzeUrl(raw: string): UrlFinding {
  const reasons: string[] = [];
  let protocol: "http" | "https" | "unknown" = "unknown";
  try {
    const u = new URL(raw);
    protocol = u.protocol === "https:" ? "https" : "http";
    const host = u.hostname.toLowerCase();
    const tld = host.split(".").pop() || "";

    if (protocol === "http") {
      reasons.push("Uses insecure HTTP instead of HTTPS");
    }

    const isIpBased = /^(\d{1,3}\.){3}\d{1,3}$/.test(host) || /^\[?[0-9a-f:]+\]?$/i.test(host);
    if (isIpBased) {
      reasons.push("Uses a raw IP address instead of a domain name");
    }

    const isShortened = URL_SHORTENERS.has(host);
    if (isShortened) {
      reasons.push(`Link shortener (${host}) hides the real destination`);
    }

    const hasSuspiciousTld = SUSPICIOUS_TLDS.has(tld);
    if (hasSuspiciousTld) {
      reasons.push(`Unusual top-level domain ".${tld}" commonly abused in phishing`);
    }

    // Typosquatting check against known brand domains.
    let looksLikeTyposquat: string | null = null;
    if (!isIpBased) {
      const hostNorm = normalizeHomoglyphs(host);
      for (const brand of Object.keys(LEGIT_BRAND_DOMAINS)) {
        const legitDomains = LEGIT_BRAND_DOMAINS[brand];
        for (const legit of legitDomains) {
          if (host === legit) {
            // Exact match — legitimate, skip.
            looksLikeTyposquat = null;
            break;
          }
          // Only compare if the host is "close" in length to a legit domain,
          // to avoid false positives on unrelated domains.
          if (Math.abs(host.length - legit.length) <= 3) {
            const d = levenshtein(hostNorm, legit);
            if (d > 0 && d <= 2) {
              looksLikeTyposquat = `${host} closely resembles ${legit} (brand impersonation)`;
              reasons.push(looksLikeTyposquat);
              break;
            }
          }
        }
        if (looksLikeTyposquat) break;
      }
    }

    return {
      url: raw,
      protocol,
      host,
      isIpBased,
      isShortened,
      hasSuspiciousTld,
      looksLikeTyposquat,
      reasons,
    };
  } catch {
    reasons.push("Malformed or unparseable URL");
    return {
      url: raw,
      protocol,
      host: raw,
      isIpBased: false,
      isShortened: false,
      hasSuspiciousTld: false,
      looksLikeTyposquat: null,
      reasons,
    };
  }
}

// ---------------------------------------------------------------------------
// Sender analysis
// ---------------------------------------------------------------------------

interface SenderSignals {
  reasons: string[];
  score: number;
  claimedBrand: string | null;
  brandImpersonated: boolean;
}

function analyzeSender(senderEmail: string, body: string): SenderSignals {
  const reasons: string[] = [];
  let score = 0;
  const domain = extractDomain(senderEmail);

  if (!senderEmail || !senderEmail.trim()) {
    // No sender is a mild signal — phishing samples sometimes come header-only.
    return { reasons, score, claimedBrand: null, brandImpersonated: false };
  }

  if (!domain) {
    reasons.push("Sender email is missing a valid domain");
    score += 14;
    return { reasons, score, claimedBrand: null, brandImpersonated: false };
  }

  // Free public email providers being used to "represent" a brand is a major
  // red flag — real organizations send from their own domain.
  const freeProviders = [
    "gmail.com",
    "yahoo.com",
    "outlook.com",
    "hotmail.com",
    "live.com",
    "aol.com",
    "protonmail.com",
    "icloud.com",
    "yandex.com",
    "mail.com",
    "zoho.com",
    "msn.com",
  ];

  // Does the email body or subject claim a brand the sender domain doesn't own?
  const claimedBrand = detectClaimedBrand(senderEmail + " " + body);
  let brandImpersonated = false;

  if (claimedBrand) {
    const legitDomains = LEGIT_BRAND_DOMAINS[claimedBrand] || [];
    const isLegitDomain = legitDomains.includes(domain);
    const isFreeProvider = freeProviders.includes(domain);

    if (!isLegitDomain) {
      brandImpersonated = true;
      if (isFreeProvider) {
        reasons.push(
          `Claims to be from "${claimedBrand}" but sends from a free public email provider (${domain})`,
        );
        score += 22;
      } else {
        reasons.push(
          `Claims to be from "${claimedBrand}" but the sender domain (${domain}) is not an official ${claimedBrand} domain`,
        );
        score += 18;
      }
    }
  }

  // Disposable / throwaway email domains.
  const disposable = ["mailinator.com", "guerrillamail.com", "tempmail.com", "10minutemail.com", "throwawaymail.com", "yopmail.com", "getnada.com", "sharklasers.com"];
  if (disposable.includes(domain)) {
    reasons.push(`Sender uses a disposable email domain (${domain})`);
    score += 16;
  }

  // Suspicious TLD on the sender domain.
  const tld = domain.split(".").pop() || "";
  if (SUSPICIOUS_TLDS.has(tld)) {
    reasons.push(`Sender domain uses an unusual TLD ".${tld}"`);
    score += 10;
  }

  // Sender domain that looks like a typosquat of a well-known brand.
  for (const brand of Object.keys(LEGIT_BRAND_DOMAINS)) {
    for (const legit of LEGIT_BRAND_DOMAINS[brand]) {
      if (domain === legit) break;
      if (Math.abs(domain.length - legit.length) <= 3) {
        const d = levenshtein(normalizeHomoglyphs(domain), legit);
        if (d > 0 && d <= 2) {
          reasons.push(`Sender domain "${domain}" closely mimics the legitimate "${legit}"`);
          score += 20;
          brandImpersonated = true;
          break;
        }
      }
    }
  }

  // Lots of digits in the local part can indicate a generated/throwaway account.
  const localPart = senderEmail.split("@")[0] || "";
  if (/\d{5,}/.test(localPart)) {
    reasons.push("Sender local part contains an unusually long number sequence");
    score += 6;
  }

  return { reasons, score, claimedBrand, brandImpersonated };
}

// ---------------------------------------------------------------------------
// Content analysis (keywords, greetings, formatting)
// ---------------------------------------------------------------------------

interface ContentSignals {
  reasons: string[];
  score: number;
  matchedKeywords: string[];
  matchedGroups: Set<string>;
}

function analyzeContent(subject: string, body: string): ContentSignals {
  const text = lower(`${subject} ${body}`);
  const reasons: string[] = [];
  const matchedKeywords: string[] = [];
  const matchedGroups = new Set<string>();
  let score = 0;

  for (const group of KEYWORD_GROUPS) {
    let groupHits = 0;
    for (const word of group.words) {
      if (text.includes(word)) {
        groupHits += 1;
        matchedKeywords.push(word);
        matchedGroups.add(group.name);
      }
    }
    if (groupHits > 0) {
      // Diminishing returns within a group so one category can't dominate.
      const groupScore = group.weight * Math.min(groupHits, 3);
      score += groupScore;
      if (groupHits >= 2) {
        reasons.push(
          `Multiple "${group.name}" signals detected (${groupHits} phrases)`,
        );
      } else {
        reasons.push(`"${group.name}" language detected`);
      }
    }
  }

  // Generic greeting — common in mass-mailed phishing.
  for (const g of GENERIC_GREETINGS) {
    if (text.includes(g)) {
      reasons.push(`Generic greeting ("${g}") instead of addressing you by name`);
      score += 5;
      break;
    }
  }

  // Mismatch between "Reply-To" style pressure and brand claims is caught by
  // the sender analysis; here we look for a request to reply to a different
  // address, which is a classic phishing move.
  const replyTo = body.match(/reply[- ]?to[:\s]+[^\s<]+@[^\s>]+/i);
  if (replyTo) {
    reasons.push(`Asks you to reply to a different address (${replyTo[0]})`);
    score += 8;
  }

  // Attachment pressure.
  if (/attach(ed|ment)|\.zip|\.exe|\.scr|\.js\b|\.jar/i.test(body)) {
    reasons.push("References an attachment — unexpected attachments can carry malware");
    score += 6;
  }

  // All-caps pressure (shouting).
  const capsWords = (body.match(/\b[A-Z]{4,}\b/g) || []).filter(
    (w) => !["HTTP", "HTTPS", "URL", "HTML", "PDF", "JPEG", "PNG", "GIF"].includes(w),
  );
  if (capsWords.length >= 4) {
    reasons.push("Heavy use of ALL-CAPS words to create pressure");
    score += 5;
  }

  // Grammar / spelling rough signal — phishing often has many "kindly", repeated
  // punctuation, or "i" used lowercase at the start of sentences.
  const exclamationRuns = (body.match(/!{2,}/g) || []).length;
  if (exclamationRuns >= 2) {
    reasons.push("Repeated exclamation marks used to create alarm");
    score += 3;
  }

  return { reasons, score, matchedKeywords, matchedGroups };
}

// ---------------------------------------------------------------------------
// Combine into a final analysis
// ---------------------------------------------------------------------------

function classify(score: number): AnalysisResult["classification"] {
  if (score >= 71) return "High Risk (Phishing)";
  if (score >= 31) return "Suspicious";
  return "Safe";
}

function buildRecommendation(
  classification: AnalysisResult["classification"],
  reasons: string[],
  urls: UrlFinding[],
): string {
  if (classification === "Safe") {
    return "This email appears safe, but always stay alert. Never share passwords, OTPs, or banking details over email, and verify any unexpected request through official channels.";
  }
  if (classification === "Suspicious") {
    return "Treat this email with caution. Do not click any links or open attachments, and do not share personal information. Verify the sender independently using the official website or a known phone number — not the contact details in this email.";
  }
  const hasCredential = reasons.some((r) =>
    /credential|password|otp|login|verification code|payment|bank/i.test(r),
  );
  const hasUrl = urls.length > 0;
  const parts: string[] = [];
  parts.push("Do not click any links, open attachments, or provide any personal or financial information.");
  if (hasCredential) {
    parts.push("Never enter your password, OTP, or card details on a page reached from this email — the real organization will never ask for these over email.");
  }
  if (hasUrl) {
    parts.push("If you need to check your account, type the official website address directly into your browser instead of using the links in this email.");
  }
  parts.push("Report this email as phishing to your email provider, then delete it.");
  return parts.join(" ");
}

function buildExplanation(
  input: AnalysisInput,
  score: number,
  classification: AnalysisResult["classification"],
  reasons: string[],
  senderSignals: SenderSignals,
  urlFindings: UrlFinding[],
  keywordGroups: Set<string>,
): string {
  const domain = extractDomain(input.senderEmail) || "an unknown domain";
  const parts: string[] = [];

  parts.push(
    `This email was analyzed across sender reputation, URL safety, phishing language, and social-engineering patterns, producing a risk score of ${score}/100.`,
  );

  if (classification === "Safe") {
    parts.push(
      "No major phishing signals were found. The sender domain looks legitimate, the language is not coercive, and there are no requests for credentials or payment.",
    );
  } else if (classification === "Suspicious") {
    parts.push(
      `Several cautionary signals were found: ${reasons.slice(0, 3).join("; ")}. This does not confirm phishing, but it is risky enough that you should verify the sender through official channels before taking any action.`,
    );
  } else {
    parts.push(
      `Multiple strong phishing indicators were found: ${reasons.slice(0, 4).join("; ")}.`,
    );
    if (senderSignals.brandImpersonated) {
      parts.push(
        `The sender claims affiliation with "${senderSignals.claimedBrand}" but is not sending from an official ${senderSignals.claimedBrand} domain (${domain}), which is a hallmark of brand impersonation.`,
      );
    }
    if (urlFindings.some((u) => u.looksLikeTyposquat || u.isIpBased || u.isShortened)) {
      parts.push(
        "At least one link in this email is designed to look trustworthy while sending you somewhere else — a classic credential-harvesting tactic.",
      );
    }
    if (keywordGroups.has("Credential / Payment Theft")) {
      parts.push(
        "The email asks for credentials, OTPs, or payment details. Legitimate organizations never request these over email.",
      );
    }
  }

  return parts.join(" ");
}

export function analyzeEmail(input: AnalysisInput): AnalysisResult {
  const senderSignals = analyzeSender(input.senderEmail, input.emailBody + " " + input.subject);
  const contentSignals = analyzeContent(input.subject, input.emailBody);
  const rawUrls = extractUrls(input.emailBody);
  const urlsFound = rawUrls.map(analyzeUrl);

  // URL scoring.
  let urlScore = 0;
  const urlReasons: string[] = [];
  for (const u of urlsFound) {
    let perUrl = 0;
    if (u.protocol === "http") perUrl += 6;
    if (u.isIpBased) perUrl += 12;
    if (u.isShortened) perUrl += 8;
    if (u.hasSuspiciousTld) perUrl += 6;
    if (u.looksLikeTyposquat) perUrl += 14;
    urlScore += perUrl;
    if (u.reasons.length > 0) {
      urlReasons.push(`Link ${u.url}: ${u.reasons.join("; ")}`);
    }
  }
  if (urlsFound.length > 4) {
    urlScore += 4;
    urlReasons.push("An unusually high number of links in a single email");
  }
  urlScore = Math.min(urlScore, 30);

  // Aggregate reasons, deduped and ordered.
  const reasons: string[] = [];
  const pushReason = (r?: string) => {
    if (r && !reasons.includes(r)) reasons.push(r);
  };
  for (const r of senderSignals.reasons) pushReason(r);
  for (const r of contentSignals.reasons) pushReason(r);
  for (const r of urlReasons) pushReason(r);

  let score =
    senderSignals.score + contentSignals.score + urlScore;

  // Cross-signal amplification: brand impersonation + credential request + a
  // suspicious URL is the classic phishing trifecta — reward it.
  if (
    senderSignals.brandImpersonated &&
    contentSignals.matchedGroups.has("Credential / Payment Theft")
  ) {
    score += 8;
    pushReason("Brand impersonation combined with a request for credentials is a classic phishing pattern");
  }
  if (
    urlsFound.some((u) => u.looksLikeTyposquat) &&
    contentSignals.matchedGroups.has("Urgency / Threat")
  ) {
    score += 6;
    pushReason("A look-alike link paired with urgency language is designed to make you act before checking");
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  const classification = classify(score);

  // Confidence: higher when more independent signals agree.
  const signalCount =
    senderSignals.reasons.length +
    contentSignals.matchedGroups.size +
    urlReasons.length;
  let confidence: number;
  if (classification === "Safe") {
    // Confidence in "safe" is high only when we actually had content to inspect
    // and nothing tripped. Very short / empty inputs get lower confidence.
    const hasContent = (input.emailBody || "").trim().length > 40 && (input.senderEmail || "").trim().length > 0;
    confidence = hasContent ? 88 : 55;
  } else if (classification === "Suspicious") {
    confidence = Math.min(85, 55 + signalCount * 6);
  } else {
    confidence = Math.min(97, 70 + signalCount * 5);
  }

  const recommendation = buildRecommendation(classification, reasons, urlsFound);
  const explanation = buildExplanation(
    input,
    score,
    classification,
    reasons,
    senderSignals,
    urlsFound,
    contentSignals.matchedGroups,
  );

  return {
    riskScore: score,
    classification,
    confidence,
    reasons,
    suspiciousKeywords: contentSignals.matchedKeywords,
    urlsFound,
    recommendation,
    explanation,
  };
}
