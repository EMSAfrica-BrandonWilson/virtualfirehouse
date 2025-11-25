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

        // Validate required fields (only Department ID and Station Name)
        if (!departmentId) {
            throw new Error('Department ID is required');
        }

        if (!fireStationName) {
            throw new Error('Fire Station Name is required');
        }

        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
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

        // Check department existence and get allocation information
        console.log('Checking department allocation info for ID:', departmentId);
        const allocationResponse = await fetch(`${supabaseUrl}/functions/v1/get-department-allocation-info?departmentId=${departmentId}`, {
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

        // Validate station limit
        if (!allocInfo.canAddStation) {
            throw new Error(`Number of Fire Station limit reached. If you need to add more, then you have to update the indicated number of fire stations in the 'Fire Department Register' form.`);
        }
        
        // Validate staff allocation
        if (staffAllocation > allocInfo.availableStaff) {
            throw new Error(`Only ${allocInfo.availableStaff} staff available for allocation in this department. Currently allocated: ${allocInfo.currentStaffAllocated} out of ${allocInfo.staffLimit}.`);
        }
        
        // Validate vehicle allocation
        if (vehicleAllocation > allocInfo.availableVehicles) {
            throw new Error(`Only ${allocInfo.availableVehicles} vehicles available for allocation in this department. Currently allocated: ${allocInfo.currentVehiclesAllocated} out of ${allocInfo.vehicleLimit}.`);
        }

        // Check for duplicate station name within the department
        const duplicateCheckResponse = await fetch(`${supabaseUrl}/rest/v1/fire_stations_vfh?department_id=eq.${departmentId}&fire_station_name=eq.${encodeURIComponent(fireStationName)}`, {
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

        let stationImageUrl = null;

        // Handle file upload if station picture data is provided
        if (stationPictureData && fileName) {
            try {
                console.log('Processing station image upload for:', fireStationName);
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
                console.log('File upload failed, continuing without image:', uploadError);
            }
        }

        // Insert fire station data into database (handle optional fields)
        const stationData = {
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
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        console.log('Inserting fire station data:', stationData);

        const insertResponse = await fetch(`${supabaseUrl}/rest/v1/fire_stations_vfh`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(stationData)
        });

        if (!insertResponse.ok) {
            const errorText = await insertResponse.text();
            console.error('Database insert failed:', errorText);
            throw new Error(`Database insert failed: ${errorText}`);
        }

        const insertedStation = await insertResponse.json();
        console.log('Fire station registered successfully:', insertedStation[0]);

        return new Response(JSON.stringify({
            data: {
                success: true,
                message: 'Fire station registered successfully',
                station: insertedStation[0],
                remainingSlots: allocInfo.remainingStationSlots - 1,
                availableStaff: allocInfo.availableStaff - staffAllocation,
                availableVehicles: allocInfo.availableVehicles - vehicleAllocation
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Fire station registration error:', error);

        const errorResponse = {
            error: {
                code: 'FIRE_STATION_REGISTRATION_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});