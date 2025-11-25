// Deno Deploy / Supabase Edge Function: equipment-registry-backfill
// Purpose: Backfill equipment_registry fields (equipment_type, model_make, manufacturer, location_department)
// to store IDs instead of names, using lookup from dropdown tables. Includes a dry-run mode.

// deno-lint-ignore-file no-explicit-any

import "https://deno.land/x/dotenv@v3.2.2/load.ts";

interface BackfillRequestBody {
  dry_run?: boolean;
  include_inactive?: boolean; // default true: map even if dropdown entry is inactive
  case_insensitive?: boolean; // default true: name matching ignores case
}

interface RegistryRow {
  id: string | number;
  equipment_type: string | null;
  model_make: string | null;
  manufacturer: string | null;
  location_department: string | null;
}

type DropdownItem = Record<string, any> & {
  id?: string;
  uuid_id?: string;
  name?: string;
};

type NameToIdMap = Map<string, string>; // normalized name -> id

// CORS helper
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
}

function normalizeName(name: unknown, caseInsensitive = true): string | null {
  if (typeof name !== "string") return null;
  const trimmed = name.trim();
  if (!trimmed) return null;
  return caseInsensitive ? trimmed.toLowerCase() : trimmed;
}

function getId(item: DropdownItem): string | null {
  const id = item.id ?? item.uuid_id ?? null;
  if (!id) return null;
  return String(id).trim();
}

function getName(item: DropdownItem): string | null {
  const name =
    item.name ??
    item.model_make ??
    item.manufacturer_name ??
    item.department_name ??
    null;
  if (!name) return null;
  return String(name).trim();
}

async function fetchJson(url: string, headers: Record<string, string>) {
  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error(`Fetch failed ${res.status} ${res.statusText}: ${url}`);
  }
  return res.json();
}

function buildNameToIdMap(items: DropdownItem[], caseInsensitive: boolean): NameToIdMap {
  const map: NameToIdMap = new Map();
  for (const item of items) {
    const id = getId(item);
    const nm = getName(item);
    if (!id || !nm) continue;
    const key = normalizeName(nm, caseInsensitive);
    if (!key) continue;
    if (!map.has(key)) {
      map.set(key, id);
    }
  }
  return map;
}

function buildIdSet(items: DropdownItem[]): Set<string> {
  const set = new Set<string>();
  for (const item of items) {
    const id = getId(item);
    if (id) set.add(id);
  }
  return set;
}

function remapValue(
  value: string | null,
  idSet: Set<string>,
  nameToId: NameToIdMap,
  caseInsensitive: boolean,
): { changed: boolean; newValue: string | null; reason?: string } {
  if (!value) return { changed: false, newValue: null };
  const raw = String(value).trim();
  if (!raw) return { changed: false, newValue: null };
  // If already an ID, keep as is
  if (idSet.has(raw)) return { changed: false, newValue: raw };
  // Try name mapping
  const lookupKey = normalizeName(raw, caseInsensitive);
  const mapped = lookupKey ? nameToId.get(lookupKey) : undefined;
  if (mapped) return { changed: true, newValue: mapped, reason: `mapped-name:${raw}` };
  return { changed: false, newValue: raw, reason: "no-match" };
}

function ok(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body, null, 2), {
    headers: { "Content-Type": "application/json", ...corsHeaders() },
    status: 200,
    ...init,
  });
}

function err(message: string, status = 500) {
  return new Response(JSON.stringify({ error: message }, null, 2), {
    headers: { "Content-Type": "application/json", ...corsHeaders() },
    status,
  });
}

// Main handler
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders() });
  }

  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) {
    return err("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env", 500);
  }

  const headers = {
    apikey: key,
    authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  };

  try {
    if (req.method === "GET") {
      // Provide a quick status preview: counts of registries and dropdown items
      const [registryCountRes, types, makes, mans, deps] = await Promise.all([
        fetch(`${url}/rest/v1/equipment_registry?select=id`, { headers }),
        fetchJson(`${url}/rest/v1/equipment_types?select=*`, headers),
        // Try model_makes, fallback to models_makes for legacy naming
        (async () => {
          try {
            return await fetchJson(`${url}/rest/v1/model_makes?select=*`, headers);
          } catch (_) {
            return await fetchJson(`${url}/rest/v1/models_makes?select=*`, headers);
          }
        })(),
        fetchJson(`${url}/rest/v1/manufacturers?select=*`, headers),
        fetchJson(`${url}/rest/v1/location_departments?select=*`, headers),
      ]);

      const registryIds = await registryCountRes.json();
      return ok({
        equipment_registry_rows: Array.isArray(registryIds) ? registryIds.length : 0,
        dropdowns: {
          equipment_types: Array.isArray(types) ? types.length : 0,
          model_makes: Array.isArray(makes) ? makes.length : 0,
          manufacturers: Array.isArray(mans) ? mans.length : 0,
          location_departments: Array.isArray(deps) ? deps.length : 0,
        },
      });
    }

    if (req.method === "POST") {
      const body = (await req.json().catch(() => ({}))) as BackfillRequestBody;
      const dryRun = body.dry_run ?? true; // default to dry-run for safety
      const includeInactive = body.include_inactive ?? true;
      const caseInsensitive = body.case_insensitive ?? true;

      // Load dropdowns
      const selectAll = includeInactive ? "*" : "*"; // allowing all; filter by active if schema supports it
      const types: DropdownItem[] = await fetchJson(`${url}/rest/v1/equipment_types?select=${selectAll}`, headers);
      const makes: DropdownItem[] = await (async () => {
        try {
          return await fetchJson(`${url}/rest/v1/model_makes?select=${selectAll}`, headers);
        } catch (_) {
          return await fetchJson(`${url}/rest/v1/models_makes?select=${selectAll}`, headers);
        }
      })();
      const mans: DropdownItem[] = await fetchJson(`${url}/rest/v1/manufacturers?select=${selectAll}`, headers);
      const deps: DropdownItem[] = await fetchJson(`${url}/rest/v1/location_departments?select=${selectAll}`, headers);

      // Build maps and id sets
      const typesIdSet = buildIdSet(types);
      const makesIdSet = buildIdSet(makes);
      const mansIdSet = buildIdSet(mans);
      const depsIdSet = buildIdSet(deps);

      const typesMap = buildNameToIdMap(types, caseInsensitive);
      const makesMap = buildNameToIdMap(makes, caseInsensitive);
      const mansMap = buildNameToIdMap(mans, caseInsensitive);
      const depsMap = buildNameToIdMap(deps, caseInsensitive);

      // Fetch equipment_registry rows in batches to avoid huge payloads
      const pageSize = 1000;
      let page = 0;
      let totalProcessed = 0;
      let totalChangedRows = 0;
      const changesPreview: Array<Record<string, unknown>> = [];

      while (true) {
        const rangeStart = page * pageSize;
        const rangeEnd = rangeStart + pageSize - 1;
        const res = await fetch(
          `${url}/rest/v1/equipment_registry?select=id,equipment_type,model_make,manufacturer,location_department&order=id.asc&limit=${pageSize}&offset=${rangeStart}`,
          { headers },
        );
        if (!res.ok) throw new Error(`Failed to load equipment_registry page ${page}: ${res.status} ${res.statusText}`);
        const batch: RegistryRow[] = await res.json();
        if (!Array.isArray(batch) || batch.length === 0) break;

        for (const row of batch) {
          totalProcessed++;
          const rType = remapValue(row.equipment_type, typesIdSet, typesMap, caseInsensitive);
          const rMake = remapValue(row.model_make, makesIdSet, makesMap, caseInsensitive);
          const rMan = remapValue(row.manufacturer, mansIdSet, mansMap, caseInsensitive);
          const rDep = remapValue(row.location_department, depsIdSet, depsMap, caseInsensitive);

          const willChange = rType.changed || rMake.changed || rMan.changed || rDep.changed;
          if (!willChange) continue;

          totalChangedRows++;
          const changedFields: Record<string, string | null> = {};
          if (rType.changed) changedFields.equipment_type = rType.newValue;
          if (rMake.changed) changedFields.model_make = rMake.newValue;
          if (rMan.changed) changedFields.manufacturer = rMan.newValue;
          if (rDep.changed) changedFields.location_department = rDep.newValue;

          changesPreview.push({ id: row.id, changes: changedFields });

          if (!dryRun) {
            const patchRes = await fetch(`${url}/rest/v1/equipment_registry?id=eq.${row.id}`, {
              method: "PATCH",
              headers,
              body: JSON.stringify(changedFields),
            });
            if (!patchRes.ok) {
              throw new Error(`Patch failed for id=${row.id}: ${patchRes.status} ${patchRes.statusText}`);
            }
          }
        }

        if (batch.length < pageSize) break;
        page++;
      }

      return ok({
        dry_run: dryRun,
        include_inactive: includeInactive,
        case_insensitive: caseInsensitive,
        processed_rows: totalProcessed,
        changed_rows: totalChangedRows,
        sample_changes: changesPreview.slice(0, 50), // cap preview
      });
    }

    return err("Method not allowed", 405);
  } catch (e) {
    return err((e as Error).message ?? String(e), 500);
  }
});