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
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        const bucketName = 'fire-station-room-photos';
        const storageUrl = `${supabaseUrl}/storage/v1/bucket`;

        // Prepare bucket configuration
        const bucketConfig = {
            id: bucketName,
            name: bucketName,
            public: true,
            allowed_mime_types: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
            file_size_limit: 10485760 // 10MB
        };

        // Create bucket using Storage API
        const createResponse = await fetch(storageUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'Content-Type': 'application/json',
                'apikey': serviceRoleKey
            },
            body: JSON.stringify(bucketConfig)
        });

        const responseData = await createResponse.json();

        if (!createResponse.ok && responseData.message !== 'Bucket already exists') {
            console.error('Bucket creation error:', responseData);
            throw new Error(responseData.error || responseData.message || 'Failed to create bucket');
        }

        // Create public access policies for the bucket
        const policyQueries = [
            // Allow public to view objects in this bucket
            `
            CREATE POLICY "Public can view room photos" ON storage.objects
            FOR SELECT TO public
            USING (bucket_id = '${bucketName}');
            `,
            // Allow authenticated users to insert objects
            `
            CREATE POLICY "Authenticated can upload room photos" ON storage.objects
            FOR INSERT TO authenticated
            WITH CHECK (bucket_id = '${bucketName}');
            `,
            // Allow authenticated users to update their own objects
            `
            CREATE POLICY "Authenticated can update own room photos" ON storage.objects
            FOR UPDATE TO authenticated
            USING (bucket_id = '${bucketName}' AND auth.uid() = owner);
            `,
            // Allow authenticated users to delete their own objects
            `
            CREATE POLICY "Authenticated can delete own room photos" ON storage.objects
            FOR DELETE TO authenticated
            USING (bucket_id = '${bucketName}' AND auth.uid() = owner);
            `
        ];

        const policyResults = [];
        for (const query of policyQueries) {
            try {
                const policyResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'Content-Type': 'application/json',
                        'apikey': serviceRoleKey
                    },
                    body: JSON.stringify({ query })
                });

                if (policyResponse.ok) {
                    policyResults.push({ success: true });
                } else {
                    const errorData = await policyResponse.text();
                    console.log('Policy creation note:', errorData);
                    policyResults.push({ success: false, note: 'Policy may already exist' });
                }
            } catch (err) {
                console.log('Policy creation note:', err);
                policyResults.push({ success: false, note: 'Policy may already exist' });
            }
        }

        return new Response(JSON.stringify({
            success: true,
            message: 'Bucket created and configured successfully',
            bucketName: bucketName,
            bucketConfig: bucketConfig,
            policyResults: policyResults
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Error in create-room-photos-bucket:', error);
        
        const errorResponse = {
            error: {
                code: 'BUCKET_CREATION_ERROR',
                message: error.message || 'An error occurred while creating the bucket'
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
