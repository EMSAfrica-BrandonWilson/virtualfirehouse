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
        // Get the authorization header
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return new Response(JSON.stringify({ error: { code: 'UNAUTHORIZED', message: 'Authorization header required' } }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // Get Supabase client
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        
        // Parse request parameters
        const url = new URL(req.url);
        const dateParam = url.searchParams.get('date');
        const recordDate = dateParam || new Date().toISOString().split('T')[0]; // Default to today

        // Make request to Supabase
        const response = await fetch(`${supabaseUrl}/rest/v1/daily_out_of_service_vehicles?record_date=eq.${recordDate}&select=*`, {
            method: 'GET',
            headers: {
                'Authorization': authHeader,
                'apikey': supabaseKey,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Supabase request failed: ${response.statusText}`);
        }

        const data = await response.json();
        
        // Return the record if found, or null if not found
        const record = data.length > 0 ? data[0] : null;

        return new Response(JSON.stringify({ data: record }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Error in daily-vehicle-records-get:', error);
        return new Response(JSON.stringify({ 
            error: { 
                code: 'FUNCTION_ERROR', 
                message: error.message 
            } 
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});