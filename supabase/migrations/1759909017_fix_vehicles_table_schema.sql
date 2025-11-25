-- Migration: fix_vehicles_table_schema
-- Created at: 1759909017

-- Add missing columns to vehicles table to match edge function expectations

-- Add missing columns if they don't exist
DO $$ 
BEGIN 
    -- Add vehicle_model column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vehicles' AND column_name = 'vehicle_model') THEN
        ALTER TABLE vehicles ADD COLUMN vehicle_model TEXT;
    END IF;
    
    -- Add model_year column  
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vehicles' AND column_name = 'model_year') THEN
        ALTER TABLE vehicles ADD COLUMN model_year INTEGER;
    END IF;
    
    -- Add created_by column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vehicles' AND column_name = 'created_by') THEN
        ALTER TABLE vehicles ADD COLUMN created_by UUID;
    END IF;
    
    -- Add updated_by column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vehicles' AND column_name = 'updated_by') THEN
        ALTER TABLE vehicles ADD COLUMN updated_by UUID;
    END IF;
END $$;

-- Make veh_plate_no nullable since edge function treats it as optional
ALTER TABLE vehicles ALTER COLUMN veh_plate_no DROP NOT NULL;

-- Remove fire_dept_id and fire_station_id constraints if they're required but edge function doesn't handle them
ALTER TABLE vehicles ALTER COLUMN fire_dept_id DROP NOT NULL;
ALTER TABLE vehicles ALTER COLUMN fire_station_id DROP NOT NULL;;