## Current Symptoms
- Page sometimes fails to render (likely due to a hook or state update defined outside the React component or a parser-level syntax issue).
- Call Sign dropdown intermittently unloads/reset to placeholder after refresh or subsequent loads.

## Root-Cause Suspicions
- Hook/utility defined outside the component (e.g., `useEffect` placed after styled-components) causing invalid hook usage and breaking render.
- Multiple/duplicate definitions of `persistSelectedCallSign` and the restore `useEffect` with conflicting scopes.
- State clobbering of `callSigns` (setting `[]` on fetch error) combined with controlled Select resetting its value when the current selection disappears.

## Fix Plan
1. Move and unify call sign persistence logic inside the `VehicleEnhanced` component:
   - Single `persistSelectedCallSign()` and single `useEffect(() => restore selection)` at the top of the component body.
   - Remove any duplicate declarations outside or after styled-components.
2. Implement dedicated, resilient `loadCallSigns()`:
   - `supabase.from('vehicle_call_signs').select('id, name, active, vehicle_callsign, call_sign, code').order('name')`.
   - Normalize rows to `{ id, name, active }` defensively.
   - Do NOT set `callSigns` to `[]` on error; log error and retain the previous list.
   - If `veh_call_sign` is currently selected but not present, prepend a temporary option so the Select remains controlled.
3. Initialize call signs on mount: `useEffect(() => { loadCallSigns(); }, [])`.
4. In `handleCallSignChange`:
   - Immediately set `veh_call_sign` and persist selection in sessionStorage.
   - Ensure `callSigns` contains the selected value; if not, append a temporary option.
   - Proceed with vehicle matching and modal logic without resetting dropdown state.
5. Remove scattered call-sign mapping in other loaders; call `loadCallSigns()` instead to avoid inconsistent behavior.
6. Add defensive guards:
   - Wrap Supabase calls in try/catch; never clear options on transient failures.
   - Ensure no hook is outside a React component or inside conditional flows.

## Verification
- Run the dev server and open `/admin/register/vehicles/process`.
- Dropdown should populate on mount, selection sticks during fetch and after refresh.
- Existing call sign → confirmation modal shows; New call sign → add modal shows.
- No console or compile errors (confirm hooks only inside component).

## Notes
- No changes to backend required; continues to read `vehicle_call_signs`.
- This consolidation removes duplicated logic and state clobbering, restoring predictable dropdown behavior and page load.