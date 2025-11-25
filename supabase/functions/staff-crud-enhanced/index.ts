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
            // Get all staff with department names and dropdown values
            console.log('Fetching all staff...');
            const staffResponse = await fetch(`${supabaseUrl}/rest/v1/staff_vfh?select=*&order=created_at.desc`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                }
            });

            if (!staffResponse.ok) {
                throw new Error('Failed to fetch staff');
            }

            const staff = await staffResponse.json();
            
            // Get department names for each staff member
            const departmentIds = [...new Set(staff.map(s => s.department_id))];
            const departmentsResponse = await fetch(`${supabaseUrl}/rest/v1/emergency_departments?select=id,dept_name&id=in.(${departmentIds.join(',')})`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                }
            });

            // Get positions
            const positionsResponse = await fetch(`${supabaseUrl}/rest/v1/positions?select=*`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                }
            });

            // Get ranks
            const ranksResponse = await fetch(`${supabaseUrl}/rest/v1/ranks?select=*`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                }
            });

            // Get emergency contact relationships
            const relationshipsResponse = await fetch(`${supabaseUrl}/rest/v1/emergency_contact_relationships?select=*`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                }
            });

            // Get fire stations
            const fireStationsResponse = await fetch(`${supabaseUrl}/rest/v1/fire_stations_vfh?select=*`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                }
            });

            // Create lookup maps
            let departmentMap = {};
            let positionMap = {};
            let rankMap = {};
            let relationshipMap = {};
            let fireStationMap = {};

            if (departmentsResponse.ok) {
                const departments = await departmentsResponse.json();
                departmentMap = departments.reduce((map, dept) => {
                    map[dept.id] = dept.dept_name;
                    return map;
                }, {});
            }

            if (positionsResponse.ok) {
                const positions = await positionsResponse.json();
                positionMap = positions.reduce((map, pos) => {
                    map[pos.id] = pos.name;
                    return map;
                }, {});
            }

            if (ranksResponse.ok) {
                const ranks = await ranksResponse.json();
                rankMap = ranks.reduce((map, rank) => {
                    map[rank.id] = rank.name;
                    return map;
                }, {});
            }

            if (relationshipsResponse.ok) {
                const relationships = await relationshipsResponse.json();
                relationshipMap = relationships.reduce((map, rel) => {
                    map[rel.id] = rel.name;
                    return map;
                }, {});
            }

            if (fireStationsResponse.ok) {
                const fireStations = await fireStationsResponse.json();
                fireStationMap = fireStations.reduce((map, station) => {
                    map[station.id] = station.fire_station_name;
                    return map;
                }, {});
            }

            // Add lookup values to staff records
            staff.forEach(member => {
                member.department_name = departmentMap[member.department_id] || 'Unknown Department';
                member.position_name = positionMap[member.position_id] || member.position || '';
                member.rank_name = rankMap[member.rank_id] || member.rank || '';
                member.relationship_name = relationshipMap[member.emergency_contact_relationship_id] || member.emergency_contact_relationship || '';
                member.fire_station_name = fireStationMap[member.fire_station_id] || '';
            });

            console.log('Staff fetched successfully:', staff.length);

            return new Response(JSON.stringify({
                data: {
                    staff: staff || []
                }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });

        } else if (req.method === 'PUT') {
            // Update staff member
            const requestData = await req.json();
            const {
                staffId,
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
            if (!staffId) {
                throw new Error('Staff ID is required');
            }

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

            // Check if staff member exists
            const existingStaffResponse = await fetch(`${supabaseUrl}/rest/v1/staff_vfh?id=eq.${staffId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                }
            });

            if (!existingStaffResponse.ok) {
                throw new Error('Failed to check existing staff member');
            }

            const existingStaff = await existingStaffResponse.json();
            if (!existingStaff || existingStaff.length === 0) {
                throw new Error('Staff member not found');
            }

            const existingMember = existingStaff[0];

            // Check for duplicate staff ID within the department (excluding current member)
            const duplicateCheckResponse = await fetch(`${supabaseUrl}/rest/v1/staff_vfh?department_id=eq.${departmentId}&staff_id=eq.${encodeURIComponent(staffIdNumber)}&id=neq.${staffId}`, {
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

            let staffImageUrl = existingMember.staff_image_url;

            // Handle file upload if new staff picture data is provided
            if (staffPictureData && fileName) {
                try {
                    console.log('Processing staff image upload for update:', firstName, lastName);
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
                    console.log('File upload failed, keeping existing image:', uploadError);
                }
            }

            // Update staff data with new dropdown structure and expiry date fields
            const updateData = {
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
                updated_at: new Date().toISOString()
            };

            console.log('Updating staff data:', updateData);

            const updateResponse = await fetch(`${supabaseUrl}/rest/v1/staff_vfh?id=eq.${staffId}`, {
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
                console.error('Database update failed:', errorText);
                throw new Error(`Database update failed: ${errorText}`);
            }

            const updatedStaff = await updateResponse.json();
            console.log('Staff member updated successfully:', updatedStaff[0]);

            return new Response(JSON.stringify({
                data: {
                    success: true,
                    message: 'Staff member updated successfully',
                    staff: updatedStaff[0]
                }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });

        } else if (req.method === 'DELETE') {
            // Delete staff member
            const requestData = await req.json();
            const { staffId } = requestData;

            if (!staffId) {
                throw new Error('Staff ID is required');
            }

            // Check if staff member exists
            const existingStaffResponse = await fetch(`${supabaseUrl}/rest/v1/staff_vfh?id=eq.${staffId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                }
            });

            if (!existingStaffResponse.ok) {
                throw new Error('Failed to check existing staff member');
            }

            const existingStaff = await existingStaffResponse.json();
            if (!existingStaff || existingStaff.length === 0) {
                throw new Error('Staff member not found');
            }

            console.log('Deleting staff member with ID:', staffId);

            const deleteResponse = await fetch(`${supabaseUrl}/rest/v1/staff_vfh?id=eq.${staffId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                }
            });

            if (!deleteResponse.ok) {
                const errorText = await deleteResponse.text();
                console.error('Database delete failed:', errorText);
                throw new Error(`Database delete failed: ${errorText}`);
            }

            console.log('Staff member deleted successfully');

            return new Response(JSON.stringify({
                data: {
                    success: true,
                    message: 'Staff member deleted successfully'
                }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });

        } else {
            throw new Error('Method not allowed');
        }

    } catch (error) {
        console.error('Staff CRUD error:', error);

        const errorResponse = {
            error: {
                code: 'STAFF_CRUD_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
