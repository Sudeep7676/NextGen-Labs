-- NextGen Labs — Contact system schema
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------------------
-- Admin users (authentication + RBAC)
-- ---------------------------------------------------------------------------
CREATE TABLE app_users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name     VARCHAR(160) NOT NULL,
    role          VARCHAR(32)  NOT NULL,
    enabled       BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_app_users_email ON app_users (email);

-- ---------------------------------------------------------------------------
-- Contact inquiries
-- ---------------------------------------------------------------------------
CREATE TABLE contact_inquiries (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name     VARCHAR(160) NOT NULL,
    email         VARCHAR(255) NOT NULL,
    company_name  VARCHAR(200),
    phone_number  VARCHAR(40),
    inquiry_type  VARCHAR(40)  NOT NULL,
    message       TEXT         NOT NULL,
    status        VARCHAR(20)  NOT NULL DEFAULT 'NEW',
    priority      VARCHAR(20)  NOT NULL DEFAULT 'MEDIUM',
    assigned_to   VARCHAR(160),
    source        VARCHAR(60)  NOT NULL DEFAULT 'WEBSITE',
    ip_address    VARCHAR(64),
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_contact_status      ON contact_inquiries (status);
CREATE INDEX idx_contact_type        ON contact_inquiries (inquiry_type);
CREATE INDEX idx_contact_created_at  ON contact_inquiries (created_at DESC);
CREATE INDEX idx_contact_email       ON contact_inquiries (email);

-- ---------------------------------------------------------------------------
-- Audit log
-- ---------------------------------------------------------------------------
CREATE TABLE audit_logs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action      VARCHAR(48)  NOT NULL,
    actor       VARCHAR(160) NOT NULL,
    entity_id   UUID,
    ip_address  VARCHAR(64),
    details     TEXT,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_created_at ON audit_logs (created_at DESC);
CREATE INDEX idx_audit_action     ON audit_logs (action);
