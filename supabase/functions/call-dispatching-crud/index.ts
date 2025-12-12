import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Max-Age": "86400",
  "Access-Control-Allow-Credentials": "false",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const authHeader = req.headers.get("Authorization") || req.headers.get("authorization") || "";
    if (!authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: { code: "UNAUTHORIZED", message: "Missing bearer token" } }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = req.method === "POST" ? await req.json() : {};
    const action = body?.action || "upsert";

    if (action !== "upsert") {
      return new Response(
        JSON.stringify({ error: { code: "INVALID_ACTION", message: "Unsupported action" } }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const payload = {
      incident_number: String(body?.incident_number || ""),
      dispatch_date: String(body?.dispatch_date || ""),
      dispatch_time: String(body?.dispatch_time || ""),
      dispatcher_id: body?.dispatcher_id ? String(body.dispatcher_id) : null,
      dispatched_stations: Array.isArray(body?.dispatched_stations) ? body.dispatched_stations : [],
    };

    if (!payload.incident_number || !payload.dispatch_date || !payload.dispatch_time) {
      return new Response(
        JSON.stringify({ error: { code: "MISSING_FIELDS", message: "incident_number, dispatch_date, dispatch_time are required" } }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data, error } = await serviceClient
      .from("03_ecc_03_02_Incident_Call_Dispatching")
      .upsert([payload], { onConflict: "incident_number" })
      .select()
      .limit(1);

    if (error) {
      return new Response(
        JSON.stringify({ error: { code: "UPSERT_FAILED", message: error.message } }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ ok: true, record: (Array.isArray(data) && data[0]) || null }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: { code: "UNEXPECTED", message: String(e?.message || e) } }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

