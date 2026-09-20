-- ==========================================
-- ONEWISHES - COMPLETE DATABASE SCHEMA UPGRADE
-- Execute this script in Supabase SQL Editor
-- ==========================================

-- 1. CLEANUP (Drop existing objects if any)
DROP FUNCTION IF EXISTS public.claim_golden_wish() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP TABLE IF EXISTS public.neverfade_bookings CASCADE;
DROP TABLE IF EXISTS public.spotlight_bookings CASCADE;
DROP TABLE IF EXISTS public.wishes CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 2. PROFILES TABLE (User identity, unique username & lifetime golden count)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    username TEXT UNIQUE,
    golden_used INTEGER NOT NULL DEFAULT 0 CHECK (golden_used >= 0 AND golden_used <= 3),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view usernames"
    ON public.profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

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

-- 4. WISHES TABLE (Stores Spark, Golden, Neverfade wishes with Media & Privacy)
CREATE TABLE public.wishes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    sender_username TEXT NOT NULL,
    tier TEXT NOT NULL CHECK (tier IN ('spark', 'golden', 'neverfade')),
    from_name TEXT NOT NULL,
    to_name TEXT NOT NULL,
    message TEXT NOT NULL,
    media_url TEXT,
    media_type TEXT CHECK (media_type IN ('image', 'video', null)),
    privacy TEXT NOT NULL DEFAULT 'public' CHECK (privacy IN ('public', 'private')),
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.wishes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view wishes"
    ON public.wishes FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can create wishes"
    ON public.wishes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own wishes"
    ON public.wishes FOR DELETE
    USING (auth.uid() = user_id);

-- 5. NEVERFADE BOOKINGS TABLE (Atomic 1-slot-per-day enforcement)
CREATE TABLE public.neverfade_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_date DATE NOT NULL UNIQUE,
    wish_id UUID NOT NULL REFERENCES public.wishes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.neverfade_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view neverfade bookings"
    ON public.neverfade_bookings FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can book neverfade date"
    ON public.neverfade_bookings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 6. ATOMIC GOLDEN WISH CLAIM RPC
CREATE OR REPLACE FUNCTION public.claim_golden_wish()
RETURNS BOOLEAN AS $$
DECLARE
    current_used INT;
BEGIN
    IF auth.uid() IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Lock the user's profile row
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
