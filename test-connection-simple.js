// Simple database connection test
// This script tests basic database connectivity

console.log('=== Database Connection Test ===');

// Test basic fetch to see if we can connect to the database
async function testConnection() {
  try {
    console.log('Testing connection to Supabase...');
    
    // Simple test - try to fetch the table info using the REST API
    const response = await fetch('https://yhrecxzygcapozirquzw.supabase.co/rest/v1/daily_vehicle_records?select=id&limit=1', {
      method: 'GET',
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InloZWN4enl5Z2NhcG96aXJxdXp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE2MzQ1NDIsImV4cCI6MjA0NzIxMDU0Mn0.3K-Eq0nKG0dLMoEr0jI7E6n0dLx2t0n0q0n0q0n0q0n0',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InloZWN4enl5Z2NhcG96aXJxdXp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE2MzQ1NDIsImV4cCI6MjA0NzIxMDU0Mn0.3K-Eq0nKG0dLMoEr0jI7E6n0dLx2t0n0q0n0q0n0q0n0'
      }
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Database connection successful');
      console.log('Records found:', data.length);
      console.log('Sample data:', data[0]);
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
  console.log('2. API key authentication');
  console.log('3. Table accessibility');
  console.log('');
  console.log('If this test passes, the issue is likely in the application code.');
  console.log('If this test fails, there may be network or authentication issues.');
});