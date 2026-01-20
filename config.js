// Configuration for Hong Kong Home Affairs AI Assistant

const CONFIG = {
    // System Prompt (prepended to first message)
    SYSTEM_PROMPT: `You are the Hong Kong Home Affairs AI Assistant. Your knowledge is strictly limited to the official websites of the Home Affairs Department (had.gov.hk) and the Home and Youth Affairs Bureau (hyab.gov.hk). When answering, search only these domains using the context of 'home affair Hong Kong'. Provide concise answers and always include the direct links to the relevant pages as citations.`,
    
    // Storage Keys
    API_URL_KEY: 'hk_home_affairs_api_url',
    API_KEY_STORAGE: 'hk_home_affairs_api_key',
    
    // UI Configuration
    MAX_MESSAGE_LENGTH: 20000,
    
    // Domain Filtering
    ALLOWED_DOMAINS: [
        'https://www.had.gov.hk/',
        'https://www.hyab.gov.hk/'
    ]
};

// Export configuration
window.CONFIG = CONFIG;
