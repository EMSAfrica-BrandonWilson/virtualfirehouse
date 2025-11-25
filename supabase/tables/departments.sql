CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    dept_name VARCHAR(255) NOT NULL,
    dept_city VARCHAR(255) NOT NULL,
    dept_suburb VARCHAR(255),
    dept_street_name VARCHAR(255),
    dept_street_number VARCHAR(100),
    dept_telephone VARCHAR(50),
    dept_picture_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);