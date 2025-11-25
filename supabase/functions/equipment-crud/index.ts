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
            // Get all equipment with dropdown names
            const equipmentResponse = await fetch(`${supabaseUrl}/rest/v1/equipment?select=*&order=created_at.desc`, {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                }
            });

            if (!equipmentResponse.ok) {
                throw new Error('Failed to fetch equipment');
            }

            const equipment = await equipmentResponse.json();

            // Fetch all dropdowns
            const [equipmentTypesRes, modelMakesRes, manufacturersRes, locationDepartmentsRes] = await Promise.all([
                fetch(`${supabaseUrl}/rest/v1/equipment_types?select=*&eq.active.true&order=name`, {
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey
                    }
                }),
                fetch(`${supabaseUrl}/rest/v1/model_makes?select=*&eq.active.true&order=name`, {
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey
                    }
                }),
                fetch(`${supabaseUrl}/rest/v1/manufacturers?select=*&eq.active.true&order=name`, {
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey
                    }
                }),
                fetch(`${supabaseUrl}/rest/v1/location_departments?select=*&eq.active.true&order=name`, {
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey
                    }
                })
            ]);

            const equipmentTypes = await equipmentTypesRes.json();
            const modelMakes = await modelMakesRes.json();
            const manufacturers = await manufacturersRes.json();
            const locationDepartments = await locationDepartmentsRes.json();

            // Map database schema to frontend schema and enhance with dropdown names
            const enhancedEquipment = equipment.map(item => {
                const equipmentType = item.category || item.type || '';
                const modelMake = item.model || '';
                const conditionStatus = item.condition || '';
                const locationDepartment = item.location || '';
                
                const equipmentTypeName = equipmentTypes.find(et => et.name === equipmentType)?.name || equipmentType;
                const modelMakeName = modelMakes.find(mm => mm.name === modelMake)?.name || modelMake;
                const manufacturerName = manufacturers.find(m => m.name === item.manufacturer)?.name || item.manufacturer || '';
                const locationDepartmentName = locationDepartments.find(ld => ld.name === locationDepartment)?.name || locationDepartment;
                
                return {
                    id: item.id,
                    equipment_name: item.name || '',
                    equipment_type: equipmentType,
                    model_make: modelMake,
                    serial_number: item.serial_number || '',
                    manufacturer: item.manufacturer || '',
                    purchase_date: item.purchase_date || '',
                    warranty_expiry_date: item.warranty_expiry || '',
                    condition_status: conditionStatus,
                    location_department: locationDepartment,
                    equipment_type_name: equipmentTypeName,
                    model_make_name: modelMakeName,
                    manufacturer_name: manufacturerName,
                    location_department_name: locationDepartmentName,
                    created_at: item.created_at,
                    updated_at: item.updated_at
                };
            });

            response = { data: enhancedEquipment };
        } else if (method === 'POST') {
            const body = await req.json();
            const { action, equipmentData, equipmentId } = body;

            if (action === 'create') {
                // Validate required field
                if (!equipmentData.equipment_name) {
                    throw new Error('Equipment Name is required');
                }

                // Check for unique serial number if provided
                if (equipmentData.serial_number) {
                    const checkResponse = await fetch(`${supabaseUrl}/rest/v1/equipment?select=id&serial_number=eq.${encodeURIComponent(equipmentData.serial_number)}`, {
                        headers: {
                            'Authorization': `Bearer ${serviceRoleKey}`,
                            'apikey': serviceRoleKey
                        }
                    });
                    const existing = await checkResponse.json();
                    if (existing.length > 0) {
                        throw new Error(`Serial Number '${equipmentData.serial_number}' already exists`);
                    }
                }

                // Map frontend schema to database schema
                const dbData = {
                    name: equipmentData.equipment_name,
                    category: equipmentData.equipment_type || null,
                    type: equipmentData.equipment_type || null,
                    model: equipmentData.model_make || null,
                    serial_number: equipmentData.serial_number || null,
                    manufacturer: equipmentData.manufacturer || null,
                    purchase_date: equipmentData.purchase_date || null,
                    warranty_expiry: equipmentData.warranty_expiry_date || null,
                    condition: equipmentData.condition_status || null,
                    location: equipmentData.location_department || null
                };

                const createResponse = await fetch(`${supabaseUrl}/rest/v1/equipment`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify(dbData)
                });

                if (!createResponse.ok) {
                    const errorText = await createResponse.text();
                    throw new Error(`Failed to create equipment: ${errorText}`);
                }

                const createdEquipment = await createResponse.json();
                // Map back to frontend schema
                const mappedResult = {
                    id: createdEquipment[0].id,
                    equipment_name: createdEquipment[0].name,
                    equipment_type: createdEquipment[0].category || createdEquipment[0].type,
                    model_make: createdEquipment[0].model,
                    serial_number: createdEquipment[0].serial_number,
                    manufacturer: createdEquipment[0].manufacturer,
                    purchase_date: createdEquipment[0].purchase_date,
                    warranty_expiry_date: createdEquipment[0].warranty_expiry,
                    condition_status: createdEquipment[0].condition,
                    location_department: createdEquipment[0].location,
                    created_at: createdEquipment[0].created_at,
                    updated_at: createdEquipment[0].updated_at
                };
                response = { data: mappedResult };
            } else if (action === 'update') {
                if (!equipmentId) {
                    throw new Error('Equipment ID is required for update');
                }

                // Validate required field
                if (!equipmentData.equipment_name) {
                    throw new Error('Equipment Name is required');
                }

                // Check for unique serial number if provided (excluding current equipment)
                if (equipmentData.serial_number) {
                    const checkResponse = await fetch(`${supabaseUrl}/rest/v1/equipment?select=id&serial_number=eq.${encodeURIComponent(equipmentData.serial_number)}&id=neq.${equipmentId}`, {
                        headers: {
                            'Authorization': `Bearer ${serviceRoleKey}`,
                            'apikey': serviceRoleKey
                        }
                    });
                    const existing = await checkResponse.json();
                    if (existing.length > 0) {
                        throw new Error(`Serial Number '${equipmentData.serial_number}' already exists`);
                    }
                }

                // Map frontend schema to database schema
                const dbData = {
                    name: equipmentData.equipment_name,
                    category: equipmentData.equipment_type || null,
                    type: equipmentData.equipment_type || null,
                    model: equipmentData.model_make || null,
                    serial_number: equipmentData.serial_number || null,
                    manufacturer: equipmentData.manufacturer || null,
                    purchase_date: equipmentData.purchase_date || null,
                    warranty_expiry: equipmentData.warranty_expiry_date || null,
                    condition: equipmentData.condition_status || null,
                    location: equipmentData.location_department || null
                };

                const updateResponse = await fetch(`${supabaseUrl}/rest/v1/equipment?id=eq.${equipmentId}`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify(dbData)
                });

                if (!updateResponse.ok) {
                    const errorText = await updateResponse.text();
                    throw new Error(`Failed to update equipment: ${errorText}`);
                }

                const updatedEquipment = await updateResponse.json();
                // Map back to frontend schema
                const mappedResult = {
                    id: updatedEquipment[0].id,
                    equipment_name: updatedEquipment[0].name,
                    equipment_type: updatedEquipment[0].category || updatedEquipment[0].type,
                    model_make: updatedEquipment[0].model,
                    serial_number: updatedEquipment[0].serial_number,
                    manufacturer: updatedEquipment[0].manufacturer,
                    purchase_date: updatedEquipment[0].purchase_date,
                    warranty_expiry_date: updatedEquipment[0].warranty_expiry,
                    condition_status: updatedEquipment[0].condition,
                    location_department: updatedEquipment[0].location,
                    created_at: updatedEquipment[0].created_at,
                    updated_at: updatedEquipment[0].updated_at
                };
                response = { data: mappedResult };
            } else if (action === 'delete') {
                if (!equipmentId) {
                    throw new Error('Equipment ID is required for delete');
                }

                const deleteResponse = await fetch(`${supabaseUrl}/rest/v1/equipment?id=eq.${equipmentId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey
                    }
                });

                if (!deleteResponse.ok) {
                    const errorText = await deleteResponse.text();
                    throw new Error(`Failed to delete equipment: ${errorText}`);
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
        console.error('Equipment CRUD error:', error);

        const errorResponse = {
            error: {
                code: 'EQUIPMENT_CRUD_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
