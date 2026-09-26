import React, { useState } from "react";

import Navbar from "./components/Navbar";
import Chatbot from "./components/chatbot";

import Dashboard from "./pages/Dashboard.jsx";
import SelfService from "./pages/SelfService.jsx";
import KnowledgeBase from "./pages/KnowledgeBase.jsx";
import TicketDetails from "./pages/TicketDetails.jsx";

function App() {
  const [page, setPage] = useState("dashboard");
  const [selectedTicket, setSelectedTicket] = useState(null);

  const renderPage = () => {
    switch (page) {
      case "self-service":
        return <SelfService />;

      case "knowledge-base":
        return <KnowledgeBase />;

      case "ticket-details":
        return (
          <TicketDetails
            ticket={selectedTicket}
            onBack={() => setPage("dashboard")}
          />
        );

      case "dashboard":
      default:
        return (
          <Dashboard
            onViewTicket={(ticket) => {
              setSelectedTicket(ticket);
              setPage("ticket-details");
            }}
          />
        );
    }
  };

  return (
    <div className="app">
      <Navbar onNavigate={setPage} />

      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "20px",
          padding: "20px",
          minHeight: "calc(100vh - 72px)",
          boxSizing: "border-box",
        }}
      >
        <main
          style={{
            flex: "1 1 auto",
            minWidth: 0,
          }}
        >
          {renderPage()}
        </main>

        <aside
          style={{
            width: "360px",
            flex: "0 0 360px",
            position: "sticky",
            top: "20px",
            alignSelf: "flex-start",
          }}
        >
          <Chatbot />
        </aside>
      </div>
    </div>
  );
}

export default App;