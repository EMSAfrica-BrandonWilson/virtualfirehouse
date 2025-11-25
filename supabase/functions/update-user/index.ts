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
          message: 'Only System Administrators can update users'
        }
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Parse the request body
    const requestData = await req.json();
    const { userId, email, password, role } = requestData;

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

    // Validate email format if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return new Response(JSON.stringify({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid email format'
          }
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Validate password strength if provided
    if (password && password.length < 6) {
      return new Response(JSON.stringify({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Password must be at least 6 characters long'
        }
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Validate role if provided
    if (role) {
      const validRoles = ['System Administrator', 'Officer', 'Member'];
      if (!validRoles.includes(role)) {
        return new Response(JSON.stringify({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid role. Must be one of: System Administrator, Officer, Member'
          }
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
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

    // Prevent System Administrator from demoting themselves
    if (userId === currentUser.id && role && role !== 'System Administrator') {
      return new Response(JSON.stringify({
        error: {
          code: 'SELF_DEMOTION_FORBIDDEN',
          message: 'You cannot change your own role'
        }
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Build update data for auth user
    const authUpdateData: any = {};
    if (email && email !== existingUser.email) {
      authUpdateData.email = email;
    }
    if (password) {
      authUpdateData.password = password;
    }

    // Update auth user if needed
    if (Object.keys(authUpdateData).length > 0) {
      const authUpdateResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': supabaseServiceKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(authUpdateData)
      });

      if (!authUpdateResponse.ok) {
        const authError = await authUpdateResponse.text();
        return new Response(JSON.stringify({
          error: {
            code: 'AUTH_UPDATE_FAILED',
            message: `Failed to update user authentication: ${authError}`
          }
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Build update data for user profile
    const profileUpdateData: any = {};
    if (email && email !== existingUser.email) {
      profileUpdateData.email = email;
    }
    if (role && role !== existingUser.role) {
      profileUpdateData.role = role;
    }

    // Update user profile if needed
    if (Object.keys(profileUpdateData).length > 0) {
      const profileUpdateResponse = await fetch(`${supabaseUrl}/rest/v1/user_profiles?id=eq.${userId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': supabaseServiceKey,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(profileUpdateData)
      });

      if (!profileUpdateResponse.ok) {
        const profileError = await profileUpdateResponse.text();
        return new Response(JSON.stringify({
          error: {
            code: 'PROFILE_UPDATE_FAILED',
            message: `Failed to update user profile: ${profileError}`
          }
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Log the action in audit log
    const auditDetails: any = {
      updated_at: new Date().toISOString(),
      changes: {}
    };
    
    if (email && email !== existingUser.email) {
      auditDetails.changes.email = { from: existingUser.email, to: email };
    }
    if (role && role !== existingUser.role) {
      auditDetails.changes.role = { from: existingUser.role, to: role };
    }
    if (password) {
      auditDetails.changes.password = 'updated';
    }

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
        action: 'UPDATE_USER',
        target_type: 'user',
        target_id: userId,
        details: auditDetails,
        created_at: new Date().toISOString()
      })
    });

    if (!auditLogResponse.ok) {
      console.error('Failed to log audit entry:', await auditLogResponse.text());
      // Don't fail the entire operation for audit log issues
    }

    // Return success response
    return new Response(JSON.stringify({
      data: {
        user: {
          id: userId,
          email: email || existingUser.email,
          role: role || existingUser.role
        },
        message: `User ${email || existingUser.email} updated successfully`
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Update user error:', error);
    
    const errorResponse = {
      error: {
        code: 'FUNCTION_ERROR',
        message: error.message || 'An unexpected error occurred while updating the user'
      }
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});