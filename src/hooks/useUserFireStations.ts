import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface FireStation {
  id: number;
  department_id: number;
  fire_station_name: string;
}

interface UserFireStationsHook {
  fireStations: FireStation[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useUserFireStations = (): UserFireStationsHook => {
  const { user } = useAuth();
  const [fireStations, setFireStations] = useState<FireStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFireStations = async () => {
    if (!user) {
      setFireStations([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Fetching fire stations for user:', user.id);
      // Resolve user's department via database RPC to avoid schema mismatches
      const { data: deptId, error: deptErr } = await supabase.rpc('get_user_department_id', { user_uuid: user.id });

      let stationsQuery = supabase
        .from('fire_stations_vfh')
        .select('id, department_id, fire_station_name')
        .order('fire_station_name');

      if (!deptErr && deptId) {
        stationsQuery = stationsQuery.eq('department_id', deptId);
      } else {
        // Fallback: derive stations from user's created menu items
        const { data: userItems, error: userItemsErr } = await supabase
          .from('user_fire_station_menu_items')
          .select('fire_station_id')
          .eq('created_by_user_id', user.id)
          .eq('is_active', true);
        if (userItemsErr) {
          const msg = String(userItemsErr?.message || '');
          const missingTable = msg.includes("Could not find the table 'public.user_fire_station_menu_items'") || msg.includes('schema cache');
          if (missingTable) {
            setFireStations([]);
            return;
          }
        }
        const ids = Array.from(new Set((userItems || []).map((r: any) => r.fire_station_id).filter(Boolean)));
        if (ids.length > 0) {
          stationsQuery = stationsQuery.in('id', ids as any);
        } else {
          // No fallback data; return empty without error
          setFireStations([]);
          return;
        }
      }

      const { data: stationsData, error: stationsError } = await stationsQuery;

      if (stationsError) {
        console.error('❌ Error fetching fire stations:', stationsError?.message || stationsError);
        setError('Failed to fetch fire stations');
        setFireStations([]);
        return;
      }

      console.log('✅ Found fire stations:', stationsData?.length || 0);
      setFireStations(stationsData || []);
    } catch (err) {
      console.error('❌ Unexpected error:', err);
      setError('An unexpected error occurred');
      setFireStations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFireStations();
  }, [user]);

  return {
    fireStations,
    loading,
    error,
    refetch: fetchFireStations
  };
};

export default useUserFireStations;