# Manual Migration Instructions

The `npx supabase db push` command failed. You can run the migration manually using the Supabase dashboard.

## Steps

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **SQL Editor** (in the left sidebar)
4. Click **New Query**
5. Copy the contents of `supabase/migrations/create_report_recipients_table.sql`
6. Paste into the SQL editor
7. Click **Run** (or press Ctrl+Enter)

The migration will create the `report_recipients` table and fix the error.

## After Running the Migration

Refresh the page at `/control/daily-occurrence-book/report-recipients` and the error should be gone.
