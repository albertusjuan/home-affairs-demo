# Configuration Notes

## WYNI AI Hub Configuration

### Base URL
```
https://hub.wyniai.com
```

This is your WYNI AI Hub endpoint and has been configured as the default in the login form.

### Tenant Subdomain
```
home-affairs-hk
```

### API Endpoints Used

All endpoints are prefixed with the base URL above:

| Function | Endpoint |
|----------|----------|
| **Authentication** | `POST /api/v1/auth/login` |
| **Create Session** | `POST /api/v1/chat/sessions` |
| **Query Stream** | `POST /api/v1/ai-agent/query/stream` |
| **SSE Stream** | `GET /api/v1/ai-agent/query/{query_id}/stream` |

### Full URLs

```
Login:        https://hub.wyniai.com/api/v1/auth/login
Session:      https://hub.wyniai.com/api/v1/chat/sessions
Query:        https://hub.wyniai.com/api/v1/ai-agent/query/stream
Stream:       https://hub.wyniai.com/api/v1/ai-agent/query/{id}/stream
```

### Headers Required

All requests include:
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
x-tenant-subdomain: home-affairs-hk
```

### Enabled Tools
```
["web_search"]
```

### Mode
```
fast
```

---

**Last Updated**: 2026-01-20  
**Environment**: Production Ready


