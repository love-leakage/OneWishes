-- ==========================================
-- ONEWISHES - FRESH DATABASE RESET SCHEMA
-- Execute this script in Supabase SQL Editor
-- ==========================================

-- 1. CLEANUP (Drop existing objects if any)
DROP FUNCTION IF EXISTS public.claim_golden_wish() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP TABLE IF EXISTS public.spotlight_bookings CASCADE;
DROP TABLE IF EXISTS public.wishes CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 2. PROFILES TABLE (Tracks user lifetime golden wish limit)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    golden_used INTEGER NOT NULL DEFAULT 0 CHECK (golden_used >= 0 AND golden_used <= 3),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- 3. TRIGGER FOR AUTOMATIC PROFILE CREATION ON USER SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, golden_used)
    VALUES (NEW.id, NEW.email, 0)
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. WISHES TABLE (Stores Spark, Golden, Spotlight wishes)
CREATE TABLE public.wishes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    tier TEXT NOT NULL CHECK (tier IN ('spark', 'golden', 'spotlight')),
    from_name TEXT NOT NULL,
    to_name TEXT NOT NULL,
    message TEXT NOT NULL,
    photo_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.wishes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view any wish via shareable link"
    ON public.wishes FOR SELECT
    USING (true);

CREATE POLICY "Creation policy based on tier"
    ON public.wishes FOR INSERT
    WITH CHECK (
        (tier = 'spark') OR (auth.uid() IS NOT NULL AND auth.uid() = user_id)
    );

-- 5. SPOTLIGHT BOOKINGS TABLE (Atomic 1-slot-per-day enforcement)
CREATE TABLE public.spotlight_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_date DATE NOT NULL UNIQUE,
    wish_id UUID NOT NULL REFERENCES public.wishes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.spotlight_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view spotlight bookings"
    ON public.spotlight_bookings FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can book spotlight date"
    ON public.spotlight_bookings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 6. ATOMIC GOLDEN WISH CLAIM RPC (Server-enforced row lock)
CREATE OR REPLACE FUNCTION public.claim_golden_wish()
RETURNS BOOLEAN AS $$
DECLARE
    current_used INT;
BEGIN
    IF auth.uid() IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Lock the user's profile row to prevent race conditions
    SELECT golden_used INTO current_used
    FROM public.profiles
    WHERE id = auth.uid()
    FOR UPDATE;

    IF current_used IS NULL OR current_used >= 3 THEN
        RETURN FALSE;
    END IF;

    UPDATE public.profiles
    SET golden_used = golden_used + 1
    WHERE id = auth.uid();

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
