-- One row per day. Re-running the daily job replaces that day's snapshot.
CREATE TABLE IF NOT EXISTS snapshots (
  id          SERIAL PRIMARY KEY,
  taken_on    DATE NOT NULL UNIQUE,
  total_jobs  INTEGER NOT NULL CHECK (total_jobs >= 0),
  junior_jobs INTEGER NOT NULL CHECK (junior_jobs >= 0),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Aggregated counts only: job ads themselves are never stored.
CREATE TABLE IF NOT EXISTS snapshot_counts (
  snapshot_id INTEGER NOT NULL REFERENCES snapshots(id) ON DELETE CASCADE,
  kind        TEXT NOT NULL CHECK (kind IN ('tech', 'area', 'city', 'work_mode')),
  key         TEXT NOT NULL,
  count       INTEGER NOT NULL CHECK (count >= 0),
  PRIMARY KEY (snapshot_id, kind, key)
);
