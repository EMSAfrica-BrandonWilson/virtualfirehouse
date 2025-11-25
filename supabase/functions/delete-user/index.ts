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
    // Verify the request method
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({
        error: {
          code: 'METHOD_NOT_ALLOWED',
          message: 'Only POST method is allowed'
        }
      }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authorization header is required'
        }
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(JSON.stringify({
        error: {
          code: 'CONFIGURATION_ERROR',
          message: 'Supabase configuration is missing'
        }
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Verify the user making the request is authenticated
    const token = authHeader.replace('Bearer ', '');
    const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': supabaseServiceKey
      }
    });

    if (!userResponse.ok) {
      return new Response(JSON.stringify({
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired authorization token'
        }
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const currentUser = await userResponse.json();

    // Check if the requesting user is a System Administrator
    const profileResponse = await fetch(`${supabaseUrl}/rest/v1/user_profiles?id=eq.${currentUser.id}&select=role`, {
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey,
        'Content-Type': 'application/json'
      }
    });

    if (!profileResponse.ok) {
      return new Response(JSON.stringify({
        error: {
          code: 'PERMISSION_CHECK_FAILED',
          message: 'Failed to verify user permissions'
        }
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const profileData = await profileResponse.json();
    if (!profileData || profileData.length === 0 || profileData[0].role !== 'System Administrator') {
      return new Response(JSON.stringify({
        error: {
          code: 'FORBIDDEN',
          message: 'Only System Administrators can delete users'
        }
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Parse the request body
    const requestData = await req.json();
    const { userId } = requestData;

    // Validate required fields
    if (!userId) {
      return new Response(JSON.stringify({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'User ID is required'
        }
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Prevent System Administrator from deleting themselves
    if (userId === currentUser.id) {
      return new Response(JSON.stringify({
        error: {
          code: 'SELF_DELETE_FORBIDDEN',
          message: 'You cannot delete your own account'
        }
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check if the user exists and get current data
    const existingUserResponse = await fetch(`${supabaseUrl}/rest/v1/user_profiles?id=eq.${userId}`, {
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey,
        'Content-Type': 'application/json'
      }
    });

    if (!existingUserResponse.ok) {
      return new Response(JSON.stringify({
        error: {
          code: 'USER_CHECK_FAILED',
          message: 'Failed to verify user exists'
        }
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const existingUserData = await existingUserResponse.json();
    if (!existingUserData || existingUserData.length === 0) {
      return new Response(JSON.stringify({
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const existingUser = existingUserData[0];

    // Log the action in audit log before deletion
    const auditLogResponse = await fetch(`${supabaseUrl}/rest/v1/audit_log`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        actor_id: currentUser.id,
        action: 'DELETE_USER',
        target_type: 'user',
        target_id: userId,
        details: {
          deleted_user: {
            email: existingUser.email,
            role: existingUser.role,
            created_at: existingUser.created_at
          },
          deleted_at: new Date().toISOString()
        },
        created_at: new Date().toISOString()
      })
    });

    if (!auditLogResponse.ok) {
      console.error('Failed to log audit entry:', await auditLogResponse.text());
      // Don't fail the entire operation for audit log issues
    }

    // Clean up related data first
    // Delete user's uploaded images from page_images table
    const deleteImagesResponse = await fetch(`${supabaseUrl}/rest/v1/page_images?uploaded_by=eq.${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey,
        'Content-Type': 'application/json'
      }
    });

    if (!deleteImagesResponse.ok) {
      console.error('Failed to delete user images:', await deleteImagesResponse.text());
      // Continue with deletion even if cleanup fails
    }

    // Delete user profile from database
    const deleteProfileResponse = await fetch(`${supabaseUrl}/rest/v1/user_profiles?id=eq.${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey,
        'Content-Type': 'application/json'
      }
    });

    if (!deleteProfileResponse.ok) {
      const profileError = await deleteProfileResponse.text();
      return new Response(JSON.stringify({
        error: {
          code: 'PROFILE_DELETE_FAILED',
          message: `Failed to delete user profile: ${profileError}`
        }
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Finally, delete the auth user
    const deleteAuthUserResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey
      }
    });

    if (!deleteAuthUserResponse.ok) {
      const authError = await deleteAuthUserResponse.text();
      return new Response(JSON.stringify({
        error: {
          code: 'AUTH_DELETE_FAILED',
          message: `Failed to delete user authentication: ${authError}`
        }
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Return success response
    return new Response(JSON.stringify({
      data: {
        message: `User ${existingUser.email} has been permanently deleted`,
        deleted_user: {
          id: userId,
          email: existingUser.email,
          role: existingUser.role
        },
        deleted_at: new Date().toISOString()
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Delete user error:', error);
    
    const errorResponse = {
      error: {
        code: 'FUNCTION_ERROR',
        message: error.message || 'An unexpected error occurred while deleting the user'
      }
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});