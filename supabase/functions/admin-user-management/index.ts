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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (req.method === 'GET') {
      // Get all users with their profiles
      const usersResponse = await fetch(`${supabaseUrl}/rest/v1/profiles?select=id,user_id,email,full_name,display_name,created_at&order=created_at.desc`, {
        headers: {
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': supabaseServiceKey,
          'Content-Type': 'application/json'
        }
      });

      if (!usersResponse.ok) {
        const errorData = await usersResponse.json();
        return new Response(
          JSON.stringify({ error: { code: 'DATABASE_ERROR', message: errorData.message || 'Failed to fetch users' } }), 
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const users = await usersResponse.json();
      return new Response(
        JSON.stringify({ data: users }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (req.method === 'PATCH') {
      // Update user display name
      const requestData = await req.json();
      const { user_id, display_name } = requestData;

      if (!user_id) {
        return new Response(
          JSON.stringify({ error: { code: 'VALIDATION_ERROR', message: 'user_id is required' } }), 
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Update the user profile
      const updateResponse = await fetch(`${supabaseUrl}/rest/v1/profiles?user_id=eq.${user_id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': supabaseServiceKey,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({ 
          display_name: display_name || null,
          updated_at: new Date().toISOString()
        })
      });

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        return new Response(
          JSON.stringify({ error: { code: 'DATABASE_ERROR', message: errorData.message || 'Failed to update user' } }), 
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const updatedUser = await updateResponse.json();
      
      if (!updatedUser || updatedUser.length === 0) {
        return new Response(
          JSON.stringify({ error: { code: 'USER_NOT_FOUND', message: 'User not found' } }), 
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ data: updatedUser[0] }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Method not allowed
    return new Response(
      JSON.stringify({ error: { code: 'METHOD_NOT_ALLOWED', message: 'Only GET and PATCH methods are allowed' } }), 
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