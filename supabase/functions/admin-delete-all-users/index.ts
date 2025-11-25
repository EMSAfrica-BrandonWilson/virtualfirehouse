Deno.serve(async (req: Request) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, DELETE, OPTIONS',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Allow-Credentials': 'false'
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (req.method === 'DELETE') {
      const requestData = await req.json();
      const { confirm_deletion } = requestData;

      // Safety check - require explicit confirmation
      if (confirm_deletion !== 'DELETE_ALL_USERS_CONFIRMED') {
        return new Response(
          JSON.stringify({ 
            error: { 
              code: 'CONFIRMATION_REQUIRED', 
              message: 'Deletion requires explicit confirmation' 
            } 
          }), 
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Starting user deletion process...');
      
      // Step 1: Get count of existing users before deletion
      const usersCountResponse = await fetch(`${supabaseUrl}/rest/v1/profiles?select=count()`, {
        headers: {
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': supabaseServiceKey,
          'Content-Type': 'application/json'
        }
      });

      let initialUserCount = 0;
      if (usersCountResponse.ok) {
        const countData = await usersCountResponse.json();
        initialUserCount = countData.length || 0;
      }

      console.log(`Found ${initialUserCount} users in profiles table`);

      // Step 2: Delete all records from profiles table first
      const deleteProfilesResponse = await fetch(`${supabaseUrl}/rest/v1/profiles`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': supabaseServiceKey,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({})
      });

      if (!deleteProfilesResponse.ok) {
        const errorData = await deleteProfilesResponse.json();
        console.error('Error deleting profiles:', errorData);
        return new Response(
          JSON.stringify({ 
            error: { 
              code: 'PROFILES_DELETE_ERROR', 
              message: errorData.message || 'Failed to delete user profiles' 
            } 
          }), 
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Successfully deleted all profiles');

      // Step 3: Get all users from auth.users table
      const authUsersResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
        headers: {
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': supabaseServiceKey,
          'Content-Type': 'application/json'
        }
      });

      if (!authUsersResponse.ok) {
        const errorData = await authUsersResponse.json();
        console.error('Error fetching auth users:', errorData);
        return new Response(
          JSON.stringify({ 
            error: { 
              code: 'AUTH_USERS_FETCH_ERROR', 
              message: errorData.message || 'Failed to fetch auth users' 
            } 
          }), 
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const authUsers = await authUsersResponse.json();
      const usersList = authUsers.users || [];
      
      console.log(`Found ${usersList.length} users in auth.users table`);

      // Step 4: Delete each user from auth.users table
      let deletedAuthUsers = 0;
      let authDeletionErrors = [];

      for (const user of usersList) {
        try {
          const deleteUserResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users/${user.id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${supabaseServiceKey}`,
              'apikey': supabaseServiceKey,
              'Content-Type': 'application/json'
            }
          });

          if (deleteUserResponse.ok) {
            deletedAuthUsers++;
            console.log(`Deleted user ${user.id} (${user.email})`);
          } else {
            const errorData = await deleteUserResponse.json();
            authDeletionErrors.push(`User ${user.email}: ${errorData.message || 'Unknown error'}`);
            console.error(`Failed to delete user ${user.id}:`, errorData);
          }
        } catch (error) {
          authDeletionErrors.push(`User ${user.email}: ${error.message}`);
          console.error(`Exception deleting user ${user.id}:`, error);
        }
      }

      // Step 5: Verify deletion by checking remaining users
      const verifyUsersResponse = await fetch(`${supabaseUrl}/rest/v1/profiles?select=count()`, {
        headers: {
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': supabaseServiceKey,
          'Content-Type': 'application/json'
        }
      });

      let remainingProfilesCount = 0;
      if (verifyUsersResponse.ok) {
        const verifyData = await verifyUsersResponse.json();
        remainingProfilesCount = verifyData.length || 0;
      }

      const verifyAuthResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
        headers: {
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': supabaseServiceKey,
          'Content-Type': 'application/json'
        }
      });

      let remainingAuthUsersCount = 0;
      if (verifyAuthResponse.ok) {
        const verifyAuthData = await verifyAuthResponse.json();
        remainingAuthUsersCount = (verifyAuthData.users || []).length;
      }

      // Prepare response
      const deletionResult = {
        success: true,
        summary: {
          initial_profiles_count: initialUserCount,
          initial_auth_users_count: usersList.length,
          deleted_auth_users: deletedAuthUsers,
          remaining_profiles: remainingProfilesCount,
          remaining_auth_users: remainingAuthUsersCount,
          auth_deletion_errors: authDeletionErrors
        },
        message: `Successfully deleted ${deletedAuthUsers} auth users and all profile records. ${authDeletionErrors.length > 0 ? `${authDeletionErrors.length} errors occurred.` : 'All operations completed successfully.'}`
      };

      console.log('User deletion process completed:', deletionResult);

      return new Response(
        JSON.stringify({ data: deletionResult }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Method not allowed
    return new Response(
      JSON.stringify({ 
        error: { 
          code: 'METHOD_NOT_ALLOWED', 
          message: 'Only DELETE method is allowed' 
        } 
      }), 
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Function error:', error);
    const errorResponse = {
      error: {
        code: 'FUNCTION_ERROR',
        message: error.message
      }
    };

    return new Response(
      JSON.stringify(errorResponse), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});