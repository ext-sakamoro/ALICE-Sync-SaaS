-- ALICE Sync: Domain-specific tables
CREATE TABLE IF NOT EXISTS sync_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    name TEXT NOT NULL,
    strategy TEXT NOT NULL DEFAULT 'event-diff' CHECK (strategy IN ('event-diff', 'state-snapshot', 'hybrid')),
    conflict_resolution TEXT NOT NULL DEFAULT 'lww' CHECK (conflict_resolution IN ('lww', 'manual', 'merge', 'custom')),
    selective_fields TEXT[] NOT NULL DEFAULT '{}',
    peer_count INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sync_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID NOT NULL REFERENCES sync_channels(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (event_type IN ('push', 'pull', 'conflict', 'resolve')),
    entity_id TEXT NOT NULL,
    version BIGINT NOT NULL DEFAULT 1,
    diff_bytes BIGINT NOT NULL DEFAULT 0,
    latency_ms DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sync_conflict_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID NOT NULL REFERENCES sync_channels(id) ON DELETE CASCADE,
    entity_id TEXT NOT NULL,
    local_version BIGINT NOT NULL,
    remote_version BIGINT NOT NULL,
    resolution TEXT NOT NULL CHECK (resolution IN ('local-wins', 'remote-wins', 'merged', 'manual')),
    resolved_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sync_channels_user ON sync_channels(user_id);
CREATE INDEX idx_sync_events_channel ON sync_events(channel_id, created_at);
CREATE INDEX idx_sync_conflict_logs_channel ON sync_conflict_logs(channel_id, resolved_at);
