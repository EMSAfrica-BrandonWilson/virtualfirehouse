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
            // Get all fire stations with department names
            console.log('Fetching all fire stations...');
            const stationsResponse = await fetch(`${supabaseUrl}/rest/v1/fire_stations_vfh?select=*&order=created_at.desc`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                }
            });

            if (!stationsResponse.ok) {
                throw new Error('Failed to fetch fire stations');
            }

            const stations = await stationsResponse.json();
            
            // Get department names for each station
            const departmentIds = [...new Set(stations.map(station => station.department_id))];
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

                // Add department names to stations
                stations.forEach(station => {
                    station.department_name = departmentMap[station.department_id] || 'Unknown Department';
                });
            }

            console.log('Fire stations fetched successfully:', stations.length);

            return new Response(JSON.stringify({
                data: {
                    stations: stations || []
                }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });

        } else if (req.method === 'PUT') {
            // Update fire station
            const requestData = await req.json();
            const {
                stationId,
                departmentId,
                fireStationName,
                fireStationCity,
                fireStationSuburb,
                fireStationStreetName,
                fireStationBuildingNumber,
                fireStationTelephone,
                fireStationContactName,
                fireStationContactRank,
                fireStationContactEmail,
                fireStationContactTelephone,
                numberOfStationStaff,
                numberOfStationVehicles,
                stationPictureData,
                fileName
            } = requestData;

            // Validate required fields
            if (!stationId) {
                throw new Error('Station ID is required');
            }

            if (!departmentId) {
                throw new Error('Department ID is required');
            }

            if (!fireStationName) {
                throw new Error('Fire Station Name is required');
            }
            
            // Validate staff and vehicle allocation numbers
            const staffAllocation = parseInt(numberOfStationStaff) || 0;
            const vehicleAllocation = parseInt(numberOfStationVehicles) || 0;
            
            if (staffAllocation < 0) {
                throw new Error('Number of station staff cannot be negative');
            }
            
            if (vehicleAllocation < 0) {
                throw new Error('Number of station vehicles cannot be negative');
            }

            // Check if station exists
            const existingStationResponse = await fetch(`${supabaseUrl}/rest/v1/fire_stations_vfh?id=eq.${stationId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                }
            });

            if (!existingStationResponse.ok) {
                throw new Error('Failed to check existing station');
            }

            const existingStations = await existingStationResponse.json();
            if (!existingStations || existingStations.length === 0) {
                throw new Error('Station not found');
            }

            const existingStation = existingStations[0];
            const oldDepartmentId = existingStation.department_id;

            // Get allocation information for validation (exclude current station from calculations)
            const allocationResponse = await fetch(`${supabaseUrl}/functions/v1/get-department-allocation-info?departmentId=${departmentId}&excludeStationId=${stationId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!allocationResponse.ok) {
                throw new Error('Failed to check department allocation information');
            }

            const allocationData = await allocationResponse.json();
            if (!allocationData?.data) {
                throw new Error('Department not found. Please select a valid department.');
            }

            const allocInfo = allocationData.data;
            
            // If department is changing, validate station limits
            if (oldDepartmentId !== departmentId && !allocInfo.canAddStation) {
                throw new Error('Number of Fire Station limit reached for the selected department. If you need to add more, then you have to update the indicated number of fire stations in the \'Fire Department Register\' form.');
            }
            
            // Validate staff allocation
            if (staffAllocation > allocInfo.availableStaff) {
                throw new Error(`Only ${allocInfo.availableStaff} staff available for allocation in this department. Currently allocated: ${allocInfo.currentStaffAllocated} out of ${allocInfo.staffLimit}.`);
            }
            
            // Validate vehicle allocation
            if (vehicleAllocation > allocInfo.availableVehicles) {
                throw new Error(`Only ${allocInfo.availableVehicles} vehicles available for allocation in this department. Currently allocated: ${allocInfo.currentVehiclesAllocated} out of ${allocInfo.vehicleLimit}.`);
            }

            // Check for duplicate station name within the new department (excluding current station)
            const duplicateCheckResponse = await fetch(`${supabaseUrl}/rest/v1/fire_stations_vfh?department_id=eq.${departmentId}&fire_station_name=eq.${encodeURIComponent(fireStationName)}&id=neq.${stationId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                }
            });

            if (!duplicateCheckResponse.ok) {
                throw new Error('Failed to check for duplicate station names');
            }

            const duplicateStations = await duplicateCheckResponse.json();
            if (duplicateStations && duplicateStations.length > 0) {
                throw new Error(`A fire station with the name "${fireStationName}" already exists in this department. Please choose a different name.`);
            }

            let stationImageUrl = existingStation.station_image_url;

            // Handle file upload if new station picture data is provided
            if (stationPictureData && fileName) {
                try {
                    console.log('Processing station image upload for update:', fireStationName);
                    // Extract base64 data from data URL
                    const base64Data = stationPictureData.split(',')[1];
                    const mimeType = stationPictureData.split(';')[0].split(':')[1];

                    // Convert base64 to binary
                    const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

                    // Generate unique filename
                    const timestamp = Date.now();
                    const uniqueFileName = `station_${timestamp}_${fileName}`;

                    // Upload to Supabase Storage
                    const uploadResponse = await fetch(`${supabaseUrl}/storage/v1/object/fire-station-images/${uniqueFileName}`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${serviceRoleKey}`,
                            'Content-Type': mimeType,
                            'x-upsert': 'true'
                        },
                        body: binaryData
                    });

                    if (uploadResponse.ok) {
                        stationImageUrl = `${supabaseUrl}/storage/v1/object/public/fire-station-images/${uniqueFileName}`;
                        console.log('Station image uploaded successfully:', stationImageUrl);
                    } else {
                        const uploadError = await uploadResponse.text();
                        console.error('Station image upload failed:', uploadError);
                    }
                } catch (uploadError) {
                    console.log('File upload failed, keeping existing image:', uploadError);
                }
            }

            // Update fire station data
            const updateData = {
                department_id: departmentId,
                fire_station_name: fireStationName,
                fire_station_city: fireStationCity || '',
                fire_station_suburb: fireStationSuburb || '',
                fire_station_street_name: fireStationStreetName || '',
                fire_station_building_number: fireStationBuildingNumber || '',
                fire_station_telephone: fireStationTelephone || '',
                fire_station_contact_name: fireStationContactName || '',
                fire_station_contact_rank: fireStationContactRank || '',
                fire_station_contact_email: fireStationContactEmail || '',
                fire_station_contact_telephone: fireStationContactTelephone || '',
                number_of_station_staff: staffAllocation,
                number_of_station_vehicles: vehicleAllocation,
                station_image_url: stationImageUrl,
                updated_at: new Date().toISOString()
            };

            console.log('Updating fire station data:', updateData);

            const updateResponse = await fetch(`${supabaseUrl}/rest/v1/fire_stations_vfh?id=eq.${stationId}`, {
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

            const updatedStation = await updateResponse.json();
            console.log('Fire station updated successfully:', updatedStation[0]);

            return new Response(JSON.stringify({
                data: {
                    success: true,
                    message: 'Fire station updated successfully',
                    station: updatedStation[0]
                }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });

        } else if (req.method === 'DELETE') {
            // Delete fire station
            const requestData = await req.json();
            const { stationId } = requestData;

            if (!stationId) {
                throw new Error('Station ID is required');
            }

            // Check if station exists
            const existingStationResponse = await fetch(`${supabaseUrl}/rest/v1/fire_stations_vfh?id=eq.${stationId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                }
            });

            if (!existingStationResponse.ok) {
                throw new Error('Failed to check existing station');
            }

            const existingStations = await existingStationResponse.json();
            if (!existingStations || existingStations.length === 0) {
                throw new Error('Station not found');
            }

            console.log('Deleting fire station with ID:', stationId);

            const deleteResponse = await fetch(`${supabaseUrl}/rest/v1/fire_stations_vfh?id=eq.${stationId}`, {
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

            console.log('Fire station deleted successfully');

            return new Response(JSON.stringify({
                data: {
                    success: true,
                    message: 'Fire station deleted successfully'
                }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });

        } else {
            throw new Error('Method not allowed');
        }

    } catch (error) {
        console.error('Fire stations CRUD error:', error);

        const errorResponse = {
            error: {
                code: 'FIRE_STATIONS_CRUD_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});