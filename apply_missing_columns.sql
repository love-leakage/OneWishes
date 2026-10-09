-- Add the new columns introduced in the Kinetic Typography redesign
ALTER TABLE public.wishes ADD COLUMN IF NOT EXISTS to_username TEXT;
ALTER TABLE public.wishes ADD COLUMN IF NOT EXISTS media_type TEXT CHECK (media_type IN ('image', 'video', null));

-- Reload the PostgREST schema cache so the API recognizes the new columns instantly
NOTIFY pgrst, 'reload schema';
