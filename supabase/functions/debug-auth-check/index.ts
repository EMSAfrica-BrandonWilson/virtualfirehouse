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
            const errorText = await userResponse.text();
            throw new Error(`Invalid token: ${errorText}`);
        }

        const userData = await userResponse.json();
        const userId = userData.id;
        const userEmail = userData.email;

        // Check user role
        const roleCheckResponse = await fetch(`${supabaseUrl}/rest/v1/user_roles?user_id=eq.${userId}&select=role_name`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            }
        });

        if (!roleCheckResponse.ok) {
            const errorText = await roleCheckResponse.text();
            throw new Error(`Failed to check user role: ${errorText}`);
        }

        const roleData = await roleCheckResponse.json();
        const userRole = roleData.length > 0 ? roleData[0].role_name : 'user';

        // Check if user has admin privileges
        const hasAdminPrivileges = userRole === 'administrator' || userRole === 'system_admin';

        // Return detailed debug information
        return new Response(JSON.stringify({
            data: {
                debug: {
                    userId,
                    userEmail,
                    userRole,
                    hasAdminPrivileges,
                    roleData,
                    authTokenValid: true,
                    timestamp: new Date().toISOString()
                }
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Debug auth check error:', error);

        const errorResponse = {
            error: {
                code: 'DEBUG_AUTH_CHECK_FAILED',
                message: error.message,
                timestamp: new Date().toISOString()
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});