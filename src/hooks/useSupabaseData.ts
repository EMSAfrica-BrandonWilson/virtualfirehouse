import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface UseSupabaseDataOptions {
  table: string;
  select?: string;
  filters?: Record<string, any>;
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
}

export function useSupabaseData<T = any>(options: UseSupabaseDataOptions) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from(options.table)
        .select(options.select || '*');

      // Apply filters
      if (options.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      // Apply ordering
      if (options.orderBy) {
        query = query.order(options.orderBy.column, { 
          ascending: options.orderBy.ascending ?? false 
        });
      }

      // Apply limit
      if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data: result, error } = await query;

      if (error) {
        throw new Error(error.message);
      }

      setData((result as T[]) || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const insertData = async (newData: Partial<T>) => {
    try {
      const { data: result, error } = await supabase
        .from(options.table)
        .insert(newData)
        .select()
        .maybeSingle();

      if (error) {
        throw new Error(error.message);
      }

      if (result) {
        setData(prev => [result, ...prev]);
      }

      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Insert failed');
      throw err;
    }
  };

  const updateData = async (id: string, updates: Partial<T>) => {
    try {
      const { data: result, error } = await supabase
        .from(options.table)
        .update(updates)
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error) {
        throw new Error(error.message);
      }

      if (result) {
        setData(prev => prev.map(item => 
          (item as any).id === id ? result : item
        ));
      }

      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
      throw err;
    }
  };

  const deleteData = async (id: string) => {
    try {
      const { error } = await supabase
        .from(options.table)
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(error.message);
      }

      setData(prev => prev.filter(item => (item as any).id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
      throw err;
    }
  };

  useEffect(() => {
    fetchData();
  }, [options.table, JSON.stringify(options.filters)]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    insert: insertData,
    update: updateData,
    delete: deleteData
  };
}

// Specialized hooks for each module
export function useIncidents() {
  return useSupabaseData({
    table: 'incidents',
    orderBy: { column: 'created_at', ascending: false },
    limit: 100
  });
}

export function useEquipment() {
  return useSupabaseData({
    table: 'equipment',
    orderBy: { column: 'name', ascending: true }
  });
}

export function useMaintenanceOrders() {
  return useSupabaseData({
    table: 'maintenance_orders',
    orderBy: { column: 'created_at', ascending: false }
  });
}

export function useTrainingCourses() {
  return useSupabaseData({
    table: 'training_courses',
    filters: { is_active: true },
    orderBy: { column: 'course_name', ascending: true }
  });
}

export function useFireInspections() {
  return useSupabaseData({
    table: 'fire_inspections',
    orderBy: { column: 'inspection_date', ascending: false }
  });
}

export function usePersonnel() {
  return useSupabaseData({
    table: 'profiles',
    filters: { status: 'active' },
    orderBy: { column: 'full_name', ascending: true }
  });
}