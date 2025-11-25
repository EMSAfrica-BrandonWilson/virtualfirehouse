Deno.serve(async (req: Request) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Allow-Credentials': 'false'
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const method = req.method;
    const requestData = method !== 'GET' ? await req.json() : null;

    // GET: Fetch staff data by staff_id across all tables
    if (method === 'GET') {
      const url = new URL(req.url);
      const staffId = url.searchParams.get('staff_id');

      if (!staffId) {
        return new Response(JSON.stringify({ error: { message: 'staff_id is required' } }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Fetch from all tables
      const [basicRes, addressRes, docsRes, trainingRes, achievementsRes, disciplinaryRes, contactRes] = await Promise.all([
        fetch(`${supabaseUrl}/rest/v1/staff_basic_info?staff_id=eq.${staffId}&select=*,operational_shifts(name)`, {
          headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
        }),
        fetch(`${supabaseUrl}/rest/v1/staff_addresses?staff_id=eq.${staffId}`, {
          headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
        }),
        fetch(`${supabaseUrl}/rest/v1/staff_document_expiry?staff_id=eq.${staffId}`, {
          headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
        }),
        fetch(`${supabaseUrl}/rest/v1/staff_training_records?staff_id=eq.${staffId}`, {
          headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
        }),
        fetch(`${supabaseUrl}/rest/v1/staff_achievements?staff_id=eq.${staffId}`, {
          headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
        }),
        fetch(`${supabaseUrl}/rest/v1/staff_disciplinary_records?staff_id=eq.${staffId}`, {
          headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
        }),
        fetch(`${supabaseUrl}/rest/v1/staff_emergency_contacts?staff_id=eq.${staffId}`, {
          headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
        })
      ]);

      const [basic, address, docs, training, achievements, disciplinary, contact] = await Promise.all([
        basicRes.json(),
        addressRes.json(),
        docsRes.json(),
        trainingRes.json(),
        achievementsRes.json(),
        disciplinaryRes.json(),
        contactRes.json()
      ]);

      return new Response(JSON.stringify({
        data: {
          basic: basic[0] || null,
          address: address[0] || null,
          documents: docs || [],
          training: training || [],
          achievements: achievements || [],
          disciplinary: disciplinary || [],
          contact: contact[0] || null
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // POST: Handle action-based requests (create, read, update)
    if (method === 'POST') {
      const { action, table, data, staff_id } = requestData;

      // Handle READ action (single record)
      if (action === 'read') {
        if (!staff_id) {
          throw new Error('staff_id is required for read action');
        }

        const response = await fetch(`${supabaseUrl}/rest/v1/${table}?staff_id=eq.${staff_id}&select=*`, {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          }
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Failed to read record');
        }

        return new Response(JSON.stringify({ data: result[0] || null }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Handle LIST action (all records for a staff_id)
      if (action === 'list') {
        if (!staff_id) {
          throw new Error('staff_id is required for list action');
        }

        const response = await fetch(`${supabaseUrl}/rest/v1/${table}?staff_id=eq.${staff_id}&select=*&order=created_at.desc`, {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          }
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Failed to list records');
        }

        return new Response(JSON.stringify({ data: result }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Handle CREATE action
      if (action === 'create') {
        const response = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(data)
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Failed to create record');
        }

        return new Response(JSON.stringify({ data: result[0] || result }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Handle UPDATE action
      if (action === 'update') {
        // For multi-record tables, use the record's primary key (id or record_id)
        // For single-record tables, use staff_id
        const { staff_id: updateStaffId, id, record_id, ...updateData } = data;
        
        // Determine the primary key column and value
        let filterColumn, filterValue;
        
        if (id) {
          // Generic id field (e.g., contact_id, training_id, etc.)
          // Determine column name from table
          const idColumn = table === 'staff_emergency_contacts' ? 'contact_id' :
                          table === 'staff_training_records' ? 'training_id' :
                          table === 'staff_achievements' ? 'achievement_id' :
                          table === 'staff_disciplinary_records' ? 'disciplinary_id' :
                          table === 'staff_document_expiry' ? 'document_id' :
                          'id';
          filterColumn = idColumn;
          filterValue = id;
        } else if (record_id) {
          filterColumn = 'id';
          filterValue = record_id;
        } else if (updateStaffId) {
          filterColumn = 'staff_id';
          filterValue = updateStaffId;
        } else {
          throw new Error('Either id, record_id, or staff_id is required for update action');
        }

        const response = await fetch(`${supabaseUrl}/rest/v1/${table}?${filterColumn}=eq.${filterValue}`, {
          method: 'PATCH',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(updateData)
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Failed to update record');
        }

        return new Response(JSON.stringify({ data: result[0] || result }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Handle DELETE action
      if (action === 'delete') {
        const { id } = requestData;
        
        if (!id) {
          throw new Error('id is required for delete action');
        }

        // Determine the primary key column from table name
        const idColumn = table === 'staff_emergency_contacts' ? 'contact_id' :
                        table === 'staff_training_records' ? 'training_id' :
                        table === 'staff_achievements' ? 'achievement_id' :
                        table === 'staff_disciplinary_records' ? 'disciplinary_id' :
                        table === 'staff_document_expiry' ? 'document_id' :
                        'id';

        console.log(`DELETE operation: table=${table}, idColumn=${idColumn}, id=${id}`);

        const response = await fetch(`${supabaseUrl}/rest/v1/${table}?${idColumn}=eq.${id}`, {
          method: 'DELETE',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          }
        });

        if (!response.ok) {
          const error = await response.json();
          console.error(`DELETE failed: status=${response.status}, error=`, error);
          throw new Error(error.message || 'Failed to delete record');
        }

        console.log(`DELETE successful for ${table} with ${idColumn}=${id}`);

        return new Response(JSON.stringify({ data: { success: true } }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // If no action specified, return error
      throw new Error('Invalid action specified. Use create, read, list, update, or delete.');
    }

    // PUT: Update records
    if (method === 'PUT') {
      const { table, id, idColumn, data } = requestData;

      const response = await fetch(`${supabaseUrl}/rest/v1/${table}?${idColumn}=eq.${id}`, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update record');
      }

      return new Response(JSON.stringify({ data: { success: true } }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // DELETE: Delete records
    if (method === 'DELETE') {
      const { table, id, idColumn } = requestData;

      const response = await fetch(`${supabaseUrl}/rest/v1/${table}?${idColumn}=eq.${id}`, {
        method: 'DELETE',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete record');
      }

      return new Response(JSON.stringify({ data: { success: true } }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: { message: 'Method not allowed' } }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    const errorResponse = {
      error: {
        code: 'FUNCTION_ERROR',
        message: error.message
      }
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
