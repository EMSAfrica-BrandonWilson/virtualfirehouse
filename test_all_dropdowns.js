
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env file manually
const envPath = path.resolve(__dirname, '.env');
let supabaseUrl = '';
let supabaseKey = '';

if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split('\n').forEach(line => {
    if (line.startsWith('VITE_SUPABASE_URL=')) {
      supabaseUrl = line.split('=')[1].trim();
    }
    if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) {
      supabaseKey = line.split('=')[1].trim();
    }
  });
}

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or Anon Key in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAllDropdownsAccess() {
  console.log('Testing access to all dropdown tables...');

  try {
    console.log('Starting Promise.all...');
    const results = await Promise.all([
      supabase.from('02_admin_register_fd5_vehicle_call_signs').select('*'),
      supabase.from('02_admin_register_fd6_vehicle_types').select('*'),
      supabase.from('02_admin_register_fd7_vehicle_makes').select('*')
    ]);
    
    const [csRes, vtRes, vmRes] = results;

    console.log('--- Results ---');
    
    if (csRes.error) console.error('Call Signs Error:', csRes.error);
    else console.log('Call Signs Count:', csRes.data?.length);

    if (vtRes.error) console.error('Vehicle Types Error:', vtRes.error);
    else console.log('Vehicle Types Count:', vtRes.data?.length);

    if (vmRes.error) console.error('Vehicle Makes Error:', vmRes.error);
    else console.log('Vehicle Makes Count:', vmRes.data?.length);
    
    if (vmRes.data) {
        console.log('Sample Vehicle Make:', vmRes.data[0]);
    }

  } catch (err) {
    console.error('Unexpected error in Promise.all:', err);
  }
}

testAllDropdownsAccess();
