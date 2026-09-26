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

      <main>
        {renderPage()}
      </main>

      <Chatbot />
    </div>
  );
}

export default App;