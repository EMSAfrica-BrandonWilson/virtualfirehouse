// Debug script to check vehicle-crud function and data loading
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yhrecxzygcapozirquzw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlocmVjeHp5Z2NhcG96aXJxdXp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1NDMzMjQsImV4cCI6MjA3NDExOTMyNH0.RelugXX7SEYFzd6OG3U0S49GECJZIMKVyvYhpQ8CvIE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugVehicleLoading() {
  try {
    console.log('🔍 Debugging vehicle loading process...');
    
    // Step 1: Try to get vehicles using the same method as the component
    console.log('\n📋 Step 1: Testing vehicle-crud function...');
    
    try {
      const { data: vehiclesData, error: vehiclesError } = await supabase.functions.invoke('vehicle-crud', {
        method: 'GET'
      });
      
      if (vehiclesError) {
        console.error('❌ Vehicle-crud function failed:', vehiclesError);
        console.log('Error details:', vehiclesError.message);
      } else {
        console.log('✅ Vehicle-crud function successful!');
        console.log(`Found ${vehiclesData?.data?.length || 0} vehicles`);
        if (vehiclesData?.data && vehiclesData.data.length > 0) {
          console.log('Sample vehicle:', vehiclesData.data[0]);
        }
      }
    } catch (functionError) {
      console.error('❌ Vehicle-crud function threw exception:', functionError.message);
      console.log('This might be why the component is not loading data!');
    }
    
    // Step 2: Try direct database query as backup
    console.log('\n🗄️ Step 2: Testing direct database query...');
    
    try {
      const { data: directVehicles, error: directError } = await supabase
        .from('vehicles')
        .select('*')
        .order('call_sign_name', { ascending: true });
      
      if (directError) {
        console.error('❌ Direct query failed:', directError);
      } else {
        console.log('✅ Direct query successful!');
        console.log(`Found ${directVehicles?.length || 0} vehicles`);
        if (directVehicles && directVehicles.length > 0) {
          console.log('Sample vehicle:', directVehicles[0]);
        }
      }
    } catch (directException) {
      console.error('❌ Direct query threw exception:', directException.message);
    }
    
    // Step 3: Check what assignments exist
    console.log('\n📊 Step 3: Checking existing assignments...');
    
    const today = new Date().toISOString().split('T')[0];
    const { data: assignmentsData, error: assignmentsError } = await supabase
      .from('vehicle_assignments')
      .select('*')
      .eq('assignment_date', today)
      .order('call_sign', { ascending: true });
    
    if (assignmentsError) {
      console.error('❌ Assignments query failed:', assignmentsError);
    } else {
      console.log('✅ Assignments query successful!');
      console.log(`Found ${assignmentsData?.length || 0} assignments for ${today}`);
      if (assignmentsData && assignmentsData.length > 0) {
        console.log('Sample assignment:', assignmentsData[0]);
      }
    }
    
    console.log('\n🎯 Summary:');
    console.log('If vehicle-crud function is failing but direct query works,');
    console.log('we need to update the component to use direct database calls.');
    
  } catch (error) {
    console.error('💥 Debug script failed:', error);
  }
}

debugVehicleLoading();