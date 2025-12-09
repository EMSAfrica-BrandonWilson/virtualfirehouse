
INSERT INTO public."02_admin_register_fd2_operational_shifts" (shift_name, active, description)
VALUES 
  ('Red', true, 'Red Shift'),
  ('Blue', true, 'Blue Shift'),
  ('Green', true, 'Green Shift')
ON CONFLICT DO NOTHING;
