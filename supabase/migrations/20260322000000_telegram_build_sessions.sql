CREATE TABLE telegram_build_sessions (
  chat_id BIGINT PRIMARY KEY,
  step INTEGER NOT NULL DEFAULT 1,
  token_data JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
