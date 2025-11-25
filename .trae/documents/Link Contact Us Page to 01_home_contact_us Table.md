## Scope
- Update the `/contact-us` page to read and write from `01_home_contact_us` instead of the previous table.

## Changes
- In `src/pages/ContactUs.tsx`:
  - Replace all `supabase.from('home_contact_us_messages')` calls with `supabase.from('01_home_contact_us')`.
  - Keep queries defensive: `select('*')` and order by `created_at` when listing recent messages.
  - Insert payload fields remain: `name`, `email`, `subject`, `message`, `status` (set to `'new'`).

## Validation
- Reload `/contact-us` and confirm recent messages list renders from `01_home_contact_us`.
- Submit the form and verify the new entry appears at the top.
- Ensure no console or network errors.

## Notes
- Assumes `01_home_contact_us` has columns compatible with the page: `name`, `email`, `subject`, `message`, `status`, `created_at`.
- If column names differ, I’ll add defensive mapping after testing.