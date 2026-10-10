-- Run this in Supabase SQL Editor to wipe out all data
-- Since all our tables are linked to auth.users via ON DELETE CASCADE,
-- deleting the users will automatically delete all profiles, wishes, and bookings.

DELETE FROM auth.users WHERE id IS NOT NULL;
