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
            departmentId,
            fireStationId,
            staffIdNumber,
            firstName,
            lastName,
            idNumber,
            email,
            phoneNumber,
            address,
            hireDate,
            positionId,
            rankId,
            employmentStatus,
            certificationDetails,
            certificationExpiry,
            trainingRecords,
            emergencyContactName,
            emergencyContactPhone,
            emergencyContactRelationshipId,
            staffPictureData,
            fileName,
            // New expiry date fields
            idIqamaExpiryDate,
            driversLicenseExpiryDate,
            airsideIdExpiryDate,
            airsidePermitExpiryDate
        } = requestData;

        // Validate required fields
        if (!departmentId) {
            throw new Error('Department ID is required');
        }

        if (!staffIdNumber) {
            throw new Error('Staff ID Number is required');
        }

        if (!firstName) {
            throw new Error('First Name is required');
        }

        if (!lastName) {
            throw new Error('Last Name is required');
        }

        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        // Check department existence
        console.log('Checking department existence for ID:', departmentId);
        const departmentResponse = await fetch(`${supabaseUrl}/rest/v1/emergency_departments?id=eq.${departmentId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            }
        });

        if (!departmentResponse.ok) {
            throw new Error('Failed to check department existence');
        }

        const departments = await departmentResponse.json();
        if (!departments || departments.length === 0) {
            throw new Error('Department not found. Please select a valid department.');
        }

        // Validate fire station if provided
        if (fireStationId) {
            const stationResponse = await fetch(`${supabaseUrl}/rest/v1/fire_stations_vfh?id=eq.${fireStationId}&department_id=eq.${departmentId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                }
            });

            if (!stationResponse.ok) {
                throw new Error('Failed to check fire station existence');
            }

            const stations = await stationResponse.json();
            if (!stations || stations.length === 0) {
                throw new Error('Fire station not found in the selected department.');
            }
        }

        // Validate position if provided
        if (positionId) {
            const positionResponse = await fetch(`${supabaseUrl}/rest/v1/positions?id=eq.${positionId}&active=eq.true`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                }
            });

            if (!positionResponse.ok) {
                throw new Error('Failed to check position existence');
            }

            const positions = await positionResponse.json();
            if (!positions || positions.length === 0) {
                throw new Error('Position not found or inactive.');
            }
        }

        // Validate rank if provided
        if (rankId) {
            const rankResponse = await fetch(`${supabaseUrl}/rest/v1/ranks?id=eq.${rankId}&is_active=eq.true`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                }
            });

            if (!rankResponse.ok) {
                throw new Error('Failed to check rank existence');
            }

            const ranks = await rankResponse.json();
            if (!ranks || ranks.length === 0) {
                throw new Error('Rank not found or inactive.');
            }
        }

        // Validate emergency contact relationship if provided
        if (emergencyContactRelationshipId) {
            const relationshipResponse = await fetch(`${supabaseUrl}/rest/v1/emergency_contact_relationships?id=eq.${emergencyContactRelationshipId}&active=eq.true`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                }
            });

            if (!relationshipResponse.ok) {
                throw new Error('Failed to check emergency contact relationship existence');
            }

            const relationships = await relationshipResponse.json();
            if (!relationships || relationships.length === 0) {
                throw new Error('Emergency contact relationship not found or inactive.');
            }
        }

        // Check for duplicate staff ID within the department
        const duplicateCheckResponse = await fetch(`${supabaseUrl}/rest/v1/staff_vfh?department_id=eq.${departmentId}&staff_id=eq.${encodeURIComponent(staffIdNumber)}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            }
        });

        if (!duplicateCheckResponse.ok) {
            throw new Error('Failed to check for duplicate staff IDs');
        }

        const duplicateStaff = await duplicateCheckResponse.json();
        if (duplicateStaff && duplicateStaff.length > 0) {
            throw new Error(`A staff member with ID "${staffIdNumber}" already exists in this department. Please choose a different ID.`);
        }

        let staffImageUrl = null;

        // Handle file upload if staff picture data is provided
        if (staffPictureData && fileName) {
            try {
                console.log('Processing staff image upload for:', firstName, lastName);
                // Extract base64 data from data URL
                const base64Data = staffPictureData.split(',')[1];
                const mimeType = staffPictureData.split(';')[0].split(':')[1];

                // Convert base64 to binary
                const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

                // Generate unique filename
                const timestamp = Date.now();
                const uniqueFileName = `staff_${timestamp}_${fileName}`;

                // Upload to Supabase Storage
                const uploadResponse = await fetch(`${supabaseUrl}/storage/v1/object/staff-images/${uniqueFileName}`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'Content-Type': mimeType,
                        'x-upsert': 'true'
                    },
                    body: binaryData
                });

                if (uploadResponse.ok) {
                    staffImageUrl = `${supabaseUrl}/storage/v1/object/public/staff-images/${uniqueFileName}`;
                    console.log('Staff image uploaded successfully:', staffImageUrl);
                } else {
                    const uploadError = await uploadResponse.text();
                    console.error('Staff image upload failed:', uploadError);
                }
            } catch (uploadError) {
                console.log('File upload failed, continuing without image:', uploadError);
            }
        }

        // Insert staff data into database with new dropdown structure and expiry date fields
        const staffData = {
            department_id: departmentId,
            fire_station_id: fireStationId || null,
            staff_id: staffIdNumber,
            first_name: firstName,
            last_name: lastName,
            id_number: idNumber || '',
            email: email || '',
            phone_number: phoneNumber || '',
            address: address || '',
            hire_date: hireDate || null,
            position_id: positionId || null,
            rank_id: rankId || null,
            employment_status: employmentStatus || 'Active',
            certification_details: certificationDetails || '',
            certification_expiry: certificationExpiry || null,
            training_records: trainingRecords || '',
            emergency_contact_name: emergencyContactName || '',
            emergency_contact_phone: emergencyContactPhone || '',
            emergency_contact_relationship_id: emergencyContactRelationshipId || null,
            staff_image_url: staffImageUrl,
            // New expiry date fields
            id_iqama_expiry_date: idIqamaExpiryDate || null,
            drivers_license_expiry_date: driversLicenseExpiryDate || null,
            airside_id_expiry_date: airsideIdExpiryDate || null,
            airside_permit_expiry_date: airsidePermitExpiryDate || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        console.log('Inserting staff data:', staffData);

        const insertResponse = await fetch(`${supabaseUrl}/rest/v1/staff_vfh`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(staffData)
        });

        if (!insertResponse.ok) {
            const errorText = await insertResponse.text();
            console.error('Database insert failed:', errorText);
            throw new Error(`Database insert failed: ${errorText}`);
        }

        const insertedStaff = await insertResponse.json();
        console.log('Staff member registered successfully:', insertedStaff[0]);

        return new Response(JSON.stringify({
            data: {
                success: true,
                message: 'Staff member registered successfully',
                staff: insertedStaff[0]
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Staff registration error:', error);

        const errorResponse = {
            error: {
                code: 'STAFF_REGISTRATION_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
