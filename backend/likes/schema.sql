-- Run once in the D1 console. Re-running is safe and preserves existing hearts.
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS like_totals (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  total INTEGER NOT NULL DEFAULT 0 CHECK (typeof(total) = 'integer' AND total BETWEEN 0 AND 9007199254740991)
);
INSERT OR IGNORE INTO like_totals (id, total) VALUES (1, 0);

-- One row per contributing browser, not one row per click. No names or emails.
CREATE TABLE IF NOT EXISTS like_contributions (
  client_id TEXT PRIMARY KEY NOT NULL CHECK (length(client_id) = 36),
  hearts INTEGER NOT NULL CHECK (typeof(hearts) = 'integer' AND hearts BETWEEN 0 AND 9007199254740991),
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER IF NOT EXISTS like_limit_initial
BEFORE INSERT ON like_contributions
WHEN NEW.hearts > 250 AND NOT EXISTS (SELECT 1 FROM like_contributions WHERE client_id = NEW.client_id)
BEGIN SELECT RAISE(ABORT, 'heart_increment_too_large'); END;

CREATE TRIGGER IF NOT EXISTS like_limit_increment
BEFORE UPDATE OF hearts ON like_contributions WHEN NEW.hearts > OLD.hearts + 250
BEGIN SELECT RAISE(ABORT, 'heart_increment_too_large'); END;

CREATE TRIGGER IF NOT EXISTS like_total_insert
AFTER INSERT ON like_contributions
BEGIN UPDATE like_totals SET total = total + NEW.hearts WHERE id = 1; END;

CREATE TRIGGER IF NOT EXISTS like_total_update
AFTER UPDATE OF hearts ON like_contributions
BEGIN UPDATE like_totals SET total = total + NEW.hearts - OLD.hearts WHERE id = 1; END;
