# Manual Migration Instructions

The `npx supabase db push` command failed because the project is not linked locally. You can run the migration manually using the Supabase dashboard.

## Immediate Action Required: Rename Columns to Store Names

We updated the application to save **Call Taker Names** and **Dispatcher Names** instead of their IDs. The database columns need to be renamed to match this change.

### Steps

1.  Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2.  Select your project.
3.  Go to **SQL Editor** (in the left sidebar).
4.  Click **New Query**.
5.  Copy the SQL code below and paste it into the editor:

```sql
-- Rename call_taker_id to call_taker_name in 03_ecc_03_01_Incident_Call_Taking
ALTER TABLE "03_ecc_03_01_Incident_Call_Taking" 
RENAME COLUMN "call_taker_id" TO "call_taker_name";

-- Rename dispatcher_id to dispatcher_name in 03_ecc_03_02_Incident_Call_Dispatching
ALTER TABLE "03_ecc_03_02_Incident_Call_Dispatching" 
RENAME COLUMN "dispatcher_id" TO "dispatcher_name";

-- Rename call_taker_id to call_taker_name in 03_ecc_03_05_Incident_Cancellations
ALTER TABLE "03_ecc_03_05_Incident_Cancellations" 
RENAME COLUMN "call_taker_id" TO "call_taker_name";
```

6.  Click **Run** (or press Ctrl+Enter).

---

## Previous Manual Migrations (Reference)

### Create Report Recipients Table
If you see errors regarding `report_recipients`, run this:
(See `supabase/migrations/create_report_recipients_table.sql` for content if needed, usually this is already applied).
