// Configuration for Hong Kong Home Affairs AI Assistant

const CONFIG = {
    // Tenant Configuration
    TENANT_SUBDOMAIN: 'home-affairs-hk',
    
    // System Prompt (prepended to first message)
    SYSTEM_PROMPT: `You are the Hong Kong Home Affairs AI Assistant. Your knowledge is strictly limited to the official websites of the Home Affairs Department (had.gov.hk) and the Home and Youth Affairs Bureau (hyab.gov.hk). When answering, search only these domains using the context of 'home affair Hong Kong'. Provide concise answers and always include the direct links to the relevant pages as citations.`,
    
    // API Configuration
    ENABLED_TOOLS: ['web_search'],
    MODE: 'fast',
    
    // Token Storage Key
    TOKEN_STORAGE_KEY: 'hk_home_affairs_auth_token',
    SESSION_STORAGE_KEY: 'hk_home_affairs_session_id',
    API_URL_STORAGE_KEY: 'hk_home_affairs_api_url',
    
    // Session Configuration
    TOKEN_EXPIRY_DAYS: 30,
    
    // UI Configuration
    MAX_MESSAGE_LENGTH: 20000,
    AUTO_SCROLL_THRESHOLD: 100,
    
    // Search Configuration
    SEARCH_CONTEXT: 'home affair Hong Kong',
    ALLOWED_DOMAINS: [
        'https://www.had.gov.hk/',
        'https://www.hyab.gov.hk/'
    ]
};

// Export configuration
window.CONFIG = CONFIG;


