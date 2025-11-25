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
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        // Get all departments with their station counts and additional fields
        console.log('Fetching all departments...');
        const departmentResponse = await fetch(`${supabaseUrl}/rest/v1/emergency_departments?select=id,dept_name,dept_picture_url,department_type,number_of_fire_stations,number_of_staff,number_of_fire_vehicles&order=dept_name.asc`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            }
        });

        if (!departmentResponse.ok) {
            throw new Error('Failed to fetch departments');
        }

        const departments = await departmentResponse.json();
        console.log('Departments fetched successfully:', departments.length);

        return new Response(JSON.stringify({
            data: {
                departments: departments || []
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Get departments error:', error);

        const errorResponse = {
            error: {
                code: 'GET_DEPARTMENTS_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});