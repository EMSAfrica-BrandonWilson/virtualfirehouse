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
        const { imageData, fileName, pageName } = await req.json();

        if (!imageData || !fileName || !pageName) {
            throw new Error('Image data, filename, and page name are required');
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

        // Extract base64 data from data URL
        const base64Data = imageData.split(',')[1];
        const mimeType = imageData.split(';')[0].split(':')[1];

        // Validate mime type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(mimeType)) {
            throw new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.');
        }

        // Convert base64 to binary
        const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

        // Validate file size (5MB max)
        if (binaryData.length > 5242880) {
            throw new Error('File size exceeds 5MB limit');
        }

        // Generate unique filename with timestamp
        const timestamp = Date.now();
        const uniqueFileName = `${pageName}_${timestamp}_${fileName}`;

        // Check if page already has an active image and deactivate it
        const existingImageResponse = await fetch(`${supabaseUrl}/rest/v1/page_images?page_name=eq.${pageName}&is_active=eq.true`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            }
        });

        if (existingImageResponse.ok) {
            const existingImages = await existingImageResponse.json();
            if (existingImages && existingImages.length > 0) {
                // Deactivate existing images for this page
                await fetch(`${supabaseUrl}/rest/v1/page_images?page_name=eq.${pageName}`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        is_active: false,
                        updated_at: new Date().toISOString()
                    })
                });
            }
        }

        // Upload to Supabase Storage
        const uploadResponse = await fetch(`${supabaseUrl}/storage/v1/object/page-images/${uniqueFileName}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'Content-Type': mimeType,
                'x-upsert': 'true'
            },
            body: binaryData
        });

        if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            throw new Error(`Upload failed: ${errorText}`);
        }

        // Get public URL
        const publicUrl = `${supabaseUrl}/storage/v1/object/public/page-images/${uniqueFileName}`;

        // Save image metadata to database
        const insertResponse = await fetch(`${supabaseUrl}/rest/v1/page_images`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                page_name: pageName,
                image_url: publicUrl,
                image_name: fileName,
                uploaded_by: userId,
                file_size: binaryData.length,
                mime_type: mimeType,
                is_active: true
            })
        });

        if (!insertResponse.ok) {
            const errorText = await insertResponse.text();
            throw new Error(`Database insert failed: ${errorText}`);
        }

        const imageData_response = await insertResponse.json();

        return new Response(JSON.stringify({
            data: {
                publicUrl,
                image: imageData_response[0],
                message: 'Image uploaded successfully'
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Image upload error:', error);

        const errorResponse = {
            error: {
                code: 'IMAGE_UPLOAD_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});