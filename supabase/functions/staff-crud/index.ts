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
            // Get all staff with department names
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

            if (departmentsResponse.ok) {
                const departments = await departmentsResponse.json();
                const departmentMap = departments.reduce((map, dept) => {
                    map[dept.id] = dept.dept_name;
                    return map;
                }, {});

                // Add department names to staff
                staff.forEach(member => {
                    member.department_name = departmentMap[member.department_id] || 'Unknown Department';
                });
            }

            // Get rank names for each staff member
            const rankIds = [...new Set(staff.map(s => s.rank_id).filter(id => id))];
            if (rankIds.length > 0) {
                const ranksResponse = await fetch(`${supabaseUrl}/rest/v1/ranks?select=id,name&id=in.(${rankIds.join(',')})`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json'
                    }
                });

                if (ranksResponse.ok) {
                    const ranks = await ranksResponse.json();
                    const rankMap = ranks.reduce((map, rank) => {
                        map[rank.id] = rank.name;
                        return map;
                    }, {});

                    // Add rank names to staff
                    staff.forEach(member => {
                        if (member.rank_id) {
                            member.rank = rankMap[member.rank_id] || '';
                        }
                    });
                }
            }

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
                staffIdNumber,
                firstName,
                lastName,
                idNumber,
                email,
                phoneNumber,
                address,
                hireDate,
                position,
                rank,
                rankId,
                employmentStatus,
                certificationDetails,
                certificationExpiry,
                trainingRecords,
                emergencyContactName,
                emergencyContactPhone,
                emergencyContactRelationship,
                staffPictureData,
                fileName
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

            // Update staff data
            const updateData = {
                department_id: departmentId,
                staff_id: staffIdNumber,
                first_name: firstName,
                last_name: lastName,
                id_number: idNumber || '',
                email: email || '',
                phone_number: phoneNumber || '',
                address: address || '',
                hire_date: hireDate || null,
                position: position || '',
                rank: rank || '',
                rank_id: rankId || null,
                employment_status: employmentStatus || 'Active',
                certification_details: certificationDetails || '',
                certification_expiry: certificationExpiry || null,
                training_records: trainingRecords || '',
                emergency_contact_name: emergencyContactName || '',
                emergency_contact_phone: emergencyContactPhone || '',
                emergency_contact_relationship: emergencyContactRelationship || '',
                staff_image_url: staffImageUrl,
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
