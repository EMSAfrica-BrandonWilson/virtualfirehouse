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
        const { imageId } = await req.json();

        if (!imageId) {
            throw new Error('Image ID is required');
        }

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

        // Check if user has admin role (administrator or system_admin)
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

        // Get image details before deletion
        const imageResponse = await fetch(`${supabaseUrl}/rest/v1/page_images?id=eq.${imageId}`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            }
        });

        if (!imageResponse.ok) {
            throw new Error('Failed to fetch image details');
        }

        const images = await imageResponse.json();
        if (!images || images.length === 0) {
            throw new Error('Image not found');
        }

        const image = images[0];
        
        // Extract filename from URL
        const urlParts = image.image_url.split('/');
        const fileName = urlParts[urlParts.length - 1];

        // Delete from storage
        const deleteStorageResponse = await fetch(`${supabaseUrl}/storage/v1/object/page-images/${fileName}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'Content-Type': 'application/json'
            }
        });

        if (!deleteStorageResponse.ok) {
            console.warn('Failed to delete from storage, continuing with database deletion');
        }

        // Delete from database
        const deleteDbResponse = await fetch(`${supabaseUrl}/rest/v1/page_images?id=eq.${imageId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            }
        });

        if (!deleteDbResponse.ok) {
            const errorText = await deleteDbResponse.text();
            throw new Error(`Database deletion failed: ${errorText}`);
        }

        return new Response(JSON.stringify({
            data: {
                message: 'Image deleted successfully',
                deletedImage: image
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Delete page image error:', error);

        const errorResponse = {
            error: {
                code: 'DELETE_PAGE_IMAGE_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});