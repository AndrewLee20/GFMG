CREATE TABLE IF NOT EXISTS challenge_scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nickname TEXT NOT NULL,
  score INTEGER NOT NULL,
  correct INTEGER NOT NULL,
  total INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  ip_hash TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_rank
ON challenge_scores(score DESC, total DESC, created_at ASC);
