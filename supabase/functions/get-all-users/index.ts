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
            throw new Error('Access denied: Only system administrators can view all users');
        }

        // Get all users with their roles
        const usersQuery = `
            SELECT 
                u.id,
                u.email,
                u.created_at,
                COALESCE(ur.role_name, 'user') as role,
                ur.updated_at as role_updated_at
            FROM auth.users u
            LEFT JOIN public.user_roles ur ON u.id = ur.user_id
            ORDER BY u.email
        `;

        // Use service role to query auth.users table
        const usersResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/get_users_with_roles`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            }
        });

        // If RPC doesn't exist, create a direct query
        if (!usersResponse.ok) {
            // Fallback: Get auth users and roles separately
            const authUsersResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey
                }
            });

            if (!authUsersResponse.ok) {
                throw new Error('Failed to fetch users from auth');
            }

            const authUsers = await authUsersResponse.json();

            // Get all user roles
            const rolesResponse = await fetch(`${supabaseUrl}/rest/v1/user_roles?select=user_id,role_name,updated_at`, {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey
                }
            });

            if (!rolesResponse.ok) {
                throw new Error('Failed to fetch user roles');
            }

            const roles = await rolesResponse.json();
            const roleMap = new Map(roles.map(r => [r.user_id, r]));

            // Combine users with their roles
            const usersWithRoles = authUsers.users.map(user => ({
                id: user.id,
                email: user.email,
                created_at: user.created_at,
                role: roleMap.get(user.id)?.role_name || 'user',
                role_updated_at: roleMap.get(user.id)?.updated_at || null,
                last_sign_in_at: user.last_sign_in_at,
                email_confirmed_at: user.email_confirmed_at
            }));

            return new Response(JSON.stringify({
                data: {
                    users: usersWithRoles,
                    total: usersWithRoles.length
                }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        const users = await usersResponse.json();

        return new Response(JSON.stringify({
            data: {
                users: users,
                total: users.length
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Get users error:', error);

        const errorResponse = {
            error: {
                code: 'GET_USERS_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});