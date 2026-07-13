-- Enterprise admin security: MFA, lockout, login telemetry, refresh tokens

ALTER TABLE app_users
    ADD COLUMN IF NOT EXISTS mfa_enabled            BOOLEAN     NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS mfa_secret             VARCHAR(64),
    ADD COLUMN IF NOT EXISTS failed_attempts        INT         NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS locked_until           TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS manual_unlock_required BOOLEAN     NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS last_login_at          TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS last_login_ip          VARCHAR(64),
    ADD COLUMN IF NOT EXISTS last_login_device      VARCHAR(200),
    ADD COLUMN IF NOT EXISTS password_updated_at    TIMESTAMPTZ;

ALTER TABLE audit_logs
    ADD COLUMN IF NOT EXISTS device VARCHAR(200),
    ADD COLUMN IF NOT EXISTS result VARCHAR(20);

CREATE TABLE refresh_tokens (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES app_users (id) ON DELETE CASCADE,
    token_hash  VARCHAR(128) NOT NULL UNIQUE,
    jti         VARCHAR(64)  NOT NULL,
    expires_at  TIMESTAMPTZ  NOT NULL,
    used        BOOLEAN      NOT NULL DEFAULT FALSE,
    revoked     BOOLEAN      NOT NULL DEFAULT FALSE,
    ip_address  VARCHAR(64),
    device      VARCHAR(200),
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX idx_refresh_user ON refresh_tokens (user_id);
CREATE INDEX idx_refresh_hash ON refresh_tokens (token_hash);

CREATE TABLE mfa_backup_codes (
    id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id   UUID NOT NULL REFERENCES app_users (id) ON DELETE CASCADE,
    code_hash VARCHAR(100) NOT NULL,
    used      BOOLEAN      NOT NULL DEFAULT FALSE
);
CREATE INDEX idx_backup_user ON mfa_backup_codes (user_id);
