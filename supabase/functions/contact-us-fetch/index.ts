import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Allow-Credentials': 'false'
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders })
  }

  try {
    const auth = req.headers.get('Authorization') || ''
    const url = Deno.env.get('SUPABASE_URL') || ''
    const anon = Deno.env.get('SUPABASE_ANON_KEY') || ''
    const service = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

    const userClient = createClient(url, anon, { global: { headers: { Authorization: auth } } })
    const { data: authData, error: authErr } = await userClient.auth.getUser()
    if (authErr || !authData?.user) {
      return new Response(JSON.stringify({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const serviceClient = createClient(url, service)
    const { data: profiles, error: profErr } = await serviceClient
      .from('user_profiles')
      .select('id, email, role')
      .eq('id', authData.user.id)
      .limit(1)
    if (profErr || !profiles || profiles.length === 0) {
      return new Response(JSON.stringify({ error: { code: 'FORBIDDEN', message: 'Profile not found' } }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
    const role = String((profiles[0] as any).role || '')
    if (role !== 'System Administrator') {
      return new Response(JSON.stringify({ error: { code: 'FORBIDDEN', message: 'Forbidden' } }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const { data: rows, error: rowsErr } = await serviceClient
      .from('01_home_contact_us')
      .select('id, name, email, subject, message, created_at, status')
      .order('created_at', { ascending: false })
    if (rowsErr) {
      return new Response(JSON.stringify({ error: { code: 'FETCH_FAILED', message: rowsErr.message || 'Failed to fetch messages' } }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    return new Response(JSON.stringify({ messages: rows || [] }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (e) {
    return new Response(JSON.stringify({ error: { code: 'SERVER_ERROR', message: e?.message || 'Server error' } }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})