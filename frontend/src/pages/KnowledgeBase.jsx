import React, { useState } from "react";

const API_URL = "http://127.0.0.1:8000";

function KnowledgeBase() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const searchKnowledgeBase = async () => {
    const searchQuery = query.trim();

    if (!searchQuery || loading) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      setResults([]);

      const response = await fetch(
        `${API_URL}/api/knowledge/search`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: searchQuery,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Knowledge Base search failed"
        );
      }

      setResults(data.results || []);
    } catch (err) {
      console.error("Knowledge Base error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      searchKnowledgeBase();
    }
  };

  return (
    <div
      style={{
        padding: "30px",
        fontFamily: "Arial",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <div>
        <h1>Knowledge Base</h1>

        <p
          style={{
            color: "#64748b",
            fontSize: "16px",
          }}
        >
          Search IT support knowledge using AI-powered semantic
          retrieval.
        </p>
      </div>

      {/* Search */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginTop: "25px",
        }}
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="🔎 Search an IT issue..."
          style={{
            flex: 1,
            padding: "14px",
            border: "1px solid #cbd5e1",
            borderRadius: "8px",
            fontSize: "16px",
          }}
        />

        <button
          onClick={searchKnowledgeBase}
          disabled={loading || !query.trim()}
          style={{
            padding: "14px 22px",
            border: "none",
            borderRadius: "8px",
            backgroundColor: "#1f2937",
            color: "white",
            cursor:
              loading || !query.trim()
                ? "not-allowed"
                : "pointer",
          }}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {/* Example searches */}
      <div style={{ marginTop: "15px" }}>
        <p
          style={{
            color: "#64748b",
            marginBottom: "8px",
          }}
        >
          Try:
        </p>

        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          {[
            "I forgot my password",
            "My Wi-Fi is not working",
            "I cannot connect to VPN",
            "My Outlook email is not working",
            "I need to install software",
          ].map((example) => (
            <button
              key={example}
              onClick={() => {
                setQuery(example);
              }}
              style={{
                padding: "8px 12px",
                border: "1px solid #cbd5e1",
                borderRadius: "20px",
                backgroundColor: "#f8fafc",
                cursor: "pointer",
              }}
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            marginTop: "25px",
            padding: "15px",
            borderRadius: "8px",
            backgroundColor: "#fee2e2",
            color: "#991b1b",
          }}
        >
          ❌ {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div
          style={{
            marginTop: "30px",
            padding: "20px",
            textAlign: "center",
            backgroundColor: "#f8fafc",
            borderRadius: "10px",
          }}
        >
          🧠 Searching the AI Knowledge Base...
        </div>
      )}

      {/* Results */}
      {!loading && results.length > 0 && (
        <div style={{ marginTop: "35px" }}>
          <h2>Knowledge Base Results</h2>

          <p style={{ color: "#64748b" }}>
            Found {results.length} relevant articles.
          </p>

          {results.map((result, index) => {
            const article = result.article;

            return (
              <div
                key={index}
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  padding: "25px",
                  marginTop: "18px",
                  backgroundColor: "#ffffff",
                  boxShadow:
                    "0 3px 10px rgba(0, 0, 0, 0.05)",
                }}
              >
                {/* Article Header */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "20px",
                    alignItems: "flex-start",
                  }}
                >
                  <div>
                    <h3
                      style={{
                        marginTop: 0,
                        marginBottom: "8px",
                      }}
                    >
                      📖 {article.title}
                    </h3>

                    {article.category && (
                      <span
                        style={{
                          display: "inline-block",
                          padding: "5px 10px",
                          borderRadius: "12px",
                          backgroundColor: "#e0f2fe",
                          color: "#075985",
                          fontSize: "13px",
                          fontWeight: "bold",
                        }}
                      >
                        {article.category}
                      </span>
                    )}
                  </div>

                  {/* Score */}
                  <div
                    style={{
                      minWidth: "130px",
                      textAlign: "right",
                    }}
                  >
                    <strong>Relevance</strong>

                    <div
                      style={{
                        marginTop: "5px",
                        fontSize: "18px",
                        fontWeight: "bold",
                        color: "#166534",
                      }}
                    >
                      {Number(result.score).toFixed(3)}
                    </div>
                  </div>
                </div>

                {/* Solution */}
                <div
                  style={{
                    marginTop: "20px",
                    padding: "18px",
                    backgroundColor: "#f8fafc",
                    borderRadius: "8px",
                  }}
                >
                  <h4 style={{ marginTop: 0 }}>
                    💡 Solution
                  </h4>

                  <p
                    style={{
                      lineHeight: "1.6",
                      marginBottom: 0,
                    }}
                  >
                    {article.content}
                  </p>
                </div>

                {/* Keywords */}
                {article.keywords &&
                  article.keywords.length > 0 && (
                    <div style={{ marginTop: "15px" }}>
                      <strong>🏷️ Keywords:</strong>{" "}
                      {Array.isArray(article.keywords)
                        ? article.keywords.join(", ")
                        : article.keywords}
                    </div>
                  )}
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!loading &&
        !error &&
        results.length === 0 && (
          <div
            style={{
              marginTop: "40px",
              padding: "45px",
              textAlign: "center",
              backgroundColor: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
            }}
          >
            <h2>📚 Search the Knowledge Base</h2>

            <p style={{ color: "#64748b" }}>
              Enter an IT issue above to find relevant
              troubleshooting solutions.
            </p>
          </div>
        )}
    </div>
  );
}

export default KnowledgeBase;