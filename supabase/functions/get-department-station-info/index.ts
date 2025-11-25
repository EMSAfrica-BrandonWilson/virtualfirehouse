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
        const url = new URL(req.url);
        const departmentId = url.searchParams.get('departmentId');

        if (!departmentId) {
            throw new Error('Department ID is required');
        }

        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        // Get department details with station limit
        console.log('Fetching department station info for ID:', departmentId);
        const departmentResponse = await fetch(`${supabaseUrl}/rest/v1/emergency_departments?id=eq.${departmentId}&select=id,dept_name,number_of_fire_stations`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            }
        });

        if (!departmentResponse.ok) {
            throw new Error('Failed to fetch department information');
        }

        const departments = await departmentResponse.json();
        if (!departments || departments.length === 0) {
            throw new Error('Department not found');
        }

        const department = departments[0];

        // Get current station count for this department
        const stationCountResponse = await fetch(`${supabaseUrl}/rest/v1/fire_stations_vfh?department_id=eq.${departmentId}&select=id`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            }
        });

        if (!stationCountResponse.ok) {
            throw new Error('Failed to fetch existing station count');
        }

        const existingStations = await stationCountResponse.json();
        const currentStationCount = existingStations ? existingStations.length : 0;
        const stationLimit = department.number_of_fire_stations || 0;
        const remainingSlots = Math.max(0, stationLimit - currentStationCount);

        console.log(`Department: ${department.dept_name}, Current: ${currentStationCount}, Limit: ${stationLimit}, Remaining: ${remainingSlots}`);

        return new Response(JSON.stringify({
            data: {
                departmentId: department.id,
                departmentName: department.dept_name,
                stationLimit: stationLimit,
                currentStationCount: currentStationCount,
                remainingSlots: remainingSlots,
                canAddStation: remainingSlots > 0
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Get department station info error:', error);

        const errorResponse = {
            error: {
                code: 'GET_DEPARTMENT_STATION_INFO_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});