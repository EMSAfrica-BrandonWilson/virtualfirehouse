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
        const url = new URL(req.url);
        const pageName = url.searchParams.get('pageName');

        if (!pageName) {
            throw new Error('Page name is required');
        }

        // Get environment variables
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        // Get active image for the specified page
        const imageResponse = await fetch(`${supabaseUrl}/rest/v1/page_images?page_name=eq.${pageName}&is_active=eq.true&order=created_at.desc&limit=1`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            }
        });

        if (!imageResponse.ok) {
            const errorText = await imageResponse.text();
            throw new Error(`Failed to fetch image: ${errorText}`);
        }

        const images = await imageResponse.json();
        
        if (!images || images.length === 0) {
            return new Response(JSON.stringify({
                data: null,
                message: 'No active image found for this page'
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        const image = images[0];

        return new Response(JSON.stringify({
            data: {
                image,
                imageUrl: image.image_url
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Get page image error:', error);

        const errorResponse = {
            error: {
                code: 'GET_PAGE_IMAGE_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});