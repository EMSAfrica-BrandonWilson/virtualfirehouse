-- Migration: create_vehicle_station_assignment_audit_log
-- Created at: 1761250001
-- Purpose: Create audit log table for vehicle station assignments change tracking

-- Create audit log table for vehicle station assignments
CREATE TABLE IF NOT EXISTS public.vehicle_station_assignment_audit_log (
    id SERIAL PRIMARY KEY,
    assignment_id INTEGER REFERENCES public.vehicle_station_assignments(id) ON DELETE CASCADE,
    action VARCHAR(20) NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE')),
    changed_by UUID REFERENCES auth.users(id),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Store the changes made (old values and new values)
    old_values JSONB,
    new_values JSONB,
    
    -- Additional context
    assignment_date DATE NOT NULL,
    vehicle_id INTEGER,
    call_sign VARCHAR(100)
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS vehicle_station_assignment_audit_log_assignment_id_idx ON public.vehicle_station_assignment_audit_log(assignment_id);
CREATE INDEX IF NOT EXISTS vehicle_station_assignment_audit_log_changed_by_idx ON public.vehicle_station_assignment_audit_log(changed_by);
CREATE INDEX IF NOT EXISTS vehicle_station_assignment_audit_log_changed_at_idx ON public.vehicle_station_assignment_audit_log(changed_at);
CREATE INDEX IF NOT EXISTS vehicle_station_assignment_audit_log_action_idx ON public.vehicle_station_assignment_audit_log(action);
CREATE INDEX IF NOT EXISTS vehicle_station_assignment_audit_log_date_idx ON public.vehicle_station_assignment_audit_log(assignment_date);

-- Enable RLS
ALTER TABLE public.vehicle_station_assignment_audit_log ENABLE ROW LEVEL SECURITY;

-- Create policy for system admins to view all audit logs
CREATE POLICY "System admins can view vehicle station assignment audit logs" 
ON public.vehicle_station_assignment_audit_log FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role_name = 'system_admin'
    )
);

-- Create policy for system admins to insert audit logs
CREATE POLICY "System admins can insert vehicle station assignment audit logs" 
ON public.vehicle_station_assignment_audit_log FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role_name = 'system_admin'
    )
);

-- Create function to log changes automatically
CREATE OR REPLACE FUNCTION log_vehicle_station_assignment_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Log INSERT operations
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.vehicle_station_assignment_audit_log (
            assignment_id,
            action,
            changed_by,
            new_values,
            assignment_date,
            vehicle_id,
            call_sign
        ) VALUES (
            NEW.id,
            'CREATE',
            NEW.created_by,
            to_jsonb(NEW),
            NEW.assignment_date,
            NEW.vehicle_id,
            NEW.call_sign
        );
        RETURN NEW;
    END IF;
    
    -- Log UPDATE operations
    IF TG_OP = 'UPDATE' THEN
        INSERT INTO public.vehicle_station_assignment_audit_log (
            assignment_id,
            action,
            changed_by,
            old_values,
            new_values,
            assignment_date,
            vehicle_id,
            call_sign
        ) VALUES (
            NEW.id,
            'UPDATE',
            NEW.updated_by,
            to_jsonb(OLD),
            to_jsonb(NEW),
            NEW.assignment_date,
            NEW.vehicle_id,
            NEW.call_sign
        );
        RETURN NEW;
    END IF;
    
    -- Log DELETE operations
    IF TG_OP = 'DELETE' THEN
        INSERT INTO public.vehicle_station_assignment_audit_log (
            assignment_id,
            action,
            changed_by,
            old_values,
            assignment_date,
            vehicle_id,
            call_sign
        ) VALUES (
            OLD.id,
            'DELETE',
            OLD.updated_by,
            to_jsonb(OLD),
            OLD.assignment_date,
            OLD.vehicle_id,
            OLD.call_sign
        );
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Create trigger for audit logging
CREATE TRIGGER vehicle_station_assignment_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.vehicle_station_assignments
    FOR EACH ROW EXECUTE FUNCTION log_vehicle_station_assignment_changes();