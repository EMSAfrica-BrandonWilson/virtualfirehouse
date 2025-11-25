import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface UserFireStationMenuItem {
  id: string;
  fire_station_id: string;
  menu_item_name: string;
  created_by_user_id: string;
  created_by_staff_id: string;
  department_id: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  display_order: number;
}

interface UserFireStationMenuItemsHook {
  menuItems: UserFireStationMenuItem[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useUserFireStationMenuItems = (): UserFireStationMenuItemsHook => {
  const { user } = useAuth();
  const [menuItems, setMenuItems] = useState<UserFireStationMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMenuItems = async () => {
    if (!user) {
      setMenuItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Fetching menu items for user:', user.id);
      // Resolve user's department via database RPC to avoid schema mismatches
      const { data: deptId, error: deptErr } = await supabase.rpc('get_user_department_id', { user_uuid: user.id });

      let menuItemsQuery = supabase
        .from('user_fire_station_menu_items')
        .select(`
          id,
          fire_station_id,
          menu_item_name,
          created_by_user_id,
          created_by_staff_id,
          department_id,
          created_at,
          updated_at,
          is_active,
          display_order
        `)
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .order('menu_item_name', { ascending: true });

      if (!deptErr && deptId) {
        menuItemsQuery = menuItemsQuery.eq('department_id', deptId);
      } else {
        // Fallback: show items created by this user to avoid RPC/table dependency
        menuItemsQuery = menuItemsQuery.eq('created_by_user_id', user.id);
      }

      const { data: menuItemsData, error: menuItemsError } = await menuItemsQuery;

      if (menuItemsError) {
        const msg = String(menuItemsError?.message || '');
        const missingTable = msg.includes("Could not find the table 'public.user_fire_station_menu_items'") || msg.includes('schema cache');
        if (missingTable) {
          setMenuItems([]);
          setError(null);
          return;
        }
        console.error('❌ Error fetching menu items:', menuItemsError?.message || menuItemsError);
        setError('Failed to fetch menu items');
        setMenuItems([]);
        return;
      }

      console.log('✅ Found menu items:', menuItemsData?.length || 0);
      setMenuItems(menuItemsData || []);
    } catch (err) {
      console.error('❌ Unexpected error:', err);
      setError('An unexpected error occurred');
      setMenuItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, [user]);

  return {
    menuItems,
    loading,
    error,
    refetch: fetchMenuItems
  };
};

export default useUserFireStationMenuItems;
