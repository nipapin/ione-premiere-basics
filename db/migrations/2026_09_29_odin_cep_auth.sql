-- Apply to the Odin database before deploying the CEP login routes.
CREATE TABLE IF NOT EXISTS odin_cep_auth_sessions (
  code text PRIMARY KEY,
  secret_hash text NOT NULL,
  fingerprint text NOT NULL,
  device jsonb NOT NULL,
  ip text NOT NULL,
  user_id text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','denied','device_limit','complete')),
  expires_at timestamptz NOT NULL,
  claimed_at timestamptz
);
CREATE INDEX IF NOT EXISTS odin_cep_auth_expiry ON odin_cep_auth_sessions (expires_at);
CREATE TABLE IF NOT EXISTS odin_cep_devices (
  id text PRIMARY KEY,
  user_id text NOT NULL,
  fingerprint text NOT NULL,
  token_hash text NOT NULL UNIQUE,
  device jsonb NOT NULL,
  ip text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  last_seen_at timestamptz NOT NULL DEFAULT NOW(),
  expires_at timestamptz NOT NULL DEFAULT NOW() + INTERVAL '30 days',
  revoked_at timestamptz
);
CREATE INDEX IF NOT EXISTS odin_cep_devices_user ON odin_cep_devices (user_id);
CREATE TABLE IF NOT EXISTS odin_cep_rate_limits (
  key text PRIMARY KEY,
  hits integer NOT NULL,
  expires_at timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS odin_cep_rate_expiry ON odin_cep_rate_limits (expires_at);
