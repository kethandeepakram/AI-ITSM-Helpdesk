# AI-Powered ITSM Helpdesk

A working prototype of an AI-powered IT Service Management helpdesk for enterprise IT support workflows.

## Assessment-focused capabilities

- Intelligent ticket intake and classification
- Priority, urgency and assignment-group routing
- Hugging Face open-source LLM response generation with deterministic fallback
- RAG-based enterprise Knowledge Base retrieval
- MongoDB Atlas storage
- Optional MongoDB Atlas Vector Search with cosine-similarity fallback
- Self-healing workflows for password reset and account unlock
- Software catalogue validation and software provisioning workflow
- Provisioning request IDs and MongoDB audit records
- ServiceNow integration with optional live Table API mode and safe prototype fallback
- React self-service AI chatbot

## Architecture

```
React
  |
  v
FastAPI
  |
  +--> Hybrid AI analysis
  |       |
  |       +--> Hugging Face open-source LLM
  |
  +--> RAG Knowledge Base
  |       |
  |       +--> Hugging Face embeddings
  |       +--> MongoDB Atlas vectors
  |
  +--> ITSM Ticket Service
          |
          +--> Automation / Provisioning
          +--> ServiceNow
          +--> MongoDB audit trail
```

## Backend environment variables

```
MONGODB_URI=<MongoDB Atlas connection string>
MONGODB_DATABASE=itsm_helpdesk

HF_TOKEN=<Hugging Face token>
HF_LLM_MODEL=Qwen/Qwen2.5-3B-Instruct

MONGODB_VECTOR_INDEX=knowledge_vector_index
MONGODB_VECTOR_PATH=embedding

SERVICENOW_INSTANCE_URL=<optional ServiceNow instance URL>
SERVICENOW_USERNAME=<optional ServiceNow username>
SERVICENOW_PASSWORD=<optional ServiceNow password>
```

The ServiceNow variables are optional. If they are not configured, the prototype records a ServiceNow-style incident in MongoDB instead of claiming a live ServiceNow call.

## Knowledge Base and RAG

Knowledge articles store 384-dimensional embeddings generated from
`sentence-transformers/all-MiniLM-L6-v2`.

When `MONGODB_VECTOR_INDEX` is configured, the RAG service attempts native MongoDB Atlas Vector Search. If the Atlas vector index is unavailable, it falls back to cosine similarity over the stored embeddings so the deployed prototype remains usable.

For a native Atlas Vector Search index, configure:

- Collection: `knowledge_articles`
- Index name: `knowledge_vector_index`
- Vector path: `embedding`
- Dimensions: `384`
- Similarity: `cosine`

## Software provisioning demo

Example:

```
User: I need Microsoft Teams installed on my laptop
        |
        v
Software Installation detected
        |
        v
Software catalogue validation
        |
        v
Provisioning request created
        |
        v
REQ-YYYYMMDD-XXXXXX
        |
        v
Provisioning workflow completed (simulated)
        |
        v
MongoDB audit record
```

The prototype does not install software on a physical machine. It demonstrates the enterprise provisioning workflow and records the result for technical demonstration.

## ServiceNow

When ServiceNow credentials are configured, the backend attempts to create a real incident using the ServiceNow Table API.

Without credentials, the backend uses a clearly labelled prototype simulation stored in MongoDB. This keeps the demonstration functional without pretending that a live ServiceNow instance was contacted.

## Local run

From the backend directory:

```powershell
uvicorn app.main:app --reload
```

From the frontend directory:

```powershell
npm install
npm run dev
```

## Demo scenarios

1. Wi-Fi / internet connectivity issue
2. VPN issue
3. Password reset
4. Account unlock
5. Outlook/email issue
6. Microsoft Teams software installation
7. VS Code / Python / Docker installation

## Deployment notes

For Render, configure the backend environment variables in the Render service rather than committing secrets to GitHub.

The frontend should use:

```
VITE_API_URL=<deployed FastAPI backend URL>
```

Never commit `.env` files or API tokens.
