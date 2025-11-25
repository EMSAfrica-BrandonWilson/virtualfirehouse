import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

// Define and export types
export interface AdministrativeReport {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface LiveOperationsFeed {
  id: string;
  message: string;
  type: string;
  priority: string;
  status: string;
  description: string;
  title: string;
  created_at: string;
}

export interface PreventionProgram {
  id: string;
  name: string;
  description: string;
  status: string;
  start_date: string;
  created_at: string;
  updated_at: string;
}

export interface MaintenanceSchedule {
  id: string;
  equipment_id: string;
  scheduled_date: string;
  description: string;
  status: string;
  maintenance_type: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface Certification {
  id: string;
  name: string;
  description: string;
  validity_period: number;
  issued_date: string;
  expiry_date: string;
  status: string;
  personnel_id: string;
  certification_name: string;
  created_at: string;
  updated_at: string;
}

// Generic data hook for CRUD operations
export function useData<T>(tableName: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all records
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: result, error: fetchError } = await supabase
        .from(tableName)
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setData(result || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
      console.error(`Error fetching ${tableName}:`, err);
    } finally {
      setLoading(false);
    }
  }, [tableName]);

  // Create a new record
  const createRecord = useCallback(async (newRecord: Omit<T, 'id' | 'created_at' | 'updated_at'>) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: result, error: createError } = await supabase
        .from(tableName)
        .insert([newRecord])
        .select()
        .maybeSingle();

      if (createError) {
        throw createError;
      }

      if (result) {
        setData(prev => [result, ...prev]);
      }
      
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to create record');
      console.error(`Error creating ${tableName}:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [tableName]);

  // Update a record
  const updateRecord = useCallback(async (id: string | number, updates: Partial<T>) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: result, error: updateError } = await supabase
        .from(tableName)
        .update(updates)
        .eq('id', id)
        .select()
        .maybeSingle();

      if (updateError) {
        throw updateError;
      }

      if (result) {
        setData(prev => prev.map(item => 
          (item as any).id === id ? result : item
        ));
      }
      
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to update record');
      console.error(`Error updating ${tableName}:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [tableName]);

  // Delete a record
  const deleteRecord = useCallback(async (id: string | number) => {
    setLoading(true);
    setError(null);
    
    try {
      const { error: deleteError } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);

      if (deleteError) {
        throw deleteError;
      }

      setData(prev => prev.filter(item => (item as any).id !== id));
      
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to delete record');
      console.error(`Error deleting ${tableName}:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [tableName]);

  // Auto-fetch data on mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    create: createRecord,
    update: updateRecord,
    delete: deleteRecord,
    setError
  };
}

// Specialized hooks for each data type
export const useAdministrativeReports = () => useData<AdministrativeReport>('administrative_reports');
export const useLiveOperationsFeed = () => useData<LiveOperationsFeed>('live_operations_feed');
export const usePreventionPrograms = () => useData<PreventionProgram>('prevention_programs');
export const useMaintenanceSchedule = () => useData<MaintenanceSchedule>('maintenance_schedule');
export const useCertifications = () => useData<Certification>('certifications');

// Personnel data hook with more specific types
export interface Personnel {
  id: string;
  email: string;
  full_name: string;
  department?: string;
  rank?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export const usePersonnel = () => {
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPersonnel = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // First get profiles, then departments and ranks separately
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name', { ascending: true });

      if (profilesError) {
        throw profilesError;
      }

      // Get departments and ranks
      const [departmentsResult, ranksResult] = await Promise.all([
        supabase.from('departments').select('id, name'),
        supabase.from('ranks').select('id, name')
      ]);

      // Map department and rank names
      const profilesWithDetails = (profiles || []).map(profile => {
        const department = departmentsResult.data?.find(d => d.id === profile.department);
        const rank = ranksResult.data?.find(r => r.id === profile.rank);
        
        return {
          ...profile,
          department: department?.name || profile.department || '',
          rank: rank?.name || profile.rank || '',
          status: profile.status || 'active'
        };
      });

      setPersonnel(profilesWithDetails);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch personnel');
      console.error('Error fetching personnel:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPersonnel();
  }, [fetchPersonnel]);

  return {
    data: personnel,
    loading,
    error,
    refetch: fetchPersonnel
  };
};

// Departments hook
export interface Department {
  id: number;
  name: string;
  description?: string;
  created_at: string;
}

export const useDepartments = () => useData<Department>('departments');

// Stations hook
export interface Station {
  id: number;
  name: string;
  location: string;
  status: string;
  created_at: string;
}

export const useStations = () => useData<Station>('stations');

// Ranks hook
export interface Rank {
  id: number;
  name: string;
  level: number;
  created_at: string;
}

export const useRanks = () => useData<Rank>('ranks');

