-- Rename cli_auth_codes → cli_pending_sessions to match device-auth flow
alter table public.cli_auth_codes rename to cli_pending_sessions;

-- Rename the primary key column for clarity
alter table public.cli_pending_sessions rename column code to session_token;

-- Drop email — device auth flow doesn't need it (user is already browser-authed)
alter table public.cli_pending_sessions drop column email;
