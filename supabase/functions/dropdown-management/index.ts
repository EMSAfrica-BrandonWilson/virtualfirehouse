const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Allow-Credentials': 'false'
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const { method, url } = req;
    const urlObj = new URL(url);
    const path = urlObj.pathname.split('/').pop();
    const urlParams = Object.fromEntries(urlObj.searchParams.entries());

    if (method === 'GET') {
      // Get all dropdown configurations
      const configsResponse = await fetch(`${supabaseUrl}/rest/v1/dropdown_configurations?is_active=eq.true&order=display_name`, {
        headers: {
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': supabaseServiceKey,
          'Content-Type': 'application/json'
        }
      });

      if (!configsResponse.ok) {
        throw new Error(`Failed to fetch configurations: ${configsResponse.statusText}`);
      }

      const configs = await configsResponse.json();

      // Get options for each configuration
      const configsWithOptions = [];
      for (const config of configs) {
        const optionsResponse = await fetch(`${supabaseUrl}/rest/v1/dropdown_options?dropdown_id=eq.${config.id}&is_active=eq.true&order=display_text.asc`, {
          headers: {
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'apikey': supabaseServiceKey,
            'Content-Type': 'application/json'
          }
        });

        let options = [];
        if (optionsResponse.ok) {
          options = await optionsResponse.json();
        }

        configsWithOptions.push({
          ...config,
          options: options || []
        });
      }

      return new Response(JSON.stringify({ data: configsWithOptions }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (method === 'POST') {
      const requestData = await req.json();
      const { action } = requestData;

      if (action === 'create_config') {
        const { config_name, display_name, description } = requestData;
        
        const response = await fetch(`${supabaseUrl}/rest/v1/dropdown_configurations`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'apikey': supabaseServiceKey,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            dropdown_name: config_name,
            display_name: display_name,
            description: description
          })
        });

        if (!response.ok) {
          throw new Error(`Failed to create configuration: ${response.statusText}`);
        }

        const config = await response.json();
        return new Response(JSON.stringify({ data: config }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (action === 'add_option') {
        const { dropdown_id, option_value, display_text, sort_order } = requestData;
        
        const response = await fetch(`${supabaseUrl}/rest/v1/dropdown_options`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'apikey': supabaseServiceKey,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            dropdown_id,
            option_value,
            display_text,
            sort_order
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          if (response.status === 409 || errorText.includes('duplicate') || errorText.includes('unique')) {
            throw new Error('An option with this name already exists. Please use a different name.');
          }
          throw new Error(`Failed to add option: ${response.statusText}`);
        }

        const option = await response.json();
        return new Response(JSON.stringify({ data: option }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    if (method === 'PUT') {
      const requestData = await req.json();
      const { action } = requestData;

      if (action === 'update_option') {
        const { option_id, option_value, display_text, sort_order, is_active } = requestData;
        
        const response = await fetch(`${supabaseUrl}/rest/v1/dropdown_options?id=eq.${option_id}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'apikey': supabaseServiceKey,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            option_value,
            display_text,
            sort_order,
            is_active
          })
        });

        if (!response.ok) {
          throw new Error(`Failed to update option: ${response.statusText}`);
        }

        const option = await response.json();
        return new Response(JSON.stringify({ data: option }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    if (method === 'DELETE') {
      const requestData = await req.json();
      const { action } = requestData;

      if (action === 'delete_option') {
        const { option_id } = requestData;
        
        const response = await fetch(`${supabaseUrl}/rest/v1/dropdown_options?id=eq.${option_id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'apikey': supabaseServiceKey,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to delete option: ${response.statusText}`);
        }

        return new Response(JSON.stringify({ message: 'Option deleted successfully' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({
      error: {
        code: 'DROPDOWN_MANAGEMENT_ERROR',
        message: error.message
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
