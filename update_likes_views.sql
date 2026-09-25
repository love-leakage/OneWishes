-- Drop existing RPC functions if any
DROP FUNCTION IF EXISTS public.increment_wish_likes(UUID, INT);
DROP FUNCTION IF EXISTS public.increment_wish_likes(UUID);
DROP FUNCTION IF EXISTS public.increment_wish_views(UUID);

-- Create RPC function for atomic like incrementing
CREATE OR REPLACE FUNCTION public.increment_wish_likes(target_wish_id UUID, delta INT DEFAULT 1)
RETURNS INTEGER AS $$
DECLARE
    new_count INT;
BEGIN
    UPDATE public.wishes
    SET likes_count = GREATEST(0, COALESCE(likes_count, 0) + delta)
    WHERE id = target_wish_id
    RETURNING likes_count INTO new_count;

    RETURN new_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create RPC function for atomic view incrementing
CREATE OR REPLACE FUNCTION public.increment_wish_views(target_wish_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.wishes
    SET views_count = COALESCE(views_count, 0) + 1
    WHERE id = target_wish_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Update Policy on wishes table
DROP POLICY IF EXISTS "Public can update wish views and likes" ON public.wishes;
CREATE POLICY "Public can update wish views and likes"
    ON public.wishes FOR UPDATE
    USING (true)
    WITH CHECK (true);
