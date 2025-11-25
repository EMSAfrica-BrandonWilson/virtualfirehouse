## Findings From Reported Errors

* Console shows a 404 on `GET /rest/v1/advertisers?...` which likely blocks the page’s render while an unhandled promise error propagates.

* Prior dropdown issues stem from inconsistent, duplicated data-loading and state clearing during fetch cycles.

## Investigation Actions

1. Browser Console: capture stack traces around the failed `advertisers` request and any React/runtime errors.
2. Network Tab: inspect requests to `advertisers`, `vehicle_call_signs`, `admin_register_fire_vehicles` and static assets; verify status codes, payloads, and timing.
3. Server Responses: confirm whether `advertisers` table exists; if not, expect 404 and handle gracefully.
4. JavaScript Flow: review mount effects and how failures are handled (try/catch, promise rejections); trace dropdown state mutations and controlled Select value.
5. HTML/CSS: verify the form renders with valid structure; ensure the Select has a matching option for its current value.

## Implementation Plan

### A. Guard Missing Advertisers (404)

* Locate advertiser fetch (likely a home/banner or shared component) and wrap in `try/catch`.

* On 404/missing table: set a safe default (`[]`), hide the section, and do NOT throw; log non-blocking warning.

* If advertisers were renamed, make table name configurable or switch to the new table if provided.

### B. Stabilize Call Sign Loading

* Create `loadCallSigns()` inside the vehicle page component:

  * Query `vehicle_call_signs` with defensive mapping: `{ id, name: name || vehicle_callsign || call_sign || code, active }`.

  * Do not clear `callSigns` on error; retain previous options and show non-blocking message.

  * If a selected call sign exists, ensure it remains in options; if missing, append a temporary option.

* Initialize on mount and reuse instead of duplicating mapping across loaders.

### C. Persist Selection Across Refresh

* Read saved call sign from `sessionStorage` on mount and set `veh_call_sign`.

* Persist on selection change and after modal actions.

* Prevent clearing `veh_call_sign` unless the user selects the placeholder.

### D. Robust Controlled Select

* Ensure the Select’s `value` always has a matching option.

* If no options available yet, temporarily disable the Select or show a loading placeholder rather than resetting the value.

### E. Performance (<3s)

* Fetch call signs and vehicles in parallel; batch state updates to avoid extra re-renders.

* Defer non-critical images; keep existing placeholder/fallback.

* Avoid any blocking awaits before first render; render the shell immediately and hydrate as data returns.

## Verification

* Reload `/admin/register/vehicles/process` and confirm:

  * No blocking console errors (404 is handled gracefully).

  * Dropdown options render on mount; selection persists across refresh.

  * Modal prompts for existing/new vehicles still work.

  * Page becomes interactive within \~3s and all critical assets load successfully.

## Documentation

* Record the root causes:

  * Unhandled 404 on `advertisers` caused render failure.

  * Duplicated/fragile dropdown loading caused state clears.

* Document the code changes (guards, consolidated loader, persistence) and rationale for future maintenance.

