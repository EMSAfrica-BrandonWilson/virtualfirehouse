## Investigation Plan
### 1. Browser Console
- Open `/admin/register/vehicles/process` and capture console logs and stack traces
- Look for syntax/runtime errors (invalid hook usage, undefined variables, TypeError from array mapping)

### 2. Network Requests
- Inspect the Network tab (XHR/fetch) for calls to:
  - `vehicle_call_signs` (call sign list)
  - `admin_register_fire_vehicles` (vehicle data)
  - Any images, CSS and JS bundles
- Verify status codes, payload shapes, timing; flag 4xx/5xx or unusually slow (>1s)

### 3. Server Responses
- Review response bodies for schema mismatches (missing `name`, `active`, etc.)
- Confirm CORS and auth headers are correct; ensure anon key used for reads works

### 4. JS Execution Flow
- Trace the sequence of effects and handlers:
  - Component mount → loadCallSigns → other loaders
  - Call-sign change → matching → modal branch
- Identify any state clobbering (e.g., resetting `callSigns` to `[]`) and hook placement issues

### 5. HTML/CSS Rendering
- Validate DOM nodes render without layout-breaking errors
- Check Select value vs options consistency (controlled input must have matching option)

## Fixes To Implement
### A. Stabilize Call Sign Loading
- Create `loadCallSigns()` inside component to fetch from `vehicle_call_signs`, normalize `{ id, name, active }`
- Use defensive mapping (fallbacks for `name`: `name || vehicle_callsign || call_sign || code`)
- Do not clear `callSigns` on request error; keep previous list and display a non-blocking error
- Initialize on mount: `useEffect(() => loadCallSigns(), [])`

### B. Preserve Selection Across Loads/Refresh
- Persist selected call sign in `sessionStorage`
- On mount, restore `veh_call_sign` from storage
- After each fetch, if the current selection is missing in results, append a temporary option `{ id: -1, name: selected, active: true }`

### C. Remove Duplicated Logic And Invalid Hooks
- Ensure there is a single `persistSelectedCallSign()` and `useEffect` at top of the component
- Remove any hook definitions outside React component and any repeated call-sign mapping in other loaders

### D. Controlled Select Consistency
- Ensure the Select `value={vehicleData.veh_call_sign}` always has a matching option
- Add guard to set `veh_call_sign` to `''` only when no options exist; otherwise retain selection

### E. Page Load Performance (<3s)
- Defer non-critical image loads (keep existing placeholder/fallback)
- Ensure call sign fetch happens in parallel with other data; avoid serial awaits
- Avoid state churn that causes additional re-renders (batch updates where possible)

## Validation
- Reload page and confirm no console errors
- Verify `vehicle_call_signs` and `admin_register_fire_vehicles` requests succeed (<500ms each)
- Confirm dropdown remains populated and selection persists across refresh
- Confirm modal flows for existing/new vehicles still work
- Measure load time: page fully interactive within 3 seconds

## Documentation (Deliverables)
- List identified issues (invalid hook placement, state clobbering, inconsistent mapping)
- Record applied fixes and rationale
- Note any schema assumptions for `vehicle_call_signs` and how mapping handles variations