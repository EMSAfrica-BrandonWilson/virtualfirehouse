-- Migration: add_user_activity_audit_log
-- Created at: 1759848814

-- Create user activity log table for audit trail
CREATE TABLE IF NOT EXISTS public.user_activity_log (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    action VARCHAR(50) NOT NULL,
    target_user_id UUID,
    details JSONB,
    performed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS user_activity_log_user_id_idx ON public.user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS user_activity_log_target_user_id_idx ON public.user_activity_log(target_user_id);
CREATE INDEX IF NOT EXISTS user_activity_log_performed_at_idx ON public.user_activity_log(performed_at);

-- Enable RLS
ALTER TABLE public.user_activity_log ENABLE ROW LEVEL SECURITY;

-- Create policy for system admins to view all activity logs
CREATE POLICY "System admins can view all activity logs" 
ON public.user_activity_log FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role_name = 'system_admin'
    )
);

-- Create policy for system admins to insert activity logs
CREATE POLICY "System admins can insert activity logs" 
ON public.user_activity_log FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role_name = 'system_admin'
    )
);;