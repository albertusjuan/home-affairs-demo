/**
 * Hong Kong Home Affairs AI Assistant - Configuration Template
 * 
 * Instructions:
 * 1. Copy this file to config.js: cp config.example.js config.js
 * 2. Edit config.js with your actual credentials
 * 3. Never commit config.js with real credentials
 */

const CONFIG = {
    // REQUIRED: Replace these with your actual credentials
    API_URL: 'https://your-api-url.com',
    API_EMAIL: 'your-email@example.com',
    API_PASSWORD: 'your-password-here',
    
    // Configuration per Task Specification (DO NOT CHANGE)
    TENANT_SUBDOMAIN: 'home-affairs-hk',
    API_MODE: 'fast',
    ENABLED_TOOLS: ['web_search'],
    TOKEN_EXPIRY_DAYS: 30,
    
    SYSTEM_PROMPT: `You are the Hong Kong Home Affairs AI Assistant. Your knowledge is strictly limited to the official websites of the Home Affairs Department (had.gov.hk) and the Home and Youth Affairs Bureau (hyab.gov.hk). When answering, search only these domains using the context of 'home affair Hong Kong'. Provide concise answers and always include the direct links to the relevant pages as citations.`,
    
    ALLOWED_DOMAINS: [
        'https://www.had.gov.hk/',
        'https://www.hyab.gov.hk/'
    ],
    
    SEARCH_CONTEXT: 'home affair Hong Kong',
    
    // UI Configuration (HK Gov Branding)
    PRIMARY_COLOR: '#003366',
    ACCENT_COLOR: '#E60012',
    LOADING_MESSAGE: 'Consulting Home Affairs Database...',
    SECURE_BADGE_TEXT: 'Secure Official Source',
    
    // Storage keys
    STORAGE: {
        TOKEN: 'hk_home_affairs_auth_token',
        SESSION_ID: 'hk_home_affairs_session_id',
        API_URL: 'hk_home_affairs_api_url'
    },
    
    // Advanced
    MAX_MESSAGE_LENGTH: 20000,
    AUTO_SCROLL_THRESHOLD: 100,
    DEBUG_MODE: false
};

Object.freeze(CONFIG);
if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
}

