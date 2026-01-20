# Hong Kong Home Affairs AI Assistant

A specialized AI chatbot interface for Hong Kong Home Affairs inquiries, providing high-accuracy information strictly from official government domains (had.gov.hk and hyab.gov.hk).

## Quick Start

1. **Open the application**: Simply open `index.html` in your browser
2. **Enter your API credentials**:
   - API URL: Your WYNI API Hub URL
   - Developer API Key: Your WYNI Developer API key (starts with `dak-`)
3. **Start chatting**: Ask questions about Hong Kong Home Affairs services

## Features

- ✅ **Official Source Verification**: Only searches had.gov.hk and hyab.gov.hk
- ✅ **Real-time Streaming**: SSE for live response streaming
- ✅ **Source Citations**: Automatic citation drawer with official links
- ✅ **API Key Authentication**: Simple, secure developer API key access
- ✅ **Professional UI**: HK Gov branding (Navy Blue #003366, Bauhinia Red #E60012)
- ✅ **Zero Dependencies**: Pure HTML/CSS/JavaScript

## Files

```
├── index.html      # Main interface
├── styles.css      # Styling
├── app.js          # Application logic
├── config.js       # Configuration
└── README.md       # This file
```

## Configuration

The system automatically prepends this prompt to your first message:

> "You are the Hong Kong Home Affairs AI Assistant. Your knowledge is strictly limited to the official websites of the Home Affairs Department (had.gov.hk) and the Home and Youth Affairs Bureau (hyab.gov.hk). When answering, search only these domains using the context of 'home affair Hong Kong'. Provide concise answers and always include the direct links to the relevant pages as citations."

## Running Locally

```bash
# Option 1: Direct open
# Simply double-click index.html

# Option 2: Python server
python -m http.server 8080

# Option 3: Node.js
npx serve -p 8080
```

## Documentation

- **API Documentation**: `docs/API_documentation.md`
- **Task Specification**: `docs/Task Specification Home Affairs AI Project HK - 2026-01-14 (3).md`

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

**Version**: 1.0.0  
**Last Updated**: 2026-01-20
