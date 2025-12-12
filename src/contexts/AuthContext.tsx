import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { getSupabaseClient, isSupabaseFallback, resetSupabaseClient } from '../lib/supabase';
import { formatDateTimeReadable } from '../lib/utils';

// Define UserProfile interface
interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  full_name?: string;
  display_name?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

// Profile service functions
const profileService = {
  async getUserProfile(): Promise<UserProfile | null> {
    try {
      const sb = getSupabaseClient();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) return null;

      const { data, error } = await sb
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      const first = Array.isArray(data) ? (data[0] || null) : (data as any);
      return first || null;
    } catch (error) {
      console.error('Error in getUserProfile:', error);
      return null;
    }
  },

  async createProfile(user: User): Promise<UserProfile | null> {
    try {
      const profileData = {
        user_id: user.id,
        email: user.email || '',
        full_name: user.user_metadata?.full_name || '',
        display_name: user.user_metadata?.display_name || user.user_metadata?.full_name || '',
        created_at: formatDateTimeReadable(new Date()),
        updated_at: formatDateTimeReadable(new Date())
      };

      const sb = getSupabaseClient();
      const { data, error } = await sb
        .from('profiles')
        .insert(profileData)
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in createProfile:', error);
      return null;
    }
  },

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      const sb = getSupabaseClient();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) return null;

      const { data, error } = await sb
        .from('profiles')
        .update({ ...updates, updated_at: formatDateTimeReadable(new Date()) })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in updateProfile:', error);
      return null;
    }
  }
};

// Authentication helper functions
const signInWithPassword = async (email: string, password: string) => {
  const sb = ensureRealClient();
  return await sb.auth.signInWithPassword({ email, password });
};

const signUp = async (email: string, password: string, fullName?: string, displayName?: string) => {
  const sb = ensureRealClient();
  const { data, error } = await sb.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        display_name: displayName
      }
    }
  });
  return { data, error };
};

const signOut = async () => {
  const sb = ensureRealClient();
  return await sb.auth.signOut();
};

// Ensure we use a real client when env vars are present
const ensureRealClient = () => {
  const rawUrl = (import.meta?.env?.VITE_SUPABASE_URL || '').trim();
  const rawKey = (import.meta?.env?.VITE_SUPABASE_ANON_KEY || '').trim();
  if (isSupabaseFallback && rawUrl && rawKey) {
    console.info('[VFHouse] Resetting Supabase client because envs are present.');
    resetSupabaseClient();
  }
  return getSupabaseClient();
};

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUpUser: (email: string, password: string, fullName?: string, displayName?: string) => Promise<any>;
  signOut: () => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<UserProfile | null>;
  refreshProfile: () => Promise<void>;
  getDisplayName: () => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Utility function to process URL authentication parameters
const processAuthUrl = async () => {
  try {
    // Get current URL
    const url = new URL(window.location.href);
    
    // Check for hash fragment parameters (common in Supabase auth redirects)
    const hash = window.location.hash;
    if (hash) {
      console.log('Processing auth URL with hash:', hash);
      
      // Parse hash parameters
      const hashParams = new URLSearchParams(hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      const type = hashParams.get('type');
      
      if (accessToken && refreshToken && (type === 'signup' || type === 'recovery' || type === 'email_change')) {
        console.log('Email confirmation detected, type:', type);
        
        // Set the session from URL parameters
        const sb = ensureRealClient();
        const { error } = await sb.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });
        
        if (error) {
          console.error('Error setting session from URL:', error);
        } else {
          console.log('Session set successfully from email confirmation');
          
          // Clean up URL by removing hash parameters
          window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
          
          return true; // Indicates successful auth from URL
        }
      }
    }
    
    // Check for query parameters as fallback
    const accessToken = url.searchParams.get('access_token');
    const refreshToken = url.searchParams.get('refresh_token');
    const type = url.searchParams.get('type');
    
    if (accessToken && refreshToken && (type === 'signup' || type === 'recovery' || type === 'email_change')) {
      console.log('Email confirmation detected in query params, type:', type);
      
      const sb = ensureRealClient();
      const { error } = await sb.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      });
      
      if (error) {
        console.error('Error setting session from URL params:', error);
      } else {
        console.log('Session set successfully from email confirmation (query params)');
        
        // Clean up URL by removing auth parameters
        url.searchParams.delete('access_token');
        url.searchParams.delete('refresh_token');
        url.searchParams.delete('type');
        url.searchParams.delete('expires_in');
        url.searchParams.delete('expires_at');
        url.searchParams.delete('token_type');
        
        window.history.replaceState({}, document.title, url.toString());
        
        return true; // Indicates successful auth from URL
      }
    }
  } catch (error) {
    console.error('Error processing auth URL:', error);
  }
  
  return false;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  // Function to load user profile
  const loadUserProfile = async (currentUser: User, forceReload = false) => {
    if (profileLoading && !forceReload) {
      console.log('Profile loading already in progress, skipping...');
      return;
    }
    
    try {
      setProfileLoading(true);
      console.log('=== Loading profile for user:', currentUser.email, 'User ID:', currentUser.id, 'Force reload:', forceReload);
      
      const profile = await profileService.getUserProfile();
      console.log('Profile retrieved from service:', profile);
      
      if (profile) {
        console.log('Setting profile:', profile);
        setUserProfile(profile);
      } else {
        console.log('No profile found, attempting to create one in database');
        
        try {
          // Try to create a real profile in the database
          const createdProfile = await profileService.createProfile(currentUser);
          console.log('Created profile in database:', createdProfile);
          setUserProfile(createdProfile);
        } catch (createError) {
          console.error('Failed to create profile in database:', createError);
          
          // If creation fails, use fallback
          const fallbackProfile = {
            id: '',
            user_id: currentUser.id,
            email: currentUser.email || '',
            full_name: currentUser.user_metadata?.full_name || '',
            display_name: currentUser.user_metadata?.display_name || 
                         currentUser.user_metadata?.full_name || 
                         currentUser.email || '',
            created_at: formatDateTimeReadable(new Date()),
            updated_at: formatDateTimeReadable(new Date())
          };
          console.log('Using fallback profile after create failure:', fallbackProfile);
          setUserProfile(fallbackProfile);
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      
      // Always create a fallback profile so user info shows
      const fallbackProfile = {
        id: '',
        user_id: currentUser.id,
        email: currentUser.email || '',
        full_name: currentUser.user_metadata?.full_name || '',
        display_name: currentUser.user_metadata?.display_name || 
                     currentUser.user_metadata?.full_name || 
                     currentUser.email || 'User',
        created_at: formatDateTimeReadable(new Date()),
        updated_at: formatDateTimeReadable(new Date())
      };
      console.log('Error occurred, using fallback profile:', fallbackProfile);
      setUserProfile(fallbackProfile);
    } finally {
      setProfileLoading(false);
    }
  };

  // Load user and profile on mount (one-time check)
  useEffect(() => {
    async function loadUser() {
      setLoading(true);
      try {
        console.log('=== Initial auth check started ===');
        
        // First, check if we have auth parameters in the URL (email confirmation)
        const urlAuthProcessed = await processAuthUrl();
        console.log('URL auth processed:', urlAuthProcessed);
        
        // Add a small delay if URL auth was processed to allow session to be set
        if (urlAuthProcessed) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        // Get current session
        const sb = ensureRealClient();
        const { data: { session: currentSession }, error } = await sb.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
          if (typeof error.message === 'string' && error.message.includes('Invalid Refresh Token')) {
            try {
              await sb.auth.signOut();
            } catch {}
          }
        } else {
          console.log('Current session:', currentSession ? 'Found' : 'None', currentSession?.user?.email);
          setSession(currentSession);
          const currentUser = currentSession?.user || null;
          setUser(currentUser);
          
          // Load user profile if authenticated
          if (currentUser) {
            console.log('Loading initial user profile...');
            await loadUserProfile(currentUser, true); // Force reload for initial load
          }
        }
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setLoading(false);
        console.log('=== Initial auth check completed ===');
      }
    }
    loadUser();

    // Set up auth listener for ongoing auth state changes
    const sbForSubscribe = ensureRealClient();
    const { data: { subscription } } = sbForSubscribe.auth.onAuthStateChange(
      async (event, session) => {
        console.log('=== Auth state changed ===', event, session?.user?.email);
        setSession(session);
        const currentUser = session?.user || null;
        setUser(currentUser);
        
        // Handle different auth events
        if (currentUser && (
          event === 'SIGNED_IN' || 
          event === 'TOKEN_REFRESHED' || 
          event === 'USER_UPDATED'
        )) {
          console.log('Loading profile for auth event:', event);
          // Add a small delay to ensure the session is fully established
          setTimeout(() => loadUserProfile(currentUser, event === 'SIGNED_IN'), 200);
        } else if (!currentUser && event === 'SIGNED_OUT') {
          // Clear profile when user logs out
          console.log('Clearing profile for sign out');
          setUserProfile(null);
        }
        
        // Always set loading to false after handling auth state change
        setLoading(false);
      }
    );

    return () => {
      console.log('Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  // Remove the secondary useEffect that was causing race conditions
  // Profile loading is now handled directly in the auth state change listener

  // Auth methods
  async function signIn(email: string, password: string) {
    setLoading(true);
    try {
      const result = await signInWithPassword(email, password);
      return result;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function signUpUser(email: string, password: string, fullName?: string, displayName?: string) {
    setLoading(true);
    try {
      const result = await signUp(email, password, fullName, displayName);
      return result;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    setLoading(true);
    try {
      await signOut();
      setUserProfile(null); // Clear profile on logout
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  // Profile management methods
  async function updateUserProfile(updates: Partial<UserProfile>) {
    try {
      const updatedProfile = await profileService.updateProfile(updates);
      setUserProfile(updatedProfile);
      return updatedProfile;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  async function refreshProfile() {
    if (user) {
      await loadUserProfile(user, true); // Force reload when manually refreshing
    }
  }

  // Get display name with fallback logic
  function getDisplayName(): string {
    if (userProfile?.display_name) {
      return userProfile.display_name;
    }
    if (userProfile?.full_name) {
      return userProfile.full_name;
    }
    if (user?.email) {
      return user.email;
    }
    return 'User';
  }

  const value = {
    user,
    session,
    userProfile,
    loading: loading || profileLoading,
    signIn,
    signUpUser,
    signOut: handleSignOut,
    updateUserProfile,
    refreshProfile,
    getDisplayName
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
