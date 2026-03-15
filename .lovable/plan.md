

## Custom Domains: The Core Problem

Custom domains for user-generated sites **cannot work on Lovable hosting**. Here's why:

Lovable's infrastructure only serves traffic for domains explicitly added in **Project Settings → Domains**. When a user points `mytoken.com` via CNAME to `degen-site-studio.lovable.app`, Lovable's servers reject the request because `mytoken.com` isn't registered in your project's domain settings. You'd have to manually add every user's domain — not scalable.

## What Actually Works Today

| Method | Status | Notes |
|--------|--------|-------|
| **Path-based URLs** (`degentools.co/site/slug`) | Works now | Primary shareable link |
| **Subdomains** (`slug.degentools.co`) | Broken | Requires wildcard DNS + self-hosting |
| **Custom domains** (`mytoken.com`) | Broken | Requires self-hosting |

## Recommended Plan

Since self-hosting is needed for both subdomains and custom domains, the immediate fix is to **clean up the builder UI to be honest about what works today**:

1. **Remove subdomain "auto-enabled" messaging** — replace with a note that subdomains are coming soon or require self-hosting
2. **Update custom domain instructions** — change CNAME target from `degen-site-studio.lovable.app` to show that custom domains require the app to be self-hosted first, with a link to the self-hosting guide
3. **Make path-based URL the primary/default** — emphasize `degentools.co/site/slug` as the working share link in both the builder and publish modal
4. **Keep DNS verification** — it's still useful for when self-hosting is set up

### No database or backend changes needed — this is purely UI/copy updates.

If you want custom domains to actually work, you'll need to self-host the app on a VPS (as discussed previously), then the existing `useCustomDomain` hook and DNS verification will work as-is.

