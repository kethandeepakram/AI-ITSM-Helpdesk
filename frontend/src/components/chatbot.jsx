import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

export default function Chatbot() {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hi! I'm your AI IT Support Assistant. How can I help you?",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const service = params.get("service");

    if (service) {
      setInput(service);
    }
  }, []);

  const sendMessage = async () => {
    const message = input.trim();

    if (!message || loading) {
      return;
    }

    setMessages((prev) => [
      ...prev,
      {
        sender: "user",
        text: message,
      },
    ]);

    setInput("");
    setLoading(true);

    try {
      // 1. Send the user's issue to the AI chatbot
      // This performs AI classification + RAG Knowledge Base search
      const chatResponse = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
        }),
      });

      const chatData = await chatResponse.json();

      if (!chatResponse.ok) {
        throw new Error(
          chatData.detail || "AI chatbot request failed"
        );
      }

      // 2. Create the ITSM ticket
      const ticketResponse = await fetch(
        `${API_URL}/api/tickets`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message,
          }),
        }
      );

      const ticketData = await ticketResponse.json();

      if (!ticketResponse.ok) {
        throw new Error(
          ticketData.detail || "Failed to create ticket"
        );
      }

      const ticket = ticketData.ticket;

      // 3. Build chatbot response
      let botMessage = "✅ IT issue analyzed successfully.\n\n";

      botMessage += `🎫 Ticket ID: ${ticket.ticket_id}\n`;
      botMessage += `📌 Status: ${ticket.status}\n`;
      botMessage += `📂 Category: ${ticket.category}\n`;
      botMessage += `🔎 Issue: ${ticket.subcategory}\n`;
      botMessage += `⚡ Priority: ${ticket.priority}\n`;
      botMessage += `🚨 Urgency: ${ticket.urgency}\n`;
      botMessage += `👨‍💻 Assigned to: ${ticket.assignment_group}\n`;

      botMessage +=
        `\n💡 Suggested Action: ${ticket.suggested_action}`;

      // 4. Display RAG Knowledge Base result
      if (chatData.knowledge_base) {
        const topResult = chatData.knowledge_base;
        const article = topResult.article;

        botMessage += "\n\n📚 Knowledge Base";

        botMessage += `\n📖 Article: ${article.title}`;

        botMessage +=
          `\n📊 Relevance Score: ${topResult.score}`;

        botMessage +=
          `\n💡 Solution: ${article.content}`;
      }

      // 5. Display Self-Healing Automation result
      if (ticket.automation) {
        botMessage +=
          "\n\n🤖 Self-Healing Automation";

        botMessage +=
          `\n✅ Status: ${ticket.automation.status}`;

        botMessage +=
          `\n🔧 Action: ${ticket.automation.action}`;

        botMessage +=
          `\n📝 ${ticket.automation.message}`;
      }

      // 6. Display ServiceNow integration result
if (ticket.servicenow) {
  botMessage +=
    "\n\n🎫 ServiceNow Integration";

  botMessage +=
    `\n✅ Status: ${ticket.servicenow.status}`;

  botMessage +=
    `\n📌 Incident: ${ticket.servicenow.incident_number}`;

  botMessage +=
    `\n📝 ${ticket.servicenow.message}`;
}

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: botMessage,
        },
      ]);
    } catch (error) {
      console.error("Chatbot error:", error);

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text:
            `❌ Unable to process your request.\n\n${error.message}`,
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

  return (
    <div
      style={{
        width: "360px",
        height: "500px",
        display: "flex",
        flexDirection: "column",
        border: "1px solid #ddd",
        borderRadius: "12px",
        backgroundColor: "#fff",
        overflow: "hidden",
        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "15px",
          backgroundColor: "#1e3a8a",
          color: "white",
          fontWeight: "bold",
        }}
      >
        🤖 AI IT Support Assistant
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          padding: "15px",
          overflowY: "auto",
          backgroundColor: "#f8fafc",
        }}
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              justifyContent:
                msg.sender === "user"
                  ? "flex-end"
                  : "flex-start",
              marginBottom: "10px",
            }}
          >
            <div
              style={{
                maxWidth: "80%",
                padding: "10px 12px",
                borderRadius: "10px",
                whiteSpace: "pre-line",
                backgroundColor:
                  msg.sender === "user"
                    ? "#2563eb"
                    : "#e5e7eb",
                color:
                  msg.sender === "user"
                    ? "white"
                    : "#111827",
              }}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div
            style={{
              padding: "10px",
              color: "#666",
            }}
          >
            🤖 Analyzing your IT issue...
          </div>
        )}
      </div>

      {/* Input */}
      <div
        style={{
          display: "flex",
          padding: "10px",
          borderTop: "1px solid #ddd",
          backgroundColor: "white",
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe your IT issue..."
          disabled={loading}
          style={{
            flex: 1,
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            outline: "none",
          }}
        />

        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          style={{
            marginLeft: "8px",
            padding: "10px 15px",
            border: "none",
            borderRadius: "8px",
            backgroundColor: "#2563eb",
            color: "white",
            cursor: "pointer",
          }}
        >
          {loading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}