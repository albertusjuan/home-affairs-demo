# Hong Kong Home Affairs AI Assistant

A specialized AI chatbot providing information exclusively from official Hong Kong government websites (had.gov.hk and hyab.gov.hk).

## Features

- ✅ **Official Sources Only** - Searches only Home Affairs Department and Home & Youth Affairs Bureau websites
- ✅ **Real-time Streaming** - Live response updates via Server-Sent Events
- ✅ **Multi-turn Conversations** - Maintains context across multiple questions
- ✅ **Auto Citations** - Displays official government sources automatically
- ✅ **Professional UI** - Hong Kong government branding (Navy Blue #003366, Bauhinia Red #E60012)
- ✅ **Zero Build Process** - Pure HTML/CSS/JavaScript

## Quick Start

See **[docs/START.md](docs/START.md)** for setup instructions.

## Documentation

- **[docs/START.md](docs/START.md)** - Quick start guide and setup instructions
- **[docs/VERCEL_DEPLOYMENT.md](docs/VERCEL_DEPLOYMENT.md)** - Production deployment guide
- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** - System architecture and CORS explanation
- **[docs/Task Specification...md](docs/Task%20Specification%20Home%20Affairs%20AI%20Project%20HK%20-%202026-01-14%20(3).md)** - Original requirements

## Project Structure

```
home-affairs-demo/
├── api/
│   └── ai.js               # Vercel serverless function
├── docs/
│   ├── START.md            # Quick start guide
│   ├── VERCEL_DEPLOYMENT.md # Deployment guide
│   ├── ARCHITECTURE.md     # Technical documentation
│   └── Task Specification...md
├── index.html              # Main application
├── styles.css              # Styling
├── app.js                  # Core logic
├── config.js               # Base configuration
├── config.local.js         # Your API key (gitignored)
├── cors-proxy.js           # Local dev proxy (optional)
└── package.json            # Dependencies
```

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Markdown**: Marked.js
- **Proxy**: Vercel Serverless Functions (Production), Node.js Express (Local Dev)
- **Backend API**: WYNI AI Hub Developer API
- **Deployment**: Vercel

## Requirements

- Modern browser (Chrome, Firefox, Safari, Edge)
- WYNI Developer API key
- For deployment: Vercel account (free tier works)
- For local dev: Node.js or Python 3

## Security

- API keys stored in `config.local.js` (gitignored)
- Domain filtering ensures only official sources
- HTTPS recommended for production

## License

Proprietary - Wyni Technology

## Support

For technical details, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

---

**Version**: 1.0.0  
**Last Updated**: 2026-01-21  
**Status**: Production Ready ✅
