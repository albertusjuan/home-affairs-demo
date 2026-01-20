# Developer API Guide

Use the WYNI Developer API to run a stateless, fast-mode agent against your own documents. This guide is for developers building integrations or custom workflows.

## Overview

- **Mode:** fast only (no subagents).
- **Tools:** search and web tool groups only.
- **Data scope:** limited to the API key owner's documents (collection: `user_documents`). Public or shared docs are not included.
- **Stateless:** no server-side conversation state. Provide `context_history` per request if you need continuity.

## Quick start

1. **Get Developer API access**
   - Your account must be flagged as developer (`is_developper`) or admin.
   - If you do not see Developer API in the UI, ask your admin to enable it.

2. **Create an API key**
   - UI: Profile menu -> Developer API -> Create key.
   - Or use the API endpoints below with your normal user auth.

3. **Call the agent**

```bash
API_URL="https://your-host"
DEV_API_KEY="dak-xxxx-yyyy"

curl -X POST "$API_URL/api/v1/developer/agent/query" \
  -H "Authorization: Bearer $DEV_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"message":"Find my onboarding docs","top_k":3}'
```

## Base URL and authentication

- **Base path:** `/api/v1/developer`
- **Agent calls auth:**
  - `Authorization: Bearer <API_KEY>` (recommended)
  - or `X-API-Key: <API_KEY>`
- **Key management auth:** use your normal user authentication (the same auth used by the web app). API keys cannot create/rotate/revoke other keys.

## Creating and managing API keys

All endpoints below require a normal user session/token and developer or admin access.

### Create a key

`POST /api-keys`

Request body:
```json
{
  "name": "My integration",
  "scopes": ["search", "web"],
  "expires_at": "2026-12-31T00:00:00Z"
}
```

Notes:
- `name` is required.
- `scopes` are optional. Allowed values: `search`, `web`, `documents`.
- If `scopes` are omitted or empty, the key defaults to `search` + `web`.
- `documents` enables the developer documents endpoints for upload/list/delete.
- The secret key is returned **once**. Store it securely.

Response:
```json
{
  "key": "dak-...",
  "api_key": {
    "id": "...",
    "name": "My integration",
    "key_prefix": "...",
    "scopes": ["search", "web"],
    "is_active": true,
    "expires_at": "2026-12-31T00:00:00Z",
    "last_used_at": null,
    "revoked_at": null,
    "created_at": "2025-01-01T00:00:00Z"
  }
}
```

### List keys

`GET /api-keys`

Returns an array of key metadata (no secrets).

### Revoke a key

`POST /api-keys/{id}/revoke`

Deactivates the key immediately.

Response:
```json
{
  "id": "UUID",
  "name": "My integration",
  "key_prefix": "abcd1234",
  "scopes": ["search", "web"],
  "is_active": false,
  "expires_at": null,
  "last_used_at": "2026-01-19T09:15:07Z",
  "revoked_at": "2026-01-19T09:20:00Z",
  "created_at": "2026-01-01T00:00:00Z"
}
```

### Delete a key

`DELETE /api-keys/{id}`

Removes the key record. Requires the key to be revoked or expired.

Response:
```json
{
  "id": "UUID",
  "name": "My integration",
  "key_prefix": "abcd1234",
  "scopes": ["search", "web"],
  "is_active": false,
  "expires_at": null,
  "last_used_at": "2026-01-19T09:15:07Z",
  "revoked_at": "2026-01-19T09:20:00Z",
  "created_at": "2026-01-01T00:00:00Z"
}
```

### Rotate and export a key

`POST /api-keys/{id}/export`

Generates a new secret for the key and returns it once.

## Using the agent API

### Run a query (single response)

`POST /agent/query`

Request body:
```json
{
  "message": "Find my onboarding docs",
  "top_k": 3,
  "system_prompt": "You are my doc helper. Be concise.",
  "context_history": [
    { "role": "user", "content": "I uploaded onboarding docs yesterday." },
    { "role": "assistant", "content": "What should I look for in them?" }
  ],
  "tool_groups": ["search"],
  "tool_names": ["read_document"]
}
```

Field reference:
- `message` (required, string, 1-20000)
- `top_k` (optional, 1-50; server clamps to configured max)
- `system_prompt` (optional; sanitized and length-capped server-side). If omitted, the default fast-mode system prompt from `backend/config/deep_agent.yaml` is used. If provided, it replaces the default prompt entirely.
- `context_history` (optional array of `{role, content}`; roles: `user`, `assistant`)
- `tool_groups` (optional array of tool group ids)
- `tool_names` (optional array of tool names)

Allowed tool groups:
- `search`
- `web` (alias: `web_search`)

Allowed tool names:
- `hybrid_search`
- `document_search`
- `read_document`
- `web_search`
- `web_extract`

Tool selection behavior:
- Key scopes define the maximum tool groups you can use.
- If you send `tool_groups`, only those groups are enabled.
- `tool_names` are added to the enabled set (and must be within your key scopes).
- If you omit both `tool_groups` and `tool_names`, all tools allowed by your key are enabled.
- To run **chat-only**, send `tool_groups: []` (optionally with `tool_names: []`).
- To enable **only specific tools**, send `tool_groups: []` and list tools in `tool_names`.

Response (AIAgentQueryResponse):
- `answer` (string)
- `sources` (array of source references)
- `intent` (string)
- `collections_searched` (array)
- `confidence` (number)
- `cost_usd` (number)
- `tool_calls` (array of tool names)
- `tool_invocations` (array with detailed tool inputs/outputs)

### Stream a query (SSE)

`POST /agent/query/stream`

- Same request body and headers as `/agent/query`.
- Response is `text/event-stream`.

Typical event types:
- `start`
- `answer_chunk`
- `tool_start` / `tool_end`
- `sources`
- `answer_done`
- `done`
- `error`

Example:
```
event: start
data: {"query":"Find my docs","intent":"processing"}

event: answer_chunk
data: {"chunk":"Here are the onboarding documents..."}

event: answer_done
data: {"intent":"question","confidence":0.9,"cost_usd":0.002,"tool_calls":["hybrid_search"]}

event: done
data: {}
```

## Developer Documents API (API key)

These endpoints require a developer API key with the `documents` scope.
Documents are always private and scoped to the API key owner.

### Upload a document

`POST /api/v1/developer/documents`

Multipart form fields:
- `title` (required)
- `file` (required)

Example:
```bash
curl -X POST "$API_URL/api/v1/developer/documents" \
  -H "Authorization: Bearer $DEV_API_KEY" \
  -F "title=My doc" \
  -F "file=@/path/to/file.pdf"
```

Response:
```json
{
  "id": "UUID",
  "user_id": "UUID",
  "company_id": "UUID",
  "title": "My doc",
  "file_type": "pdf",
  "collection": "user_documents",
  "visibility": "private",
  "role_ids": null,
  "shared_user_ids": null,
  "approved_by": null,
  "approved_at": null,
  "rejection_reason": null,
  "source_type": "upload",
  "source_id": null,
  "status": "uploaded",
  "file_size_mb": 2.5,
  "chunk_count": 0,
  "error_message": null,
  "created_at": "2026-01-19T09:20:00Z",
  "updated_at": "2026-01-19T09:20:00Z"
}
```

### List documents

`GET /api/v1/developer/documents`

Query params:
- `page` (default 1)
- `page_size` (default 20, max 50)
- `status` (optional)
- `visibility` (optional)
- `search` (optional)

Example:
```bash
curl -X GET "$API_URL/api/v1/developer/documents?page=1&page_size=20" \
  -H "Authorization: Bearer $DEV_API_KEY"
```

Response:
```json
{
  "items": [
    {
      "id": "UUID",
      "user_id": "UUID",
      "title": "My doc",
      "file_type": "pdf",
      "collection": "user_documents",
      "visibility": "private",
      "role_ids": null,
      "shared_user_ids": null,
      "status": "completed",
      "file_size_mb": 2.5,
      "chunk_count": 12,
      "created_at": "2026-01-19T09:20:00Z",
      "owner_email": null,
      "owner_name": null
    }
  ],
  "total": 1,
  "page": 1,
  "page_size": 20,
  "total_pages": 1
}
```

### Delete a document

`DELETE /api/v1/developer/documents/{document_id}`

Example:
```bash
curl -X DELETE "$API_URL/api/v1/developer/documents/UUID-HERE" \
  -H "Authorization: Bearer $DEV_API_KEY"
```

Response:
```
204 No Content
```

## Errors and status codes

- `401 Unauthorized`: missing, invalid, revoked, or expired API key
- `403 Forbidden`: user is inactive or lacks developer/admin access
- `400 Bad Request`: invalid payload (for example, empty `message` or invalid `scopes`)
- `429 Too Many Requests`: rate limit (if configured)

## Notes and best practices

- Keep `context_history` short and relevant. The API is stateless.
- Do not place secrets in `system_prompt`.
- Store API keys securely and rotate them periodically.
