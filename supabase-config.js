// Supabase Configuration for Hong Kong Home Affairs AI Assistant
// IMPORTANT: Create a supabase-config.local.js file with your actual credentials

const SUPABASE_CONFIG = {
    // Replace these with your actual Supabase credentials
    // Get from: https://app.supabase.com/project/_/settings/api
    SUPABASE_URL: 'https://your-project.supabase.co',
    SUPABASE_ANON_KEY: 'your-anon-key-here'
};

// Override with local config if available
if (window.SUPABASE_LOCAL_CONFIG) {
    Object.assign(SUPABASE_CONFIG, window.SUPABASE_LOCAL_CONFIG);
}

// Export configuration
window.SUPABASE_CONFIG = SUPABASE_CONFIG;

