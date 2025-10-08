-- Add 2FA columns to app_user table
ALTER TABLE app_user ADD COLUMN IF NOT EXISTS two_factor_secret TEXT;
ALTER TABLE app_user ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN NOT NULL DEFAULT false;
