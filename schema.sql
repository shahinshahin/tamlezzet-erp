-- TamLezzet ERP Schema

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(255),
    role VARCHAR(50) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    mfa_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    mfa_secret VARCHAR(255),
    last_login_at TIMESTAMP,
    refresh_token VARCHAR(255),
    refresh_token_expiry TIMESTAMP,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

CREATE TABLE customers (
    id BIGSERIAL PRIMARY KEY,
    customer_code VARCHAR(255) NOT NULL UNIQUE,
    company_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255),
    whatsapp VARCHAR(255),
    phone VARCHAR(255),
    country VARCHAR(255) NOT NULL,
    city VARCHAR(255),
    address VARCHAR(255),
    stage VARCHAR(50) NOT NULL DEFAULT 'LEAD',
    notes VARCHAR(1000),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

CREATE TABLE customer_interested_products (
    customer_id BIGINT NOT NULL REFERENCES customers(id),
    product VARCHAR(255)
);

CREATE TABLE sample_requests (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL REFERENCES customers(id),
    product_name VARCHAR(255) NOT NULL,
    specification VARCHAR(255),
    request_date DATE NOT NULL,
    dispatch_date DATE,
    tracking_number VARCHAR(255),
    status VARCHAR(50) DEFAULT 'REQUESTED',
    feedback VARCHAR(255),
    notes VARCHAR(255),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

CREATE TABLE documents (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    s3_key VARCHAR(255) NOT NULL,
    original_file_name VARCHAR(255),
    content_type VARCHAR(255),
    file_size_bytes BIGINT,
    issue_date DATE,
    expiry_date DATE,
    reference_number VARCHAR(255),
    description VARCHAR(1000),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

CREATE TABLE expenses (
    id BIGSERIAL PRIMARY KEY,
    expense_date DATE NOT NULL,
    amount NUMERIC(14,2) NOT NULL,
    gst_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
    category VARCHAR(50) NOT NULL,
    vendor VARCHAR(255) NOT NULL,
    payment_mode VARCHAR(50),
    reference_number VARCHAR(255),
    invoice_url VARCHAR(255),
    notes VARCHAR(1000),
    approval_status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    approved_by VARCHAR(255),
    fiscal_year VARCHAR(255),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

CREATE TABLE shipments (
    id BIGSERIAL PRIMARY KEY,
    shipment_number VARCHAR(255) NOT NULL UNIQUE,
    buyer_name VARCHAR(255) NOT NULL,
    buyer_code VARCHAR(255),
    destination_country VARCHAR(255) NOT NULL,
    destination_port VARCHAR(255),
    origin_port VARCHAR(255),
    container_number VARCHAR(255),
    vessel_name VARCHAR(255),
    voyage_number VARCHAR(255),
    shipment_date DATE,
    etd DATE,
    eta DATE,
    actual_arrival DATE,
    invoice_number VARCHAR(255),
    shipping_bill_number VARCHAR(255),
    net_weight_kg NUMERIC(14,3),
    gross_weight_kg NUMERIC(14,3),
    invoice_value_usd NUMERIC(14,2),
    freight_cost NUMERIC(14,2),
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    payment_status VARCHAR(50) DEFAULT 'PENDING',
    notes VARCHAR(1000),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

CREATE TABLE shipment_doc_urls (
    shipment_id BIGINT NOT NULL REFERENCES shipments(id),
    doc_url VARCHAR(255)
);

CREATE TABLE farmers (
    id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    village VARCHAR(255) NOT NULL,
    taluka VARCHAR(255),
    district VARCHAR(255),
    state VARCHAR(255),
    mobile VARCHAR(255) UNIQUE,
    alternate_mobile VARCHAR(255),
    crop_name VARCHAR(255),
    crop_variety VARCHAR(255),
    harvest_month VARCHAR(3),
    harvest_year INTEGER,
    quality_rating NUMERIC(3,1),
    latitude NUMERIC(10,6),
    longitude NUMERIC(10,6),
    notes VARCHAR(1000),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

CREATE TABLE farmer_photos (
    farmer_id BIGINT NOT NULL REFERENCES farmers(id),
    photo_url VARCHAR(255)
);

CREATE TABLE farmer_purchases (
    id BIGSERIAL PRIMARY KEY,
    farmer_id BIGINT NOT NULL REFERENCES farmers(id),
    purchase_date DATE NOT NULL,
    crop_name VARCHAR(255) NOT NULL,
    crop_variety VARCHAR(255),
    quantity_kg NUMERIC(10,2) NOT NULL,
    price_per_kg NUMERIC(10,2) NOT NULL,
    total_amount NUMERIC(14,2) NOT NULL,
    batch_number VARCHAR(255),
    payment_status VARCHAR(50),
    notes VARCHAR(255),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

CREATE TABLE sales_invoices (
    id BIGSERIAL PRIMARY KEY,
    invoice_number VARCHAR(255) NOT NULL UNIQUE,
    customer_name VARCHAR(255) NOT NULL,
    customer_code VARCHAR(255),
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    currency VARCHAR(3) NOT NULL,
    exchange_rate NUMERIC(10,4) NOT NULL,
    amount_foreign NUMERIC(14,2) NOT NULL,
    amount_inr NUMERIC(14,2) NOT NULL,
    received_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
    outstanding_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'UNPAID',
    invoice_doc_url VARCHAR(255),
    notes VARCHAR(1000),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

CREATE TABLE payment_receipts (
    id BIGSERIAL PRIMARY KEY,
    invoice_id BIGINT NOT NULL REFERENCES sales_invoices(id),
    receipt_date DATE NOT NULL,
    amount_foreign NUMERIC(14,2) NOT NULL,
    amount_inr NUMERIC(14,2) NOT NULL,
    exchange_rate NUMERIC(10,4) NOT NULL,
    bank_reference VARCHAR(255),
    notes VARCHAR(255),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

CREATE TABLE inventory_items (
    id BIGSERIAL PRIMARY KEY,
    item_name VARCHAR(255) NOT NULL,
    item_type VARCHAR(50) NOT NULL,
    sku VARCHAR(255),
    batch_number VARCHAR(255),
    warehouse VARCHAR(255),
    quantity NUMERIC(14,3) NOT NULL,
    unit VARCHAR(255) NOT NULL,
    reorder_level NUMERIC(10,2),
    cost_per_unit NUMERIC(10,2),
    expiry_date DATE,
    manufacture_date DATE,
    notes VARCHAR(1000),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

CREATE TABLE stock_movements (
    id BIGSERIAL PRIMARY KEY,
    item_id BIGINT NOT NULL REFERENCES inventory_items(id),
    movement_type VARCHAR(50) NOT NULL,
    quantity NUMERIC(14,3) NOT NULL,
    movement_date TIMESTAMP NOT NULL,
    reference_number VARCHAR(255),
    remarks VARCHAR(255),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

CREATE TABLE manufacturers (
    id BIGSERIAL PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(255),
    address VARCHAR(255),
    city VARCHAR(255),
    state VARCHAR(255),
    gst_number VARCHAR(255),
    price_per_kg NUMERIC(10,2),
    moq_kg NUMERIC(10,2),
    lead_time_days INTEGER,
    quality_score NUMERIC(3,1),
    notes VARCHAR(1000),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

CREATE TABLE manufacturer_certifications (
    manufacturer_id BIGINT NOT NULL REFERENCES manufacturers(id),
    certification VARCHAR(255)
);

CREATE TABLE manufacturer_agreement_urls (
    manufacturer_id BIGINT NOT NULL REFERENCES manufacturers(id),
    doc_url VARCHAR(255)
);

CREATE TABLE meetings (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    scheduled_at TIMESTAMP NOT NULL,
    duration_minutes INTEGER,
    location VARCHAR(255),
    meeting_link VARCHAR(255),
    agenda VARCHAR(2000),
    minutes VARCHAR(4000),
    follow_up VARCHAR(2000),
    status VARCHAR(50) NOT NULL DEFAULT 'SCHEDULED',
    voice_note_url VARCHAR(255),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

CREATE TABLE meeting_attendees (
    meeting_id BIGINT NOT NULL REFERENCES meetings(id),
    attendee VARCHAR(255)
);

CREATE TABLE meeting_attachment_urls (
    meeting_id BIGINT NOT NULL REFERENCES meetings(id),
    attachment_url VARCHAR(255)
);

CREATE TABLE tasks (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(2000),
    assigned_to VARCHAR(255) NOT NULL,
    assigned_by VARCHAR(255),
    priority VARCHAR(50) NOT NULL DEFAULT 'MEDIUM',
    status VARCHAR(50) NOT NULL DEFAULT 'TODO',
    due_date DATE NOT NULL,
    completed_date DATE,
    notes VARCHAR(1000),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

CREATE TABLE task_attachments (
    task_id BIGINT NOT NULL REFERENCES tasks(id),
    attachment_url VARCHAR(255)
);

-- Default admin user (password: Admin@1234)
INSERT INTO users (email, password_hash, full_name, role, active, mfa_enabled, created_at)
VALUES (
    'admin@tamlezzet.com',
    '$2a$12$1H42C.0DJg0kURbViy0vaOJmxkROO8qP.rM3bZmDYBA9IXLVrBQem',
    'Admin User',
    'SUPER_ADMIN',
    TRUE,
    FALSE,
    NOW()
);
