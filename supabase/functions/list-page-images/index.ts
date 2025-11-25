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
        // Get environment variables
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
        const userId = userData.id;

        // Check if user has admin role
        const adminCheckResponse = await fetch(`${supabaseUrl}/rest/v1/user_roles?user_id=eq.${userId}&role_name=in.(administrator,system_admin)`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            }
        });

        if (!adminCheckResponse.ok) {
            throw new Error('Failed to verify admin privileges');
        }

        const adminRoles = await adminCheckResponse.json();
        if (!adminRoles || adminRoles.length === 0) {
            throw new Error('Access denied: Administrator privileges required');
        }

        // Get query parameters for pagination
        const url = new URL(req.url);
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = parseInt(url.searchParams.get('limit') || '20');
        const offset = (page - 1) * limit;

        // Get all page images with pagination
        const imagesResponse = await fetch(`${supabaseUrl}/rest/v1/page_images?order=created_at.desc&limit=${limit}&offset=${offset}`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            }
        });

        if (!imagesResponse.ok) {
            const errorText = await imagesResponse.text();
            throw new Error(`Failed to fetch images: ${errorText}`);
        }

        const images = await imagesResponse.json();

        // Get total count for pagination
        const countResponse = await fetch(`${supabaseUrl}/rest/v1/page_images?select=count`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json',
                'Prefer': 'count=exact'
            }
        });

        let totalCount = 0;
        if (countResponse.ok) {
            const countHeader = countResponse.headers.get('content-range');
            if (countHeader) {
                totalCount = parseInt(countHeader.split('/')[1]) || 0;
            }
        }

        return new Response(JSON.stringify({
            data: {
                images,
                pagination: {
                    page,
                    limit,
                    total: totalCount,
                    pages: Math.ceil(totalCount / limit)
                }
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('List page images error:', error);

        const errorResponse = {
            error: {
                code: 'LIST_PAGE_IMAGES_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});