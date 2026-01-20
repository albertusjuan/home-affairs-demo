/**
 * Hong Kong Home Affairs AI Assistant - Configuration Template
 * DEVELOPER API KEY AUTHENTICATION
 * 
 * Instructions:
 * 1. Copy this file to config.js: cp config.example.js config.js
 * 2. Edit config.js with your actual API URL and API Key
 * 3. Never commit config.js with real credentials
 */

const CONFIG = {
    // REQUIRED: Replace these with your actual values
    API_URL: 'https://PUT-YOUR-API-URL-HERE.com',     // Your WYNI server URL
    API_KEY: 'dak-your-api-key-here',                  // Your Developer API key
    
    // Authentication type
    AUTH_TYPE: 'developer_api',
    
    // Configuration per Task Specification (DO NOT CHANGE)
    TENANT_SUBDOMAIN: 'home-affairs-hk',
    API_MODE: 'fast',
    TOOL_GROUPS: ['web'],
    TOOL_NAMES: ['web_search'],
    
    SYSTEM_PROMPT: `You are the Hong Kong Home Affairs AI Assistant. Your knowledge is strictly limited to the official websites of the Home Affairs Department (had.gov.hk) and the Home and Youth Affairs Bureau (hyab.gov.hk). When answering, search only these domains using the context of 'home affair Hong Kong'. Provide concise answers and always include the direct links to the relevant pages as citations.`,
    
    ALLOWED_DOMAINS: [
        'https://www.had.gov.hk/',
        'https://www.hyab.gov.hk/'
    ],
    
    SEARCH_CONTEXT: 'home affair Hong Kong',
    
    // UI Configuration
    PRIMARY_COLOR: '#003366',
    ACCENT_COLOR: '#E60012',
    LOADING_MESSAGE: 'Consulting Home Affairs Database...',
    SECURE_BADGE_TEXT: 'Secure Official Source',
    
    // Developer API endpoints
    ENDPOINTS: {
        QUERY: '/api/v1/developer/agent/query',
        QUERY_STREAM: '/api/v1/developer/agent/query/stream'
    },
    
    // Storage keys
    STORAGE: {
        API_KEY: 'hk_home_affairs_api_key',
        API_URL: 'hk_home_affairs_api_url',
        CONVERSATION_HISTORY: 'hk_home_affairs_conversation'
    },
    
    // Advanced
    MAX_MESSAGE_LENGTH: 20000,
    TOP_K: 5,
    AUTO_SCROLL_THRESHOLD: 100,
    DEBUG_MODE: true
};

Object.freeze(CONFIG);
if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
}
