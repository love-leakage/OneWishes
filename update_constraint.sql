-- Drop the old constraint
ALTER TABLE public.wishes DROP CONSTRAINT IF EXISTS wishes_tier_check;

-- Add the new constraint allowing golden and onewish
ALTER TABLE public.wishes ADD CONSTRAINT wishes_tier_check CHECK (tier IN ('golden', 'onewish'));
