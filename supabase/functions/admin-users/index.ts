import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

// --- Rate Limiting ---
const rateLimits = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 30;

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = rateLimits.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimits.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}

// --- Input Validation ---
const VALID_ACTIONS = ["list", "delete_user", "update_plan", "set_role", "stats"];
const VALID_PLANS = ["free", "degen", "creator", "whale"];
const VALID_ROLES = ["admin", "moderator", "user"];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // Verify caller is authenticated
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const anonClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: { user } } = await anonClient.auth.getUser()
    if (!user) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Rate limit by admin user
    if (!checkRateLimit(`admin:${user.id}`)) {
      return new Response(JSON.stringify({ error: 'Too many requests' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': '60' },
      })
    }

    // Verify admin role using service role (bypass RLS)
    const adminClient = createClient(supabaseUrl, serviceRoleKey)
    const { data: isAdmin } = await adminClient.from('user_roles').select('id').eq('user_id', user.id).eq('role', 'admin').maybeSingle()
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: 'Not authorized' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const url = new URL(req.url)
    const action = url.searchParams.get('action') || 'list'

    // Validate action
    if (!VALID_ACTIONS.includes(action)) {
      return new Response(JSON.stringify({ error: `Invalid action. Must be one of: ${VALID_ACTIONS.join(", ")}` }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'list') {
      const page = Math.max(1, Math.min(100, parseInt(url.searchParams.get('page') || '1') || 1))
      const perPage = Math.max(1, Math.min(100, parseInt(url.searchParams.get('per_page') || '50') || 50))

      const { data: { users }, error } = await adminClient.auth.admin.listUsers({ page, perPage })
      if (error) throw error

      const userIds = users.map(u => u.id)
      const { data: subs } = await adminClient.from('user_subscriptions').select('*').in('user_id', userIds)
      const { data: siteCounts } = await adminClient.from('sites').select('user_id')

      const siteCountMap: Record<string, number> = {}
      siteCounts?.forEach(s => {
        siteCountMap[s.user_id] = (siteCountMap[s.user_id] || 0) + 1
      })

      const subMap: Record<string, any> = {}
      subs?.forEach(s => { subMap[s.user_id] = s })

      const { data: roles } = await adminClient.from('user_roles').select('*').in('user_id', userIds)
      const roleMap: Record<string, string[]> = {}
      roles?.forEach(r => {
        if (!roleMap[r.user_id]) roleMap[r.user_id] = []
        roleMap[r.user_id].push(r.role)
      })

      const enrichedUsers = users.map(u => ({
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at,
        email_confirmed_at: u.email_confirmed_at,
        subscription: subMap[u.id] || null,
        site_count: siteCountMap[u.id] || 0,
        roles: roleMap[u.id] || [],
      }))

      return new Response(JSON.stringify({ users: enrichedUsers }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'delete_user') {
      const body = await req.json()
      if (!body.user_id || typeof body.user_id !== 'string' || !/^[0-9a-f-]{36}$/.test(body.user_id)) {
        return new Response(JSON.stringify({ error: 'Valid user_id is required' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      // Prevent self-deletion
      if (body.user_id === user.id) {
        return new Response(JSON.stringify({ error: 'Cannot delete yourself' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      const { error } = await adminClient.auth.admin.deleteUser(body.user_id)
      if (error) throw error
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'update_plan') {
      const body = await req.json()
      if (!body.user_id || typeof body.user_id !== 'string' || !/^[0-9a-f-]{36}$/.test(body.user_id)) {
        return new Response(JSON.stringify({ error: 'Valid user_id is required' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      if (!body.plan || typeof body.plan !== 'string' || !VALID_PLANS.includes(body.plan)) {
        return new Response(JSON.stringify({ error: `Invalid plan. Must be one of: ${VALID_PLANS.join(", ")}` }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      const { error } = await adminClient.from('user_subscriptions').update({ plan: body.plan, status: 'active' }).eq('user_id', body.user_id)
      if (error) throw error
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'set_role') {
      const body = await req.json()
      if (!body.user_id || typeof body.user_id !== 'string' || !/^[0-9a-f-]{36}$/.test(body.user_id)) {
        return new Response(JSON.stringify({ error: 'Valid user_id is required' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      if (!body.role || typeof body.role !== 'string' || !VALID_ROLES.includes(body.role)) {
        return new Response(JSON.stringify({ error: `Invalid role. Must be one of: ${VALID_ROLES.join(", ")}` }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      if (body.remove) {
        await adminClient.from('user_roles').delete().eq('user_id', body.user_id).eq('role', body.role)
      } else {
        await adminClient.from('user_roles').upsert({ user_id: body.user_id, role: body.role }, { onConflict: 'user_id,role' })
      }
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'stats') {
      const { count: totalSites } = await adminClient.from('sites').select('*', { count: 'exact', head: true })
      const { count: totalContent } = await adminClient.from('generated_content').select('*', { count: 'exact', head: true })
      const { data: subs } = await adminClient.from('user_subscriptions').select('plan, status')

      const planBreakdown: Record<string, number> = {}
      let activePaid = 0
      subs?.forEach(s => {
        planBreakdown[s.plan] = (planBreakdown[s.plan] || 0) + 1
        if (s.plan !== 'free' && s.plan !== 'starter' && s.status === 'active') activePaid++
        if (s.plan !== 'free' && s.status === 'active') activePaid++
      })

      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      const { data: recentUsers } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 1000 })
      const recentSignups = recentUsers?.users?.filter(u => new Date(u.created_at) >= weekAgo).length || 0

      return new Response(JSON.stringify({
        totalUsers: recentUsers?.users?.length || 0,
        totalSites,
        totalContent,
        activePaid,
        recentSignups,
        planBreakdown,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: unknown) {
    console.error("Admin error:", error);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
