export { default as getSupabaseClient, isSupabaseFallback, resetSupabaseClient } from './supabase/client';

// Export the shared Supabase client used across the app.
// When env vars are missing, the client module returns a safe no-op client.
import getSupabaseClient from './supabase/client';
export const supabase = getSupabaseClient();
