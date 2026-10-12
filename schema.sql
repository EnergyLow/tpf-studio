-- schema.sql — структура таблицы отзывов

CREATE TABLE IF NOT EXISTS reviews (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  name         TEXT NOT NULL,
  role         TEXT,
  rating       INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  text         TEXT NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT 0,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reviews_published ON reviews (is_published, created_at DESC);

CREATE TRIGGER IF NOT EXISTS update_reviews_updated_at
AFTER UPDATE ON reviews
FOR EACH ROW
BEGIN
  UPDATE reviews SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;