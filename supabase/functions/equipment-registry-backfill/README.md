# equipment-registry-backfill

Backfills `equipment_registry` fields (`equipment_type`, `model_make`, `manufacturer`, `location_department`) to store IDs instead of names.

Includes a safe dry-run mode that previews changes without modifying data.

## Environment

Set the following environment variables for the function:

- `SUPABASE_URL`: Your project URL (`https://YOUR_PROJECT_ID.supabase.co`)
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key (required for write access)

## Endpoints

Function route:

- Deployed: `https://YOUR_PROJECT_ID.supabase.co/functions/v1/equipment-registry-backfill`
- Local (supabase start): `http://localhost:54321/functions/v1/equipment-registry-backfill`

## Quick Status (GET)

Preview availability of dropdowns and number of registry rows:

```bash
curl -X GET \
  "https://YOUR_PROJECT_ID.supabase.co/functions/v1/equipment-registry-backfill" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "apikey: YOUR_SERVICE_ROLE_KEY"
```

Local:

```bash
curl -X GET \
  "http://localhost:54321/functions/v1/equipment-registry-backfill" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "apikey: YOUR_SERVICE_ROLE_KEY"
```

## Dry Run (POST)

Preview planned changes without modifying data. Returns sample changes and counts.

```bash
curl -X POST \
  "https://YOUR_PROJECT_ID.supabase.co/functions/v1/equipment-registry-backfill" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "apikey: YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"dry_run": true}'
```

Options:

- `include_inactive` (default `true`): Map names even if dropdown item is inactive
- `case_insensitive` (default `true`): Name matching ignores case

Example with options:

```bash
curl -X POST \
  "https://YOUR_PROJECT_ID.supabase.co/functions/v1/equipment-registry-backfill" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "apikey: YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"dry_run": true, "include_inactive": true, "case_insensitive": true}'
```

## Execute Backfill (POST)

Apply the changes to `equipment_registry` by setting `dry_run` to `false`:

```bash
curl -X POST \
  "https://YOUR_PROJECT_ID.supabase.co/functions/v1/equipment-registry-backfill" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "apikey: YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"dry_run": false}'
```

## Notes

- The function recognizes IDs in either `id` or `uuid_id` fields across dropdown tables.
- It matches names from relevant fields (`name`, `model_make`, `manufacturer_name`, `department_name`) and maps them to IDs.
- It supports legacy `models_makes` table naming if `model_makes` is not present.
- Always run a dry run first to preview changes.