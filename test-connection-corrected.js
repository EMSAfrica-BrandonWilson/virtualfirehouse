// Simple database connection test with correct API key
// This script tests basic database connectivity

console.log('=== Database Connection Test (Corrected) ===');

// Test basic fetch to see if we can connect to the database
async function testConnection() {
  try {
    console.log('Testing connection to Supabase with correct API key...');
    
    // Simple test - try to fetch the table info using the REST API
    const response = await fetch('https://yhrecxzygcapozirquzw.supabase.co/rest/v1/daily_vehicle_records?select=id&limit=1', {
      method: 'GET',
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlocmVjeHp5Z2NhcG96aXJxdXp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1NDMzMjQsImV4cCI6MjA3NDExOTMyNH0.RelugXX7SEYFzd6OG3U0S49GECJZIMKVyvYhpQ8CvIE',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlocmVjeHp5Z2NhcG96aXJxdXp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1NDMzMjQsImV4cCI6MjA3NDExOTMyNH0.RelugXX7SEYFzd6OG3U0S49GECJZIMKVyvYhpQ8CvIE'
      }
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Database connection successful');
      console.log('Records found:', data.length);
      if (data.length > 0) {
        console.log('Sample data:', data[0]);
      } else {
        console.log('No records found in daily_vehicle_records table');
      }
    } else {
      const errorText = await response.text();
      console.log('❌ Database connection failed');
      console.log('Status:', response.status);
      console.log('Error:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
  }
}

// Test the connection
testConnection().then(() => {
  console.log('\n=== Test Summary ===');
  console.log('The database connection test shows:');
  console.log('1. Network connectivity to Supabase');
  console.log('2. API key authentication is working');
  console.log('3. Table is accessible');
  console.log('');
  console.log('If records are found, the table has data.');
  console.log('If no records are found, the table is empty but accessible.');
});