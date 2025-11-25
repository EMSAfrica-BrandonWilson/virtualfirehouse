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
        const method = req.method;
        const requestData = method !== 'GET' ? await req.json() : null;

        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        // Handle GET request - list departments
        if (method === 'GET') {
            console.log('Fetching all departments');
            
            const listResponse = await fetch(`${supabaseUrl}/rest/v1/emergency_departments?order=created_at.desc`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                }
            });

            if (!listResponse.ok) {
                const errorText = await listResponse.text();
                throw new Error(`Failed to fetch departments: ${errorText}`);
            }

            const departments = await listResponse.json();
            console.log(`Found ${departments.length} departments`);

            return new Response(JSON.stringify({
                data: {
                    success: true,
                    departments: departments
                }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // Handle PUT request - update department
        if (method === 'PUT') {
            const { 
                departmentId,
                deptName, 
                deptType, 
                deptCountry, 
                deptCity, 
                deptSuburb, 
                deptStreetName, 
                deptStreetNumber, 
                deptTelephone, 
                numberOfFireStations,
                numberOfFireVehicles,
                numberOfStaff,
                headOfDepartment,
                contactEmail,
                description,
                operationalStatus,
                pictureData, 
                fileName 
            } = requestData;

            if (!departmentId) {
                throw new Error('Department ID is required for update');
            }

            console.log('Updating department with ID:', departmentId);

            let pictureUrl = null;

            // Handle file upload if picture data is provided
            if (pictureData && fileName) {
                try {
                    console.log('Processing logo upload for department update:', deptName);
                    // Extract base64 data from data URL
                    const base64Data = pictureData.split(',')[1];
                    const mimeType = pictureData.split(';')[0].split(':')[1];

                    // Convert base64 to binary
                    const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

                    // Generate unique filename
                    const timestamp = Date.now();
                    const uniqueFileName = `dept_${timestamp}_${fileName}`;

                    // Upload to Supabase Storage
                    const uploadResponse = await fetch(`${supabaseUrl}/storage/v1/object/department-images/${uniqueFileName}`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${serviceRoleKey}`,
                            'Content-Type': mimeType,
                            'x-upsert': 'true'
                        },
                        body: binaryData
                    });

                    if (uploadResponse.ok) {
                        pictureUrl = `${supabaseUrl}/storage/v1/object/public/department-images/${uniqueFileName}`;
                        console.log('Logo uploaded successfully for update:', pictureUrl);
                    } else {
                        const uploadError = await uploadResponse.text();
                        console.error('Logo upload failed during update:', uploadError);
                    }
                } catch (uploadError) {
                    console.log('File upload failed during update, continuing without new image:', uploadError);
                }
            }

            // Prepare update data
            const updateData: any = {
                dept_name: deptName,
                dept_type: deptType,
                dept_country: deptCountry,
                dept_city: deptCity,
                dept_suburb: deptSuburb || '',
                dept_street_name: deptStreetName || '',
                dept_street_number: deptStreetNumber || '',
                dept_telephone: deptTelephone,
                number_of_fire_stations: numberOfFireStations || null,
                number_of_fire_vehicles: numberOfFireVehicles || null,
                number_of_staff: numberOfStaff || null,
                head_of_department: headOfDepartment || '',
                contact_email: contactEmail || '',
                description: description || '',
                operational_status: operationalStatus || '',
                updated_at: new Date().toISOString()
            };

            // Only update picture URL if a new one was uploaded
            if (pictureUrl) {
                updateData.dept_picture_url = pictureUrl;
            }

            console.log('Updating department with data:', updateData);

            const updateResponse = await fetch(`${supabaseUrl}/rest/v1/emergency_departments?id=eq.${departmentId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify(updateData)
            });

            if (!updateResponse.ok) {
                const errorText = await updateResponse.text();
                throw new Error(`Failed to update department: ${errorText}`);
            }

            const updatedDepartment = await updateResponse.json();
            console.log('Department updated successfully:', updatedDepartment[0]);

            return new Response(JSON.stringify({
                data: {
                    success: true,
                    message: 'Department updated successfully',
                    department: updatedDepartment[0]
                }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // Handle DELETE request - delete department
        if (method === 'DELETE') {
            const { departmentId } = requestData;

            if (!departmentId) {
                throw new Error('Department ID is required for deletion');
            }

            console.log('Deleting department with ID:', departmentId);

            // First, get the department to check if it has an image to delete
            const getDeptResponse = await fetch(`${supabaseUrl}/rest/v1/emergency_departments?id=eq.${departmentId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                }
            });

            if (getDeptResponse.ok) {
                const deptData = await getDeptResponse.json();
                if (deptData && deptData.length > 0 && deptData[0].dept_picture_url) {
                    // Extract filename from URL and delete the image
                    try {
                        const imageUrl = deptData[0].dept_picture_url;
                        const fileName = imageUrl.split('/').pop();
                        if (fileName) {
                            console.log('Deleting associated image:', fileName);
                            await fetch(`${supabaseUrl}/storage/v1/object/department-images/${fileName}`, {
                                method: 'DELETE',
                                headers: {
                                    'Authorization': `Bearer ${serviceRoleKey}`
                                }
                            });
                        }
                    } catch (imageDeleteError) {
                        console.log('Failed to delete associated image, continuing with department deletion');
                    }
                }
            }

            // Delete the department record
            const deleteResponse = await fetch(`${supabaseUrl}/rest/v1/emergency_departments?id=eq.${departmentId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                }
            });

            if (!deleteResponse.ok) {
                const errorText = await deleteResponse.text();
                throw new Error(`Failed to delete department: ${errorText}`);
            }

            console.log('Department deleted successfully');

            return new Response(JSON.stringify({
                data: {
                    success: true,
                    message: 'Department deleted successfully'
                }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // Handle POST request - check for duplicate names
        if (method === 'POST') {
            const { deptName, excludeId } = requestData;

            if (!deptName) {
                throw new Error('Department name is required for duplicate check');
            }

            console.log('Checking for duplicate department name:', deptName, 'excluding ID:', excludeId);

            let queryUrl = `${supabaseUrl}/rest/v1/emergency_departments?dept_name=eq.${encodeURIComponent(deptName)}`;
            
            // If we're editing, exclude the current record from duplicate check
            if (excludeId) {
                queryUrl += `&id=neq.${excludeId}`;
            }

            const duplicateCheckResponse = await fetch(queryUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                }
            });

            if (!duplicateCheckResponse.ok) {
                throw new Error('Failed to check for duplicate department names');
            }

            const existingDepartments = await duplicateCheckResponse.json();
            const isDuplicate = existingDepartments && existingDepartments.length > 0;

            console.log('Duplicate check result:', { deptName, excludeId, isDuplicate, count: existingDepartments.length });

            return new Response(JSON.stringify({
                data: {
                    isDuplicate: isDuplicate,
                    message: isDuplicate ? `Department name "${deptName}" already exists` : 'Department name is available'
                }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        throw new Error(`Method ${method} not supported`);

    } catch (error) {
        console.error('Departments CRUD error:', error);

        const errorResponse = {
            error: {
                code: 'DEPARTMENTS_CRUD_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
