## The Problem
- The Call Sign dropdown on `/admin/register/vehicles/process` intermittently renders empty or resets to the placeholder after refresh and data loads.
- Current loaders mix vehicle and call-sign fetching and sometimes replace the dropdown state with `[]` when a fetch fails or returns unexpected shapes.

## Fix Overview
- Create a dedicated, resilient `loadCallSigns()` function that reads from `vehicle_call_signs`, normalizes rows, and updates state without clearing prior options on transient failures.
- Initialize call signs on mount and reuse `loadCallSigns()` anywhere the list needs refreshing (e.g., after modal updates), rather than duplicating mapping logic in multiple loaders.
- Preserve the selected call sign during fetch cycles and across page refreshes using sessionStorage; if the selected value isn’t present in the latest data, append a temporary option so the Select stays controlled.

## Implementation Steps
1. Add `loadCallSigns()` in `VehicleEnhanced.tsx`:
   - Query: `supabase.from('vehicle_call_signs').select('id, name, active, vehicle_callsign, call_sign, code').order('name')`.
   - Map each row to `{ id, name, active }` with defensive fallbacks for name and active.
   - If mapping returns an empty array, keep the previous `callSigns` state (don’t clobber with `[]`).
2. Call `loadCallSigns()` on component mount (`useEffect([])`), and remove ad‑hoc call-sign mapping inside other loaders.
3. In `handleCallSignChange`:
   - Immediately set `veh_call_sign` in form state.
   - Persist selection to sessionStorage.
   - If selected isn’t found in current `callSigns`, append a temporary `{ id: -1, name: selected, active: true }` so the Select remains controlled.
   - After vehicle matching completes, do not reset `veh_call_sign`.
4. After modal actions (Load Details/Add Vehicle), re‑persist the selected Call Sign and ensure `callSigns` array still contains it.
5. Remove any `setCallSigns([])` branches that run on fetch error; instead display a non-blocking error message while leaving prior options intact.

## Validation
- Start the dev server and open `/admin/register/vehicles/process`.
- Verify dropdown populates on mount and remains populated after selecting a Call Sign.
- Refresh the page; confirm the previously selected call sign is restored and the list remains.
- Select existing call sign → see confirmation modal; Select new call sign → see add modal; in both cases the dropdown value persists.

## Notes
- No backend changes required; reads still come from `vehicle_call_signs`.
- This refactor keeps the code simpler and avoids clobbering state on transient fetch issues.