# Hong Kong Home Affairs AI Assistant

A specialized AI chatbot interface for Hong Kong Home Affairs inquiries, providing information strictly from official government domains.

## Quick Setup

### 1. Configure Environment

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your credentials
```

Required credentials in `.env`:
- `API_URL` - Your WYNI API Hub URL
- `API_EMAIL` - Your account email
- `API_PASSWORD` - Your password

### 2. Configure Your .env File

Open `.env` and update these values:

```env
API_URL=https://your-actual-api-url.com
API_EMAIL=your-actual-email@example.com
API_PASSWORD=your-actual-password
```

**Important:** The `.env` file is ignored by Git and will NOT be committed. This keeps your credentials secure.

### 3. Official Domains

Per specification, the chatbot only retrieves information from:
- https://www.had.gov.hk/ (Home Affairs Department)
- https://www.hyab.gov.hk/ (Home and Youth Affairs Bureau)

## Project Specifications

See `docs/Task Specification Home Affairs AI Project HK - 2026-01-14 (3).md` for complete requirements.

## API Documentation

See `docs/API_documentation.md` for WYNI API Hub integration details.

## Key Features (Per Specification)

- ✅ **Domain Restriction**: Only had.gov.hk and hyab.gov.hk
- ✅ **Tool Restriction**: web_search only
- ✅ **Multi-turn Conversations**: Maintains context via conversation_id
- ✅ **SSE Streaming**: Real-time response streaming
- ✅ **Citation Management**: Source drawer with official links
- ✅ **JWT Authentication**: 30-day token validity
- ✅ **Tenant Scoped**: home-affairs-hk subdomain
- ✅ **HK Gov Branding**: Navy Blue (#003366) + Bauhinia Red (#E60012)

## Environment Variables Reference

| Variable | Description | Default |
|----------|-------------|---------|
| `API_URL` | WYNI API Hub base URL | (required) |
| `API_EMAIL` | Your login email | (required) |
| `API_PASSWORD` | Your login password | (required) |
| `TENANT_SUBDOMAIN` | Tenant identifier | home-affairs-hk |
| `API_MODE` | Query mode | fast |
| `ENABLED_TOOLS` | Allowed AI tools | web_search |
| `SYSTEM_PROMPT` | AI system instructions | (see .env) |
| `ALLOWED_DOMAINS` | Citation filter domains | had.gov.hk, hyab.gov.hk |
| `PRIMARY_COLOR` | UI primary color | #003366 |
| `ACCENT_COLOR` | UI accent color | #E60012 |

## Security Notes

- ✅ `.env` file is gitignored - never committed
- ✅ Use `.env.example` as a template
- ✅ JWT tokens valid for 30 days
- ✅ All API calls use HTTPS
- ✅ Credentials stored locally only

## Next Steps

1. ✅ Configure your `.env` file
2. ⏳ Implement the frontend interface
3. ⏳ Integrate with WYNI API Hub
4. ⏳ Test with real credentials
5. ⏳ Deploy to production

## Documentation

- **Task Specification**: `docs/Task Specification Home Affairs AI Project HK - 2026-01-14 (3).md`
- **API Reference**: `docs/API_documentation.md`

## Support

For questions about the WYNI API Hub, refer to the API documentation or contact your system administrator.

---

**Status**: Configuration Ready ✅  
**Last Updated**: 2026-01-20

