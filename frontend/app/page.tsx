export default function LandingPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0a0a0a, #1a0a2e)",
        color: "#fff",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <header
        style={{
          padding: "24px 48px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #ffffff10",
        }}
      >
        <h2 style={{ margin: 0, color: "#a78bfa" }}>ALICE Sync</h2>
        <a
          href="/dashboard/console"
          style={{
            color: "#a78bfa",
            textDecoration: "none",
            padding: "8px 20px",
            border: "1px solid #a78bfa",
            borderRadius: 8,
            fontSize: 14,
          }}
        >
          Console →
        </a>
      </header>

      <main
        style={{
          maxWidth: 960,
          margin: "0 auto",
          padding: "80px 24px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "inline-block",
            background: "#a78bfa20",
            color: "#a78bfa",
            padding: "4px 16px",
            borderRadius: 20,
            fontSize: 13,
            marginBottom: 24,
          }}
        >
          Real-Time Data Synchronization
        </div>
        <h1 style={{ fontSize: 52, marginBottom: 16, lineHeight: 1.1 }}>
          Sync Everything,<br />Resolve Anything
        </h1>
        <p style={{ fontSize: 20, color: "#aaa", marginBottom: 48, maxWidth: 600, margin: "0 auto 48px" }}>
          Pub/sub channels, conflict-free data resolution, and real-time synchronization for distributed systems at any scale.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 24,
            textAlign: "left",
          }}
        >
          <div style={{ background: "#ffffff08", borderRadius: 12, padding: 28, border: "1px solid #ffffff10" }}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>&#x1F4E1;</div>
            <h3 style={{ margin: "0 0 8px", color: "#a78bfa" }}>Pub/Sub Channels</h3>
            <p style={{ color: "#aaa", margin: 0, lineHeight: 1.6 }}>
              Create persistent or ephemeral channels with fine-grained subscriber filtering and delivery guarantees.
            </p>
          </div>
          <div style={{ background: "#ffffff08", borderRadius: 12, padding: 28, border: "1px solid #ffffff10" }}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>&#x2699;&#xFE0F;</div>
            <h3 style={{ margin: "0 0 8px", color: "#a78bfa" }}>Conflict Resolution</h3>
            <p style={{ color: "#aaa", margin: 0, lineHeight: 1.6 }}>
              Pluggable strategies: last-write-wins, CRDT merge, custom resolver functions for complex state.
            </p>
          </div>
          <div style={{ background: "#ffffff08", borderRadius: 12, padding: 28, border: "1px solid #ffffff10" }}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>&#x26A1;</div>
            <h3 style={{ margin: "0 0 8px", color: "#a78bfa" }}>Real-Time Push</h3>
            <p style={{ color: "#aaa", margin: 0, lineHeight: 1.6 }}>
              Sub-millisecond event propagation with ordered delivery, sequence tracking, and replay support.
            </p>
          </div>
        </div>

        <div style={{ marginTop: 64 }}>
          <a
            href="/dashboard/console"
            style={{
              display: "inline-block",
              background: "#a78bfa",
              color: "#000",
              padding: "14px 36px",
              borderRadius: 10,
              textDecoration: "none",
              fontWeight: "bold",
              fontSize: 16,
            }}
          >
            Open Console
          </a>
        </div>
      </main>
    </div>
  );
}
