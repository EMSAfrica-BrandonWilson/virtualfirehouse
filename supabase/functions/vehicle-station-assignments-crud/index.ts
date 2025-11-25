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
            // Get assignments for a specific date
            const date = url.searchParams.get('date');
            
            if (!date) {
                throw new Error('Date parameter is required');
            }

            // Fetch assignments for the specified date
            const assignmentsResponse = await fetch(`${supabaseUrl}/rest/v1/vehicle_assignments?assignment_date=eq.${date}&order=call_sign.asc`, {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                }
            });

            if (!assignmentsResponse.ok) {
                throw new Error('Failed to fetch assignments');
            }

            const assignments = await assignmentsResponse.json();
            
            response = { data: assignments };
            
        } else if (method === 'POST') {
            const body = await req.json();
            const { action, assignments, date } = body;

            if (action === 'save') {
                if (!date || !assignments) {
                    throw new Error('Date and assignments are required');
                }

                console.log('Save operation started:', { date, assignmentsCount: assignments.length });

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
                            console.log('User authenticated:', userId);
                        } else {
                            console.log('User authentication failed:', userResponse.status);
                        }
                    } catch (error) {
                        console.log('Could not get user from token:', error.message);
                    }
                } else {
                    console.log('No auth header found');
                }

                const results = [];
                
                // Process each assignment
                for (const assignment of assignments) {
                    try {
                        console.log('Processing assignment:', { vehicle_id: assignment.vehicle_id, call_sign: assignment.call_sign });
                        
                        // First, check if assignment already exists for this vehicle and date
                        const existingResponse = await fetch(
                            `${supabaseUrl}/rest/v1/vehicle_assignments?assignment_date=eq.${date}&vehicle_id=eq.${assignment.vehicle_id}&select=*`,
                            {
                                headers: {
                                    'Authorization': `Bearer ${serviceRoleKey}`,
                                    'apikey': serviceRoleKey
                                }
                            }
                        );

                        const existing = await existingResponse.json();
                        console.log('Existing assignment check:', { vehicle_id: assignment.vehicle_id, exists: existing.length > 0 });
                        
                        if (existing.length > 0) {
                            // Update existing assignment
                            const existingAssignment = existing[0];
                            
                            const updateData = {
                                call_sign: assignment.call_sign,
                                vehicle_type: assignment.vehicle_type,
                                vehicle_make: assignment.vehicle_make,
                                vehicle_model: assignment.vehicle_model,
                                status: assignment.status,
                                readiness: assignment.readiness,
                                station_assignment: assignment.station_assignment,
                                crew_members: assignment.crew_members || null,
                                last_check_time: assignment.last_check_time || null,
                                is_workshop: assignment.station_assignment === 'In Workshop',
                                updated_by: userId
                            };

                            console.log('Updating assignment:', { id: existingAssignment.id, updateData });

                            const updateResponse = await fetch(
                                `${supabaseUrl}/rest/v1/vehicle_assignments?id=eq.${existingAssignment.id}`,
                                {
                                    method: 'PATCH',
                                    headers: {
                                        'Authorization': `Bearer ${serviceRoleKey}`,
                                        'apikey': serviceRoleKey,
                                        'Content-Type': 'application/json',
                                        'Prefer': 'return=representation'
                                    },
                                    body: JSON.stringify(updateData)
                                }
                            );

                            if (!updateResponse.ok) {
                                const errorText = await updateResponse.text();
                                console.error('Update failed:', errorText);
                                throw new Error(`Failed to update assignment: ${errorText}`);
                            }

                            const updatedAssignment = await updateResponse.json();
                            console.log('Update response raw:', updatedAssignment);
                            console.log('Update successful, first assignment:', updatedAssignment[0]);
                            console.log('Update response status:', updateResponse.status);
                            console.log('Update response headers:', Object.fromEntries(updateResponse.headers.entries()));
                            
                            if (!updatedAssignment || !updatedAssignment[0]) {
                                console.error('Update response is empty or malformed:', updatedAssignment);
                                throw new Error('Database update operation returned empty response');
                            }
                            
                            results.push({ 
                                action: 'updated', 
                                assignment: updatedAssignment[0],
                                vehicle_id: assignment.vehicle_id 
                            });
                        } else {
                            // Create new assignment
                            const createData = {
                                assignment_date: date,
                                vehicle_id: assignment.vehicle_id,
                                call_sign: assignment.call_sign,
                                vehicle_type: assignment.vehicle_type,
                                vehicle_make: assignment.vehicle_make,
                                vehicle_model: assignment.vehicle_model,
                                status: assignment.status,
                                readiness: assignment.readiness,
                                station_assignment: assignment.station_assignment,
                                crew_members: assignment.crew_members || null,
                                last_check_time: assignment.last_check || null,
                                is_workshop: assignment.station_assignment === 'In Workshop',
                                created_by: userId,
                                updated_by: userId
                            };

                            console.log('Creating assignment:', createData);

                            const createResponse = await fetch(`${supabaseUrl}/rest/v1/vehicle_assignments`, {
                                method: 'POST',
                                headers: {
                                    'Authorization': `Bearer ${serviceRoleKey}`,
                                    'apikey': serviceRoleKey,
                                    'Content-Type': 'application/json',
                                    'Prefer': 'return=representation'
                                },
                                body: JSON.stringify(createData)
                            });

                            if (!createResponse.ok) {
                                const errorText = await createResponse.text();
                                console.error('Create failed:', errorText);
                                throw new Error(`Failed to create assignment: ${errorText}`);
                            }

                            const createdAssignment = await createResponse.json();
                            console.log('Create response raw:', createdAssignment);
                            console.log('Create successful, first assignment:', createdAssignment[0]);
                            console.log('Create response status:', createResponse.status);
                            console.log('Create response headers:', Object.fromEntries(createResponse.headers.entries()));
                            
                            if (!createdAssignment || !createdAssignment[0]) {
                                console.error('Create response is empty or malformed:', createdAssignment);
                                throw new Error('Database create operation returned empty response');
                            }
                            
                            results.push({ 
                                action: 'created', 
                                assignment: createdAssignment[0],
                                vehicle_id: assignment.vehicle_id 
                            });
                        }
                    } catch (assignmentError) {
                        console.error(`Error processing assignment for vehicle ${assignment.vehicle_id}:`, assignmentError);
                        results.push({ 
                            action: 'error', 
                            vehicle_id: assignment.vehicle_id, 
                            error: assignmentError.message 
                        });
                    }
                }

                console.log('Save operation completed:', { 
                    totalProcessed: assignments.length, 
                    results: results.length,
                    created: results.filter(r => r.action === 'created').length,
                    updated: results.filter(r => r.action === 'updated').length,
                    errors: results.filter(r => r.action === 'error').length,
                    sampleResults: results.slice(0, 2) // Show first 2 results for debugging
                });

                response = { data: results };
                console.log('Final response being sent:', JSON.stringify(response, null, 2));
                
            } else if (action === 'audit_log') {
                // Get audit log for a specific assignment or date
                const assignmentId = url.searchParams.get('assignment_id');
                const auditDate = url.searchParams.get('date');
                
                let query = `${supabaseUrl}/rest/v1/vehicle_station_assignment_audit_log?select=*&order=changed_at.desc`;
                
                if (assignmentId) {
                    query += `&assignment_id=eq.${assignmentId}`;
                } else if (auditDate) {
                    query += `&assignment_date=eq.${auditDate}`;
                }

                const auditResponse = await fetch(query, {
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json'
                    }
                });

                if (!auditResponse.ok) {
                    throw new Error('Failed to fetch audit log');
                }

                const auditLog = await auditResponse.json();
                response = { data: auditLog };
                
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
        console.error('Vehicle station assignment CRUD error:', error);

        const errorResponse = {
            error: {
                code: 'VEHICLE_STATION_ASSIGNMENT_CRUD_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});