// Debug script to check data loading logic
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yhrecxzygcapozirquzw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlocmVjeHp5Z2NhcG96aXJxdXp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1NDMzMjQsImV4cCI6MjA3NDExOTMyNH0.RelugXX7SEYFzd6OG3U0S49GECJZIMKVyvYhpQ8CvIE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugDataLoading() {
  try {
    console.log('🔍 Debugging vehicle assignment data loading...');
    
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const selectedDate = todayStr; // Simulate the component's selectedDate
    
    console.log('📅 Today:', todayStr);
    console.log('🎯 Selected date:', selectedDate);
    
    // Simulate the component's logic
    const datesToCheck = [];
    datesToCheck.push(selectedDate);
    
    // Check last 30 days (most recent first)
    for (let i = 0; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      if (dateStr !== selectedDate) {
        datesToCheck.push(dateStr);
      }
    }
    
    console.log('📋 Dates to check (first 5):', datesToCheck.slice(0, 5));
    console.log('📊 Total dates to check:', datesToCheck.length);
    
    let allFoundAssignments = [];
    let foundDataForSelectedDate = false;
    
    // Check each date (like the component does)
    for (const checkDate of datesToCheck.slice(0, 5)) { // Check first 5 dates for debugging
      console.log(`\n🔍 Checking date: ${checkDate}`);
      
      try {
        const { data: assignmentsData, error: fetchError } = await supabase
          .from('vehicle_assignments')
          .select('*')
          .eq('assignment_date', checkDate)
          .order('call_sign', { ascending: true });

        if (fetchError) {
          console.log(`❌ Error for ${checkDate}:`, fetchError.message);
        } else if (assignmentsData && assignmentsData.length > 0) {
          console.log(`✅ Found ${assignmentsData.length} assignments for ${checkDate}`);
          console.log(`📋 Sample assignment:`, assignmentsData[0]);
          
          const assignmentsWithDate = assignmentsData.map((assignment) => ({
            ...assignment,
            assignment_date: checkDate
          }));
          
          allFoundAssignments = allFoundAssignments.concat(assignmentsWithDate);
          
          if (checkDate === selectedDate) {
            foundDataForSelectedDate = true;
            console.log(`🎯 Found data for selected date!`);
          }
        } else {
          console.log(`ℹ️ No data found for ${checkDate}`);
        }
      } catch (error) {
        console.log(`⚠️ Exception for ${checkDate}:`, error.message);
      }
    }
    
    console.log('\n📈 Summary:');
    console.log(`Total assignments found: ${allFoundAssignments.length}`);
    console.log(`Found data for selected date: ${foundDataForSelectedDate}`);
    console.log(`Selected date: ${selectedDate}`);
    
    if (allFoundAssignments.length > 0) {
      // Group by vehicle_id and keep most recent (like component does)
      const latestByVehicle = {};
      
      allFoundAssignments.forEach((assignment) => {
        const vehicleId = assignment.vehicle_id;
        const currentUpdateTime = assignment.updated_at || assignment.created_at;
        const existingUpdateTime = latestByVehicle[vehicleId]?.updated_at || latestByVehicle[vehicleId]?.created_at;
        
        if (!latestByVehicle[vehicleId] || currentUpdateTime > existingUpdateTime) {
          latestByVehicle[vehicleId] = assignment;
        }
      });
      
      const latestAssignments = Object.values(latestByVehicle);
      console.log(`📊 Latest assignments by vehicle: ${latestAssignments.length}`);
      
      // Check if we have data for the selected date
      const hasSelectedDateData = latestAssignments.some(assignment => assignment.assignment_date === selectedDate);
      console.log(`✅ Has data for selected date: ${hasSelectedDateData}`);
      
      if (hasSelectedDateData || foundDataForSelectedDate) {
        console.log('🎉 WOULD USE FOUND DATA - SUCCESS!');
      } else {
        console.log('⚠️ WOULD USE DEFAULT VALUES - No recent data found');
      }
    } else {
      console.log('⚠️ WOULD USE DEFAULT VALUES - No assignment data found');
    }
    
  } catch (error) {
    console.error('💥 Debug script failed:', error);
  }
}

debugDataLoading();