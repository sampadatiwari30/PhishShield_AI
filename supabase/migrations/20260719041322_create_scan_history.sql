/*
# Create scan_history table for PhishShield AI

1. Purpose
   PhishShield AI lets users paste a sender email, optional subject, and email body
   to run an AI-powered phishing risk analysis. Each analysis (a "scan") is stored
   so users can review past reports in the Scan History page.

2. New Tables
   - `scan_history`
     - `id`            uuid, primary key
     - `sender_email`  text, the sender email address the user pasted (nullable, in case only body is provided)
     - `subject`       text, optional email subject (nullable)
     - `email_body`    text, the full pasted email body (nullable, in case only headers given)
     - `risk_score`    integer, 0-100 risk score from analysis
     - `classification` text, one of: 'Safe', 'Suspicious', 'High Risk (Phishing)'
     - `confidence`    integer, 0-100 confidence level of the analysis
     - `reasons`       jsonb, array of human-readable reason strings
     - `suspicious_keywords` jsonb, array of detected keyword strings
     - `urls_found`    jsonb, array of URL analysis objects
     - `recommendation` text, AI-generated security recommendation
     - `explanation`   text, longer natural-language summary of the analysis
     - `created_at`    timestamptz, defaults to now()

3. Security
   - Single-tenant app (no sign-in screen). Enable RLS and allow anon+authenticated
     full CRUD because scan history is intentionally public/shared for this demo tool.
   - Four separate policies (select/insert/update/delete), not FOR ALL.

4. Notes
   - No user_id column and no auth dependency: the app has no sign-in flow.
   - USING (true) is acceptable here because the data is intentionally shared.
*/

CREATE TABLE IF NOT EXISTS scan_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_email text,
  subject text,
  email_body text,
  risk_score integer NOT NULL DEFAULT 0,
  classification text NOT NULL DEFAULT 'Safe',
  confidence integer NOT NULL DEFAULT 50,
  reasons jsonb NOT NULL DEFAULT '[]'::jsonb,
  suspicious_keywords jsonb NOT NULL DEFAULT '[]'::jsonb,
  urls_found jsonb NOT NULL DEFAULT '[]'::jsonb,
  recommendation text NOT NULL DEFAULT '',
  explanation text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE scan_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_scans" ON scan_history;
CREATE POLICY "anon_select_scans"
ON scan_history FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_scans" ON scan_history;
CREATE POLICY "anon_insert_scans"
ON scan_history FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_scans" ON scan_history;
CREATE POLICY "anon_update_scans"
ON scan_history FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_scans" ON scan_history;
CREATE POLICY "anon_delete_scans"
ON scan_history FOR DELETE
TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS scan_history_created_at_idx ON scan_history (created_at DESC);
