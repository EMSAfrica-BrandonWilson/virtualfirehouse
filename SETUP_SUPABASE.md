# Supabase Configuration

To run the application with Supabase, you need to configure the environment variables.

1.  Create a file named `.env` in the root directory (`e:\VirtualFireHouse\virtualfirehouse`).
2.  Add the following content to the `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Where to find these values?

1.  Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2.  Select your project.
3.  Go to **Settings** -> **API**.
4.  Copy the **Project URL** and paste it as `VITE_SUPABASE_URL`.
5.  Copy the **anon** / **public** key and paste it as `VITE_SUPABASE_ANON_KEY`.

## Restart the Server

After creating the `.env` file, you must restart the development server for the changes to take effect:

1.  Stop the current server (Ctrl+C).
2.  Run `pnpm dev` again.
