import { createClient, SupabaseClient } from '@supabase/supabase-js';
// Fallback globals injected via Vite define
declare const __VITE_SUPABASE_URL__: string;
declare const __VITE_SUPABASE_ANON_KEY__: string;

let supabaseClient: SupabaseClient | null = null;
export let isSupabaseFallback = false;

function createNoopClient() {
  const error = { message: 'Supabase not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.' };
  const response = { data: null, error };

  // Thenable to mimic awaitable query builders
  const thenable = {
    then: (resolve: (value: any) => any) => resolve(response),
    catch: (_reject?: (reason: any) => any) => thenable,
    finally: (_onFinally?: () => any) => thenable
  } as any;

  // Chainable query builder mock matching Postgrest filter builder API
  const chain: any = {
    select: () => chain,
    update: () => chain,
    insert: () => chain,
    delete: () => chain,
    upsert: () => chain,
    order: () => chain,
    eq: () => chain,
    in: () => chain,
    ilike: () => chain,
    limit: () => chain,
    range: () => chain,
    maybeSingle: async () => response,
    single: async () => response,
    ...thenable
  };

  // Warn loudly when the fallback client is used so developers see it in devtools
  console.warn('[VFHouse] Using Supabase fallback client. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');

  return {
    auth: {
      async getUser() { return { data: { user: null }, error }; },
      async getSession() { return { data: { session: null }, error }; },
      async signInWithPassword() { return { data: null, error }; },
      async signUp() { return { data: null, error }; },
      async signOut() { return { error: null }; },
      onAuthStateChange: (_handler: any) => ({ data: { subscription: { unsubscribe: () => {} } } })
    },
    from() { return chain; },
    functions: { async invoke() { return response; } },
    storage: {},
    realtime: {}
  } as any;
}

/**
 * Get a singleton Supabase client instance.
 * Returns a no-op client when env vars are missing to avoid network calls and crashes.
 */
export function getSupabaseClient(): SupabaseClient {
  if (supabaseClient) return supabaseClient;

  const rawUrl = (import.meta?.env?.VITE_SUPABASE_URL ?? (__VITE_SUPABASE_URL__ || undefined)) as string | undefined;
  const rawKey = (import.meta?.env?.VITE_SUPABASE_ANON_KEY ?? (__VITE_SUPABASE_ANON_KEY__ || undefined)) as string | undefined;
  const url = (rawUrl || '').trim() || undefined;
  const key = (rawKey || '').trim() || undefined;

  // Debug logs to trace env detection at runtime
  try {
    console.info('[VFHouse] Env raw values', { rawUrlPreview: rawUrl?.slice(0, 30), rawKeyLen: rawKey?.length });
    const hasUrl = !!url;
    const hasKey = !!key;
    console.info('[VFHouse] Supabase env detection', { hasUrl, hasKey, urlPreview: url?.slice(0, 30), urlLen: url?.length, keyLen: key?.length });
  } catch (e) {
    // no-op
  }

  if (!url || !key) {
    isSupabaseFallback = true;
    supabaseClient = createNoopClient() as unknown as SupabaseClient;
    return supabaseClient;
  }

  // Log when a real Supabase client is configured (dev only)
  try {
    console.info('[VFHouse] Supabase configured. Using real client', { urlPreview: url.slice(0, 30) });
  } catch {}

  supabaseClient = createClient(url, key, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  });

  return supabaseClient;
}

/**
 * Reset the Supabase client instance (mainly for testing purposes)
 */
export function resetSupabaseClient(): void {
  supabaseClient = null;
  isSupabaseFallback = false;
}

export default getSupabaseClient;