# Task Specification: Home Affairs AI Project (HK)

## Project Overview

The goal is to develop a specialized AI interface for Hong Kong Home Affairs inquiries. This tool must provide high-accuracy information by strictly limiting its knowledge source to official government domains while maintaining the robust backend capabilities of the WYNI AI Hub.

***

## 1. Prompt Engineering & Tool Logic

The system must be constrained to act as an official information specialist for the Home Affairs Department (HAD) and the Home and Youth Affairs Bureau (HYAB) of Hong Kong.

### Search and Citation Constraints

* **Target Domains:** Only search and cite information from:
  * [`https://www.had.gov.hk/`](https://www.had.gov.hk/) [1]
  * [`https://www.hyab.gov.hk/`](https://www.hyab.gov.hk/) [2]
* **Tool Configuration:** In the API request, the `enabled_tools` parameter must be restricted.
  * **Enabled Tools:** `["web_search"]` (Disable all other tools like calculator or image generation).
* **Search Scope:** Use the keyword phrase `"home affair" Hong Kong` to ensure regional relevance.
* **Output Style:**
  * **Conciseness:** Provide direct, brief answers.
  * **Transparency:** Every response must include the specific source URLs from the official domains mentioned above.

### System Prompt (Prefix Logic)

The following instruction must be prepended to the user's first query in a session:

> "You are the Hong Kong Home Affairs AI Assistant. Your knowledge is strictly limited to the official websites of the Home Affairs Department (had.gov.hk) and the Home and Youth Affairs Bureau (hyab.gov.hk). When answering, search only these domains using the context of 'home affair Hong Kong'. Provide concise answers and always include the direct links to the relevant pages as citations."

***

## 2. API Integration & Multi-Turn Conversation

The external UI interacts with the WYNI backend using a tenant-scoped streaming architecture.

### A. Authentication & Tenant Resolution

The backend requires a tenant context for every request.

* **Header-based Resolution:** Include `x-tenant-subdomain: <company_subdomain>` in all requests.
* **Login:** POST `/api/v1/auth/login` returns a JWT valid for **30 days**. Store this locally in the frontend.

### B. Handling Multi-Turn Conversations

To maintain context across multiple rounds of questions, the frontend must manage a stable `conversation_id`.

1. **Initialize Session:**
   `POST /api/v1/chat/sessions`
   * Store the returned `id` as your `conversation_id`.
2. **Submit Multi-Turn Query:**
   `POST /api/v1/ai-agent/query/stream`
   ```json
   {
     "query": "What are the latest youth grants?",
     "conversation_id": "<stored_session_id>",
     "mode": "fast",
     "enabled_tools": ["web_search"]
   }
   ```
   *The backend uses the `conversation_id` to retrieve previous message history automatically.*

### C. Consuming the SSE Stream

After submitting a query, connect to the `stream_url` returned in the response:
`GET /api/v1/ai-agent/query/{query_id}/stream`

**Crucial SSE Events to Handle:**

* `start`: Signal that the request is being processed.
* `thinking`: Display "Searching official HK Gov domains..." to the user.
* `answer_chunk`: Append these tokens immediately to the active chat bubble.
* `sources`: Update the **Citation Drawer** with the list of official URLs.
* `done`: Finalize the message and re-enable the input field.

***

## 3. Detailed Frontend Specification

### UI Architecture

* **Brand Identity:**
  * Primary: Navy Blue (`#003366`) | Accent: Bauhinia Red (`#E60012`).
  * Header: Must display a "Secure Official Source" badge.
* **Citation Management:**
  * Implement a **Source Citation Drawer** at the bottom of the chat interface.
  * As the `sources` event fires in the SSE stream, populate this drawer with clickable links to `had.gov.hk` or `hyab.gov.hk`.
* **Loading States:**
  * While the `thinking` event is active, show a subtle pulse animation with text: *"Consulting Home Affairs Database..."*

### Implementation Logic

```
// Example: Prepending the hidden system instruction for the first message
const handleSend = async (userInput) => {
  let finalQuery = userInput;
  if (isNewSession) {
    finalQuery = `${SYSTEM_PROMPT_PREFIX}\n\nUser Question: ${userInput}`;
    isNewSession = false;
  }
  
  const response = await fetch('/api/v1/ai-agent/query/stream', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'x-tenant-subdomain': 'home-affairs-hk'
    },
    body: JSON.stringify({ 
      query: finalQuery,
      conversation_id: currentConversationId,
      enabled_tools: ["web_search"]
    })
  });
  // Handle SSE connection...
};
```

***

## Action Items for Development

* [ ] **Persistent Login:** Implement token storage logic to reuse the 30-day JWT.
* [ ] **Session Tracking:** Ensure the `conversation_id` is passed in every query to enable multi-turn context.
* [ ] **Tool Lockdown:** Verify that `enabled_tools` is strictly `["web_search"]` to prevent the AI from using unauthorized tools.
* [ ] **Tenant Header:** Confirm `x-tenant-subdomain` is included in the SSE connection request.

## References

1. [Home Affairs Department - Home](<https://www.had.gov.hk/>)
2. [Home and Youth Affairs Bureau](<https://www.hyab.gov.hk/>)
