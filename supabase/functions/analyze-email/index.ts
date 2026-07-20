import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";
import { analyzeEmail, type AnalysisInput } from "./detector.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed. Use POST." }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Request body must be valid JSON." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const input = (body || {}) as Partial<AnalysisInput>;
    const senderEmail = (input.senderEmail || "").trim();
    const subject = (input.subject || "").trim();
    const emailBody = (input.emailBody || "").trim();

    if (!senderEmail && !subject && !emailBody) {
      return new Response(
        JSON.stringify({
          error: "Please provide at least a sender email, a subject, or an email body to analyze.",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const result = analyzeEmail({ senderEmail, subject, emailBody });

    // Persist the scan so it shows up in Scan History.
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || Deno.env.get("VITE_SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    let scanId: string | null = null;

    if (supabaseUrl && serviceRoleKey) {
      const supabase = createClient(supabaseUrl, serviceRoleKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { data, error } = await supabase
        .from("scan_history")
        .insert({
          sender_email: senderEmail || null,
          subject: subject || null,
          email_body: emailBody || null,
          risk_score: result.riskScore,
          classification: result.classification,
          confidence: result.confidence,
          reasons: result.reasons,
          suspicious_keywords: result.suspiciousKeywords,
          urls_found: result.urlsFound,
          recommendation: result.recommendation,
          explanation: result.explanation,
        })
        .select("id")
        .maybeSingle();

      if (error) {
        console.error("Failed to persist scan:", error.message);
      } else if (data) {
        scanId = data.id;
      }
    } else {
      console.warn("Supabase env vars missing; scan will not be persisted.");
    }

    return new Response(
      JSON.stringify({ scanId, ...result }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("analyze-email error:", err);
    return new Response(
      JSON.stringify({ error: "Analysis failed. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
