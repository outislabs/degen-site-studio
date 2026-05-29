CREATE TABLE telegram_launch_sessions (
  chat_id BIGINT PRIMARY KEY,
  step INTEGER NOT NULL DEFAULT 1,
  session_data JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
