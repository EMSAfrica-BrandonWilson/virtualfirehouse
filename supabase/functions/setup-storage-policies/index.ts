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
        // Get the service role key
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        // This function should only be called by system administrators
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

        // Check if user has system_admin role
        const roleCheckResponse = await fetch(`${supabaseUrl}/rest/v1/user_roles?user_id=eq.${userId}&role_name=eq.system_admin`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            }
        });

        if (!roleCheckResponse.ok) {
            throw new Error('Failed to check user permissions');
        }

        const roleData = await roleCheckResponse.json();
        if (!roleData || roleData.length === 0) {
            throw new Error('Access denied: Only system administrators can manage storage policies');
        }

        // Setup storage policies using service role privileges
        const policySetupQueries = [
            // Enable RLS on storage.objects
            'ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;',
            
            // Drop existing policies if they exist
            'DROP POLICY IF EXISTS "Admin users can upload page images" ON storage.objects;',
            'DROP POLICY IF EXISTS "Admin users can update page images" ON storage.objects;', 
            'DROP POLICY IF EXISTS "Admin users can delete page images" ON storage.objects;',
            'DROP POLICY IF EXISTS "Public read access for page images" ON storage.objects;',
            
            // Create comprehensive storage policies for page-images bucket
            `CREATE POLICY "Public read access for page images" ON storage.objects
                FOR SELECT USING (bucket_id = 'page-images');`,
                
            `CREATE POLICY "Admin users can upload page images" ON storage.objects
                FOR INSERT 
                WITH CHECK (
                    bucket_id = 'page-images' 
                    AND auth.uid() IS NOT NULL
                    AND EXISTS (
                        SELECT 1 FROM public.user_roles 
                        WHERE user_id = auth.uid() 
                        AND role_name IN ('administrator', 'system_admin')
                    )
                );`,
                
            `CREATE POLICY "Admin users can update page images" ON storage.objects
                FOR UPDATE 
                USING (
                    bucket_id = 'page-images' 
                    AND auth.uid() IS NOT NULL
                    AND EXISTS (
                        SELECT 1 FROM public.user_roles 
                        WHERE user_id = auth.uid() 
                        AND role_name IN ('administrator', 'system_admin')
                    )
                );`,
                
            `CREATE POLICY "Admin users can delete page images" ON storage.objects
                FOR DELETE 
                USING (
                    bucket_id = 'page-images' 
                    AND auth.uid() IS NOT NULL
                    AND EXISTS (
                        SELECT 1 FROM public.user_roles 
                        WHERE user_id = auth.uid() 
                        AND role_name IN ('administrator', 'system_admin')
                    )
                );`
        ];

        const results = [];
        
        for (const query of policySetupQueries) {
            try {
                // Execute policy setup using direct SQL with service role
                const policyResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ sql: query })
                });

                if (policyResponse.ok) {
                    results.push({ query: query.substring(0, 50) + '...', status: 'success' });
                } else {
                    const errorText = await policyResponse.text();
                    results.push({ query: query.substring(0, 50) + '...', status: 'failed', error: errorText });
                }
            } catch (error) {
                results.push({ query: query.substring(0, 50) + '...', status: 'failed', error: error.message });
            }
        }

        // Also ensure bucket configuration is optimal
        const bucketUpdateResponse = await fetch(`${supabaseUrl}/storage/v1/bucket/page-images`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                public: true,
                file_size_limit: 5242880, // 5MB
                allowed_mime_types: ['image/jpeg', 'image/png', 'image/webp']
            })
        });

        let bucketUpdateStatus = 'success';
        if (!bucketUpdateResponse.ok) {
            const errorText = await bucketUpdateResponse.text();
            bucketUpdateStatus = `failed: ${errorText}`;
        }

        return new Response(JSON.stringify({
            data: {
                message: 'Storage policy setup completed',
                policyResults: results,
                bucketUpdate: bucketUpdateStatus,
                timestamp: new Date().toISOString()
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Storage policy setup error:', error);

        const errorResponse = {
            error: {
                code: 'STORAGE_POLICY_SETUP_FAILED',
                message: error.message,
                timestamp: new Date().toISOString()
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});