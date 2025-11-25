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

        const url = new URL(req.url);
        const method = req.method;
        
        let response;

        if (method === 'GET') {
            // Get all vehicles and enrich with dropdown names
            const vehiclesResponse = await fetch(`${supabaseUrl}/rest/v1/vehicles?select=*&order=id.asc`, {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                }
            });

            let vehicles: any[] = [];
            if (!vehiclesResponse.ok) {
                // Gracefully handle missing table by returning empty list
                if (vehiclesResponse.status === 404) {
                    vehicles = [];
                } else {
                    const errText = await vehiclesResponse.text();
                    throw new Error(`Failed to fetch vehicles: ${vehiclesResponse.status} ${errText}`);
                }
            } else {
                vehicles = await vehiclesResponse.json();
            }

            // Fetch all dropdowns
            const [callSignsRes, vehicleTypesRes, vehicleMakesRes] = await Promise.all([
                fetch(`${supabaseUrl}/rest/v1/call_signs?select=*&active=eq.true&order=name`, {
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey
                    }
                }),
                fetch(`${supabaseUrl}/rest/v1/vehicle_types?select=*&active=eq.true&order=name`, {
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey
                    }
                }),
                fetch(`${supabaseUrl}/rest/v1/vehicle_makes?select=*&active=eq.true&order=name`, {
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey
                    }
                })
            ]);

            const callSigns = await callSignsRes.json();
            const vehicleTypes = await vehicleTypesRes.json();
            const vehicleMakes = await vehicleMakesRes.json();

            // Enhance vehicles with dropdown names and map to UI schema
            const enhancedVehicles = vehicles.map((vehicle: any) => {
                const callSignName = callSigns.find(cs => cs.id === vehicle.call_sign_id)?.name || '';
                const vehicleTypeName = vehicleTypes.find(vt => vt.id === vehicle.vehicle_type_id)?.name || '';
                const vehicleMakeName = vehicleMakes.find(vm => vm.id === vehicle.vehicle_make_id)?.name || '';

                const currentYear = new Date().getFullYear();
                const model_year = typeof vehicle?.model_year === 'number' ? vehicle.model_year : (vehicle?.model_year ? parseInt(vehicle.model_year) : null);
                const vehicle_age = vehicle?.vehicle_age ?? (model_year ? (currentYear - model_year) : null);

                return {
                    id: String(vehicle.id),
                    veh_call_sign: callSignName,
                    veh_type: vehicleTypeName,
                    veh_make: vehicleMakeName,
                    vehicle_model: vehicle.vehicle_model || '',
                    model_year,
                    vehicle_age,
                    veh_plate_no: vehicle.registration_plate_number || '',
                    veh_mms_no: vehicle.mms_number || '',
                    veh_gate_pass_no: vehicle.gate_pass_number || '',
                    veh_gate_pass_expiry_date: vehicle.gate_pass_expiry_date || '',
                    vehicle_picture_url: vehicle.vehicle_picture_url || '',
                    call_sign_name: callSignName,
                    vehicle_type_name: vehicleTypeName,
                    vehicle_make_name: vehicleMakeName,
                    created_at: vehicle.created_at,
                    updated_at: vehicle.updated_at
                };
            });

            response = { data: enhancedVehicles };
        } else if (method === 'POST') {
            const body = await req.json();
            const { action, vehicleData, vehicleId } = body;

            if (action === 'create') {
                // Validate required field
                if (!vehicleData.veh_call_sign) {
                    throw new Error('Call Sign is required');
                }

                // Check for unique fields if provided
                const uniqueChecks = [];
                if (vehicleData.veh_plate_no) {
                    uniqueChecks.push({
                        field: 'registration_plate_number',
                        value: vehicleData.veh_plate_no,
                        name: 'Registration/Plate Number'
                    });
                }
                if (vehicleData.veh_mms_no) {
                    uniqueChecks.push({
                        field: 'mms_number',
                        value: vehicleData.veh_mms_no,
                        name: 'MMS Number'
                    });
                }
                if (vehicleData.veh_gate_pass_no) {
                    uniqueChecks.push({
                        field: 'gate_pass_number',
                        value: vehicleData.veh_gate_pass_no,
                        name: 'Gate Pass Number'
                    });
                }

                // Check uniqueness
                for (const check of uniqueChecks) {
                    const checkResponse = await fetch(`${supabaseUrl}/rest/v1/vehicles?select=id&${check.field}=eq.${encodeURIComponent(check.value)}`, {
                        headers: {
                            'Authorization': `Bearer ${serviceRoleKey}`,
                            'apikey': serviceRoleKey
                        }
                    });
                    const existing = await checkResponse.json();
                    if (existing.length > 0) {
                        throw new Error(`${check.name} '${check.value}' already exists`);
                    }
                }

                // Normalize model_year and calculate vehicle age
                const rawYear = vehicleData.model_year ?? null;
                const normalizedYear = rawYear ? parseInt(rawYear) : null;
                if (normalizedYear) {
                    const currentYear = new Date().getFullYear();
                    vehicleData.vehicle_age = currentYear - normalizedYear;
                }
                vehicleData.model_year = normalizedYear;

                // Map names to IDs
                const [callSignsRes, vehicleTypesRes, vehicleMakesRes] = await Promise.all([
                    fetch(`${supabaseUrl}/rest/v1/call_signs?select=*&active=eq.true&order=name`, {
                        headers: { 'Authorization': `Bearer ${serviceRoleKey}`, 'apikey': serviceRoleKey }
                    }),
                    fetch(`${supabaseUrl}/rest/v1/vehicle_types?select=*&active=eq.true&order=name`, {
                        headers: { 'Authorization': `Bearer ${serviceRoleKey}`, 'apikey': serviceRoleKey }
                    }),
                    fetch(`${supabaseUrl}/rest/v1/vehicle_makes?select=*&active=eq.true&order=name`, {
                        headers: { 'Authorization': `Bearer ${serviceRoleKey}`, 'apikey': serviceRoleKey }
                    })
                ]);
                const callSigns = await callSignsRes.json();
                const vehicleTypes = await vehicleTypesRes.json();
                const vehicleMakes = await vehicleMakesRes.json();
                const findIdByName = (arr: any[], name: string) => {
                    const target = (name || '').trim();
                    const match = (arr || []).find(x => (x?.name || '').trim() === target);
                    return match?.id ?? null;
                };
                const call_sign_id = findIdByName(callSigns, vehicleData.veh_call_sign);
                const vehicle_type_id = vehicleData.veh_type ? findIdByName(vehicleTypes, vehicleData.veh_type) : null;
                const vehicle_make_id = vehicleData.veh_make ? findIdByName(vehicleMakes, vehicleData.veh_make) : null;

                if (!call_sign_id) {
                    throw new Error(`Call Sign '${vehicleData.veh_call_sign}' not found`);
                }

                const dbPayload: any = {
                    call_sign_id,
                    vehicle_type_id,
                    vehicle_make_id,
                    vehicle_model: vehicleData.vehicle_model ?? null,
                    model_year: vehicleData.model_year ?? null,
                    vehicle_age: vehicleData.vehicle_age ?? null,
                    registration_plate_number: vehicleData.veh_plate_no ?? null,
                    mms_number: vehicleData.veh_mms_no ?? null,
                    gate_pass_number: vehicleData.veh_gate_pass_no ?? null,
                    gate_pass_expiry_date: vehicleData.veh_gate_pass_expiry_date ?? null,
                    vehicle_picture_url: vehicleData.vehicle_picture_url ?? null
                };

                // Get user from auth header
                const authHeader = req.headers.get('authorization');
                let userId = null;
                if (authHeader) {
                    try {
                        const token = authHeader.replace('Bearer ', '');
                        const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'apikey': serviceRoleKey
                            }
                        });
                        if (userResponse.ok) {
                            const userData = await userResponse.json();
                            userId = userData.id;
                        }
                    } catch (error) {
                        console.log('Could not get user from token:', error.message);
                    }
                }

                // Add audit fields
                dbPayload.created_by = userId;
                dbPayload.updated_by = userId;

                const createResponse = await fetch(`${supabaseUrl}/rest/v1/vehicles`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify(dbPayload)
                });

                if (!createResponse.ok) {
                    const errorText = await createResponse.text();
                    throw new Error(`Failed to create vehicle: ${errorText}`);
                }

                const createdVehicle = await createResponse.json();
                response = { data: createdVehicle[0] };
            } else if (action === 'update') {
                if (!vehicleId) {
                    throw new Error('Vehicle ID is required for update');
                }

                // Validate required field
                if (!vehicleData.veh_call_sign) {
                    throw new Error('Call Sign is required');
                }

                // Check for unique fields if provided (excluding current vehicle)
                const uniqueChecks = [];
                if (vehicleData.veh_plate_no) {
                    uniqueChecks.push({
                        field: 'registration_plate_number',
                        value: vehicleData.veh_plate_no,
                        name: 'Registration/Plate Number'
                    });
                }
                if (vehicleData.veh_mms_no) {
                    uniqueChecks.push({
                        field: 'mms_number',
                        value: vehicleData.veh_mms_no,
                        name: 'MMS Number'
                    });
                }
                if (vehicleData.veh_gate_pass_no) {
                    uniqueChecks.push({
                        field: 'gate_pass_number',
                        value: vehicleData.veh_gate_pass_no,
                        name: 'Gate Pass Number'
                    });
                }

                // Check uniqueness (excluding current vehicle)
                for (const check of uniqueChecks) {
                    const checkResponse = await fetch(`${supabaseUrl}/rest/v1/vehicles?select=id&${check.field}=eq.${encodeURIComponent(check.value)}&id=not.eq.${encodeURIComponent(vehicleId)}`, {
                        headers: {
                            'Authorization': `Bearer ${serviceRoleKey}`,
                            'apikey': serviceRoleKey
                        }
                    });
                    const existing = await checkResponse.json();
                    if (existing.length > 0) {
                        throw new Error(`${check.name} '${check.value}' already exists`);
                    }
                }

                // Normalize model_year and calculate vehicle age
                const rawYearUpd = vehicleData.model_year ?? null;
                const normalizedYearUpd = rawYearUpd ? parseInt(rawYearUpd) : null;
                if (normalizedYearUpd) {
                    const currentYear = new Date().getFullYear();
                    vehicleData.vehicle_age = currentYear - normalizedYearUpd;
                }
                vehicleData.model_year = normalizedYearUpd;

                // Map names to IDs
                const [callSignsResUpd, vehicleTypesResUpd, vehicleMakesResUpd] = await Promise.all([
                    fetch(`${supabaseUrl}/rest/v1/call_signs?select=*&active=eq.true&order=name`, {
                        headers: { 'Authorization': `Bearer ${serviceRoleKey}`, 'apikey': serviceRoleKey }
                    }),
                    fetch(`${supabaseUrl}/rest/v1/vehicle_types?select=*&active=eq.true&order=name`, {
                        headers: { 'Authorization': `Bearer ${serviceRoleKey}`, 'apikey': serviceRoleKey }
                    }),
                    fetch(`${supabaseUrl}/rest/v1/vehicle_makes?select=*&active=eq.true&order=name`, {
                        headers: { 'Authorization': `Bearer ${serviceRoleKey}`, 'apikey': serviceRoleKey }
                    })
                ]);
                const callSignsUpd = await callSignsResUpd.json();
                const vehicleTypesUpd = await vehicleTypesResUpd.json();
                const vehicleMakesUpd = await vehicleMakesResUpd.json();
                const findIdByNameUpd = (arr: any[], name: string) => {
                    const target = (name || '').trim();
                    const match = (arr || []).find(x => (x?.name || '').trim() === target);
                    return match?.id ?? null;
                };
                const call_sign_id_upd = findIdByNameUpd(callSignsUpd, vehicleData.veh_call_sign);
                const vehicle_type_id_upd = vehicleData.veh_type ? findIdByNameUpd(vehicleTypesUpd, vehicleData.veh_type) : null;
                const vehicle_make_id_upd = vehicleData.veh_make ? findIdByNameUpd(vehicleMakesUpd, vehicleData.veh_make) : null;

                if (!call_sign_id_upd) {
                    throw new Error(`Call Sign '${vehicleData.veh_call_sign}' not found`);
                }

                const dbPayloadUpd: any = {
                    call_sign_id: call_sign_id_upd,
                    vehicle_type_id: vehicle_type_id_upd,
                    vehicle_make_id: vehicle_make_id_upd,
                    vehicle_model: vehicleData.vehicle_model ?? null,
                    model_year: vehicleData.model_year ?? null,
                    vehicle_age: vehicleData.vehicle_age ?? null,
                    registration_plate_number: vehicleData.veh_plate_no ?? null,
                    mms_number: vehicleData.veh_mms_no ?? null,
                    gate_pass_number: vehicleData.veh_gate_pass_no ?? null,
                    gate_pass_expiry_date: vehicleData.veh_gate_pass_expiry_date ?? null,
                    vehicle_picture_url: vehicleData.vehicle_picture_url ?? null
                };

                // Get user from auth header
                const authHeader = req.headers.get('authorization');
                let userId = null;
                if (authHeader) {
                    try {
                        const token = authHeader.replace('Bearer ', '');
                        const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'apikey': serviceRoleKey
                            }
                        });
                        if (userResponse.ok) {
                            const userData = await userResponse.json();
                            userId = userData.id;
                        }
                    } catch (error) {
                        console.log('Could not get user from token:', error.message);
                    }
                }

                // Add audit fields
                dbPayloadUpd.updated_by = userId;

                const updateResponse = await fetch(`${supabaseUrl}/rest/v1/vehicles?id=eq.${encodeURIComponent(vehicleId)}`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify(dbPayloadUpd)
                });

                if (!updateResponse.ok) {
                    const errorText = await updateResponse.text();
                    throw new Error(`Failed to update vehicle: ${errorText}`);
                }

                const updatedVehicle = await updateResponse.json();
                response = { data: updatedVehicle[0] };
            } else if (action === 'delete') {
                if (!vehicleId) {
                    throw new Error('Vehicle ID is required for delete');
                }

                const deleteResponse = await fetch(`${supabaseUrl}/rest/v1/vehicles?id=eq.${encodeURIComponent(vehicleId)}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey
                    }
                });

                if (!deleteResponse.ok) {
                    const errorText = await deleteResponse.text();
                    throw new Error(`Failed to delete vehicle: ${errorText}`);
                }

                response = { data: { success: true } };
            } else {
                throw new Error('Invalid action');
            }
        } else {
            throw new Error('Method not allowed');
        }

        return new Response(JSON.stringify(response), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Vehicle CRUD error:', error);

        const message = (error as any)?.message || 'Unknown error';
        // Derive appropriate status for clearer client handling
        let statusCode = 500;
        if (
            message.includes('required') ||
            message.includes('already exists') ||
            message.includes("Call Sign '") ||
            message.startsWith('Failed to create vehicle:') ||
            message.startsWith('Failed to update vehicle:')
        ) {
            statusCode = 400;
        } else if (message.startsWith('Method not allowed')) {
            statusCode = 405;
        } else if (message.includes('Failed to fetch vehicles')) {
            statusCode = 404;
        }

        const errorResponse = {
            error: {
                code: 'VEHICLE_CRUD_FAILED',
                message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: statusCode,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
