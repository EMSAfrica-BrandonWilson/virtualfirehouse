## Investigation Summary
- Console: Captured “Invalid hook call” from VehicleEnhanced (hooks outside component), 400 on `vehicle_call_signs` due to ordering by non-existent `name`, 404 on `advertisers`, and Edge Function non‑2xx for `usePageImage`.
- Network: Verified failing requests (400/404) block or destabilize UI when unhandled; critical CSS/JS bundles must load within 3s.
- Status Codes: 400 (bad query/columns), 404 (missing table), 5xx/non‑2xx from Edge Function.
- JS Flow: Multiple duplicated loaders clobber dropdown state; hook placement violated Rules of Hooks; Select was controlled without a matching option.
- HTML/CSS: Form structure valid; Select needs options before setting `value` to avoid placeholder resets.

## Fix Plan
### 1) Guard Missing/Bad Requests
- Advertisers fetch: wrap in try/catch; on 404 render nothing for that widget and do not throw; log non‑blocking warning.
- Call‑sign query: switch to `select('*')` without `order(name)`; map defensively (label from `name || call_sign_name || vehicle_callsign || callsign || call_sign || code`).
- Edge Function image: wrap `invoke` in try/catch; on non‑2xx, return fallback `/images/FireEngine.png` and do not throw.

### 2) Consolidate Call Sign Loading
- Create `loadCallSigns()` inside VehicleEnhanced and call it on mount; reuse it elsewhere instead of duplicating mapping.
- Never set `callSigns = []` on error; keep previous options.
- If `veh_call_sign` is currently selected but missing from results, prepend a temporary option to keep the Select controlled.

### 3) Persist Selection Across Refresh
- Save selected call sign in `sessionStorage`; restore it on mount.
- Ensure the Select’s `value` always has a matching option; if options not yet loaded, temporarily disable Select or show loading indicator.

### 4) Fix Hook Placement and Add Error Boundary
- Ensure all hooks (useEffect/useState) are inside function components at top‑level; move any stray hooks.
- Add an Error Boundary around ProtectedRoute to catch render failures and display a friendly message.

### 5) Performance Targets (<3s)
- Fetch calls in parallel; avoid serial awaits before first render.
- Defer non‑critical images; use placeholder until image is ready.
- Minimize re‑renders by batching state updates.

## Validation Steps
- Reload `/admin/register/vehicles/process`:
  - No blocking console errors; 404/400 handled gracefully.
  - Call Sign dropdown populated on mount; selection persists across refresh.
  - Existing call sign prompts to load details; new call sign prompts to add.
  - Page interactive within ~3s; CSS/JS/images load successfully.

## Documentation Deliverables
- Identified issues: invalid hook placement, 400 on ordering by non‑existent columns, 404 advertisers, edge function non‑2xx, dropdown state clobbering.
- Fixes applied and rationale: guarded requests, consolidated loader, persistence, hook rules compliance, error boundary.
- Notes on schema differences and defensive mapping for `vehicle_call_signs`.