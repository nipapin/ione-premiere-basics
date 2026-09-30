CREATE TABLE IF NOT EXISTS odin_motionflow_access (
  user_id text PRIMARY KEY,
  mode text NOT NULL CHECK (mode IN ('allow', 'deny')),
  expires_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT NOW(),
  CHECK (mode <> 'allow' OR expires_at IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS odin_motionflow_audit (
  id bigserial PRIMARY KEY,
  user_id text NOT NULL,
  actor text NOT NULL,
  action text NOT NULL,
  reason text NOT NULL,
  before_state jsonb,
  after_state jsonb,
  created_at timestamptz NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS odin_motionflow_audit_user ON odin_motionflow_audit (user_id, created_at DESC);
