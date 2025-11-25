## Scope

* Update the `/guestbook` page to read and write from `01_home_guestbook`.

## Changes

* In `src/pages/Guestbook.tsx`:

  * Replace all `supabase.from('home_guestbook_messages')` calls with `supabase.from('01_home_guestbook')`.

  * Keep queries: `select('*')`, `eq('is_approved', true)`, and `order('created_at', { ascending: false })`.

  * Insert payload stays the same (`name`, `email`, `location`, `message`, `is_approved: false`).

## Validation

* Reload `/guestbook` and verify approved entries load from `01_home_guestbook`.

* Submit a new entry and confirm it is inserted into `01_home_guestbook` and appears in the list.

* Check no console or network errors.

## Notes

* If column names differ in `01_home_guestbook`, I’ll map them defensively after testing.

