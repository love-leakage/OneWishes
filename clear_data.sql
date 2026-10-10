-- Run this in Supabase SQL Editor to clear all user data and wishes
-- WARNING: This will delete ALL users, profiles, wishes, and bookings.

-- Disable triggers temporarily to avoid foreign key constraints failing
SET session_replication_role = 'replica';

-- Truncate all tables
TRUNCATE TABLE public.onewish_bookings CASCADE;
TRUNCATE TABLE public.wishes CASCADE;
TRUNCATE TABLE public.profiles CASCADE;

-- Delete auth users (this will also cascade if any other auth relations exist)
DELETE FROM auth.users;

-- Re-enable triggers
SET session_replication_role = 'origin';
