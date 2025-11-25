// Debug script to check the exact mapping process
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yhrecxzygcapozirquzw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlocmVjeHp5Z2NhcG96aXJxdXp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1NDMzMjQsImV4cCI6MjA3NDExOTMyNH0.RelugXX7SEYFzd6OG3U0S49GECJZIMKVyvYhpQ8CvIE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugMappingProcess() {
  try {
    console.log('🔍 Debugging the exact mapping process used by the component...');
    
    const today = new Date().toISOString().split('T')[0];
    console.log('📅 Today:', today);
    
    // Step 1: Get vehicles (like the component does)
    console.log('\n🚗 Step 1: Getting vehicles...');
    const { data: vehiclesData, error: vehiclesError } = await supabase.functions.invoke('vehicle-crud', {
      method: 'GET'
    });
    
    if (vehiclesError) {
      console.error('❌ Failed to get vehicles:', vehiclesError);
      return;
    }
    
    const vehicles = vehiclesData?.data || [];
    console.log(`✅ Found ${vehicles.length} vehicles`);
    console.log('📝 Sample vehicle structure:');
    if (vehicles.length > 0) {
      console.log(JSON.stringify(vehicles[0], null, 2));
    }
    
    // Step 2: Get assignments for today (like the component does)
    console.log('\n📋 Step 2: Getting assignments for today...');
    const { data: assignmentsData, error: assignmentsError } = await supabase
      .from('vehicle_assignments')
      .select('*')
      .eq('assignment_date', today)
      .order('call_sign', { ascending: true });
    
    if (assignmentsError) {
      console.error('❌ Failed to get assignments:', assignmentsError);
      return;
    }
    
    const assignments = assignmentsData || [];
    console.log(`✅ Found ${assignments.length} assignments for ${today}`);
    console.log('📝 Sample assignment structure:');
    if (assignments.length > 0) {
      console.log(JSON.stringify(assignments[0], null, 2));
    }
    
    // Step 3: Simulate the exact mapping process
    console.log('\n🔄 Step 3: Simulating the mapping process...');
    
    const vehicleAssignments = vehicles.map((vehicle) => {
      const existingAssignment = assignments.find((assignment) => assignment.vehicle_id === vehicle.id);
      
      const mappedAssignment = {
        id: vehicle.id,
        call_sign: vehicle.call_sign_name || 'N/A',
        vehicle_type: vehicle.vehicle_type_name || 'N/A',
        vehicle_make: vehicle.vehicle_make_name || 'N/A',
        vehicle_model: vehicle.vehicle_model || 'N/A',
        vehicle_id: vehicle.id,
        status: existingAssignment?.status || 'In Service',
        readiness: existingAssignment?.readiness || 'Operational',
        station_assignment: existingAssignment?.station_assignment || 'Main Fire Station',
        crew_members: existingAssignment?.crew_members || '',
        last_check: existingAssignment?.last_check_time || '08:00:00',
        created_at: existingAssignment?.created_at,
        updated_at: existingAssignment?.updated_at,
        is_database_record: !!existingAssignment,
        assignment_date: today
      };
      
      return mappedAssignment;
    });
    
    console.log(`✅ Mapped ${vehicleAssignments.length} vehicle assignments`);
    
    // Step 4: Check for assignments with database records
    const assignmentsWithData = vehicleAssignments.filter(assignment => assignment.is_database_record);
    console.log(`📊 Assignments with database data: ${assignmentsWithData.length}`);
    
    if (assignmentsWithData.length > 0) {
      console.log('🎯 Sample assignment with database data:');
      console.log(JSON.stringify(assignmentsWithData[0], null, 2));
      
      console.log('\n✅ This assignment should be showing in the form!');
      console.log(`Status: ${assignmentsWithData[0].status}`);
      console.log(`Readiness: ${assignmentsWithData[0].readiness}`);
      console.log(`Station: ${assignmentsWithData[0].station_assignment}`);
    } else {
      console.log('⚠️ No assignments found with database data');
      console.log('This explains why the form shows default values!');
    }
    
    // Step 5: Check for potential mapping issues
    console.log('\n🔍 Step 5: Checking for mapping issues...');
    
    // Check if vehicle IDs match
    const vehicleIds = vehicles.map(v => v.id);
    const assignmentVehicleIds = assignments.map(a => a.vehicle_id);
    
    console.log(`Vehicle IDs: ${vehicleIds.slice(0, 5)}...`);
    console.log(`Assignment Vehicle IDs: ${assignmentVehicleIds.slice(0, 5)}...`);
    
    // Find assignments that don't match any vehicle
    const unmatchedAssignments = assignments.filter(assignment => 
      !vehicleIds.includes(assignment.vehicle_id)
    );
    
    if (unmatchedAssignments.length > 0) {
      console.log(`⚠️ Found ${unmatchedAssignments.length} unmatched assignments`);
      console.log('Unmatched assignment vehicle IDs:', unmatchedAssignments.map(a => a.vehicle_id));
    } else {
      console.log('✅ All assignments match vehicles');
    }
    
  } catch (error) {
    console.error('💥 Debug script failed:', error);
  }
}

debugMappingProcess();