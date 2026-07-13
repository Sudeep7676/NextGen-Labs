-- CRM extensions: internal notes + outgoing email history

ALTER TABLE contact_inquiries ADD COLUMN IF NOT EXISTS notes TEXT;

CREATE TABLE email_messages (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inquiry_id  UUID NOT NULL REFERENCES contact_inquiries (id) ON DELETE CASCADE,
    recipient   VARCHAR(255) NOT NULL,
    subject     VARCHAR(255) NOT NULL,
    body        TEXT         NOT NULL,
    sender      VARCHAR(160) NOT NULL,
    status      VARCHAR(20)  NOT NULL,
    error       VARCHAR(500),
    kind        VARCHAR(40)  NOT NULL,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_email_inquiry ON email_messages (inquiry_id, created_at DESC);
