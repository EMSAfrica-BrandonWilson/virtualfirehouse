CREATE TABLE page_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_name VARCHAR(100) NOT NULL,
    image_url TEXT NOT NULL,
    image_name VARCHAR(255) NOT NULL,
    uploaded_by UUID NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);