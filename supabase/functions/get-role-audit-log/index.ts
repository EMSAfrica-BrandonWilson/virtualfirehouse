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
        // Get the service role key
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        // Get user from auth header
        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
            throw new Error('No authorization header');
        }

        const token = authHeader.replace('Bearer ', '');

        // Verify token and get user
        const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'apikey': serviceRoleKey
            }
        });

        if (!userResponse.ok) {
            throw new Error('Invalid token');
        }

        const userData = await userResponse.json();
        const requestingUserId = userData.id;

        // Check if user has system_admin role
        const roleCheckResponse = await fetch(`${supabaseUrl}/rest/v1/user_roles?user_id=eq.${requestingUserId}&select=role_name`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        });

        if (!roleCheckResponse.ok) {
            throw new Error('Failed to check user permissions');
        }

        const roleData = await roleCheckResponse.json();
        const userRole = roleData.length > 0 ? roleData[0].role_name : 'user';

        if (userRole !== 'system_admin') {
            throw new Error('Access denied: Only system administrators can view audit logs');
        }

        // Get query parameters
        const url = new URL(req.url);
        const limit = parseInt(url.searchParams.get('limit') || '50');
        const offset = parseInt(url.searchParams.get('offset') || '0');
        const targetUserId = url.searchParams.get('target_user_id');

        // Build audit log query
        let auditQuery = `select=*,assigned_by:assigned_by_user_id(*),target_user:target_user_id(*)&order=assigned_at.desc&limit=${limit}&offset=${offset}`;
        
        if (targetUserId) {
            auditQuery += `&target_user_id=eq.${targetUserId}`;
        }

        // Get role assignment audit log
        const auditResponse = await fetch(`${supabaseUrl}/rest/v1/role_assignment_audit?${auditQuery}`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        });

        if (!auditResponse.ok) {
            throw new Error('Failed to fetch audit log');
        }

        const auditData = await auditResponse.json();

        // Get total count for pagination
        const countResponse = await fetch(`${supabaseUrl}/rest/v1/role_assignment_audit?select=count&count=exact`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        });

        let totalCount = 0;
        if (countResponse.ok) {
            const countData = await countResponse.json();
            totalCount = countData.length || 0;
        }

        // Return audit log data
        return new Response(JSON.stringify({
            data: {
                auditLog: auditData,
                pagination: {
                    total: totalCount,
                    limit,
                    offset,
                    hasNext: offset + limit < totalCount
                }
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Get audit log error:', error);

        const errorResponse = {
            error: {
                code: 'GET_AUDIT_LOG_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});