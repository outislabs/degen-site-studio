import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // Verify caller is admin
    const authHeader = req.headers.get('Authorization')!
    const anonClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: { user } } = await anonClient.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data: roleCheck } = await anonClient.rpc('has_role', { _user_id: user.id, _role: 'admin' })
    // has_role returns boolean directly from rpc
    // But since it's a SQL function returning boolean, let's check via query
    const adminClient = createClient(supabaseUrl, serviceRoleKey)
    const { data: isAdmin } = await adminClient.from('user_roles').select('id').eq('user_id', user.id).eq('role', 'admin').maybeSingle()
    if (!isAdmin) throw new Error('Not authorized')

    const url = new URL(req.url)
    const action = url.searchParams.get('action') || 'list'

    if (action === 'list') {
      const page = parseInt(url.searchParams.get('page') || '1')
      const perPage = parseInt(url.searchParams.get('per_page') || '50')

      const { data: { users }, error } = await adminClient.auth.admin.listUsers({
        page,
        perPage,
      })
      if (error) throw error

      // Get subscriptions and site counts
      const userIds = users.map(u => u.id)
      const { data: subs } = await adminClient.from('user_subscriptions').select('*').in('user_id', userIds)
      const { data: siteCounts } = await adminClient.from('sites').select('user_id')

      const siteCountMap: Record<string, number> = {}
      siteCounts?.forEach(s => {
        siteCountMap[s.user_id] = (siteCountMap[s.user_id] || 0) + 1
      })

      const subMap: Record<string, any> = {}
      subs?.forEach(s => { subMap[s.user_id] = s })

      // Get roles
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
      const { error } = await adminClient.auth.admin.deleteUser(body.user_id)
      if (error) throw error
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'update_plan') {
      const body = await req.json()
      const { error } = await adminClient.from('user_subscriptions').update({ plan: body.plan, status: 'active' }).eq('user_id', body.user_id)
      if (error) throw error
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'set_role') {
      const body = await req.json()
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
      const { count: totalUsers } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 1 })
      const { count: totalSites } = await adminClient.from('sites').select('*', { count: 'exact', head: true })
      const { count: totalContent } = await adminClient.from('generated_content').select('*', { count: 'exact', head: true })
      const { data: subs } = await adminClient.from('user_subscriptions').select('plan, status')

      const planBreakdown: Record<string, number> = {}
      let activePaid = 0
      subs?.forEach(s => {
        planBreakdown[s.plan] = (planBreakdown[s.plan] || 0) + 1
        if (s.plan !== 'free' && s.status === 'active') activePaid++
      })

      // Recent signups (last 7 days)
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
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
