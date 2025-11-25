CREATE TABLE department_contacts (
    id SERIAL PRIMARY KEY,
    department_id INTEGER,
    contact_name VARCHAR(255) NOT NULL,
    contact_title VARCHAR(255),
    contact_email VARCHAR(255),
    contact_telephone VARCHAR(50),
    contact_picture_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);