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

        if (req.method === 'GET') {
            // Get all dropdown options for all tables
            console.log('Fetching all dropdown options...');
            
            // Fetch positions
            const positionsResponse = await fetch(`${supabaseUrl}/rest/v1/positions?select=*&order=name.asc`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                }
            });

            // Fetch ranks
            const ranksResponse = await fetch(`${supabaseUrl}/rest/v1/ranks?select=*&order=name.asc`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                }
            });

            // Fetch emergency contact relationships
            const relationshipsResponse = await fetch(`${supabaseUrl}/rest/v1/emergency_contact_relationships?select=*&order=name.asc`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                }
            });

            // Fetch employment status
            const employmentStatusResponse = await fetch(`${supabaseUrl}/rest/v1/employment_status?select=*&order=name.asc`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                }
            });

            // Fetch fire stations
            const fireStationsResponse = await fetch(`${supabaseUrl}/rest/v1/fire_stations_vfh?select=*&order=fire_station_name.asc`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                }
            });

            // Fetch vehicle dropdown options
            const callSignsResponse = await fetch(`${supabaseUrl}/rest/v1/call_signs?select=*&order=name.asc`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                }
            });

            const vehicleTypesResponse = await fetch(`${supabaseUrl}/rest/v1/vehicle_types?select=*&order=name.asc`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                }
            });

            const vehicleMakesResponse = await fetch(`${supabaseUrl}/rest/v1/vehicle_makes?select=*&order=name.asc`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                }
            });

            // Fetch equipment dropdown options
            const equipmentTypesResponse = await fetch(`${supabaseUrl}/rest/v1/equipment_types?select=*&order=name.asc`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                }
            });

            const modelMakesResponse = await fetch(`${supabaseUrl}/rest/v1/model_makes?select=*&order=name.asc`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                }
            });

            const manufacturersResponse = await fetch(`${supabaseUrl}/rest/v1/manufacturers?select=*&order=name.asc`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                }
            });

            const locationDepartmentsResponse = await fetch(`${supabaseUrl}/rest/v1/location_departments?select=*&order=name.asc`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                }
            });

            // Fetch department dropdown options
            const departmentTypesResponse = await fetch(`${supabaseUrl}/rest/v1/department_types?select=*&order=name.asc`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                }
            });

            const countriesResponse = await fetch(`${supabaseUrl}/rest/v1/countries?select=*&order=name.asc`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                }
            });

            const citiesResponse = await fetch(`${supabaseUrl}/rest/v1/cities?select=*&order=name.asc`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                }
            });

            const departmentStatusResponse = await fetch(`${supabaseUrl}/rest/v1/department_status?select=*&order=name.asc`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                }
            });

            // Fetch operational shifts
            const operationalShiftsResponse = await fetch(`${supabaseUrl}/rest/v1/02_admin_register_fd2_operational_shifts?select=*&order=shift_name.asc`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                }
            });

            // Fetch incident types
            const incidentTypesResponse = await fetch(`${supabaseUrl}/rest/v1/incident_types?select=*&order=display_name.asc`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Fire stations response status:', fireStationsResponse.status);
            console.log('Fire stations response ok:', fireStationsResponse.ok);

            const positions = positionsResponse.ok ? await positionsResponse.json() : [];
            let ranks = ranksResponse.ok ? await ranksResponse.json() : [];
            // Transform ranks to match frontend expectations
            ranks = ranks.map((rank: any) => ({
                ...rank,
                rank_name: rank.name,
                rank_level: rank.level?.toString(),
                rank_description: rank.description,
                active: rank.is_active
            }));
            const relationships = relationshipsResponse.ok ? await relationshipsResponse.json() : [];
            const employmentStatus = employmentStatusResponse.ok ? await employmentStatusResponse.json() : [];
            const fireStations = fireStationsResponse.ok ? await fireStationsResponse.json() : [];
            const callSigns = callSignsResponse.ok ? await callSignsResponse.json() : [];
            const vehicleTypes = vehicleTypesResponse.ok ? await vehicleTypesResponse.json() : [];
            const vehicleMakes = vehicleMakesResponse.ok ? await vehicleMakesResponse.json() : [];
            const equipmentTypes = equipmentTypesResponse.ok ? await equipmentTypesResponse.json() : [];
            const modelMakes = modelMakesResponse.ok ? await modelMakesResponse.json() : [];
            const manufacturers = manufacturersResponse.ok ? await manufacturersResponse.json() : [];
            const locationDepartments = locationDepartmentsResponse.ok ? await locationDepartmentsResponse.json() : [];
            const departmentTypes = departmentTypesResponse.ok ? await departmentTypesResponse.json() : [];
            const countries = countriesResponse.ok ? await countriesResponse.json() : [];
            const cities = citiesResponse.ok ? await citiesResponse.json() : [];
            const departmentStatus = departmentStatusResponse.ok ? await departmentStatusResponse.json() : [];
            const operationalShifts = operationalShiftsResponse.ok ? await operationalShiftsResponse.json() : [];
            const incidentTypes = incidentTypesResponse.ok ? await incidentTypesResponse.json() : [];

            console.log('Dropdown options fetched successfully');
            console.log('Positions count:', positions.length);
            console.log('Ranks count:', ranks.length);
            console.log('Relationships count:', relationships.length);
            console.log('Employment status count:', employmentStatus.length);
            console.log('Fire stations count:', fireStations.length);
            console.log('Call signs count:', callSigns.length);
            console.log('Vehicle types count:', vehicleTypes.length);
            console.log('Vehicle makes count:', vehicleMakes.length);
            console.log('Equipment types count:', equipmentTypes.length);
            console.log('Model makes count:', modelMakes.length);
            console.log('Manufacturers count:', manufacturers.length);
            console.log('Location departments count:', locationDepartments.length);
            console.log('Department types count:', departmentTypes.length);
            console.log('Countries count:', countries.length);
            console.log('Cities count:', cities.length);
            console.log('Department status count:', departmentStatus.length);
            console.log('Operational shifts count:', operationalShifts.length);

            return new Response(JSON.stringify({
                data: {
                    positions: positions || [],
                    ranks: ranks || [],
                    emergencyContactRelationships: relationships || [],
                    employmentStatus: employmentStatus || [],
                    fireStations: fireStations || [],
                    callSigns: callSigns || [],
                    vehicleTypes: vehicleTypes || [],
                    vehicleMakes: vehicleMakes || [],
                    equipmentTypes: equipmentTypes || [],
                    modelMakes: modelMakes || [],
                    manufacturers: manufacturers || [],
                    locationDepartments: locationDepartments || [],
                    departmentTypes: departmentTypes || [],
                    countries: countries || [],
                    cities: cities || [],
                    departmentStatus: departmentStatus || [],
                    operationalShifts: operationalShifts || [],
                    incidentTypes: incidentTypes || []
                }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });

        } else if (req.method === 'POST') {
            // Create new dropdown option
            const requestData = await req.json();
            const { type: table, data } = requestData;

            if (!table || !data) {
                throw new Error('Table name and data are required');
            }

            // Validate table name and map frontend table names to actual database table names
            const tableMapping = {
                'positions': 'positions',
                'ranks': 'ranks',
                'emergency_contact_relationships': 'emergency_contact_relationships',
                'employment_status': 'employment_status',
                'call_signs': 'call_signs',
                'vehicle_types': 'vehicle_types',
                'vehicle_makes': 'vehicle_makes',
                'equipment_types': 'equipment_types',
                'model_makes': 'model_makes',
                'manufacturers': 'manufacturers',
                'location_departments': 'location_departments',
                'department_types': 'department_types',
                'countries': 'countries',
                'cities': 'cities',
                'department_status': 'department_status',
                'operational_shifts': '02_admin_register_fd2_operational_shifts',
                'incident_types': 'incident_types'
            };
            
            const dbTable = tableMapping[table];
            if (!dbTable) {
                throw new Error('Invalid table name');
            }

            console.log(`Creating new ${table} option:`, data);

            const response = await fetch(`${supabaseUrl}/rest/v1/${dbTable}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Database insert failed:', errorText);
                throw new Error(`Database insert failed: ${errorText}`);
            }

            const newRecord = await response.json();
            console.log(`${table} option created successfully:`, newRecord[0]);

            return new Response(JSON.stringify({
                data: {
                    success: true,
                    message: 'Option created successfully',
                    record: newRecord[0]
                }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });

        } else if (req.method === 'PUT') {
            // Update dropdown option
            const requestData = await req.json();
            const { type: table, id, data } = requestData;

            if (!table || !id || !data) {
                throw new Error('Table name, ID, and data are required');
            }

            // Validate table name and map frontend table names to actual database table names
            const tableMapping = {
                'positions': 'positions',
                'ranks': 'ranks',
                'emergency_contact_relationships': 'emergency_contact_relationships',
                'employment_status': 'employment_status',
                'call_signs': 'call_signs',
                'vehicle_types': 'vehicle_types',
                'vehicle_makes': 'vehicle_makes',
                'equipment_types': 'equipment_types',
                'model_makes': 'model_makes',
                'manufacturers': 'manufacturers',
                'location_departments': 'location_departments',
                'department_types': 'department_types',
                'countries': 'countries',
                'cities': 'cities',
                'department_status': 'department_status',
                'operational_shifts': 'operational_shifts',
                'incident_types': 'incident_types'
            };
            
            const dbTable = tableMapping[table];
            if (!dbTable) {
                throw new Error('Invalid table name');
            }

            console.log(`Updating ${table} option with ID ${id}:`, data);

            // Add updated_at timestamp
            const updateData = {
                ...data,
                updated_at: new Date().toISOString()
            };

            const response = await fetch(`${supabaseUrl}/rest/v1/${dbTable}?id=eq.${id}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify(updateData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Database update failed:', errorText);
                throw new Error(`Database update failed: ${errorText}`);
            }

            const updatedRecord = await response.json();
            console.log(`${table} option updated successfully:`, updatedRecord[0]);

            return new Response(JSON.stringify({
                data: {
                    success: true,
                    message: 'Option updated successfully',
                    record: updatedRecord[0]
                }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });

        } else if (req.method === 'DELETE') {
            // Delete dropdown option
            const requestData = await req.json();
            const { type: table, id } = requestData;

            if (!table || !id) {
                throw new Error('Table name and ID are required');
            }

            // Validate table name and map frontend table names to actual database table names
            const tableMapping = {
                'positions': 'positions',
                'ranks': 'ranks',
                'emergency_contact_relationships': 'emergency_contact_relationships',
                'employment_status': 'employment_status',
                'call_signs': 'call_signs',
                'vehicle_types': 'vehicle_types',
                'vehicle_makes': 'vehicle_makes',
                'equipment_types': 'equipment_types',
                'model_makes': 'model_makes',
                'manufacturers': 'manufacturers',
                'location_departments': 'location_departments',
                'department_types': 'department_types',
                'countries': 'countries',
                'cities': 'cities',
                'department_status': 'department_status',
                'operational_shifts': 'operational_shifts',
                'incident_types': 'incident_types'
            };
            
            const dbTable = tableMapping[table];
            if (!dbTable) {
                throw new Error('Invalid table name');
            }

            console.log(`Deleting ${table} option with ID ${id}`);

            // Check if option is in use before deleting
            let inUseCount = 0;
            
            if (table === 'positions') {
                const usageResponse = await fetch(`${supabaseUrl}/rest/v1/staff_vfh?position_id=eq.${id}&select=id`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json'
                    }
                });
                if (usageResponse.ok) {
                    const usage = await usageResponse.json();
                    inUseCount = usage.length;
                }
            } else if (table === 'ranks') {
                const usageResponse = await fetch(`${supabaseUrl}/rest/v1/staff_vfh?rank_id=eq.${id}&select=id`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json'
                    }
                });
                if (usageResponse.ok) {
                    const usage = await usageResponse.json();
                    inUseCount = usage.length;
                }
            } else if (table === 'emergency_contact_relationships') {
                const usageResponse = await fetch(`${supabaseUrl}/rest/v1/staff_vfh?emergency_contact_relationship_id=eq.${id}&select=id`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json'
                    }
                });
                if (usageResponse.ok) {
                    const usage = await usageResponse.json();
                    inUseCount = usage.length;
                }
            } else if (table === 'call_signs') {
                // Get the call sign name to check against vehicles
                const callSignResponse = await fetch(`${supabaseUrl}/rest/v1/call_signs?id=eq.${id}&select=name`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json'
                    }
                });
                if (callSignResponse.ok) {
                    const callSignData = await callSignResponse.json();
                    if (callSignData.length > 0) {
                        const callSignName = callSignData[0].name;
                        const usageResponse = await fetch(`${supabaseUrl}/rest/v1/vehicles?veh_call_sign=eq.${encodeURIComponent(callSignName)}&select=id`, {
                            method: 'GET',
                            headers: {
                                'Authorization': `Bearer ${serviceRoleKey}`,
                                'apikey': serviceRoleKey,
                                'Content-Type': 'application/json'
                            }
                        });
                        if (usageResponse.ok) {
                            const usage = await usageResponse.json();
                            inUseCount = usage.length;
                        }
                    }
                }
            } else if (table === 'vehicle_types') {
                // Get the vehicle type name to check against vehicles
                const vehicleTypeResponse = await fetch(`${supabaseUrl}/rest/v1/vehicle_types?id=eq.${id}&select=name`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json'
                    }
                });
                if (vehicleTypeResponse.ok) {
                    const vehicleTypeData = await vehicleTypeResponse.json();
                    if (vehicleTypeData.length > 0) {
                        const vehicleTypeName = vehicleTypeData[0].name;
                        const usageResponse = await fetch(`${supabaseUrl}/rest/v1/vehicles?veh_type=eq.${encodeURIComponent(vehicleTypeName)}&select=id`, {
                            method: 'GET',
                            headers: {
                                'Authorization': `Bearer ${serviceRoleKey}`,
                                'apikey': serviceRoleKey,
                                'Content-Type': 'application/json'
                            }
                        });
                        if (usageResponse.ok) {
                            const usage = await usageResponse.json();
                            inUseCount = usage.length;
                        }
                    }
                }
            } else if (table === 'vehicle_makes') {
                // Get the vehicle make name to check against vehicles
                const vehicleMakeResponse = await fetch(`${supabaseUrl}/rest/v1/vehicle_makes?id=eq.${id}&select=name`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json'
                    }
                });
                if (vehicleMakeResponse.ok) {
                    const vehicleMakeData = await vehicleMakeResponse.json();
                    if (vehicleMakeData.length > 0) {
                        const vehicleMakeName = vehicleMakeData[0].name;
                        const usageResponse = await fetch(`${supabaseUrl}/rest/v1/vehicles?veh_make=eq.${encodeURIComponent(vehicleMakeName)}&select=id`, {
                            method: 'GET',
                            headers: {
                                'Authorization': `Bearer ${serviceRoleKey}`,
                                'apikey': serviceRoleKey,
                                'Content-Type': 'application/json'
                            }
                        });
                        if (usageResponse.ok) {
                            const usage = await usageResponse.json();
                            inUseCount = usage.length;
                        }
                    }
                }
            } else if (table === 'incident_types') {
                // Get the incident type name to check against edob entries
                const incidentTypeResponse = await fetch(`${supabaseUrl}/rest/v1/incident_types?id=eq.${id}&select=name`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json'
                    }
                });
                if (incidentTypeResponse.ok) {
                    const incidentTypeData = await incidentTypeResponse.json();
                    if (incidentTypeData.length > 0) {
                        const incidentTypeName = incidentTypeData[0].name;
                        const usageResponse = await fetch(`${supabaseUrl}/rest/v1/edob_entries?incident_type=eq.${encodeURIComponent(incidentTypeName)}&select=id`, {
                            method: 'GET',
                            headers: {
                                'Authorization': `Bearer ${serviceRoleKey}`,
                                'apikey': serviceRoleKey,
                                'Content-Type': 'application/json'
                            }
                        });
                        if (usageResponse.ok) {
                            const usage = await usageResponse.json();
                            inUseCount = usage.length;
                        }
                    }
                }
            }

            if (inUseCount > 0) {
                const recordType = table.includes('vehicle') || table.includes('call_sign') ? 'vehicle(s)' : 
                                  table.includes('incident') ? 'EDOB entry(ies)' : 'staff member(s)';
                throw new Error(`Cannot delete this option as it is currently being used by ${inUseCount} ${recordType}. Please update those records first.`);
            }

            const response = await fetch(`${supabaseUrl}/rest/v1/${dbTable}?id=eq.${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Database delete failed:', errorText);
                throw new Error(`Database delete failed: ${errorText}`);
            }

            console.log(`${table} option deleted successfully`);

            return new Response(JSON.stringify({
                data: {
                    success: true,
                    message: 'Option deleted successfully'
                }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });

        } else {
            throw new Error('Method not allowed');
        }

    } catch (error) {
        console.error('Dropdown options CRUD error:', error);

        const errorResponse = {
            error: {
                code: 'DROPDOWN_OPTIONS_CRUD_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
