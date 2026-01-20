# Hong Kong Home Affairs AI Assistant

A specialized AI chatbot interface for Hong Kong Home Affairs inquiries, providing high-accuracy information strictly from official government domains (had.gov.hk and hyab.gov.hk).

## Features

- **Official Source Verification**: Only retrieves information from Home Affairs Department (HAD) and Home and Youth Affairs Bureau (HYAB) official websites
- **Real-time Streaming**: Server-Sent Events (SSE) for live response streaming
- **Multi-turn Conversations**: Maintains context across multiple questions
- **Source Citations**: Automatically displays official government sources with every response
- **Secure Authentication**: JWT-based authentication with 30-day token validity
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Professional UI**: Hong Kong government branding with Navy Blue (#003366) and Bauhinia Red (#E60012)

## Tech Stack

- **Frontend**: Pure HTML5, CSS3, JavaScript (ES6+)
- **Backend API**: WYNI AI Hub (FastAPI-based)
- **Authentication**: JWT tokens
- **Real-time Communication**: Server-Sent Events (SSE)
- **Fonts**: Inter (Google Fonts)

## Project Structure

```
home-affairs-demo/
├── index.html              # Main HTML interface
├── styles.css              # Complete styling and theming
├── app.js                  # Core application logic
├── config.js               # Configuration settings
├── README.md               # This file
└── docs/                   # Documentation folder
    ├── API_documentation.md        # WYNI API documentation
    ├── DEPLOYMENT.md               # Production deployment guide
    ├── MODULE_STATUS.md            # Project status tracking
    ├── QUICKSTART.md               # Quick start guide
    └── Task Specification...       # Project specifications
```

## Configuration

### Key Settings (config.js)

```javascript
{
  TENANT_SUBDOMAIN: 'home-affairs-hk',
  ENABLED_TOOLS: ['web_search'],
  MODE: 'fast',
  ALLOWED_DOMAINS: [
    'https://www.had.gov.hk/',
    'https://www.hyab.gov.hk/'
  ]
}
```

### API Endpoints Used

1. **Authentication**: `POST /api/v1/auth/login`
2. **Session Creation**: `POST /api/v1/chat/sessions`
3. **Query Submission**: `POST /api/v1/ai-agent/query/stream`
4. **Stream Connection**: `GET /api/v1/ai-agent/query/{query_id}/stream`

## Setup Instructions

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- Access to WYNI AI Hub backend API
- Valid user credentials

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd home-affairs-demo
   ```

2. **Configure API URL**:
   - Open the application in a browser
   - Enter your WYNI API Hub URL in the login screen

3. **No build process required** - Pure HTML/CSS/JS, ready to deploy!

### Deployment

#### Option 1: Static Web Server

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve .

# Using PHP
php -S localhost:8000
```

#### Option 2: Deploy to Hostinger VPS

```bash
# SSH into your VPS
ssh user@your-vps-ip

# Navigate to web directory
cd /var/www/html

# Clone or copy files
git clone <repository-url> home-affairs

# Set permissions
chmod -R 755 home-affairs

# Configure Nginx/Apache to serve the directory
```

#### Option 3: Deploy to GitHub Pages

1. Push to GitHub repository
2. Go to Settings → Pages
3. Select main branch
4. Save and get your URL

## Usage Guide

### First Time Login

1. Open the application in your browser
2. Enter your credentials:
   - **Email**: Your WYNI account email
   - **Password**: Your password
   - **API URL**: Your WYNI API Hub URL (e.g., https://api.example.com)
3. Click "Sign In"

### Using the Chat Interface

1. **Ask Questions**: Type your question about Hong Kong Home Affairs services
2. **View Responses**: Watch the AI stream real-time responses
3. **Check Sources**: Click on the citation drawer at the bottom to see official sources
4. **Continue Conversation**: Ask follow-up questions - context is maintained
5. **Logout**: Click the logout button in the top right when done

### Example Queries

- "What are the latest youth grants available?"
- "How do I register for community services?"
- "What facilities are available in Central and Western District?"
- "Tell me about the Home Affairs Youth Programme"
- "What are the eligibility requirements for district council services?"

## Architecture Overview

### Authentication Flow

```
User Login → POST /api/v1/auth/login → Receive JWT Token → Store in localStorage
```

### Conversation Flow

```
1. Create Session → POST /api/v1/chat/sessions → Get conversation_id
2. Send Query → POST /api/v1/ai-agent/query/stream → Get query_id
3. Connect SSE → GET /api/v1/ai-agent/query/{query_id}/stream
4. Handle Events:
   - start: Query processing begins
   - thinking: AI is searching
   - answer_chunk: Receive response tokens
   - sources: Update citations
   - done: Response complete
```

### System Prompt Logic

On the first message of each session, the system automatically prepends:

> "You are the Hong Kong Home Affairs AI Assistant. Your knowledge is strictly limited to the official websites of the Home Affairs Department (had.gov.hk) and the Home and Youth Affairs Bureau (hyab.gov.hk). When answering, search only these domains using the context of 'home affair Hong Kong'. Provide concise answers and always include the direct links to the relevant pages as citations."

## Features Detail

### 1. Secure Official Source Badge
- Displays in header to indicate verified sources
- Visual indicator of government-backed information

### 2. Citation Management
- Automatically extracts sources from AI responses
- Filters only had.gov.hk and hyab.gov.hk domains
- Displays in collapsible drawer at bottom
- Clickable links to original sources

### 3. Loading States
- Pulse animation during AI processing
- "Consulting Home Affairs Database..." message
- Real-time streaming of response chunks

### 4. Responsive Design
- Mobile-first approach
- Adapts to all screen sizes
- Touch-friendly interface

### 5. Session Persistence
- JWT token stored for 30 days
- Conversation history maintained during session
- Auto-reconnect on page refresh (if token valid)

## Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Security Features

- JWT-based authentication
- Secure token storage (localStorage)
- HTTPS required for production
- Tenant isolation via x-tenant-subdomain header
- Domain-restricted source filtering

## Troubleshooting

### Login Issues
- **Problem**: "Login failed" error
- **Solution**: Verify API URL format (must include https://)
- **Solution**: Check credentials are correct
- **Solution**: Ensure tenant subdomain is configured correctly

### Connection Issues
- **Problem**: SSE stream not connecting
- **Solution**: Check CORS settings on backend
- **Solution**: Verify JWT token is valid
- **Solution**: Ensure network allows SSE connections

### No Citations Showing
- **Problem**: Citation drawer is empty
- **Solution**: Ensure response includes sources from allowed domains
- **Solution**: Check sources event in SSE stream
- **Solution**: Verify domain filtering logic

## Development

### Local Development

```bash
# Start a local server
python -m http.server 8000

# Open in browser
http://localhost:8000
```

### Customization

#### Changing Colors
Edit `styles.css`:
```css
:root {
    --primary-navy: #003366;  /* Primary color */
    --accent-red: #E60012;    /* Accent color */
}
```

#### Modifying System Prompt
Edit `config.js`:
```javascript
SYSTEM_PROMPT: "Your custom prompt here..."
```

#### Adding More Tools
Edit `config.js`:
```javascript
ENABLED_TOOLS: ['web_search', 'other_tool']
```

## API Documentation

For complete API documentation, refer to:
- `docs/API_documentation.md` - Developer API guide
- `docs/Task Specification...md` - Project requirements

## License

Proprietary - Wyni Technology

## Support

For issues or questions:
- Email: support@wyni.technology
- Documentation: See API_documentation.md

## Version History

### v1.0.0 (2026-01-20)
- Initial release
- Core chat functionality
- SSE streaming
- Citation management
- Authentication system
- Responsive UI

## Credits

- **Development**: Wyni Technology
- **Design**: Hong Kong Government branding guidelines
- **Icons**: Custom SVG icons
- **Fonts**: Inter (Google Fonts)

---

**Last Updated**: 2026-01-20
**Status**: Production Ready ✅

