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
        const assignerUserId = userData.id;

        // Extract parameters from request body
        const requestData = await req.json();
        const { targetUserId, newRole, reason } = requestData;

        if (!targetUserId || !newRole) {
            throw new Error('Target user ID and new role are required');
        }

        // Validate role values
        const validRoles = ['user', 'administrator', 'system_admin'];
        if (!validRoles.includes(newRole)) {
            throw new Error('Invalid role specified');
        }

        // Check if assigner has permission to assign this role
        const canAssignResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/can_assign_role`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                assigner_user_id: assignerUserId,
                target_role: newRole
            })
        });

        if (!canAssignResponse.ok) {
            throw new Error('Failed to check role assignment permissions');
        }

        const canAssign = await canAssignResponse.json();
        if (!canAssign) {
            throw new Error('You do not have permission to assign this role');
        }

        // Get current role of target user
        const currentRoleResponse = await fetch(`${supabaseUrl}/rest/v1/user_roles?user_id=eq.${targetUserId}&select=role_name`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        });

        if (!currentRoleResponse.ok) {
            throw new Error('Failed to get current user role');
        }

        const currentRoleData = await currentRoleResponse.json();
        const currentRole = currentRoleData.length > 0 ? currentRoleData[0].role_name : 'user';

        // Update or insert user role
        const roleUpdateResponse = await fetch(`${supabaseUrl}/rest/v1/user_roles?user_id=eq.${targetUserId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json',
                'Prefer': 'resolution=merge-duplicates'
            },
            body: JSON.stringify({
                user_id: targetUserId,
                role_name: newRole,
                updated_at: new Date().toISOString()
            })
        });

        if (!roleUpdateResponse.ok) {
            const errorText = await roleUpdateResponse.text();
            throw new Error(`Failed to update user role: ${errorText}`);
        }

        // Log the role assignment in audit table
        const auditLogResponse = await fetch(`${supabaseUrl}/rest/v1/role_assignment_audit`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                assigned_by_user_id: assignerUserId,
                target_user_id: targetUserId,
                old_role: currentRole,
                new_role: newRole,
                reason: reason || 'Role assignment via admin interface'
            })
        });

        if (!auditLogResponse.ok) {
            console.warn('Failed to log role assignment audit');
        }

        // Return success response
        return new Response(JSON.stringify({
            data: {
                success: true,
                message: `User role updated from ${currentRole} to ${newRole}`,
                targetUserId,
                oldRole: currentRole,
                newRole,
                assignedBy: assignerUserId
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Role assignment error:', error);

        const errorResponse = {
            error: {
                code: 'ROLE_ASSIGNMENT_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});