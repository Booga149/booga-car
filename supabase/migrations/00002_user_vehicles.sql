-- Create user_vehicles table
CREATE TABLE IF NOT EXISTS public.user_vehicles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    vin TEXT NOT NULL,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    year TEXT NOT NULL,
    current_mileage INTEGER DEFAULT 0,
    last_oil_service INTEGER DEFAULT 0,
    last_brake_service INTEGER DEFAULT 0,
    nickname TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Set up RLS (Row Level Security)
ALTER TABLE public.user_vehicles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own vehicles
CREATE POLICY "Users can view their own vehicles" 
ON public.user_vehicles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy: Users can only insert their own vehicles
CREATE POLICY "Users can insert their own vehicles" 
ON public.user_vehicles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only update their own vehicles
CREATE POLICY "Users can update their own vehicles" 
ON public.user_vehicles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Policy: Users can only delete their own vehicles
CREATE POLICY "Users can delete their own vehicles" 
ON public.user_vehicles 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create a trigger to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_vehicles_updated_at
    BEFORE UPDATE ON public.user_vehicles
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
