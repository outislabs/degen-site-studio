-- CLI auth codes: ephemeral magic-link codes, valid 10 minutes
create table public.cli_auth_codes (
  code text primary key,
  email text not null,
  user_id uuid references auth.users(id),
  status text not null default 'pending', -- pending | confirmed | consumed
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '10 minutes'),
  consumed_at timestamptz
);

create index on public.cli_auth_codes (status, expires_at);

-- Only service role touches this table
alter table public.cli_auth_codes enable row level security;

-- CLI sessions: long-lived tokens with server-side revocation
create table public.cli_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  token_hash text not null unique,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '30 days'),
  revoked_at timestamptz,
  last_used_at timestamptz
);

create index on public.cli_sessions (token_hash) where revoked_at is null;
create index on public.cli_sessions (user_id, revoked_at);

-- Only service role touches this table
alter table public.cli_sessions enable row level security;

-- Add status column to sites for draft/published lifecycle
alter table public.sites add column if not exists status text not null default 'draft';
