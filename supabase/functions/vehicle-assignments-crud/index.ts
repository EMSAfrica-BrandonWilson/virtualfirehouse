import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const { action, date, assignments } = await req.json();
    console.log(`Vehicle assignments CRUD - Action: ${action}, Date: ${date}, Assignments count: ${assignments?.length || 0}`);

    // Get the authenticated user
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('No authorization header provided');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error('User authentication error:', userError);
      throw new Error('User not authenticated');
    }

    const userId = user.id;
    console.log(`Authenticated user: ${userId}`);

    let response;

    if (action === 'get') {
      // Get assignments for a specific date
      console.log(`Getting assignments for date: ${date}`);
      
      const { data, error } = await supabase
        .from('vehicle_assignments')
        .select('*')
        .eq('assignment_date', date)
        .order('call_sign', { ascending: true });

      if (error) {
        console.error('Error getting assignments:', error);
        throw new Error(`Failed to get assignments: ${error.message}`);
      }

      console.log(`Found ${data?.length || 0} assignments for date ${date}`);
      response = { data: data || [] };

    } else if (action === 'save') {
      // Save assignments for a specific date
      if (!assignments || !Array.isArray(assignments)) {
        throw new Error('Assignments array is required for save action');
      }

      console.log(`Saving ${assignments.length} assignments for date: ${date}`);
      const results = [];

      for (const assignment of assignments) {
        try {
          console.log(`Processing assignment for vehicle ${assignment.vehicle_id} (${assignment.call_sign})`);

          // Check if assignment already exists for this date and vehicle
          const { data: existingAssignment, error: checkError } = await supabase
            .from('vehicle_assignments')
            .select('id')
            .eq('assignment_date', date)
            .eq('vehicle_id', assignment.vehicle_id)
            .single();

          if (checkError && checkError.code !== 'PGRST116') {
            console.error(`Error checking existing assignment: ${checkError.message}`);
            results.push({ 
              action: 'error', 
              vehicle_id: assignment.vehicle_id,
              error: `Check failed: ${checkError.message}`
            });
            continue;
          }

          const assignmentData = {
            assignment_date: date,
            vehicle_id: assignment.vehicle_id,
            call_sign: assignment.call_sign,
            vehicle_type: assignment.vehicle_type,
            vehicle_make: assignment.vehicle_make,
            vehicle_model: assignment.vehicle_model,
            status: assignment.status,
            readiness: assignment.readiness,
            station_assignment: assignment.station_assignment,
            crew_members: assignment.crew_members || '',
            last_check_time: assignment.last_check || '08:00:00',
            is_workshop: assignment.station_assignment === 'In Workshop',
            updated_by: userId
          };

          if (existingAssignment) {
            // Update existing assignment
            console.log(`Updating existing assignment ID: ${existingAssignment.id}`);
            
            const { data: updatedData, error: updateError } = await supabase
              .from('vehicle_assignments')
              .update(assignmentData)
              .eq('id', existingAssignment.id)
              .select()
              .single();

            if (updateError) {
              console.error(`Update failed: ${updateError.message}`);
              results.push({ 
                action: 'error', 
                vehicle_id: assignment.vehicle_id,
                error: `Update failed: ${updateError.message}`
              });
            } else {
              console.log(`Successfully updated assignment for vehicle ${assignment.vehicle_id}`);
              results.push({ 
                action: 'updated', 
                assignment: updatedData,
                vehicle_id: assignment.vehicle_id 
              });
            }
          } else {
            // Create new assignment
            console.log(`Creating new assignment for vehicle ${assignment.vehicle_id}`);
            
            const createData = {
              ...assignmentData,
              created_by: userId
            };

            const { data: createdData, error: createError } = await supabase
              .from('vehicle_assignments')
              .insert(createData)
              .select()
              .single();

            if (createError) {
              console.error(`Create failed: ${createError.message}`);
              results.push({ 
                action: 'error', 
                vehicle_id: assignment.vehicle_id,
                error: `Create failed: ${createError.message}`
              });
            } else {
              console.log(`Successfully created assignment for vehicle ${assignment.vehicle_id}`);
              results.push({ 
                action: 'created', 
                assignment: createdData,
                vehicle_id: assignment.vehicle_id 
              });
            }
          }
        } catch (error) {
          console.error(`Unexpected error processing assignment ${assignment.vehicle_id}:`, error);
          results.push({ 
            action: 'error', 
            vehicle_id: assignment.vehicle_id,
            error: error.message || 'Unexpected error'
          });
        }
      }

      const summary = {
        total: assignments.length,
        created: results.filter(r => r.action === 'created').length,
        updated: results.filter(r => r.action === 'updated').length,
        errors: results.filter(r => r.action === 'error').length
      };
      
      console.log('Save operation completed:', summary);
      response = { data: results, summary };

    } else {
      throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('Vehicle assignments CRUD error:', error);
    
    const errorResponse = { 
      error: error.message || 'An unexpected error occurred',
      timestamp: new Date().toISOString()
    };
    
    return new Response(JSON.stringify(errorResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});