-- Database schema for Shift Tracker application

-- Enable UUID extension (required for Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (managed by Supabase Auth)
-- Note: Supabase Auth already creates and manages the 'auth.users' table
-- The following is a public view/table that references the auth users

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create companies table
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    hourly_wage NUMERIC(10, 2) NOT NULL CHECK (hourly_wage >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- Additional constraint to ensure company names are unique per user
    UNIQUE (user_id, name)
);

-- Create shifts table
CREATE TABLE IF NOT EXISTS public.shifts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- Additional constraint to ensure end_time is after start_time
    CONSTRAINT end_time_after_start_time CHECK (end_time > start_time)
);

-- Create indexes for better query performance
CREATE INDEX idx_companies_user_id ON public.companies(user_id);
CREATE INDEX idx_shifts_user_id ON public.shifts(user_id);
CREATE INDEX idx_shifts_company_id ON public.shifts(company_id);
CREATE INDEX idx_shifts_date ON public.shifts(date);

-- Row Level Security (RLS) Policies
-- Enable RLS on tables
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies to restrict access to user's own data
-- Profiles table policy
CREATE POLICY profiles_policy ON public.profiles
    FOR ALL
    USING (auth.uid() = id);

-- Companies table policies
CREATE POLICY companies_select_policy ON public.companies
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY companies_insert_policy ON public.companies
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY companies_update_policy ON public.companies
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY companies_delete_policy ON public.companies
    FOR DELETE
    USING (auth.uid() = user_id);

-- Shifts table policies
CREATE POLICY shifts_select_policy ON public.shifts
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY shifts_insert_policy ON public.shifts
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY shifts_update_policy ON public.shifts
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY shifts_delete_policy ON public.shifts
    FOR DELETE
    USING (auth.uid() = user_id);

-- Functions for computed values like total hours and earnings
CREATE OR REPLACE FUNCTION calculate_shift_hours(start_time TIME, end_time TIME)
RETURNS NUMERIC AS $$
BEGIN
    RETURN EXTRACT(EPOCH FROM (end_time - start_time))/3600;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION calculate_shift_earnings(start_time TIME, end_time TIME, hourly_wage NUMERIC)
RETURNS NUMERIC AS $$
BEGIN
    RETURN (EXTRACT(EPOCH FROM (end_time - start_time))/3600) * hourly_wage;
END;
$$ LANGUAGE plpgsql IMMUTABLE;


-- Triggers to update the 'updated_at' timestamp automatically
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER set_timestamp_companies
BEFORE UPDATE ON public.companies
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER set_timestamp_shifts
BEFORE UPDATE ON public.shifts
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();