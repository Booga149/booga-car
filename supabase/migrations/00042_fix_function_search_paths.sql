-- ============================================================
-- Fix "Function search path is mutable" Warnings dynamically
-- ============================================================

-- This block automatically loops through all functions in the 
-- public schema and explicitly sets their search_path to 'public'
-- which satisfies the Supabase Security Linter's requirements.

DO $$
DECLARE
    rec record;
BEGIN
    FOR rec IN 
        SELECT p.oid::regprocedure AS func_signature
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
        -- Only target functions that don't already have config set
        AND p.proconfig IS NULL
    LOOP
        EXECUTE 'ALTER FUNCTION ' || rec.func_signature || ' SET search_path = public';
    END LOOP;
END;
$$;
