# ALICE-Sync-SaaS

Real-time data synchronization SaaS with pub/sub channels and conflict resolution.

## Architecture

```
Frontend (Next.js :3000)
        |
        v
API Gateway (:8081)
        |
   +----+-----+-----+
   |    |     |     |
Channel Push Subscribe Resolve
Manager  |     |     |
   |   Sequence  Conflict
   |   Tracker   Engine
   |         |
  Persistent Event Store
```

## Features

| Feature | Description |
|---------|-------------|
| Pub/Sub Channels | Persistent and ephemeral channels with filtering |
| Real-Time Push | Sub-millisecond ordered event delivery |
| Conflict Resolution | LWW, CRDT merge, and custom resolver strategies |
| Sequence Tracking | Monotonic sequence numbers with replay support |
| Channel Management | Create, list, and configure sync channels |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /health | Health check |
| POST | /api/v1/sync/push | Push an event to a channel |
| POST | /api/v1/sync/subscribe | Subscribe to a channel from a sequence |
| POST | /api/v1/sync/resolve | Resolve conflicts on a channel |
| POST | /api/v1/sync/channel/create | Create a new sync channel |
| GET | /api/v1/sync/channels | List all active channels |
| GET | /api/v1/sync/stats | Sync throughput and subscriber stats |

## Quick Start

```bash
docker compose up -d
# API:      http://localhost:8081
# Frontend: http://localhost:3000
```

## License

AGPL-3.0-or-later
