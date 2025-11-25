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
        const excludeStationId = url.searchParams.get('excludeStationId'); // For edit scenarios

        if (!departmentId) {
            throw new Error('Department ID is required');
        }

        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        // Get department details with limits
        console.log('Fetching department allocation info for ID:', departmentId);
        const departmentResponse = await fetch(`${supabaseUrl}/rest/v1/emergency_departments?id=eq.${departmentId}&select=id,dept_name,number_of_fire_stations,number_of_staff,number_of_fire_vehicles`, {
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

        // Build query for existing stations (exclude current station if editing)
        let stationQuery = `${supabaseUrl}/rest/v1/fire_stations_vfh?department_id=eq.${departmentId}&select=id,number_of_station_staff,number_of_station_vehicles`;
        if (excludeStationId) {
            stationQuery += `&id=neq.${excludeStationId}`;
        }

        // Get current allocations for this department
        const stationAllocationsResponse = await fetch(stationQuery, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            }
        });

        if (!stationAllocationsResponse.ok) {
            throw new Error('Failed to fetch existing station allocations');
        }

        const existingStations = await stationAllocationsResponse.json();
        
        // Calculate current allocations
        const currentStationCount = existingStations ? existingStations.length : 0;
        const currentStaffAllocated = existingStations ? existingStations.reduce((sum, station) => sum + (station.number_of_station_staff || 0), 0) : 0;
        const currentVehiclesAllocated = existingStations ? existingStations.reduce((sum, station) => sum + (station.number_of_station_vehicles || 0), 0) : 0;
        
        // Calculate limits and available amounts
        const stationLimit = department.number_of_fire_stations || 0;
        const staffLimit = department.number_of_staff || 0;
        const vehicleLimit = department.number_of_fire_vehicles || 0;
        
        const remainingStationSlots = Math.max(0, stationLimit - currentStationCount);
        const availableStaff = Math.max(0, staffLimit - currentStaffAllocated);
        const availableVehicles = Math.max(0, vehicleLimit - currentVehiclesAllocated);

        console.log(`Department: ${department.dept_name}`);
        console.log(`Stations - Current: ${currentStationCount}, Limit: ${stationLimit}, Remaining: ${remainingStationSlots}`);
        console.log(`Staff - Allocated: ${currentStaffAllocated}, Limit: ${staffLimit}, Available: ${availableStaff}`);
        console.log(`Vehicles - Allocated: ${currentVehiclesAllocated}, Limit: ${vehicleLimit}, Available: ${availableVehicles}`);

        return new Response(JSON.stringify({
            data: {
                departmentId: department.id,
                departmentName: department.dept_name,
                // Station information
                stationLimit: stationLimit,
                currentStationCount: currentStationCount,
                remainingStationSlots: remainingStationSlots,
                canAddStation: remainingStationSlots > 0,
                // Staff allocation information
                staffLimit: staffLimit,
                currentStaffAllocated: currentStaffAllocated,
                availableStaff: availableStaff,
                // Vehicle allocation information
                vehicleLimit: vehicleLimit,
                currentVehiclesAllocated: currentVehiclesAllocated,
                availableVehicles: availableVehicles
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Get department allocation info error:', error);

        const errorResponse = {
            error: {
                code: 'GET_DEPARTMENT_ALLOCATION_INFO_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
