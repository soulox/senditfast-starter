-- Add super admin role support to app_user table

-- Add role column to app_user (if it doesn't exist)
ALTER TABLE app_user 
ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'USER';

-- Create enum-like constraint
ALTER TABLE app_user
DROP CONSTRAINT IF EXISTS app_user_role_check;

ALTER TABLE app_user
ADD CONSTRAINT app_user_role_check 
CHECK (role IN ('USER', 'ADMIN', 'SUPER_ADMIN'));

-- Create index for faster role lookups
CREATE INDEX IF NOT EXISTS idx_app_user_role ON app_user(role);

-- Create admin_audit_log table for tracking admin actions
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES app_user(id),
  action TEXT NOT NULL,
  target_user_id UUID REFERENCES app_user(id),
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for audit log queries
CREATE INDEX IF NOT EXISTS idx_admin_audit_admin ON admin_audit_log(admin_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_target ON admin_audit_log(target_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_action ON admin_audit_log(action, created_at DESC);

-- Create table for tracking user usage statistics
CREATE TABLE IF NOT EXISTS user_usage_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  month DATE NOT NULL, -- First day of the month
  transfers_count INT NOT NULL DEFAULT 0,
  total_size_bytes BIGINT NOT NULL DEFAULT 0,
  total_downloads INT NOT NULL DEFAULT 0,
  last_activity_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, month)
);

-- Create indexes for usage stats
CREATE INDEX IF NOT EXISTS idx_user_usage_user_month ON user_usage_stats(user_id, month DESC);
CREATE INDEX IF NOT EXISTS idx_user_usage_month ON user_usage_stats(month DESC);

-- Function to update usage stats
CREATE OR REPLACE FUNCTION update_user_usage_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_usage_stats (user_id, month, transfers_count, total_size_bytes, last_activity_at)
  VALUES (
    NEW.owner_id,
    DATE_TRUNC('month', NEW.created_at),
    1,
    NEW.total_size_bytes,
    NEW.created_at
  )
  ON CONFLICT (user_id, month)
  DO UPDATE SET
    transfers_count = user_usage_stats.transfers_count + 1,
    total_size_bytes = user_usage_stats.total_size_bytes + NEW.total_size_bytes,
    last_activity_at = NEW.created_at,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic usage tracking
DROP TRIGGER IF EXISTS trigger_update_usage_stats ON transfer;
CREATE TRIGGER trigger_update_usage_stats
AFTER INSERT ON transfer
FOR EACH ROW
EXECUTE FUNCTION update_user_usage_stats();

-- Add storage_used_bytes to app_user for quick access
ALTER TABLE app_user
ADD COLUMN IF NOT EXISTS storage_used_bytes BIGINT NOT NULL DEFAULT 0;

ALTER TABLE app_user
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;

-- Create indexes for better admin query performance
CREATE INDEX IF NOT EXISTS idx_app_user_plan ON app_user(plan);
CREATE INDEX IF NOT EXISTS idx_app_user_created ON app_user(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_app_user_last_login ON app_user(last_login_at DESC NULLS LAST);

-- Create view for admin dashboard statistics
CREATE OR REPLACE VIEW admin_dashboard_stats AS
SELECT 
  COUNT(*) as total_users,
  COUNT(*) FILTER (WHERE plan = 'FREE') as free_users,
  COUNT(*) FILTER (WHERE plan = 'PRO') as pro_users,
  COUNT(*) FILTER (WHERE plan = 'BUSINESS') as business_users,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as new_users_30d,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as new_users_7d,
  COUNT(*) FILTER (WHERE last_login_at >= NOW() - INTERVAL '30 days') as active_users_30d,
  COUNT(*) FILTER (WHERE last_login_at >= NOW() - INTERVAL '7 days') as active_users_7d,
  SUM(storage_used_bytes) as total_storage_used
FROM app_user;

-- Create view for user overview (for admin panel)
CREATE OR REPLACE VIEW admin_user_overview AS
SELECT 
  u.id,
  u.email,
  u.name,
  u.plan,
  u.role,
  u.created_at,
  u.last_login_at,
  u.storage_used_bytes,
  u.stripe_customer_id,
  u.two_factor_enabled,
  COUNT(DISTINCT t.id) as total_transfers,
  COALESCE(SUM(t.total_size_bytes), 0) as total_size_transferred,
  MAX(t.created_at) as last_transfer_at
FROM app_user u
LEFT JOIN transfer t ON u.id = t.owner_id
GROUP BY u.id, u.email, u.name, u.plan, u.role, u.created_at, u.last_login_at, u.storage_used_bytes, u.stripe_customer_id, u.two_factor_enabled;

COMMENT ON TABLE admin_audit_log IS 'Logs all administrative actions for compliance and security';
COMMENT ON TABLE user_usage_stats IS 'Aggregated usage statistics per user per month';
COMMENT ON VIEW admin_dashboard_stats IS 'Real-time statistics for admin dashboard';
COMMENT ON VIEW admin_user_overview IS 'Comprehensive user information for admin panel';

