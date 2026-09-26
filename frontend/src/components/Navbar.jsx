function Navbar({ onNavigate }) {
  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "15px 30px",
        background: "#1f2937",
        color: "white",
      }}
    >
      <h2 style={{ margin: 0 }}>AI-Powered ITSM Helpdesk</h2>

      <div style={{ display: "flex", gap: "10px" }}>
        <button onClick={() => onNavigate("dashboard")}>
          Dashboard
        </button>

        <button onClick={() => onNavigate("self-service")}>
          Self Service
        </button>

        <button onClick={() => onNavigate("knowledge-base")}>
          Knowledge Base
        </button>
      </div>
    </nav>
  );
}

export default Navbar;