Deno.serve(async (req: Request) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Allow-Credentials': 'false'
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({
        error: { code: 'CONFIG_ERROR', message: 'Supabase env variables not set' }
      }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (req.method !== 'POST') {
      return new Response(JSON.stringify({
        error: { code: 'METHOD_NOT_ALLOWED', message: 'Use POST to perform bulk update' }
      }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const body = await req.json().catch(() => ({}));
    const shiftName: string = (body?.shift_name || 'Blue Shift').toString();

    // 1) Resolve the target operational shift id
    const shiftRes = await fetch(
      `${supabaseUrl}/rest/v1/02_admin_register_fd2_operational_shifts?select=id,shift_name&shift_name=ilike.*${encodeURIComponent(shiftName.toLowerCase())}*`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${serviceRoleKey}`,
          'apikey': serviceRoleKey,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!shiftRes.ok) {
      const errText = await shiftRes.text();
      return new Response(JSON.stringify({
        error: { code: 'SHIFT_LOOKUP_FAILED', message: errText || 'Failed to lookup operational shift' }
      }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const shifts = await shiftRes.json();
    const targetShift = Array.isArray(shifts)
      ? shifts.find((s: any) => (s.shift_name || '').toLowerCase().includes(shiftName.toLowerCase()))
      : null;

    if (!targetShift?.id) {
      return new Response(JSON.stringify({
        error: { code: 'SHIFT_NOT_FOUND', message: `Operational shift '${shiftName}' not found` }
      }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const shiftId = targetShift.id;

    // 2) Bulk update all staff_basic_info rows
    // Use a filter that matches all rows to comply with PostgREST restrictions
    const updateRes = await fetch(
      `${supabaseUrl}/rest/v1/staff_basic_info?staff_id=not.is.null`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${serviceRoleKey}`,
          'apikey': serviceRoleKey,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ operational_shift_id: shiftId })
      }
    );

    if (!updateRes.ok) {
      const errText = await updateRes.text();
      return new Response(JSON.stringify({
        error: { code: 'BULK_UPDATE_FAILED', message: errText || 'Failed to set Operational Shift for all staff' }
      }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // 3) Return a simple success payload
    return new Response(JSON.stringify({
      data: {
        message: `Operational Shift set to '${shiftName}' for all staff_basic_info rows`,
        operational_shift_id: shiftId
      }
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('bulk-set-operational-shift error:', error);
    return new Response(JSON.stringify({
      error: { code: 'INTERNAL_ERROR', message: (error as Error)?.message || 'Unexpected error' }
    }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});