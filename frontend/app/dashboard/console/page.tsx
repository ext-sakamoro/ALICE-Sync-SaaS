"use client";
import { useState } from "react";

type Tab = "push" | "subscribe" | "resolve" | "channelCreate" | "channels" | "stats";

const DEFAULTS: Record<Tab, string> = {
  push: JSON.stringify({
    channel_id: "ch-001",
    payload: { event: "user.updated", user_id: "u-123", name: "Alice", ts: 1700000000 },
    ttl_ms: 30000,
    sequence: 42
  }, null, 2),
  subscribe: JSON.stringify({
    channel_id: "ch-001",
    subscriber_id: "sub-abc",
    from_sequence: 0,
    filter: { event_types: ["user.updated", "user.created"] }
  }, null, 2),
  resolve: JSON.stringify({
    channel_id: "ch-001",
    conflicts: [
      { sequence: 40, value: { name: "Alice" }, origin: "client-A" },
      { sequence: 40, value: { name: "Alicia" }, origin: "client-B" }
    ],
    strategy: "last_write_wins"
  }, null, 2),
  channelCreate: JSON.stringify({
    name: "user-events",
    type: "pubsub",
    persistence: true,
    max_subscribers: 1000,
    ttl_seconds: 86400
  }, null, 2),
  channels: "",
  stats: "",
};

const TAB_LABELS: Record<Tab, string> = {
  push: "POST /push",
  subscribe: "POST /subscribe",
  resolve: "POST /resolve",
  channelCreate: "POST /channel/create",
  channels: "GET /channels",
  stats: "GET /stats",
};

const GET_TABS: Tab[] = ["channels", "stats"];

const ROUTES: Record<Tab, string> = {
  push: "/api/v1/sync/push",
  subscribe: "/api/v1/sync/subscribe",
  resolve: "/api/v1/sync/resolve",
  channelCreate: "/api/v1/sync/channel/create",
  channels: "/api/v1/sync/channels",
  stats: "/api/v1/sync/stats",
};

export default function ConsolePage() {
  const [activeTab, setActiveTab] = useState<Tab>("push");
  const [input, setInput] = useState(DEFAULTS["push"]);
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const API = "http://localhost:8081";

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setInput(DEFAULTS[tab]);
    setResponse("");
  };

  const send = async () => {
    setLoading(true);
    try {
      const isGet = GET_TABS.includes(activeTab);
      const res = await fetch(`${API}${ROUTES[activeTab]}`, {
        method: isGet ? "GET" : "POST",
        headers: isGet ? {} : { "Content-Type": "application/json" },
        body: isGet ? undefined : input,
      });
      setResponse(JSON.stringify(await res.json(), null, 2));
    } catch (e: unknown) {
      setResponse(`Error: ${e instanceof Error ? e.message : String(e)}`);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: 24, fontFamily: "monospace", background: "#0a0a0a", minHeight: "100vh", color: "#fff" }}>
      <h1 style={{ marginBottom: 4 }}>ALICE Sync-SaaS — Console</h1>
      <p style={{ color: "#666", marginBottom: 24, fontSize: 14 }}>Real-time data synchronization API tester</p>

      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {(Object.keys(TAB_LABELS) as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            style={{
              padding: "6px 14px",
              borderRadius: 6,
              border: "1px solid",
              borderColor: activeTab === tab ? "#a78bfa" : "#333",
              background: activeTab === tab ? "#a78bfa20" : "#111",
              color: activeTab === tab ? "#a78bfa" : "#888",
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      {!GET_TABS.includes(activeTab) && (
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={14}
          style={{
            width: "100%",
            fontFamily: "monospace",
            fontSize: 13,
            background: "#111",
            color: "#e0e0e0",
            border: "1px solid #333",
            borderRadius: 8,
            padding: 12,
            boxSizing: "border-box",
          }}
        />
      )}

      {GET_TABS.includes(activeTab) && (
        <div style={{ color: "#666", fontSize: 13, padding: "12px 0" }}>
          No request body required for GET requests.
        </div>
      )}

      <button
        onClick={send}
        disabled={loading}
        style={{
          marginTop: 12,
          padding: "10px 28px",
          background: loading ? "#333" : "#a78bfa",
          color: loading ? "#666" : "#000",
          border: "none",
          borderRadius: 8,
          cursor: loading ? "not-allowed" : "pointer",
          fontWeight: "bold",
          fontSize: 14,
        }}
      >
        {loading ? "Sending..." : "Send"}
      </button>

      <pre
        style={{
          background: "#111",
          color: "#0f0",
          padding: 16,
          marginTop: 16,
          minHeight: 200,
          overflow: "auto",
          borderRadius: 8,
          border: "1px solid #222",
          fontSize: 13,
        }}
      >
        {response || "// Response will appear here"}
      </pre>
    </div>
  );
}
