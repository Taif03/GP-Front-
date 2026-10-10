/*
# Mueen — Smart Security Assistant Database Schema

## Overview
Creates the core data model for the Mueen (مُعين) AI-powered security and crowd management
dashboard for the Holy Mosque of Makkah. This is a single-tenant application with no auth
sign-in screen, so all policies use `TO anon, authenticated`.

## New Tables

1. `officers` — Security officers on duty
   - id (uuid, PK)
   - name (text) — Officer full name (Arabic)
   - badge_number (text, unique) — Badge ID
   - rank (text) — Military/police rank
   - phone (text) — Contact number
   - duty_station (text) — Assigned gate/area
   - status (text) — 'online' | 'offline' | 'on_break'
   - created_at (timestamp)

2. `shifts` — Shift schedule entries for officers
   - id (uuid, PK)
   - officer_id (uuid FK → officers) — Which officer
   - shift_date (date) — The date of the shift
   - start_time (text) — Shift start (e.g. "06:00")
   - end_time (text) — Shift end (e.g. "14:00")
   - station (text) — Duty station for this shift
   - status (text) — 'scheduled' | 'active' | 'completed'
   - created_at (timestamp)

3. `reports` — Emergency / incident reports
   - id (uuid, PK)
   - title (text) — Short description
   - description (text) — Detailed description
   - gate_name (text) — Location gate name
   - latitude (numeric) — GPS latitude
   - longitude (numeric) — GPS longitude
   - risk_level (text) — 'high' | 'medium' | 'low'
   - status (text) — 'active' | 'assigned' | 'resolved'
   - assigned_officer_id (uuid FK → officers, nullable) — Officer assigned
   - reporter_name (text) — Name of person who reported
   - reporter_phone (text) — Contact of reporter
   - created_at (timestamp)
   - updated_at (timestamp)

## Security
- RLS enabled on all three tables.
- Single-tenant no-auth app: policies use `TO anon, authenticated` with `USING (true)`.
- All CRUD operations allowed for anon + authenticated roles.
*/

-- ============ OFFICERS ============
CREATE TABLE IF NOT EXISTS officers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  badge_number text UNIQUE NOT NULL,
  rank text NOT NULL DEFAULT 'رجل أمن',
  phone text,
  duty_station text,
  status text NOT NULL DEFAULT 'offline',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE officers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_officers" ON officers;
CREATE POLICY "anon_select_officers" ON officers FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_officers" ON officers;
CREATE POLICY "anon_insert_officers" ON officers FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_officers" ON officers;
CREATE POLICY "anon_update_officers" ON officers FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_officers" ON officers;
CREATE POLICY "anon_delete_officers" ON officers FOR DELETE
  TO anon, authenticated USING (true);

-- ============ SHIFTS ============
CREATE TABLE IF NOT EXISTS shifts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  officer_id uuid NOT NULL REFERENCES officers(id) ON DELETE CASCADE,
  shift_date date NOT NULL DEFAULT CURRENT_DATE,
  start_time text NOT NULL,
  end_time text NOT NULL,
  station text NOT NULL,
  status text NOT NULL DEFAULT 'scheduled',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_shifts" ON shifts;
CREATE POLICY "anon_select_shifts" ON shifts FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_shifts" ON shifts;
CREATE POLICY "anon_insert_shifts" ON shifts FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_shifts" ON shifts;
CREATE POLICY "anon_update_shifts" ON shifts FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_shifts" ON shifts;
CREATE POLICY "anon_delete_shifts" ON shifts FOR DELETE
  TO anon, authenticated USING (true);

-- ============ REPORTS ============
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  gate_name text NOT NULL,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  risk_level text NOT NULL DEFAULT 'medium',
  status text NOT NULL DEFAULT 'active',
  assigned_officer_id uuid REFERENCES officers(id) ON DELETE SET NULL,
  reporter_name text,
  reporter_phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_reports" ON reports;
CREATE POLICY "anon_select_reports" ON reports FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_reports" ON reports;
CREATE POLICY "anon_insert_reports" ON reports FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_reports" ON reports;
CREATE POLICY "anon_update_reports" ON reports FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_reports" ON reports;
CREATE POLICY "anon_delete_reports" ON reports FOR DELETE
  TO anon, authenticated USING (true);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_assigned_officer ON reports(assigned_officer_id);
CREATE INDEX IF NOT EXISTS idx_shifts_officer ON shifts(officer_id);
CREATE INDEX IF NOT EXISTS idx_shifts_date ON shifts(shift_date);
CREATE INDEX IF NOT EXISTS idx_officers_status ON officers(status);
