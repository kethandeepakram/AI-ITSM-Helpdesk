import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

const quickActions = [
  { label: "🔑 Password Reset", value: "I need to reset my password" },
  { label: "📶 Wi-Fi Help", value: "My laptop is connected to WiFi but I cannot access the internet" },
  { label: "💻 Software Install", value: "I need Microsoft Teams installed on my laptop" },
];

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hello! I'm your AI IT Support Assistant. How can I help you today?",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const service = params.get("service");

    if (service) {
      setInput(service);
      setOpen(true);
    }
  }, []);

  const sendMessage = async () => {
    const message = input.trim();

    if (!message || loading) {
      return;
    }

    setMessages((prev) => [
      ...prev,
      { sender: "user", text: message },
    ]);

    setInput("");
    setLoading(true);

    try {
      const chatResponse = await fetch(\`\${API_URL}/api/chat\`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const chatData = await chatResponse.json();

      if (!chatResponse.ok) {
        throw new Error(chatData.detail || "AI chatbot request failed");
      }

      const ticketResponse = await fetch(\`\${API_URL}/api/tickets\`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const ticketData = await ticketResponse.json();

      if (!ticketResponse.ok) {
        throw new Error(ticketData.detail || "Failed to create ticket");
      }

      const ticket = ticketData.ticket;

      let botMessage = "✅ IT issue analyzed successfully.\\n\\n";

      if (chatData.ai_response) {
        botMessage += \`🤖 AI Assistant: \${chatData.ai_response}\\n\`;
        botMessage += \`🧠 AI Engine: \${chatData.ai_model}\\n\`;
      }

      botMessage += \`🎫 Ticket ID: \${ticket.ticket_id}\\n\`;
      botMessage += \`📌 Status: \${ticket.status}\\n\`;
      botMessage += \`📂 Category: \${ticket.category}\\n\`;
      botMessage += \`🔎 Issue: \${ticket.subcategory}\\n\`;
      botMessage += \`⚡ Priority: \${ticket.priority}\\n\`;
      botMessage += \`🚨 Urgency: \${ticket.urgency}\\n\`;
      botMessage += \`👨‍💻 Assigned to: \${ticket.assignment_group}\\n\`;
      botMessage += \`\\n💡 Suggested Action: \${ticket.suggested_action}\`;

      if (chatData.knowledge_base) {
        const topResult = chatData.knowledge_base;
        const article = topResult.article;

        botMessage += "\\n\\n📚 Knowledge Base";
        botMessage += \`\\n📖 Article: \${article.title}\`;
        botMessage += \`\\n📊 Relevance Score: \${topResult.score}\`;
        botMessage += \`\\n💡 Solution: \${article.content}\`;
      }

      if (ticket.automation) {
        botMessage += "\\n\\n🤖 Automation";
        botMessage += \`\\n✅ Status: \${ticket.automation.status}\`;
        botMessage += \`\\n🔧 Action: \${ticket.automation.action}\`;

        if (ticket.automation.software_name) {
          botMessage += \`\\n💻 Software: \${ticket.automation.software_name}\`;
        }

        if (ticket.automation.request_id) {
          botMessage += \`\\n🆔 Provisioning Request: \${ticket.automation.request_id}\`;
        }

        if (ticket.automation.catalog_status) {
          botMessage += \`\\n📦 Catalogue: \${ticket.automation.catalog_status}\`;
        }

        if (ticket.automation.workflow) {
          botMessage += \`\\n🔄 Workflow: \${ticket.automation.workflow.join(" → ")}\`;
        }

        botMessage += \`\\n📝 \${ticket.automation.message}\`;

        if (ticket.automation.note) {
          botMessage += \`\\nℹ️ \${ticket.automation.note}\`;
        }
      }

      if (ticket.servicenow) {
        botMessage += "\\n\\n🎫 ServiceNow Integration";
        botMessage += \`\\n✅ Status: \${ticket.servicenow.status}\`;
        botMessage += \`\\n📌 Incident: \${ticket.servicenow.incident_number}\`;
        botMessage += \`\\n📝 \${ticket.servicenow.message}\`;
      }

      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: botMessage },
      ]);
    } catch (error) {
      console.error("Chatbot error:", error);

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: \`❌ Unable to process your request.\\n\\n\${error.message}\`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      sendMessage();
    }
  };

  const chooseQuickAction = (value) => {
    setInput(value);
  };

  return (
    <>
      {open && (
        <div
          style={{
            position: "fixed",
            right: "24px",
            bottom: "92px",
            width: "min(390px, calc(100vw - 32px))",
            height: "min(620px, calc(100vh - 120px))",
            minHeight: "460px",
            display: "flex",
            flexDirection: "column",
            background: "#ffffff",
            border: "1px solid #d9def0",
            borderRadius: "18px",
            overflow: "hidden",
            boxShadow: "0 20px 60px rgba(31, 41, 95, 0.25)",
            zIndex: 9999,
            fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          }}
        >
          <div
            style={{
              padding: "16px 18px",
              background: "linear-gradient(135deg, #11183f 0%, #1e2454 100%)",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #4f7cff, #8b5cf6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "21px",
                  boxShadow: "0 6px 18px rgba(79,124,255,.35)",
                }}
              >
                🤖
              </div>
              <div>
                <div style={{ fontSize: "15px", fontWeight: 750 }}>
                  AI IT Support Assistant
                  <span style={{ color: "#22c55e", marginLeft: "7px" }}>●</span>
                </div>
                <div style={{ fontSize: "11px", color: "#cbd5ff", marginTop: "3px" }}>
                  Powered by AI & ITSM Engine
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button
                type="button"
                onClick={() =>
                  setMessages((prev) => [
                    ...prev,
                    {
                      sender: "bot",
                      text: "👨‍💻 Human-agent handoff is available as a prototype option. Please include your issue details and the support team can review the ticket.",
                    },
                  ])
                }
                style={{
                  border: "1px solid rgba(255,255,255,.25)",
                  background: "rgba(255,255,255,.08)",
                  color: "#e5e7ff",
                  borderRadius: "8px",
                  padding: "7px 9px",
                  fontSize: "10px",
                  cursor: "pointer",
                }}
              >
                ↗ Human Agent
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close AI chat"
                style={{
                  border: "none",
                  background: "transparent",
                  color: "#dbe2ff",
                  fontSize: "20px",
                  cursor: "pointer",
                  padding: "2px 5px",
                }}
              >
                ×
              </button>
            </div>
          </div>

          <div
            style={{
              flex: 1,
              padding: "18px",
              overflowY: "auto",
              background: "#f8f9fd",
            }}
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  justifyContent: msg.sender === "user" ? "flex-end" : "flex-start",
                  marginBottom: "14px",
                  gap: "8px",
                }}
              >
                {msg.sender === "bot" && (
                  <div
                    style={{
                      width: "28px",
                      height: "28px",
                      flex: "0 0 28px",
                      borderRadius: "50%",
                      background: "#3b82f6",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "14px",
                    }}
                  >
                    🤖
                  </div>
                )}
                <div
                  style={{
                    maxWidth: "82%",
                    padding: "12px 14px",
                    borderRadius:
                      msg.sender === "user"
                        ? "15px 15px 4px 15px"
                        : "4px 15px 15px 15px",
                    whiteSpace: "pre-line",
                    background: msg.sender === "user" ? "#4f46e5" : "#ffffff",
                    color: msg.sender === "user" ? "#ffffff" : "#26314d",
                    border: msg.sender === "user" ? "none" : "1px solid #e3e7f2",
                    boxShadow:
                      msg.sender === "user"
                        ? "0 5px 15px rgba(79,70,229,.18)"
                        : "0 3px 12px rgba(31,41,95,.06)",
                    fontSize: "13px",
                    lineHeight: 1.55,
                  }}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: "flex", gap: "8px", alignItems: "center", color: "#667085", fontSize: "13px" }}>
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    background: "#3b82f6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  🤖
                </div>
                Analyzing your IT issue...
              </div>
            )}
          </div>

          <div
            style={{
              padding: "10px 12px 8px",
              borderTop: "1px solid #e5e7ef",
              background: "#ffffff",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "7px",
                overflowX: "auto",
                paddingBottom: "9px",
              }}
            >
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  type="button"
                  onClick={() => chooseQuickAction(action.value)}
                  style={{
                    whiteSpace: "nowrap",
                    border: "1px solid #e0e5f2",
                    background: "#f8f9fd",
                    color: "#526078",
                    borderRadius: "999px",
                    padding: "7px 10px",
                    fontSize: "10px",
                    cursor: "pointer",
                  }}
                >
                  {action.label}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe your IT issue..."
                disabled={loading}
                style={{
                  flex: 1,
                  minWidth: 0,
                  padding: "12px 13px",
                  border: "1px solid #dfe4ef",
                  borderRadius: "12px",
                  outline: "none",
                  fontSize: "13px",
                  color: "#26314d",
                  background: "#ffffff",
                }}
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                aria-label="Send message"
                style={{
                  width: "44px",
                  height: "44px",
                  border: "none",
                  borderRadius: "12px",
                  background: loading || !input.trim() ? "#c7bff8" : "#8b7cf6",
                  color: "white",
                  cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                  fontSize: "19px",
                }}
              >
                {loading ? "…" : "➤"}
              </button>
            </div>
          </div>
        </div>
      )}

      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          style={{
            position: "fixed",
            right: "24px",
            bottom: "24px",
            border: "none",
            borderRadius: "999px",
            padding: "14px 20px",
            background: "linear-gradient(135deg, #3158ff 0%, #5b4cf0 100%)",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "14px",
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 12px 30px rgba(61,75,230,.35)",
            zIndex: 9999,
          }}
        >
          <span style={{ fontSize: "19px" }}>🤖</span>
          Need Help? Chat with AI
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#22c55e",
              marginLeft: "2px",
              boxShadow: "0 0 0 3px rgba(34,197,94,.16)",
            }}
          />
        </button>
      )}
    </>
  );
}
