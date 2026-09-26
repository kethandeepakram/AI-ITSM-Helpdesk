import React, { useEffect, useState } from "react";

const API_URL = "http://127.0.0.1:8000";

function Dashboard({ onViewTicket }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

  const loadTickets = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/api/tickets`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to load tickets");
      }

      const mappedTickets = (data.tickets || []).map((ticket) => ({
        ...ticket,
        id: ticket.ticket_id,
        title: ticket.message,
      }));

      setTickets(mappedTickets);
    } catch (err) {
      console.error("Dashboard error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  // Summary counts
  const openTickets = tickets.filter(
    (ticket) => ticket.status === "Open"
  ).length;

  const resolvedTickets = tickets.filter(
    (ticket) => ticket.status === "Resolved"
  ).length;

  const automatedResolutions = tickets.filter(
    (ticket) => ticket.automation_status === "Success"
  ).length;

  const highPriorityTickets = tickets.filter(
    (ticket) =>
      ticket.priority === "P1" || ticket.priority === "P2"
  ).length;

  const mediumPriorityTickets = tickets.filter(
    (ticket) => ticket.priority === "P3"
  ).length;

  const lowPriorityTickets = tickets.filter(
    (ticket) => ticket.priority === "P4"
  ).length;

  // Filter tickets
  const filteredTickets = tickets.filter((ticket) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      ticket.id?.toLowerCase().includes(search) ||
      ticket.title?.toLowerCase().includes(search) ||
      ticket.category?.toLowerCase().includes(search) ||
      ticket.subcategory?.toLowerCase().includes(search);

    const matchesStatus =
      statusFilter === "All" ||
      ticket.status === statusFilter;

    const matchesPriority =
      priorityFilter === "All" ||
      ticket.priority === priorityFilter;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesPriority
    );
  });

  return (
    <div
      style={{
        padding: "30px",
        fontFamily: "Arial",
      }}
    >
      <h1>ITSM Dashboard</h1>

      <p>
        Welcome to the AI-Powered ITSM Helpdesk
      </p>

      {/* Summary Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "20px",
          marginTop: "25px",
        }}
      >
        <div
          style={{
            padding: "20px",
            border: "1px solid #ddd",
            borderRadius: "10px",
          }}
        >
          <h3>Total Tickets</h3>
          <h2>{tickets.length}</h2>
        </div>

        <div
          style={{
            padding: "20px",
            border: "1px solid #ddd",
            borderRadius: "10px",
          }}
        >
          <h3>Open Tickets</h3>
          <h2>{openTickets}</h2>
        </div>

        <div
          style={{
            padding: "20px",
            border: "1px solid #ddd",
            borderRadius: "10px",
          }}
        >
          <h3>Resolved Tickets</h3>
          <h2>{resolvedTickets}</h2>
        </div>
      </div>

      {/* Priority Summary */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "20px",
          marginTop: "20px",
        }}
      >
        <div
          style={{
            padding: "20px",
            border: "1px solid #ddd",
            borderRadius: "10px",
          }}
        >
          <h3>High Priority</h3>
          <h2>{highPriorityTickets}</h2>
          <p>P1 / P2 Tickets</p>
        </div>

        <div
          style={{
            padding: "20px",
            border: "1px solid #ddd",
            borderRadius: "10px",
          }}
        >
          <h3>Medium Priority</h3>
          <h2>{mediumPriorityTickets}</h2>
          <p>P3 Tickets</p>
        </div>

        <div
          style={{
            padding: "20px",
            border: "1px solid #ddd",
            borderRadius: "10px",
          }}
        >
          <h3>Low Priority</h3>
          <h2>{lowPriorityTickets}</h2>
          <p>P4 Tickets</p>
        </div>
      </div>

      {/* Automated Resolutions */}
      <div
        style={{
          padding: "20px",
          border: "1px solid #ddd",
          borderRadius: "10px",
          marginTop: "20px",
        }}
      >
        <h3>🤖 Automated Resolutions</h3>
        <h2>{automatedResolutions}</h2>
      </div>

      {/* Loading */}
      {loading && (
        <p style={{ marginTop: "30px" }}>
          Loading tickets from MongoDB...
        </p>
      )}

      {/* Error */}
      {error && (
        <p
          style={{
            marginTop: "30px",
            color: "red",
          }}
        >
          ❌ {error}
        </p>
      )}

      {/* Tickets */}
      {!loading && !error && (
        <>
          {/* Tickets Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "35px",
            }}
          >
            <h2>Tickets</h2>

            <button
              onClick={loadTickets}
              style={{
                padding: "10px 16px",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                backgroundColor: "#1f2937",
                color: "white",
              }}
            >
              🔄 Refresh Tickets
            </button>
          </div>

          {/* Search and Filters */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr",
              gap: "15px",
              marginTop: "20px",
              marginBottom: "25px",
            }}
          >
            {/* Search */}
            <input
              type="text"
              placeholder="🔎 Search by ticket ID, issue, category..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
              style={{
                padding: "13px",
                border: "1px solid #ccc",
                borderRadius: "8px",
                fontSize: "15px",
              }}
            />

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
              style={{
                padding: "13px",
                border: "1px solid #ccc",
                borderRadius: "8px",
                fontSize: "15px",
                backgroundColor: "white",
              }}
            >
              <option value="All">All Status</option>
              <option value="Open">Open</option>
              <option value="Resolved">Resolved</option>
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) =>
                setPriorityFilter(e.target.value)
              }
              style={{
                padding: "13px",
                border: "1px solid #ccc",
                borderRadius: "8px",
                fontSize: "15px",
                backgroundColor: "white",
              }}
            >
              <option value="All">All Priority</option>
              <option value="P1">P1</option>
              <option value="P2">P2</option>
              <option value="P3">P3</option>
              <option value="P4">P4</option>
            </select>
          </div>

          {/* Result Count */}
          <p
            style={{
              color: "#64748b",
              marginBottom: "15px",
            }}
          >
            Showing {filteredTickets.length} of{" "}
            {tickets.length} tickets
          </p>

          {/* No Results */}
          {filteredTickets.length === 0 ? (
            <div
              style={{
                padding: "40px",
                textAlign: "center",
                backgroundColor: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
              }}
            >
              <h3>No tickets found</h3>

              <p>
                Try changing your search or filters.
              </p>
            </div>
          ) : (
            filteredTickets.map((ticket) => (
              <div
                key={ticket.id}
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  padding: "24px",
                  marginBottom: "16px",
                  boxShadow:
                    "0 3px 10px rgba(0, 0, 0, 0.06)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "20px",
                  }}
                >
                  {/* Ticket Information */}
                  <div style={{ flex: 1 }}>
                    <h3 style={{ marginTop: 0 }}>
                      {ticket.title}
                    </h3>

                    <p>
                      <strong>Ticket ID:</strong>{" "}
                      {ticket.id}
                    </p>

                    <p>
                      <strong>Category:</strong>{" "}
                      {ticket.category}
                    </p>

                    <p>
                      <strong>Issue:</strong>{" "}
                      {ticket.subcategory}
                    </p>

                    <p>
                      <strong>Assignment Group:</strong>{" "}
                      {ticket.assignment_group}
                    </p>

                    {ticket.suggested_action && (
                      <p>
                        <strong>Suggested Action:</strong>{" "}
                        {ticket.suggested_action}
                      </p>
                    )}

                    {ticket.automation_status ===
                      "Success" && (
                      <p>
                        <strong>Automation:</strong>{" "}

                        <span
                          style={{
                            display: "inline-block",
                            padding: "5px 10px",
                            borderRadius: "12px",
                            backgroundColor: "#ede9fe",
                            color: "#6b21a8",
                            fontWeight: "bold",
                          }}
                        >
                          🤖 Self-Healing Completed
                        </span>
                      </p>
                    )}

                    {ticket.servicenow_incident && (
  <p>
    <strong>ServiceNow Incident:</strong>{" "}
    <span
      style={{
        display: "inline-block",
        padding: "5px 10px",
        borderRadius: "12px",
        backgroundColor: "#e0f2fe",
        color: "#075985",
        fontWeight: "bold",
      }}
    >
      🎫 {ticket.servicenow_incident}
    </span>
  </p>
)}
                  </div>

                  {/* Status and Priority */}
                  <div
                    style={{
                      minWidth: "130px",
                      textAlign: "right",
                    }}
                  >
                    <div style={{ marginBottom: "12px" }}>
                      <strong>Status</strong>

                      <br />

                      <span
                        style={{
                          display: "inline-block",
                          marginTop: "5px",
                          padding: "5px 10px",
                          borderRadius: "12px",
                          backgroundColor:
                            ticket.status === "Resolved"
                              ? "#dcfce7"
                              : "#fef3c7",
                          color:
                            ticket.status === "Resolved"
                              ? "#166534"
                              : "#92400e",
                          fontWeight: "bold",
                        }}
                      >
                        {ticket.status}
                      </span>
                    </div>

                    <div>
                      <strong>Priority</strong>

                      <br />

                      <span
                        style={{
                          display: "inline-block",
                          marginTop: "5px",
                          padding: "5px 10px",
                          borderRadius: "12px",
                          backgroundColor:
                            ticket.priority === "P1" ||
                            ticket.priority === "P2"
                              ? "#fee2e2"
                              : "#e0f2fe",
                          color:
                            ticket.priority === "P1" ||
                            ticket.priority === "P2"
                              ? "#991b1b"
                              : "#075985",
                          fontWeight: "bold",
                        }}
                      >
                        {ticket.priority}
                      </span>
                    </div>
                  </div>
                </div>

                {/* View Ticket */}
                <button
                  onClick={() =>
                    onViewTicket &&
                    onViewTicket(ticket)
                  }
                  style={{
                    marginTop: "15px",
                    padding: "9px 16px",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    backgroundColor: "#1f2937",
                    color: "white",
                  }}
                >
                  View Ticket
                </button>
              </div>
            ))
          )}
        </>
      )}
    </div>
  );
}

export default Dashboard;