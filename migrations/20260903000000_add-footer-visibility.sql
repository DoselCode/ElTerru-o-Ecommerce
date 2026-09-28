ALTER TABLE store_info
  ADD COLUMN IF NOT EXISTS instagram_url text,
  ADD COLUMN IF NOT EXISTS show_phone boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_whatsapp boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_email boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_address boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_instagram boolean NOT NULL DEFAULT true;

-- Reload Supabase PostgREST schema cache
NOTIFY pgrst, 'reload schema';
