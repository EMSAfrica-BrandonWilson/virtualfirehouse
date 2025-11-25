// Ambient declaration to satisfy TypeScript when editing Supabase Edge Functions in IDEs
// These files run on Deno in production; the browser build does not include them.
// Declaring a loose type prevents "Cannot find name 'Deno'" diagnostics locally.
declare const Deno: any;