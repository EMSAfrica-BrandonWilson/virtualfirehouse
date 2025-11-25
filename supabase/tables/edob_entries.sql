CREATE TABLE edob_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_type VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    action_taken TEXT NOT NULL,
    reported_by VARCHAR(255) NOT NULL,
    reported_by_email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create an index on created_at for faster sorting
CREATE INDEX idx_edob_entries_created_at ON edob_entries(created_at DESC);

-- Create an index on incident_type for filtering
CREATE INDEX idx_edob_entries_incident_type ON edob_entries(incident_type);
