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
            // Get all staff with expiry date analysis
            console.log('Fetching staff expiry status...');
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

            // Create lookup maps
            let departmentMap = {};
            let positionMap = {};
            let rankMap = {};

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

            // Current date for expiry calculations (using 2025-10-08 as reference)
            const currentDate = new Date('2025-10-08');
            const thirtyDaysFromNow = new Date(currentDate);
            thirtyDaysFromNow.setDate(currentDate.getDate() + 30);

            // Calculate expiry status for each field
            const calculateExpiryStatus = (dateString) => {
                if (!dateString) return { status: 'none', message: '', daysUntilExpiry: null };
                
                const expiryDate = new Date(dateString);
                const timeDiff = expiryDate.getTime() - currentDate.getTime();
                const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
                
                if (daysDiff < 0) {
                    return {
                        status: 'expired',
                        message: `Expired ${Math.abs(daysDiff)} day${Math.abs(daysDiff) === 1 ? '' : 's'} ago`,
                        daysUntilExpiry: daysDiff
                    };
                } else if (daysDiff <= 30) {
                    return {
                        status: 'warning',
                        message: `Expires in ${daysDiff} day${daysDiff === 1 ? '' : 's'}`,
                        daysUntilExpiry: daysDiff
                    };
                } else {
                    return {
                        status: 'valid',
                        message: `Expires in ${daysDiff} day${daysDiff === 1 ? '' : 's'}`,
                        daysUntilExpiry: daysDiff
                    };
                }
            };

            // Add expiry status and lookup values to staff records
            const staffWithExpiry = staff.map(member => {
                const expiryStatuses = {
                    certification: calculateExpiryStatus(member.certification_expiry),
                    idIqama: calculateExpiryStatus(member.id_iqama_expiry_date),
                    driversLicense: calculateExpiryStatus(member.drivers_license_expiry_date),
                    airsideId: calculateExpiryStatus(member.airside_id_expiry_date),
                    airsidePermit: calculateExpiryStatus(member.airside_permit_expiry_date)
                };

                // Determine overall status (worst case)
                const statuses = Object.values(expiryStatuses).map(e => e.status).filter(s => s !== 'none');
                let overallStatus = 'valid';
                if (statuses.includes('expired')) {
                    overallStatus = 'expired';
                } else if (statuses.includes('warning')) {
                    overallStatus = 'warning';
                }

                return {
                    ...member,
                    department_name: departmentMap[member.department_id] || 'Unknown Department',
                    position_name: positionMap[member.position_id] || member.position || '',
                    rank_name: rankMap[member.rank_id] || member.rank || '',
                    expiry_statuses: expiryStatuses,
                    overall_expiry_status: overallStatus
                };
            });

            // Calculate summary statistics
            const summary = {
                totalStaff: staffWithExpiry.length,
                activeStaff: staffWithExpiry.filter(s => s.employment_status === 'Active').length,
                expiredCount: staffWithExpiry.filter(s => s.overall_expiry_status === 'expired').length,
                warningCount: staffWithExpiry.filter(s => s.overall_expiry_status === 'warning').length,
                validCount: staffWithExpiry.filter(s => s.overall_expiry_status === 'valid').length
            };

            console.log('Staff expiry status calculated successfully:', staffWithExpiry.length);

            return new Response(JSON.stringify({
                data: {
                    staff: staffWithExpiry,
                    summary: summary,
                    currentDate: currentDate.toISOString().split('T')[0]
                }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });

        } else {
            throw new Error('Method not allowed');
        }

    } catch (error) {
        console.error('Staff expiry status error:', error);

        const errorResponse = {
            error: {
                code: 'STAFF_EXPIRY_STATUS_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
