
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables from .env file
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkTypes() {
  const { data, error } = await supabase
    .from('02_admin_register_fd2_types')
    .select('*')
    .limit(10)
  
  if (error) {
    console.error('Error:', error)
  } else {
    console.log('Types:', data)
  }

  const { data: locations, error: locError } = await supabase
    .from('02_admin_register_fd85_equipment_location')
    .select('*')
    .limit(10)
    
  if (locError) {
      console.error('Error Loc:', locError)
  } else {
      console.log('Locations:', locations)
  }
}

checkTypes()
