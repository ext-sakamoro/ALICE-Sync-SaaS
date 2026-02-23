use axum::{extract::State, response::Json, routing::{get, post}, Router};
use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};
use std::time::Instant;
use tower_http::cors::{Any, CorsLayer};
use tower_http::trace::TraceLayer;

struct AppState { start_time: Instant, stats: Mutex<Stats> }
struct Stats { total_syncs: u64, total_conflicts: u64, total_events: u64, bytes_synced: u64 }

#[derive(Serialize)]
struct Health { status: String, version: String, uptime_secs: u64, total_ops: u64 }

#[derive(Deserialize)]
struct SyncRequest { channel: String, events: Vec<serde_json::Value>, client_version: Option<u64> }
#[derive(Serialize)]
struct SyncResponse { sync_id: String, channel: String, events_accepted: usize, server_version: u64, conflicts: Vec<Conflict>, bytes_transferred: u64, elapsed_us: u128 }
#[derive(Serialize)]
struct Conflict { field: String, client_value: serde_json::Value, server_value: serde_json::Value, resolution: String }

#[derive(Deserialize)]
struct SubscribeRequest { channel: String, from_version: Option<u64> }
#[derive(Serialize)]
struct SubscribeResponse { channel: String, events: Vec<serde_json::Value>, current_version: u64, peers_connected: u32 }

#[derive(Deserialize)]
struct ResolveRequest { channel: String, conflict_id: String, resolution: String, value: serde_json::Value }
#[derive(Serialize)]
struct ResolveResponse { status: String, channel: String, new_version: u64 }

#[derive(Deserialize)]
struct CreateChannelRequest { name: String, mode: Option<String>, max_peers: Option<u32> }
#[derive(Serialize)]
struct CreateChannelResponse { channel_id: String, name: String, mode: String, max_peers: u32, status: String }

#[derive(Serialize)]
struct ChannelInfo { name: String, mode: String, peers: u32, version: u64, events_total: u64, bytes_total: u64 }
#[derive(Serialize)]
struct StatsResponse { total_syncs: u64, total_conflicts: u64, total_events: u64, bytes_synced: u64, active_channels: u32 }

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt().with_env_filter(tracing_subscriber::EnvFilter::try_from_default_env().unwrap_or_else(|_| "sync_engine=info".into())).init();
    let state = Arc::new(AppState { start_time: Instant::now(), stats: Mutex::new(Stats { total_syncs: 0, total_conflicts: 0, total_events: 0, bytes_synced: 0 }) });
    let cors = CorsLayer::new().allow_origin(Any).allow_methods(Any).allow_headers(Any);
    let app = Router::new()
        .route("/health", get(health))
        .route("/api/v1/sync/push", post(sync_push))
        .route("/api/v1/sync/subscribe", post(subscribe))
        .route("/api/v1/sync/resolve", post(resolve))
        .route("/api/v1/sync/channel/create", post(create_channel))
        .route("/api/v1/sync/channels", get(list_channels))
        .route("/api/v1/sync/stats", get(stats))
        .layer(cors).layer(TraceLayer::new_for_http()).with_state(state);
    let addr = std::env::var("SYNC_ADDR").unwrap_or_else(|_| "0.0.0.0:8081".into());
    let listener = tokio::net::TcpListener::bind(&addr).await.unwrap();
    tracing::info!("Sync Engine on {addr}");
    axum::serve(listener, app).await.unwrap();
}

async fn health(State(s): State<Arc<AppState>>) -> Json<Health> {
    let st = s.stats.lock().unwrap();
    Json(Health { status: "ok".into(), version: env!("CARGO_PKG_VERSION").into(), uptime_secs: s.start_time.elapsed().as_secs(), total_ops: st.total_syncs })
}

async fn sync_push(State(s): State<Arc<AppState>>, Json(req): Json<SyncRequest>) -> Json<SyncResponse> {
    let t = Instant::now();
    let count = req.events.len();
    let bytes: u64 = req.events.iter().map(|e| serde_json::to_string(e).map(|s| s.len() as u64).unwrap_or(0)).sum();
    let ver = req.client_version.unwrap_or(0) + 1;
    { let mut st = s.stats.lock().unwrap(); st.total_syncs += 1; st.total_events += count as u64; st.bytes_synced += bytes; }
    Json(SyncResponse { sync_id: uuid::Uuid::new_v4().to_string(), channel: req.channel, events_accepted: count, server_version: ver, conflicts: vec![], bytes_transferred: bytes, elapsed_us: t.elapsed().as_micros() })
}

async fn subscribe(State(_s): State<Arc<AppState>>, Json(req): Json<SubscribeRequest>) -> Json<SubscribeResponse> {
    let from = req.from_version.unwrap_or(0);
    Json(SubscribeResponse { channel: req.channel, events: vec![], current_version: from + 5, peers_connected: 3 })
}

async fn resolve(State(s): State<Arc<AppState>>, Json(req): Json<ResolveRequest>) -> Json<ResolveResponse> {
    s.stats.lock().unwrap().total_conflicts += 1;
    Json(ResolveResponse { status: "resolved".into(), channel: req.channel, new_version: 100 })
}

async fn create_channel(State(_s): State<Arc<AppState>>, Json(req): Json<CreateChannelRequest>) -> Json<CreateChannelResponse> {
    let mode = req.mode.unwrap_or_else(|| "event-diff".into());
    let max_peers = req.max_peers.unwrap_or(100);
    Json(CreateChannelResponse { channel_id: uuid::Uuid::new_v4().to_string(), name: req.name, mode, max_peers, status: "created".into() })
}

async fn list_channels() -> Json<Vec<ChannelInfo>> {
    Json(vec![
        ChannelInfo { name: "documents".into(), mode: "event-diff".into(), peers: 5, version: 1234, events_total: 50000, bytes_total: 25_000_000 },
        ChannelInfo { name: "state".into(), mode: "last-writer-wins".into(), peers: 12, version: 890, events_total: 12000, bytes_total: 6_000_000 },
    ])
}

async fn stats(State(s): State<Arc<AppState>>) -> Json<StatsResponse> {
    let st = s.stats.lock().unwrap();
    Json(StatsResponse { total_syncs: st.total_syncs, total_conflicts: st.total_conflicts, total_events: st.total_events, bytes_synced: st.bytes_synced, active_channels: 2 })
}
