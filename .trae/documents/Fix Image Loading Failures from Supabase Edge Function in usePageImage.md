## Context and Symptoms
- Console shows a 500 on POST `/functions/v1/get-page-image` and a FunctionsHttpError: Edge Function returned non‑2xx.
- Similar failures can occur if the function expects headers/params or the page slug, or if backend tables are missing.
- Current behavior appears to surface the error and may block or repeatedly retry without a graceful fallback.

## Proposed Fixes
### 1) Harden `usePageImage` Hook (Frontend)
- Wrap the Supabase function call in `try/catch` and handle non‑2xx explicitly.
- On any failure (500, 4xx, network error), set `imageUrl` to a safe default (e.g., `/images/FireEngine.png`), set `loading=false`, and do not throw.
- Log concise diagnostic details (status, message) for dev builds; avoid noisy logs in production.
- Add request payload validation: pass the expected `pageSlug` (e.g., `'register-vehicles'`) and any optional department/context if required by the function.
- Add a short timeout and a single retry (e.g., 300–500ms) to mitigate transient failures; backoff only once to avoid stalls.
- Cache the resolved URL per `pageSlug` in memory to prevent repeated calls during the same session.

### 2) Verify Client Configuration
- Confirm Supabase client uses the anon key (frontend) and project URL; these automatically set the `apikey` header for the functions client.
- Ensure the `get-page-image` function path is correct and the body matches the backend contract (e.g., `{ pageSlug: string }`).

### 3) Non‑Blocking Rendering
- Render a placeholder or default image while `loading=true`.
- Never let image fetching block page interactivity; the form shell should render immediately and hydrate images asynchronously.

### 4) Backend Observability (Optional)
- If available, read the function’s error context (e.g., missing table/column) and document it; otherwise treat as unknown and proceed with fallback.

## Implementation Outline
- Update `src/hooks/usePageImage.ts`:
  - `invoke('get-page-image', { body: { pageSlug } })` in `try/catch`.
  - On success: set `imageUrl` from payload and `loading=false`.
  - On failure: set `imageUrl='/images/FireEngine.png'`, `loading=false`, set `error` with concise message.
  - Add a single retry for transient errors.
  - Memoize per `pageSlug` to avoid repeated calls.

## Validation
- Reload `/admin/register/vehicles/process`:
  - Page renders and remains interactive in < 3 seconds.
  - Image placeholder shows immediately; final image loads if function returns 2xx; otherwise default image shows without errors.
  - Console shows non‑blocking diagnostic log; no uncaught exceptions.
  - Network shows a single function call; if 500 persists, no further blocking occurs.

## Documentation
- Record the failure (Edge Function 500) and the frontend fallback behavior.
- Note the expected function contract (payload and headers) and steps to debug it later without impacting UI.
- Document that images are non‑critical and must never block rendering.
