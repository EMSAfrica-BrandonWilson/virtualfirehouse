import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

// Resilient option shapes covering various dropdown tables
export interface EquipmentType { id?: string; uuid_id?: string; name?: string; equipment_type?: string; active?: boolean; is_active?: boolean; }
export interface ModelMake { id?: string; uuid_id?: string; name?: string; model_make?: string; active?: boolean; is_active?: boolean; }
export interface Manufacturer { id?: string; uuid_id?: string; name?: string; manufacturer?: string; active?: boolean; is_active?: boolean; }
export interface LocationDepartment { id?: string; uuid_id?: string; name?: string; department_name?: string; location_department?: string; active?: boolean; is_active?: boolean; }

export interface EquipmentDropdownsCache {
  equipment_types: EquipmentType[];
  model_makes: ModelMake[];
  manufacturers: Manufacturer[];
  location_departments: LocationDepartment[];
}

let cache: EquipmentDropdownsCache | null = null;
let inFlight: Promise<EquipmentDropdownsCache> | null = null;

function normalizeActive<T extends { active?: boolean; is_active?: boolean }>(item: T): T & { active: boolean } {
  return { ...item, active: typeof item.active === 'boolean' ? item.active : !!item.is_active } as T & { active: boolean };
}

function normalizeName(item: any): string {
  return (
    item.name ??
    item.equipment_type ??
    item.model_make ??
    item.manufacturer ??
    item.department_name ??
    item.location_department ??
    ''
  );
}

function normalizeId(item: any): string | undefined {
  return item.id ?? item.uuid_id ?? undefined;
}

async function fetchTable<T>(table: string): Promise<T[]> {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .order('updated_at', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) {
    // Swallow errors to keep cache resilient; return empty array
    console.warn(`[DropdownCache] Failed to load ${table}:`, error?.message || error);
    return [] as T[];
  }
  return (data as T[]) || ([] as T[]);
}

async function loadEquipmentDropdowns(): Promise<EquipmentDropdownsCache> {
  const [equipmentTypes, modelMakes, manufacturers, locationDepartments] = await Promise.all([
    fetchTable<EquipmentType>('equipment_types'),
    // Some projects use 'model_makes' while others use 'models_makes'; try both
    (async () => {
      const mm1 = await fetchTable<ModelMake>('model_makes');
      if (mm1 && mm1.length > 0) return mm1;
      return await fetchTable<ModelMake>('models_makes');
    })(),
    fetchTable<Manufacturer>('manufacturers'),
    fetchTable<LocationDepartment>('location_departments')
  ]);

  const normalizeList = <T extends { active?: boolean; is_active?: boolean }>(list: T[]) => list.map(normalizeActive);

  return {
    equipment_types: normalizeList(equipmentTypes).map(it => ({ ...it, name: normalizeName(it), id: normalizeId(it) })),
    model_makes: normalizeList(modelMakes).map(it => ({ ...it, name: normalizeName(it), id: normalizeId(it) })),
    manufacturers: normalizeList(manufacturers).map(it => ({ ...it, name: normalizeName(it), id: normalizeId(it) })),
    location_departments: normalizeList(locationDepartments).map(it => ({ ...it, name: normalizeName(it), id: normalizeId(it) }))
  };
}

export async function getEquipmentDropdowns(): Promise<EquipmentDropdownsCache> {
  if (cache) return cache;
  if (!inFlight) inFlight = loadEquipmentDropdowns();
  cache = await inFlight;
  inFlight = null;
  return cache;
}

export function primeEquipmentDropdowns(): Promise<EquipmentDropdownsCache> {
  // Explicit prefetch API (can be called on app start or first Equipment page load)
  return getEquipmentDropdowns();
}

export function clearEquipmentDropdownsCache(): void {
  cache = null;
  inFlight = null;
}

// React hook to consume cached dropdowns with automatic initial load
export function useEquipmentDropdowns() {
  const [dropdowns, setDropdowns] = useState<EquipmentDropdownsCache | null>(cache);
  const [loading, setLoading] = useState(!cache);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    if (!cache) {
      getEquipmentDropdowns()
        .then(data => { if (mounted) { setDropdowns(data); setLoading(false); } })
        .catch(err => { if (mounted) { setError(err?.message || 'Failed to load dropdowns'); setLoading(false); } });
    } else {
      setDropdowns(cache);
      setLoading(false);
    }
    return () => { mounted = false; };
  }, []);

  return { dropdowns, loading, error } as const;
}

// Label resolution helpers
export function resolveOptionLabel<T extends { id?: string; uuid_id?: string; name?: string; active?: boolean }>(
  options: T[],
  idOrName: string | null | undefined,
  snapshotName?: string | null | undefined
): { label: string; inactive: boolean } {
  if (!idOrName && snapshotName) {
    return { label: snapshotName, inactive: false };
  }
  if (!idOrName) return { label: 'Unknown', inactive: false };

  const match = options.find(o => (o.id && o.id === idOrName) || (o.uuid_id && o.uuid_id === idOrName) || (o.name && o.name === idOrName));
  if (!match) {
    return { label: snapshotName || idOrName, inactive: false };
  }
  const name = match.name || idOrName;
  if (match.active === false) {
    return { label: `(inactive) ${name}`, inactive: true };
  }
  return { label: name, inactive: false };
}