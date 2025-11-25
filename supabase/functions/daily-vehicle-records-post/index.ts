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

        // Get request data
        const requestData = await req.json();
        const { recordDate, vehiclesData, notes } = requestData;

        // Validate required fields
        if (!recordDate || !vehiclesData) {
            return new Response(JSON.stringify({ 
                error: { 
                    code: 'VALIDATION_ERROR', 
                    message: 'recordDate and vehiclesData are required' 
                } 
            }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // Get Supabase client
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        
        // Decode JWT to get user ID
        const token = authHeader.replace('Bearer ', '');
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userId = payload.sub;

        // Check if record for this date already exists
        const checkResponse = await fetch(`${supabaseUrl}/rest/v1/daily_out_of_service_vehicles?record_date=eq.${recordDate}&select=id`, {
            method: 'GET',
            headers: {
                'Authorization': authHeader,
                'apikey': supabaseKey,
                'Content-Type': 'application/json',
            },
        });

        const existingRecords = await checkResponse.json();
        if (existingRecords.length > 0) {
            return new Response(JSON.stringify({ 
                error: { 
                    code: 'RECORD_EXISTS', 
                    message: 'Record for this date already exists. Use PUT to update instead.' 
                } 
            }), {
                status: 409,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // Create the new record
        const createData = {
            record_date: recordDate,
            vehicles_data: vehiclesData,
            notes: notes || null,
            created_by: userId,
            updated_by: userId
        };

        const createResponse = await fetch(`${supabaseUrl}/rest/v1/daily_out_of_service_vehicles`, {
            method: 'POST',
            headers: {
                'Authorization': authHeader,
                'apikey': supabaseKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(createData)
        });

        if (!createResponse.ok) {
            const errorText = await createResponse.text();
            throw new Error(`Failed to create record: ${errorText}`);
        }

        const newRecord = await createResponse.json();

        return new Response(JSON.stringify({ 
            data: newRecord[0], 
            message: 'Daily vehicle record created successfully' 
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Error in daily-vehicle-records-post:', error);
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