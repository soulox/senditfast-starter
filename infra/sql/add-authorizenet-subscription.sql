-- Add Authorize.NET subscription tracking
-- This allows the app to track and manage recurring subscriptions

-- Add subscription ID field to app_user table
ALTER TABLE app_user 
ADD COLUMN IF NOT EXISTS authorizenet_subscription_id text;

-- Add subscription start date
ALTER TABLE app_user 
ADD COLUMN IF NOT EXISTS subscription_started_at timestamptz;

-- Add subscription status (active, cancelled, suspended, expired)
ALTER TABLE app_user 
ADD COLUMN IF NOT EXISTS subscription_status text;

-- Create index for faster subscription lookups
CREATE INDEX IF NOT EXISTS idx_user_subscription_id 
ON app_user(authorizenet_subscription_id) 
WHERE authorizenet_subscription_id IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN app_user.authorizenet_subscription_id IS 'Authorize.NET ARB subscription ID for recurring billing';
COMMENT ON COLUMN app_user.subscription_started_at IS 'When the current subscription started';
COMMENT ON COLUMN app_user.subscription_status IS 'Current subscription status: active, cancelled, suspended, expired';

