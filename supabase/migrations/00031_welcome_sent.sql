-- Add welcome_sent column to profiles table
-- Run this in Supabase SQL Editor
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS welcome_sent BOOLEAN DEFAULT false;
