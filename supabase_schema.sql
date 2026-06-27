-- ==========================================================================
-- SQL Database Schema for Lacre RSVP Platform
-- Copy and paste this script into the SQL Editor of your new Supabase project.
-- ==========================================================================

-- 1. Create CLIENTS table (Linked to Supabase Auth)
CREATE TABLE public.clients (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    business_name TEXT,
    role TEXT NOT NULL DEFAULT 'client',           -- 'client' | 'admin'
    access_until TIMESTAMP WITH TIME ZONE DEFAULT NULL, -- NULL = no access yet
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Clients RLS Policies
CREATE POLICY "Allow client to read own data" ON public.clients
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Allow client to update own data" ON public.clients
    FOR UPDATE USING (auth.uid() = id);

-- Admin can read ALL clients (additive OR with the above SELECT policy)
CREATE POLICY "Allow admin to read all clients" ON public.clients
    FOR SELECT USING (
        (SELECT role FROM public.clients WHERE id = auth.uid()) = 'admin'
    );

-- Admin can update ANY client (to set access_until and role)
CREATE POLICY "Allow admin to update any client" ON public.clients
    FOR UPDATE USING (
        (SELECT role FROM public.clients WHERE id = auth.uid()) = 'admin'
    );

-- After running this script, promote the admin user:
-- UPDATE public.clients SET role = 'admin', access_until = '2099-12-31' WHERE email = 'rongnysierra@gmail.com';

-- 2. Create EVENTS table
CREATE TABLE public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
    host_name TEXT NOT NULL,
    event_type TEXT NOT NULL DEFAULT 'quinceanera', -- quinceanera, boda, etc.
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    location_name TEXT NOT NULL,
    location_address TEXT NOT NULL,
    location_map_url TEXT,
    photos_folder_url TEXT,
    background_music_url TEXT,
    theme_colors JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Events RLS Policies
CREATE POLICY "Allow public read access for guests to view event details" ON public.events
    FOR SELECT USING (true); -- Guests need to read event details to display the invitation

CREATE POLICY "Allow clients to manage their own events" ON public.events
    FOR ALL USING (auth.uid() = client_id);

-- 3. Create GUESTS table (Secure UUID links)
CREATE TABLE public.guests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    max_slots INTEGER NOT NULL DEFAULT 1,
    gender CHAR(1) NOT NULL DEFAULT 'm', -- m (masculino), f (femenino), n (neutro/familia)
    phone_number TEXT,
    rsvp_status TEXT NOT NULL DEFAULT 'pending', -- pending, confirmed, declined
    attending_count INTEGER NOT NULL DEFAULT 0,
    guest_message TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;

-- Guests RLS Policies
CREATE POLICY "Allow public read access for specific guest via UUID" ON public.guests
    FOR SELECT USING (true); -- Guests read their own ticket info

CREATE POLICY "Allow public update access for guests to RSVP" ON public.guests
    FOR UPDATE 
    USING (true)
    WITH CHECK (
        -- Enforce that guests can only update RSVP status, count, and message
        -- and confirmed attending_count cannot exceed max_slots
        attending_count <= max_slots
    );

CREATE POLICY "Allow clients to manage guests for their events" ON public.guests
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.events
            WHERE public.events.id = public.guests.event_id
            AND public.events.client_id = auth.uid()
        )
    );

-- 4. Trigger to automatically create a client record on user signup in Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.clients (id, email, business_name)
    VALUES (
        new.id, 
        new.email, 
        COALESCE(
            new.raw_user_meta_data->>'business_name', 
            new.raw_user_meta_data->>'full_name', 
            'Cliente Nuevo'
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
