import { SupabaseClient } from '@supabase/supabase-js';
import getSupabaseClient from './supabase/client';





/**
 * Enhanced Supabase client with automatic authentication handling
 * This wrapper ensures all function calls include the latest authentication token
 */
class AuthenticatedSupabaseWrapper {
  private clientGetter: () => SupabaseClient;
  private lastTokenRefresh: number = 0;
  private readonly TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes

  constructor(clientGetter: () => SupabaseClient) {
    this.clientGetter = clientGetter;
  }

  /**
   * Ensure we have a valid, fresh session
   */
  private async ensureValidSession() {
    const client = this.clientGetter();
    const now = Date.now();
    
    // Force refresh if token is getting old or if this is first call
    if (now - this.lastTokenRefresh > this.TOKEN_REFRESH_THRESHOLD) {
      const { data: { session }, error } = await client.auth.getSession();
      
      if (error) {
        console.error('Session refresh error:', error);
        throw new Error(`Authentication error: ${error.message}`);
      }
      
      if (!session) {
        throw new Error('No active session found. Please login.');
      }
      
      this.lastTokenRefresh = now;
      return session;
    }
    
    // Get current session without forcing refresh
    const { data: { session }, error } = await client.auth.getSession();
    
    if (error) {
      console.error('Session get error:', error);
      throw new Error(`Authentication error: ${error.message}`);
    }
    
    if (!session) {
      throw new Error('No active session found. Please login.');
    }
    
    return session;
  }

  /**
   * Enhanced function invocation with automatic authentication
   */
  async invokeFunction(functionName: string, options: {
    body?: any;
    headers?: Record<string, string>;
  } = {}): Promise<{ data?: any; error?: any }> {
    const client = this.clientGetter();
    try {
      // Ensure we have a valid session
      const session = await this.ensureValidSession();

      // Invoke function with fresh authentication
      const result = await client.functions.invoke(functionName, {
        body: options.body || {},
        headers: {
          ...options.headers,
          // Explicitly set the authorization header with fresh token
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      return result;
    } catch (error: any) {
      console.error(`Function '${functionName}' invocation failed:`, error);
      throw error;
    }
  }

  /**
   * Get the underlying Supabase client for direct operations
   */
  get auth() {
    return this.clientGetter().auth;
  }

  get from() {
    const client = this.clientGetter();
    return client.from.bind(client);
  }

  get storage() {
    return this.clientGetter().storage;
  }

  get realtime() {
    return this.clientGetter().realtime;
  }

  /**
   * Enhanced authenticated functions interface
   */
  get functions() {
    return {
      invoke: this.invokeFunction.bind(this)
    };
  }
}

// Create the enhanced authenticated wrapper backed by the dynamic client getter
export const authenticatedSupabase = new AuthenticatedSupabaseWrapper(getSupabaseClient);

// Export the current base client for backward compatibility (always resolved fresh)
export const supabase: SupabaseClient = getSupabaseClient();

// Export authentication helper functions
export const signInWithPassword = async (email: string, password: string) => {
  const client = getSupabaseClient();
  return await client.auth.signInWithPassword({ email, password });
};

export const signUp = async (email: string, password: string, fullName?: string, displayName?: string) => {
  const client = getSupabaseClient();
  return await client.auth.signUp({ 
    email, 
    password,
    options: {
      data: {
        full_name: fullName,
        display_name: displayName
      }
    }
  });
};

export const signOut = async () => {
  const client = getSupabaseClient();
  return await client.auth.signOut();
};

export const getCurrentUser = async () => {
  const client = getSupabaseClient();
  const { data: { user }, error } = await client.auth.getUser();
  if (error) {
    // Keep error minimal; upstream can decide how to handle
    return null;
  }
  return user;
};

/**
 * Test function to verify authenticated function calls work properly
 */
export const testAuthenticatedFunction = async (functionName: string = 'debug-auth-check') => {
  try {
    const result = await authenticatedSupabase.functions.invoke(functionName, {
      body: { test: true }
    });
    return result;
  } catch (error) {
    console.error('Authenticated function test failed:', error);
    throw error;
  }
};