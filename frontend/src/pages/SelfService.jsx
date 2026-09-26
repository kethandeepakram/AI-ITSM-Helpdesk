import React from "react";

function SelfService() {
  const services = [
    {
      title: "Password Reset",
      description: "Reset your account password and regain access.",
      icon: "🔐",
      message: "I forgot my password",
    },
    {
      title: "Software Installation",
      description: "Request installation of required software.",
      icon: "💻",
      message: "I need to install software",
    },
    {
      title: "Wi-Fi Support",
      description: "Get help with Wi-Fi and network connectivity.",
      icon: "📶",
      message: "My Wi-Fi is not working",
    },
    {
      title: "VPN Access",
      description: "Request or troubleshoot VPN access.",
      icon: "🌐",
      message: "I cannot connect to the company VPN",
    },
    {
      title: "Outlook Support",
      description: "Get help with Outlook and email issues.",
      icon: "📧",
      message: "My Outlook email is not working",
    },
  ];

  const handleGetHelp = (message) => {
    window.location.href = `/?service=${encodeURIComponent(message)}`;
  };

  return (
    <div
      style={{
        padding: "40px",
        fontFamily: "Arial, sans-serif",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: "35px" }}>
        <h1
          style={{
            marginBottom: "10px",
            fontSize: "34px",
          }}
        >
          Self Service
        </h1>

        <p
          style={{
            color: "#64748b",
            fontSize: "17px",
            margin: 0,
          }}
        >
          Find solutions and submit IT requests without contacting the
          support team.
        </p>
      </div>

      {/* Service Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "22px",
        }}
      >
        {services.map((service) => (
          <div
            key={service.title}
            style={{
              backgroundColor: "white",
              border: "1px solid #e2e8f0",
              borderRadius: "14px",
              padding: "25px",
              boxShadow:
                "0 3px 10px rgba(0,0,0,0.06)",
              transition: "transform 0.2s",
            }}
          >
            {/* Icon */}
            <div
              style={{
                fontSize: "38px",
                marginBottom: "15px",
              }}
            >
              {service.icon}
            </div>

            {/* Title */}
            <h2
              style={{
                marginTop: 0,
                marginBottom: "10px",
                fontSize: "21px",
              }}
            >
              {service.title}
            </h2>

            {/* Description */}
            <p
              style={{
                color: "#64748b",
                lineHeight: "1.6",
                minHeight: "50px",
              }}
            >
              {service.description}
            </p>

            {/* Button */}
            <button
              onClick={() =>
                handleGetHelp(service.message)
              }
              style={{
                width: "100%",
                padding: "11px 16px",
                marginTop: "10px",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                backgroundColor: "#1f2937",
                color: "white",
                fontSize: "15px",
                fontWeight: "bold",
              }}
            >
              Get Help →
            </button>
          </div>
        ))}
      </div>

      {/* Information Section */}
      <div
        style={{
          marginTop: "35px",
          padding: "25px",
          backgroundColor: "#f8fafc",
          border: "1px solid #e2e8f0",
          borderRadius: "12px",
        }}
      >
        <h2 style={{ marginTop: 0 }}>
          🤖 AI-Powered Support
        </h2>

        <p
          style={{
            color: "#475569",
            lineHeight: "1.7",
            marginBottom: 0,
          }}
        >
          Select a service above and our AI IT Support Assistant
          will analyze your issue, create an ITSM ticket, search
          the Knowledge Base for relevant solutions, and trigger
          available self-healing automation.
        </p>
      </div>
    </div>
  );
}

export default SelfService;