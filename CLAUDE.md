# DegenTools Development Rules

## Workflow
- Frontend (src/) → Lovable only. Never push src/ files from terminal.
- Edge functions (supabase/functions/) → Terminal only. Never ask Lovable to modify these.
- Deployments → Vercel handles frontend automatically. Supabase CLI handles edge functions.

## Edge Function Deploy
supabase functions deploy [function-name] --no-verify-jwt

## Never do
- git push frontend changes from terminal
- Ask Lovable to deploy edge functions
- Force push to main

## Safe terminal operations
- supabase functions deploy
- supabase secrets set
- git add supabase/ + commit + push
