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
          message: 'Only System Administrators can create users'
        }
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Parse the request body
    const requestData = await req.json();
    const { email, password, role } = requestData;

    // Validate required fields
    if (!email || !password || !role) {
      return new Response(JSON.stringify({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email, password, and role are required fields'
        }
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Validate email format
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

    // Validate password strength
    if (password.length < 6) {
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

    // Validate role
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

    // Check if user with this email already exists
    const existingUsersResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey
      }
    });

    if (existingUsersResponse.ok) {
      const existingUsers = await existingUsersResponse.json();
      const userExists = existingUsers.users && existingUsers.users.some((user: any) => user.email === email);
      if (userExists) {
        return new Response(JSON.stringify({
          error: {
            code: 'USER_EXISTS',
            message: 'A user with this email address already exists'
          }
        }), {
          status: 409,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Create the user using Supabase Auth Admin API
    const createUserResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email,
        password: password,
        email_confirm: true, // Auto-confirm the email
        user_metadata: {
          role: role,
          created_by: currentUser.id,
          created_at: new Date().toISOString()
        }
      })
    });

    if (!createUserResponse.ok) {
      const errorData = await createUserResponse.text();
      return new Response(JSON.stringify({
        error: {
          code: 'USER_CREATION_FAILED',
          message: `Failed to create user: ${errorData}`
        }
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const newUser = await createUserResponse.json();
    if (!newUser || !newUser.id) {
      return new Response(JSON.stringify({
        error: {
          code: 'USER_CREATION_FAILED',
          message: 'User creation failed - no user data returned'
        }
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Create the user profile in the database
    const profileCreateResponse = await fetch(`${supabaseUrl}/rest/v1/user_profiles`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        id: newUser.id,
        email: email,
        role: role,
        created_at: new Date().toISOString(),
        last_sign_in_at: null
      })
    });

    if (!profileCreateResponse.ok) {
      // If profile creation fails, clean up the auth user
      await fetch(`${supabaseUrl}/auth/v1/admin/users/${newUser.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': supabaseServiceKey
        }
      });
      
      const profileError = await profileCreateResponse.text();
      return new Response(JSON.stringify({
        error: {
          code: 'PROFILE_CREATION_FAILED',
          message: `Failed to create user profile: ${profileError}`
        }
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Log the action in audit log
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
        action: 'CREATE_USER',
        target_type: 'user',
        target_id: newUser.id,
        details: {
          email: email,
          role: role,
          created_at: new Date().toISOString()
        },
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
          id: newUser.id,
          email: email,
          role: role,
          created_at: newUser.created_at
        },
        message: `User ${email} created successfully with role ${role}`
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Create user error:', error);
    
    const errorResponse = {
      error: {
        code: 'FUNCTION_ERROR',
        message: error.message || 'An unexpected error occurred while creating the user'
      }
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});