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
        const requestData = await req.json();
        const { 
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

        if (!deptName) {
            throw new Error('Department name is required');
        }

        if (!deptType) {
            throw new Error('Department type is required');
        }

        if (!deptCountry) {
            throw new Error('Country is required');
        }

        if (!deptCity) {
            throw new Error('City is required');
        }

        if (!deptTelephone) {
            throw new Error('Telephone is required');
        }

        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        // Check for duplicate department name
        console.log('Checking for duplicate department name:', deptName);
        const duplicateCheckResponse = await fetch(`${supabaseUrl}/rest/v1/emergency_departments?dept_name=eq.${encodeURIComponent(deptName)}`, {
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
        if (existingDepartments && existingDepartments.length > 0) {
            throw new Error(`Department name "${deptName}" already exists. Please choose a different name.`);
        }

        let pictureUrl = null;

        // Handle file upload if picture data is provided
        if (pictureData && fileName) {
            try {
                console.log('Processing logo upload for department:', deptName);
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
                    console.log('Logo uploaded successfully:', pictureUrl);
                } else {
                    const uploadError = await uploadResponse.text();
                    console.error('Logo upload failed:', uploadError);
                }
            } catch (uploadError) {
                console.log('File upload failed, continuing without image:', uploadError);
            }
        }

        // Insert department data into database
        const departmentData = {
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
            dept_picture_url: pictureUrl,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        console.log('Inserting department data:', departmentData);

        const insertResponse = await fetch(`${supabaseUrl}/rest/v1/emergency_departments`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(departmentData)
        });

        if (!insertResponse.ok) {
            const errorText = await insertResponse.text();
            console.error('Database insert failed:', errorText);
            throw new Error(`Database insert failed: ${errorText}`);
        }

        const insertedDepartment = await insertResponse.json();
        console.log('Department registered successfully:', insertedDepartment[0]);

        return new Response(JSON.stringify({
            data: {
                success: true,
                message: 'Department registered successfully',
                department: insertedDepartment[0]
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Department registration error:', error);

        const errorResponse = {
            error: {
                code: 'DEPARTMENT_REGISTRATION_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
