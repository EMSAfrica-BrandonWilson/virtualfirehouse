-- Migration: Create Countries Table
-- Created: 2025-11-08
-- Description: Creates the countries table for managing country dropdown options

-- Create countries table
CREATE TABLE IF NOT EXISTS public.countries (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    display_name VARCHAR(255) NOT NULL UNIQUE,
    iso_code VARCHAR(2) UNIQUE,
    iso3_code VARCHAR(3) UNIQUE,
    phone_code VARCHAR(10),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Create indexes for better performance
CREATE INDEX idx_countries_name ON public.countries(name);
CREATE INDEX idx_countries_display_name ON public.countries(display_name);
CREATE INDEX idx_countries_iso_code ON public.countries(iso_code);
CREATE INDEX idx_countries_active ON public.countries(is_active);
CREATE INDEX idx_countries_created_at ON public.countries(created_at);

-- Insert common countries
INSERT INTO public.countries (name, display_name, iso_code, iso3_code, phone_code, is_active) VALUES
('united_states', 'United States', 'US', 'USA', '+1', TRUE),
('canada', 'Canada', 'CA', 'CAN', '+1', TRUE),
('united_kingdom', 'United Kingdom', 'GB', 'GBR', '+44', TRUE),
('australia', 'Australia', 'AU', 'AUS', '+61', TRUE),
('germany', 'Germany', 'DE', 'DEU', '+49', TRUE),
('france', 'France', 'FR', 'FRA', '+33', TRUE),
('japan', 'Japan', 'JP', 'JPN', '+81', TRUE),
('china', 'China', 'CN', 'CHN', '+86', TRUE),
('india', 'India', 'IN', 'IND', '+91', TRUE),
('brazil', 'Brazil', 'BR', 'BRA', '+55', TRUE),
('mexico', 'Mexico', 'MX', 'MEX', '+52', TRUE),
('south_africa', 'South Africa', 'ZA', 'ZAF', '+27', TRUE),
('saudi_arabia', 'Saudi Arabia', 'SA', 'SAU', '+966', TRUE),
('uae', 'United Arab Emirates', 'AE', 'ARE', '+971', TRUE),
('other', 'Other', 'OT', 'OTH', NULL, TRUE);

-- Add table comment
COMMENT ON TABLE public.countries IS 'Stores country dropdown options for department registration forms';